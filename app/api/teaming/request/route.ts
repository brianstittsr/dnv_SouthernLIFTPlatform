import { NextRequest, NextResponse } from "next/server";
import { auth as adminAuth, db as adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { sendTemplatedEmail } from "@/lib/email";
import { createUserNotification } from "@/lib/notifications-store";
import { generateTeamingPitch, type MemberProfileSummary } from "@/lib/samgov-ai";

interface TeamingRequestBody {
  partnerUserId: string;
  opportunity: {
    noticeId?: string;
    title: string;
    agency?: string;
    solicitationNumber?: string;
    naicsCode?: string;
    setAside?: string;
    responseDeadline?: string;
    uiLink?: string;
    description?: string;
  };
  /** AI rationale carried over from /api/samgov/analyze (optional — regenerated if absent) */
  partnerReasons?: string[];
  partnerMatchScore?: number;
  positioning?: string[];
  message?: string;
}

function toSummary(userId: string, data: FirebaseFirestore.DocumentData): MemberProfileSummary & { email?: string } {
  return {
    userId,
    email: data.email || undefined,
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
 * POST /api/teaming/request
 * Authorization: Bearer <firebase id token>
 *
 * A member submits a teaming request to another KDM Consortium member for a
 * SAM.gov opportunity. Persists a teamingAlerts record (admin Teaming Alerts
 * section) plus a teamingRequests record, emails the recipient a pitch
 * (opportunity, why they fit, how to position to win), and confirms to the
 * requester.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!adminAuth || !adminDb || !authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = await adminAuth.verifyIdToken(authHeader.split("Bearer ")[1]);
    const requesterId = decoded.uid;

    const body = (await req.json()) as TeamingRequestBody;
    if (!body.partnerUserId || !body.opportunity?.title) {
      return NextResponse.json(
        { error: "Missing required fields: partnerUserId, opportunity.title" },
        { status: 400 }
      );
    }
    if (body.partnerUserId === requesterId) {
      return NextResponse.json({ error: "Cannot team with yourself" }, { status: 400 });
    }

    const [requesterSnap, recipientSnap] = await Promise.all([
      adminDb.collection(COLLECTIONS.USERS).doc(requesterId).get(),
      adminDb.collection(COLLECTIONS.USERS).doc(body.partnerUserId).get(),
    ]);
    if (!requesterSnap.exists || !recipientSnap.exists) {
      return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
    }

    const requester = toSummary(requesterId, requesterSnap.data()!);
    const recipient = toSummary(body.partnerUserId, recipientSnap.data()!);
    if (!recipient.email) {
      return NextResponse.json(
        { error: "The selected partner has no email on file" },
        { status: 400 }
      );
    }

    // Pitch content: use caller-provided AI rationale, else generate server-side
    let whyPartner = body.partnerReasons || [];
    let positioning = body.positioning || [];
    if (whyPartner.length === 0 || positioning.length === 0) {
      const pitch = await generateTeamingPitch(requester, recipient, {
        title: body.opportunity.title,
        agency: body.opportunity.agency,
        naicsCode: body.opportunity.naicsCode,
        description: body.opportunity.description,
        setAside: body.opportunity.setAside,
      });
      if (pitch) {
        if (whyPartner.length === 0) whyPartner = pitch.whyPartner;
        if (positioning.length === 0) positioning = pitch.positioning;
      }
    }
    if (whyPartner.length === 0) {
      whyPartner = [
        `${recipient.companyName || recipient.name} has complementary capabilities relevant to this opportunity.`,
      ];
    }
    if (positioning.length === 0) {
      positioning = [
        "Review the solicitation together and agree on a prime/subcontractor split that maximizes set-aside eligibility.",
      ];
    }

    const now = Timestamp.now();
    const noticeId = body.opportunity.noticeId || "";
    const opp = body.opportunity;
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.kdm-assoc.com"}/portal/samgov-opportunities/teaming`;

    // Persist the alert (admin Teaming Alerts section) and the request record
    const alertRef = adminDb.collection(COLLECTIONS.TEAMING_ALERTS).doc();
    const requestRef = adminDb.collection(COLLECTIONS.TEAMING_REQUESTS).doc();

    const emailsSent = { recipient: false, requester: false };

    // Email the recipient — opportunity, why they fit, how to position
    const recipientEmail = await sendTemplatedEmail("teamingRequest", recipient.email, {
      recipientName: recipient.name,
      requesterName: requester.name,
      requesterCompany: requester.companyName || requester.name,
      opportunityTitle: opp.title,
      agency: opp.agency,
      solicitationNumber: opp.solicitationNumber,
      setAside: opp.setAside,
      responseDeadline: opp.responseDeadline,
      uiLink: opp.uiLink,
      whyPartner,
      positioning,
      message: body.message,
      portalUrl,
    });
    emailsSent.recipient = recipientEmail.success;

    // Confirmation to the requester
    if (requester.email) {
      const confirmEmail = await sendTemplatedEmail("teamingRequestConfirmation", requester.email, {
        requesterName: requester.name,
        partnerCompany: recipient.companyName || recipient.name,
        opportunityTitle: opp.title,
        portalUrl,
      });
      emailsSent.requester = confirmEmail.success;
    }

    await alertRef.set({
      requesterId,
      requesterName: requester.name,
      requesterCompany: requester.companyName || "",
      requesterEmail: requester.email || "",
      recipientId: body.partnerUserId,
      recipientName: recipient.name,
      recipientCompany: recipient.companyName || "",
      recipientEmail: recipient.email,
      noticeId,
      opportunityTitle: opp.title,
      agency: opp.agency || null,
      solicitationNumber: opp.solicitationNumber || null,
      naicsCode: opp.naicsCode || null,
      setAside: opp.setAside || null,
      responseDeadline: opp.responseDeadline || null,
      uiLink: opp.uiLink || null,
      partnerMatchScore: body.partnerMatchScore ?? null,
      partnerReasons: whyPartner,
      positioningAdvice: positioning,
      message: body.message || null,
      teamingRequestId: requestRef.id,
      status: "sent",
      emailsSent,
      createdAt: now,
      updatedAt: now,
    });

    await requestRef.set({
      requesterId,
      requesterCompanyId: requester.companyName || "",
      recipientId: body.partnerUserId,
      recipientCompanyId: recipient.companyName || "",
      opportunityId: noticeId,
      opportunityTitle: opp.title,
      message: body.message || whyPartner.join(" "),
      status: "invitation_sent",
      teamingAlertId: alertRef.id,
      sentAt: now,
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      createdAt: now,
      updatedAt: now,
    });

    // In-app notifications for both parties
    await createUserNotification({
      userId: body.partnerUserId,
      type: "samgov_teaming",
      title: "Teaming Request",
      message: `${requester.companyName || requester.name} invited you to team on "${opp.title}".`,
      link: "/portal/samgov-opportunities/teaming",
    });
    await createUserNotification({
      userId: requesterId,
      type: "samgov_teaming",
      title: "Teaming Request Sent",
      message: `Your teaming request for "${opp.title}" was sent to ${recipient.companyName || recipient.name}.`,
      link: "/portal/samgov-opportunities/teaming",
    });

    return NextResponse.json({
      success: true,
      alertId: alertRef.id,
      requestId: requestRef.id,
      emailsSent,
    });
  } catch (error: any) {
    console.error("teaming request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit teaming request" },
      { status: 500 }
    );
  }
}
