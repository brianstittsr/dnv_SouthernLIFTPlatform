import { NextRequest, NextResponse } from "next/server";
import { auth as adminAuth, db as adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { sendEmail } from "@/lib/email";

const REVIEWER_EMAILS = [
  "kmoore@kdm-assoc.com",
  "mhundal@kdmassociates.com",
  "bstitt@strategicvalueplus.com",
];

/**
 * POST /api/consortium/readiness/submit
 * Submits a member's readiness documents for KDM staff review and emails the reviewers.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const requestUserId = decodedToken.uid;

    const body = await req.json();
    const { userId, displayName, email, documents } = body;

    if (!userId || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: "Missing required fields: userId, documents" },
        { status: 400 }
      );
    }

    // Users can only submit their own documents; admins may submit on behalf of others
    const isAdmin =
      decodedToken.role === "platform_admin" || decodedToken.admin === true;
    if (!isAdmin && userId !== requestUserId) {
      return NextResponse.json(
        { error: "You can only submit your own documents" },
        { status: 403 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const profileRef = adminDb.collection("consortium_profiles").doc(userId);
    const profileSnap = await profileRef.get();
    const profileData = profileSnap.exists ? profileSnap.data() : {};
    const memberName = displayName || profileData?.firstName || email || userId;
    const memberEmail = email || profileData?.emailPrimary || profileData?.email || "";

    // Update document statuses to pending and set validation status
    const updatedDocuments = documents.map((doc: any) => ({
      ...doc,
      status: "pending_review",
      submittedAt: Timestamp.now(),
    }));

    await profileRef.set(
      {
        readinessDocuments: updatedDocuments,
        readinessValidationStatus: "pending_review",
        readinessSubmittedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    // Build document list for the email
    const documentListHtml = documents
      .map(
        (doc: any) =>
          `<li>${doc.fileName} (${DOCUMENT_TYPE_LABELS[doc.type] || doc.type})</li>`
      )
      .join("");

    // Send notification email to reviewers
    const emailResult = await sendEmail({
      to: REVIEWER_EMAILS,
      subject: `Readiness Review Request - ${memberName}`,
      html: `
        <h1>Readiness Documents Submitted for Review</h1>
        <p><strong>Member:</strong> ${memberName}</p>
        <p><strong>Email:</strong> ${memberEmail}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        <p>The following readiness documents have been submitted for KDM staff review and validation:</p>
        <ul>
          ${documentListHtml}
        </ul>
        <p><a href="https://www.kdm-assoc.com/portal/admin/users" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Review in Admin Portal</a></p>
        <p>Best regards,<br>The KDM Consortium Platform</p>
      `,
      text: `Readiness documents submitted for review by ${memberName} (${memberEmail}). Documents: ${documents
        .map((doc: any) => doc.fileName)
        .join(", ")}`,
    });

    if (!emailResult.success) {
      console.error("Failed to send readiness review email:", emailResult.error);
      // Still return success since the Firestore update succeeded; surface warning
      return NextResponse.json(
        {
          success: true,
          warning: "Documents submitted but notification email failed to send",
          emailError: emailResult.error,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Documents submitted for review",
    });
  } catch (error: any) {
    console.error("Error submitting readiness documents:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit documents" },
      { status: 500 }
    );
  }
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  sam_registration: "SAM Registration",
  duns_number: "DUNS Number",
  cage_code: "CAGE Code",
  capability_statement: "Capability Statement",
  past_performance: "Past Performance References",
  certifications: "Certifications",
  financials: "Financial Statements",
  insurance: "Insurance Certificates",
};
