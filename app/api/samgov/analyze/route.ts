import { NextRequest, NextResponse } from "next/server";
import { auth as adminAuth, db as adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import {
  scoreOpportunitiesForMember,
  recommendTeamingPartner,
  type MemberProfileSummary,
  type TeamingCandidate,
} from "@/lib/samgov-ai";
import type { SamGovOpportunity } from "@/lib/samgov-service";

interface AnalyzeOpportunityInput {
  id?: string;
  noticeId?: string;
  title?: string;
  agency?: string;
  solicitationNumber?: string;
  naicsCode?: string;
  naicsCodes?: string[];
  description?: string;
  setAside?: string;
  deadline?: string;
}

function toMemberSummary(userId: string, data: FirebaseFirestore.DocumentData): MemberProfileSummary {
  return {
    userId,
    name: [data.firstName, data.lastName].filter(Boolean).join(" ") || data.companyName || "Member",
    companyName: data.companyName || data.company || data.legalCompanyName || undefined,
    companyDescription: data.companyDescription || undefined,
    naicsCodes: Array.isArray(data.naicsCodes) ? data.naicsCodes : undefined,
    certifications: Array.isArray(data.certifications) ? data.certifications : undefined,
    expertise: Array.isArray(data.skills) ? data.skills.join(", ") : undefined,
    matchingPreferences: data.matchingPreferences || undefined,
  };
}

/**
 * POST /api/samgov/analyze
 * Authorization: Bearer <firebase id token>
 * Body: { opportunity: AnalyzeOpportunityInput }
 *
 * On-demand per-opportunity AI analysis for the calling member:
 *   - matchScore + matchReasons (why they should consider it)
 *   - partner: best KDM Consortium teaming partner suggestion (or null)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!adminAuth || !adminDb || !authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = await adminAuth.verifyIdToken(authHeader.split("Bearer ")[1]);
    const uid = decoded.uid;

    const body = await request.json();
    const opp: AnalyzeOpportunityInput = body?.opportunity || {};
    if (!opp.title) {
      return NextResponse.json({ error: "opportunity.title is required" }, { status: 400 });
    }

    // Caller's profile
    const userSnap = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const member = toMemberSummary(uid, userSnap.data()!);

    // Score the single opportunity against the member's profile
    const scored = await scoreOpportunitiesForMember(member, [
      {
        id: opp.id || opp.noticeId || "",
        noticeId: opp.noticeId || opp.id || "",
        title: opp.title,
        solicitationNumber: opp.solicitationNumber,
        organizationHierarchy: opp.agency,
        naicsCode: opp.naicsCode || opp.naicsCodes?.[0],
        typeOfSetAsideDescription: opp.setAside,
        responseDeadLine: opp.deadline,
        description: opp.description,
      } as SamGovOpportunity,
    ]);
    const score = scored[0] || { matchScore: 0, matchReasons: [] as string[] };

    // Partner suggestion: pool = other consortium members with NAICS overlap
    const oppNaics = new Set(
      [opp.naicsCode, ...(opp.naicsCodes || [])].filter(Boolean) as string[]
    );
    const oppPrefixes = new Set(Array.from(oppNaics).map((c) => c.slice(0, 4)));

    const [byRole, byRoles] = await Promise.all([
      adminDb.collection(COLLECTIONS.USERS).where("svpRole", "==", "consortium_member").get(),
      adminDb.collection(COLLECTIONS.USERS).where("svpRoles", "array-contains", "consortium_member").get(),
    ]);
    const candidateDocs = new Map<string, FirebaseFirestore.DocumentData>();
    byRole.forEach((d) => candidateDocs.set(d.id, d.data()));
    byRoles.forEach((d) => candidateDocs.set(d.id, d.data()));

    const candidates: TeamingCandidate[] = [];
    candidateDocs.forEach((data, docId) => {
      if (docId === uid) return;
      const naics: string[] = Array.isArray(data.naicsCodes) ? data.naicsCodes : [];
      const overlaps =
        oppNaics.size === 0 ||
        naics.some((c) => oppNaics.has(c) || oppPrefixes.has(c.slice(0, 4)));
      if (!overlaps) return;
      candidates.push({
        memberId: docId,
        companyName: data.companyName || data.company || [data.firstName, data.lastName].filter(Boolean).join(" "),
        companyDescription: data.companyDescription || undefined,
        naicsCodes: naics,
        certifications: Array.isArray(data.certifications) ? data.certifications : undefined,
        expertise: Array.isArray(data.skills) ? data.skills.join(", ") : undefined,
      });
    });

    let partner: {
      userId: string;
      name: string;
      companyName: string;
      email: string;
      matchScore: number;
      reasons: string[];
      complementaryCapabilities: string[];
      relevantCertifications: string[];
    } | null = null;

    if (candidates.length > 0) {
      const rec = await recommendTeamingPartner(
        member,
        { title: opp.title, naicsCode: opp.naicsCode || opp.naicsCodes?.[0], description: opp.description },
        candidates
      );
      if (rec && rec.memberId) {
        const partnerData = candidateDocs.get(rec.memberId);
        partner = {
          userId: rec.memberId,
          name: [partnerData?.firstName, partnerData?.lastName].filter(Boolean).join(" "),
          companyName: rec.companyName,
          email: partnerData?.email || "",
          matchScore: rec.matchScore,
          reasons: rec.matchReasons,
          complementaryCapabilities: rec.complementaryCapabilities,
          relevantCertifications: rec.relevantCertifications,
        };
      }
    }

    return NextResponse.json({
      matchScore: score.matchScore,
      matchReasons: score.matchReasons,
      partner,
    });
  } catch (error: any) {
    console.error("samgov analyze error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze opportunity" },
      { status: 500 }
    );
  }
}
