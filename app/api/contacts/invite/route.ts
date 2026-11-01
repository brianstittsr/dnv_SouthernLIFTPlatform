import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { sendEmail } from "@/lib/email";

const bodySchema = z.object({
  contacts: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        email: z.string().trim().email().max(320),
      }),
    )
    .min(1)
    .max(10),
  companyName: z.string().trim().max(300).optional(),
});

type InviteStatus = "sent" | "already_registered" | "already_invited" | "failed";

/**
 * POST /api/contacts/invite
 *
 * Lets any signed-in user email secondary contacts a link to create their own
 * account on the platform (/sign-up). Unlike /api/admin/invite, no Firebase
 * account is provisioned here — the invitee registers themselves, which keeps
 * this endpoint safe for non-admin callers. Each invite is recorded in
 * `contactInvites` for audit and deduplication.
 */
export async function POST(req: NextRequest) {
  try {
    if (!db || !auth) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(authHeader.split("Bearer ")[1]);
    const uid = decodedToken.uid;

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { contacts, companyName } = parsed.data;

    const inviterDoc = await db.collection("users").doc(uid).get();
    const inviterData = inviterDoc.data();
    const inviterName =
      [inviterData?.firstName, inviterData?.lastName].filter(Boolean).join(" ").trim() ||
      inviterData?.displayName ||
      inviterData?.email ||
      "A LIFT Center member";
    const org = companyName?.trim() || "their business";

    const baseUrl =
      process.env.NEXT_PUBLIC_PLATFORM_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";
    const signUpUrl = `${baseUrl}/sign-up`;

    const invites = db.collection("contactInvites");
    const results: { email: string; status: InviteStatus }[] = [];

    for (const contact of contacts) {
      const email = contact.email.toLowerCase();
      try {
        await auth.getUserByEmail(email);
        results.push({ email, status: "already_registered" });
        continue;
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code !== "auth/user-not-found") throw error;
      }

      const existing = await invites
        .where("email", "==", email)
        .where("invitedBy", "==", uid)
        .limit(1)
        .get();
      if (!existing.empty) {
        results.push({ email, status: "already_invited" });
        continue;
      }

      const emailResult = await sendEmail({
        to: email,
        subject: `${inviterName} invited you to join the Southern University LIFT Center portal`,
        html: `
          <h1>You've been invited to the LIFT Center portal</h1>
          <p>Hi ${contact.name},</p>
          <p><strong>${inviterName}</strong> added you as a contact for <strong>${org}</strong> on the Southern University MBDA LIFT Rural Business Center portal.</p>
          <p>Create your free account to view opportunities, complete your profile, and work with your LIFT advisor:</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${signUpUrl}" style="background: #0066cc; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Create Your Account
            </a>
          </div>
          <p style="font-size: 13px; color: #6b7280;">If you weren't expecting this invitation, you can ignore this email.</p>
          <p>Best regards,<br/>The Southern University LIFT Center</p>
        `,
        text: `${inviterName} added you as a contact for ${org} on the Southern University LIFT Center portal. Create your account here: ${signUpUrl}`,
      });

      const status: InviteStatus = emailResult.success ? "sent" : "failed";
      await invites.add({
        email,
        name: contact.name,
        invitedBy: uid,
        companyName: companyName ?? null,
        status,
        createdAt: Timestamp.now(),
      });
      results.push({ email, status });
    }

    return NextResponse.json({ data: { results } });
  } catch (error) {
    console.error("Error inviting contacts:", error);
    return NextResponse.json({ error: "Failed to send invites" }, { status: 500 });
  }
}
