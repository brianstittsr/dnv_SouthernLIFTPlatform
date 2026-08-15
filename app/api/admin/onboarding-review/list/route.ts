import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { COLLECTIONS, type ConsortiumMemberDoc } from "@/lib/schema";
import type { Timestamp } from "firebase-admin/firestore";

async function authorize(request: NextRequest): Promise<{ success: boolean; error?: string; status?: number }> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { success: false, error: "Unauthorized", status: 401 };
  }

  const idToken = authorization.split("Bearer ")[1];
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return { success: false, error: "Invalid token", status: 401 };
  }

  const claims = decoded as { role?: string; admin?: boolean };
  let isAdmin = claims.role === "platform_admin" || claims.admin === true;

  if (!isAdmin) {
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    const userData = userDoc.data();
    isAdmin = userData?.role === "platform_admin" || userData?.svpRole === "platform_admin";
  }

  if (!isAdmin) {
    return { success: false, error: "Forbidden", status: 403 };
  }

  return { success: true };
}

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "object" && "toDate" in (value as object) && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  return undefined;
}

/**
 * Deterministic profile-completeness percentage used for the list view
 * (lightweight; the full AI sufficiency analysis runs on the detail page).
 */
function computeCompleteness(member: ConsortiumMemberDoc): number {
  const ci = member.companyIntelligence;
  const checks = [
    Boolean(ci?.companyDescription?.trim()),
    Boolean((ci?.primaryNaicsCodes?.length || member.naicsCodes?.length || 0) > 0),
    Boolean(
      (member.certifications?.length || 0) > 0 ||
        ci?.certifications?.cmmcLevel ||
        (ci?.certifications?.otherCertifications?.length || 0) > 0
    ),
    Boolean((ci?.technicalExpertise?.length || 0) > 0 || (ci?.serviceOfferings?.length || 0) > 0),
    Boolean((ci?.notableContracts?.length || 0) > 0),
    Boolean((member.readinessDocuments?.length || 0) > 0),
    Boolean((ci?.statesServed?.length || 0) > 0),
    Boolean(ci?.samRegistration?.status === "active" || ci?.uei || ci?.cageCode),
  ];
  const complete = checks.filter(Boolean).length;
  return Math.round((complete / checks.length) * 100);
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const membersSnapshot = await db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).get();

    const results = membersSnapshot.docs.map((docSnap) => {
      const member = { id: docSnap.id, ...docSnap.data() } as ConsortiumMemberDoc;
      return {
        id: member.id,
        userId: member.firebaseUid || member.id,
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        email: member.emailPrimary || "",
        company: member.company || member.companyIntelligence?.legalCompanyName || "",
        membershipStatus: member.membershipStatus || "pending",
        avatar: member.avatar || "",
        onboardingReviewStatus: member.onboardingReviewStatus || "not_reviewed",
        completeness: computeCompleteness(member),
        onboardingReviewedAt: timestampToIso(member.onboardingReviewedAt),
        onboardingApprovedAt: timestampToIso(member.onboardingApprovedAt),
        lastReviewRequestSentAt: timestampToIso(member.lastReviewRequestSentAt),
        createdAt: timestampToIso(member.createdAt),
        updatedAt: timestampToIso(member.updatedAt),
      };
    });

    results.sort((a, b) => {
      // Not-reviewed first, then changes_requested, then approved
      const order = { not_reviewed: 0, changes_requested: 1, approved: 2 } as Record<string, number>;
      const diff = (order[a.onboardingReviewStatus] ?? 0) - (order[b.onboardingReviewStatus] ?? 0);
      if (diff !== 0) return diff;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Error fetching onboarding review list:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch onboarding review list" },
      { status: 500 }
    );
  }
}
