import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/companies
 * List all companies (admin) or search by name (for invite dialog autocomplete)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();

    let query = db.collection("companies");

    const snapshot = await query.get();

    let companies = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by search term if provided
    if (search) {
      const lowerSearch = search.toLowerCase();
      companies = companies.filter((c: any) =>
        c.legalCompanyName?.toLowerCase().includes(lowerSearch) ||
        c.displayName?.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort by name
    companies.sort((a: any, b: any) =>
      (a.legalCompanyName || "").localeCompare(b.legalCompanyName || "")
    );

    return NextResponse.json({ companies });
  } catch (error: any) {
    console.error("Error listing companies:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list companies" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies
 * Create a new company profile
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const {
      legalCompanyName,
      displayName,
      companyDescription,
      website,
      industry,
      address,
      dunsNumber,
      cageCode,
      uei,
      tenantId,
    } = body;

    if (!legalCompanyName) {
      return NextResponse.json(
        { error: "Missing required field: legalCompanyName" },
        { status: 400 }
      );
    }

    const normalizedName = legalCompanyName
      .trim()
      .toLowerCase()
      .replace(/[.,&]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Check for existing company with same normalized name
    const existingQuery = await db
      .collection("companies")
      .where("normalizedName", "==", normalizedName)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      return NextResponse.json(
        {
          error: "A company with this name already exists",
          companyId: existingQuery.docs[0].id,
        },
        { status: 409 }
      );
    }

    const companyData = {
      legalCompanyName,
      displayName: displayName || legalCompanyName,
      companyDescription: companyDescription || "",
      companyLogo: "",
      website: website || "",
      industry: industry || "",
      address: address || { street: "", city: "", state: "", zip: "" },
      dunsNumber: dunsNumber || "",
      cageCode: cageCode || "",
      uei: uei || "",
      yearsInBusiness: 0,
      annualRevenueRange: "",
      employeeCountRange: "",
      naicsCodes: [],
      certifications: [],
      capabilities: [],
      memberUserIds: [decodedToken.uid],
      ownerUserId: decodedToken.uid,
      tenantId: tenantId || "kdm-svp-platform",
      normalizedName,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const companyRef = await db.collection("companies").add(companyData);

    // Link the creator to the company
    await db
      .collection("users")
      .doc(decodedToken.uid)
      .set(
        {
          companyId: companyRef.id,
          companyName: legalCompanyName,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

    return NextResponse.json({
      success: true,
      company: { id: companyRef.id, ...companyData },
    });
  } catch (error: any) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create company" },
      { status: 500 }
    );
  }
}
