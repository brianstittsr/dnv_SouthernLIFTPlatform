import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";
import { sendTemplatedEmail } from "@/lib/email";

/**
 * POST /api/admin/team-members/send-onboarding-link
 * Body: { memberIds: string[] }
 *
 * Emails each selected team member a direct link to the public client
 * onboarding wizard (/onboarding/client?email=…) and stamps
 * lastOnboardingLinkSentAt on their member doc.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://portal.kdm-assoc.com";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decodedToken = await admin.auth().verifyIdToken(authHeader.split("Bearer ")[1]);
    if (!decodedToken.email?.includes("kdm-assoc.com")) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { memberIds } = await request.json();
    if (!Array.isArray(memberIds) || !memberIds.length) {
      return NextResponse.json({ error: "memberIds (non-empty array) is required" }, { status: 400 });
    }
    if (memberIds.length > 50) {
      return NextResponse.json({ error: "Maximum 50 members per request" }, { status: 400 });
    }

    const now = Timestamp.now();
    const results = { sent: 0, skippedNoEmail: 0, errors: [] as string[] };

    for (const id of memberIds.slice(0, 50)) {
      try {
        const snap = await db.collection(COLLECTIONS.TEAM_MEMBERS).doc(String(id)).get();
        if (!snap.exists) {
          results.errors.push(`Member ${id} not found`);
          continue;
        }
        const member = { id: snap.id, ...snap.data() } as TeamMemberDoc;
        const email = member.emailPrimary || member.emailSecondary;
        if (!email) {
          results.skippedNoEmail += 1;
          continue;
        }

        const onboardingUrl = `${APP_URL}/onboarding/client?email=${encodeURIComponent(email)}&member=${encodeURIComponent(member.id)}`;
        const emailResult = await sendTemplatedEmail("onboardingLink", email, {
          name: member.firstName || email,
          onboardingUrl,
          senderName: decodedToken.name as string | undefined,
        });
        if (!emailResult.success) {
          results.errors.push(`${member.firstName ?? ""} ${member.lastName ?? ""} (${email}): ${emailResult.error || "send failed"}`.trim());
          continue;
        }

        await snap.ref.set({ lastOnboardingLinkSentAt: now, updatedAt: now }, { merge: true });
        results.sent += 1;
      } catch (error: unknown) {
        results.errors.push(`Member ${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Send onboarding link error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send onboarding links" },
      { status: 500 }
    );
  }
}
