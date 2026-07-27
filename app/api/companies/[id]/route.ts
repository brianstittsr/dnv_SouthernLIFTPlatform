import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/companies/[id]
 * Fetch a single company profile with its members
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    await auth.verifyIdToken(token);

    const { id } = await params;
    const companyDoc = await db.collection("companies").doc(id).get();

    if (!companyDoc.exists) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const companyData = { id: companyDoc.id, ...companyDoc.data() };

    // Fetch member user docs
    const memberUserIds: string[] = (companyData as any).memberUserIds || [];
    const members = await Promise.all(
      memberUserIds.map(async (userId) => {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) return null;
        const data = userDoc.data()!;
        return {
          userId,
          email: data.email || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          role: data.role || data.svpRole || "",
          jobTitle: data.jobTitle || "",
          isOwner: userId === (companyData as any).ownerUserId,
        };
      })
    );

    const validMembers = members.filter((m) => m !== null);

    return NextResponse.json({
      company: companyData,
      members: validMembers,
    });
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch company" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/companies/[id]
 * Update a company profile
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const { id } = await params;
    // Verify the user is a member of this company or is a platform admin
    const companyDoc = await db.collection("companies").doc(id).get();
    if (!companyDoc.exists) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const companyData = companyDoc.data()!;
    const memberUserIds: string[] = companyData.memberUserIds || [];
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const isAdmin =
      userData?.role === "platform_admin" ||
      userData?.svpRole === "platform_admin";

    if (!memberUserIds.includes(decodedToken.uid) && !isAdmin) {
      return NextResponse.json(
        { error: "You are not a member of this company" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const allowedFields = [
      "legalCompanyName",
      "displayName",
      "companyDescription",
      "companyLogo",
      "website",
      "industry",
      "address",
      "dunsNumber",
      "cageCode",
      "uei",
      "yearsInBusiness",
      "annualRevenueRange",
      "employeeCountRange",
      "naicsCodes",
      "certifications",
      "capabilities",
    ];

    const updateData: Record<string, any> = { updatedAt: Timestamp.now() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (updateData.legalCompanyName) {
      updateData.normalizedName = updateData.legalCompanyName
        .trim()
        .toLowerCase()
        .replace(/[.,&]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    await db.collection("companies").doc(id).update(updateData);

    return NextResponse.json({
      success: true,
      message: "Company updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update company" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies/[id]
 * Link an existing user to this company (add as member)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const { id } = await params;
    // Verify caller is a company member or admin
    const companyDoc = await db.collection("companies").doc(id).get();
    if (!companyDoc.exists) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const companyData = companyDoc.data()!;
    const memberUserIds: string[] = companyData.memberUserIds || [];
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const isAdmin =
      userData?.role === "platform_admin" ||
      userData?.svpRole === "platform_admin";

    if (!memberUserIds.includes(decodedToken.uid) && !isAdmin) {
      return NextResponse.json(
        { error: "You are not a member of this company" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    if (memberUserIds.includes(userId)) {
      return NextResponse.json(
        { error: "User is already a member of this company" },
        { status: 409 }
      );
    }

    // Add user to company's member list
    await db
      .collection("companies")
      .doc(id)
      .update({
        memberUserIds: [...memberUserIds, userId],
        updatedAt: Timestamp.now(),
      });

    // Link user to company
    const targetUserDoc = await db.collection("users").doc(userId).get();
    const targetUserData = targetUserDoc.data();
    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          companyId: id,
          companyName: companyData.legalCompanyName,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

    return NextResponse.json({
      success: true,
      message: "User linked to company successfully",
    });
  } catch (error: any) {
    console.error("Error linking user to company:", error);
    return NextResponse.json(
      { error: error.message || "Failed to link user" },
      { status: 500 }
    );
  }
}
