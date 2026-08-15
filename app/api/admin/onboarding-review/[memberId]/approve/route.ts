import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, type ConsortiumMemberDoc } from "@/lib/schema";
import { createUserNotification } from "@/lib/notifications-store";
import { sendTemplatedEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://portal.kdm-assoc.com";

async function authorize(request: NextRequest): Promise<{ success: boolean; error?: string; status?: number; uid?: string; name?: string }> {
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

  const claims = decoded as { role?: string; admin?: boolean; name?: string; email?: string };
  let isAdmin = claims.role === "platform_admin" || claims.admin === true;
  let adminName = claims.name || claims.email;

  if (!isAdmin) {
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    const userData = userDoc.data();
    isAdmin = userData?.role === "platform_admin" || userData?.svpRole === "platform_admin";
    adminName = adminName || userData?.email;
  }

  if (!isAdmin) {
    return { success: false, error: "Forbidden", status: 403 };
  }

  return { success: true, uid: decoded.uid, name: adminName };
}

interface ApproveBody {
  checklistSnapshot?: { field: string; severity: "missing" | "weak" | "ok"; note?: string }[];
  aiSummary?: string;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const { memberId } = await params;
    const body: ApproveBody = await request.json().catch(() => ({}));

    const memberRef = db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).doc(memberId);
    const memberDoc = await memberRef.get();
    if (!memberDoc.exists) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    const member = memberDoc.data() as ConsortiumMemberDoc;

    const now = Timestamp.now();

    await memberRef.update({
      onboardingReviewStatus: "approved",
      onboardingReviewedAt: now,
      onboardingReviewedBy: authResult.uid,
      onboardingApprovedAt: now,
      aiMatchingActivated: true,
      aiMatchingActivatedAt: now,
      updatedAt: now,
    });

    // Mirror onto the users doc — this is the collection the SAM.gov cron
    // eligibility query (and AI teaming candidate pool) actually reads from.
    const userId = member.firebaseUid || memberId;
    await db.collection(COLLECTIONS.USERS).doc(userId).set(
      { onboardingReviewStatus: "approved" },
      { merge: true }
    );

    await db.collection(COLLECTIONS.ONBOARDING_REVIEWS).add({
      memberId,
      userId,
      adminId: authResult.uid,
      adminName: authResult.name || "Admin",
      action: "approved",
      checklistSnapshot: body.checklistSnapshot || [],
      aiSummary: body.aiSummary || "",
      createdAt: now,
    });

    const name = [member.firstName, member.lastName].filter(Boolean).join(" ") || "there";
    const email = member.emailPrimary;
    const portalUrl = `${APP_URL}/portal`;
    const opportunitiesUrl = `${APP_URL}/portal/samgov-opportunities`;
    const teamingUrl = `${APP_URL}/portal/samgov-opportunities/teaming`;

    if (email) {
      await sendTemplatedEmail("onboardingApproved", email, {
        name,
        portalUrl,
        opportunitiesUrl,
        teamingUrl,
      });
    }

    await createUserNotification({
      userId,
      type: "system",
      title: "Onboarding Approved!",
      message: "Your profile is approved. Explore KDM Opportunities, AI Recommendations, and AI Teaming Matches now.",
      link: "/portal/samgov-opportunities",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error approving onboarding:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to approve onboarding" },
      { status: 500 }
    );
  }
}
