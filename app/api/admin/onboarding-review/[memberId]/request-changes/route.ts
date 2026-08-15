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

interface RequestChangesBody {
  items: { field: string; note: string }[];
  message: string;
  checklistSnapshot?: { field: string; severity: "missing" | "weak" | "ok"; note?: string }[];
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
    const body: RequestChangesBody = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "At least one item must be flagged" }, { status: 400 });
    }

    const memberRef = db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).doc(memberId);
    const memberDoc = await memberRef.get();
    if (!memberDoc.exists) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    const member = memberDoc.data() as ConsortiumMemberDoc;

    const now = Timestamp.now();
    const flaggedLabels = body.items.map((i) => i.field);

    await memberRef.update({
      onboardingReviewStatus: "changes_requested",
      onboardingReviewedAt: now,
      onboardingReviewedBy: authResult.uid,
      lastReviewRequestSentAt: now,
      lastReviewRequestItems: flaggedLabels,
      updatedAt: now,
    });

    // Mirror the flag on the users doc so the SAM.gov cron eligibility
    // query (which reads the users collection) stays in sync.
    const userId = member.firebaseUid || memberId;
    await db.collection(COLLECTIONS.USERS).doc(userId).set(
      { onboardingReviewStatus: "changes_requested" },
      { merge: true }
    );

    await db.collection(COLLECTIONS.ONBOARDING_REVIEWS).add({
      memberId,
      userId,
      adminId: authResult.uid,
      adminName: authResult.name || "Admin",
      action: "requested_changes",
      checklistSnapshot: body.checklistSnapshot || [],
      emailMessage: body.message,
      emailSentAt: now,
      createdAt: now,
    });

    const name = [member.firstName, member.lastName].filter(Boolean).join(" ") || "there";
    const email = member.emailPrimary;
    const profileUrl = `${APP_URL}/portal/profile`;

    if (email) {
      await sendTemplatedEmail("onboardingChangesRequested", email, {
        name,
        items: body.items,
        customMessage: body.message,
        profileUrl,
      });
    }

    await createUserNotification({
      userId,
      type: "system",
      title: "Profile Updates Requested",
      message: `Please update your profile: ${flaggedLabels.join(", ")}.`,
      link: "/portal/profile",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting onboarding changes:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to request changes" },
      { status: 500 }
    );
  }
}
