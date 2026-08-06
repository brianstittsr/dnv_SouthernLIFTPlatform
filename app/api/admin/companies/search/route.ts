import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

/**
 * GET /api/admin/companies/search?q=companyName
 * Searches consortium_profiles and consortium_members for fuzzy company name matches.
 * Used during onboarding to recommend existing companies for linking.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ matches: [] });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const queryLower = query.toLowerCase();
    const matches: { id: string; companyName: string; source: string }[] = [];
    const seen = new Set<string>();

    // Search consortium_members by company field
    const membersSnapshot = await db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).get();
    for (const docSnap of membersSnapshot.docs) {
      const data = docSnap.data();
      const company = (data.company || "").toLowerCase();
      if (company && company.includes(queryLower) && !seen.has(company)) {
        seen.add(company);
        matches.push({
          id: docSnap.id,
          companyName: data.company,
          source: "consortium_members",
        });
      }
    }

    // Search consortium_profiles by companyIdentity.legalCompanyName
    const profilesSnapshot = await db.collection("consortium_profiles").get();
    for (const docSnap of profilesSnapshot.docs) {
      const data = docSnap.data();
      const companyName = data.companyIdentity?.legalCompanyName || "";
      const companyLower = companyName.toLowerCase();
      if (companyLower && companyLower.includes(queryLower) && !seen.has(companyLower)) {
        seen.add(companyLower);
        matches.push({
          id: docSnap.id,
          companyName,
          source: "consortium_profiles",
        });
      }
    }

    // Search companies collection
    const companiesSnapshot = await db.collection(COLLECTIONS.COMPANIES).get();
    for (const docSnap of companiesSnapshot.docs) {
      const data = docSnap.data();
      const companyName = data.name || data.legalCompanyName || "";
      const companyLower = companyName.toLowerCase();
      if (companyLower && companyLower.includes(queryLower) && !seen.has(companyLower)) {
        seen.add(companyLower);
        matches.push({
          id: docSnap.id,
          companyName,
          source: "companies",
        });
      }
    }

    return NextResponse.json({ matches: matches.slice(0, 10) });
  } catch (error) {
    console.error("Company search error:", error);
    return NextResponse.json(
      { error: "Failed to search companies" },
      { status: 500 }
    );
  }
}
