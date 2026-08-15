import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { COLLECTIONS, type ConsortiumMemberDoc, type OnboardingReviewDoc } from "@/lib/schema";
import { analyzeOnboardingSufficiency } from "@/lib/onboarding-review-ai";
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const { memberId } = await params;
    const memberDoc = await db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).doc(memberId).get();
    if (!memberDoc.exists) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const member = { id: memberDoc.id, ...memberDoc.data() } as ConsortiumMemberDoc;

    const analysis = await analyzeOnboardingSufficiency(member);

    const reviewsSnapshot = await db
      .collection(COLLECTIONS.ONBOARDING_REVIEWS)
      .where("memberId", "==", memberId)
      .get();

    const history = reviewsSnapshot.docs
      .map((docSnap) => {
        const data = docSnap.data() as OnboardingReviewDoc;
        return {
          id: docSnap.id,
          action: data.action,
          adminName: data.adminName || data.adminId,
          aiSummary: data.aiSummary,
          emailMessage: data.emailMessage,
          createdAt: timestampToIso(data.createdAt),
        };
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({
      data: {
        id: member.id,
        userId: member.firebaseUid || member.id,
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        email: member.emailPrimary || "",
        company: member.company || member.companyIntelligence?.legalCompanyName || "",
        membershipStatus: member.membershipStatus || "pending",
        avatar: member.avatar || "",
        onboardingReviewStatus: member.onboardingReviewStatus || "not_reviewed",
        naicsCodes: member.companyIntelligence?.primaryNaicsCodes || member.naicsCodes || [],
        certifications: member.certifications || [],
        companyIntelligence: member.companyIntelligence || null,
        readinessDocuments: member.readinessDocuments || [],
        createdAt: timestampToIso(member.createdAt),
        updatedAt: timestampToIso(member.updatedAt),
      },
      analysis,
      history,
    });
  } catch (error) {
    console.error("Error fetching onboarding review detail:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch onboarding review detail" },
      { status: 500 }
    );
  }
}
