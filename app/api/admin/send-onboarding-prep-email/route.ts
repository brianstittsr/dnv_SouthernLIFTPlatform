import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { sendOnboardingPrepEmail } from "@/lib/email-demo";

/**
 * POST /api/admin/send-onboarding-prep-email
 * Sends an onboarding prep email to a user listing the PDF documents
 * they should prepare before starting the KDM onboarding process.
 *
 * Body: { email: string, firstName?: string, lastName?: string }
 * Also accepts { memberIds: string[] } for bulk sending.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(idToken);

    if (!decoded.admin && !decoded.email?.endsWith("@kdm-assoc.com")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const body = await request.json();
    const { email, firstName, lastName, memberIds } = body;

    // Bulk mode: send to multiple members
    if (Array.isArray(memberIds) && memberIds.length > 0) {
      const results: { email: string; success: boolean; error?: string }[] = [];

      for (const memberId of memberIds) {
        try {
          const memberDoc = await db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).doc(memberId).get();
          if (!memberDoc.exists) {
            results.push({ email: memberId, success: false, error: "Member not found" });
            continue;
          }

          const memberData = memberDoc.data();
          const memberEmail = memberData?.emailPrimary || "";
          if (!memberEmail) {
            results.push({ email: memberId, success: false, error: "No email on file" });
            continue;
          }

          await sendOnboardingPrepEmail({
            email: memberEmail,
            firstName: memberData?.firstName,
            lastName: memberData?.lastName,
          });

          // Queue in emailQueue for tracking
          await db.collection("emailQueue").add({
            to: [memberEmail],
            subject: "Prepare for Your KDM Onboarding — Documents to Gather",
            type: "onboarding_prep",
            memberId,
            createdAt: Timestamp.now(),
            status: "sent",
          });

          results.push({ email: memberEmail, success: true });
        } catch (err) {
          results.push({
            email: memberId,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      return NextResponse.json({
        success: true,
        sent: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      });
    }

    // Single email mode
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await sendOnboardingPrepEmail({ email, firstName, lastName });

    // Queue in emailQueue for tracking
    await db.collection("emailQueue").add({
      to: [email],
      subject: "Prepare for Your KDM Onboarding — Documents to Gather",
      type: "onboarding_prep",
      createdAt: Timestamp.now(),
      status: "sent",
    });

    return NextResponse.json({
      success: true,
      message: `Onboarding prep email sent to ${email}`,
    });
  } catch (error) {
    console.error("Error sending onboarding prep email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
