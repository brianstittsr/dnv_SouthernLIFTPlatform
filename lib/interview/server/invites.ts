/**
 * Invite delivery for the AI Interview Tool.
 * Creates tracked invite records, emails recipients, and notifies matched
 * platform users in-app. Also resolves public access keys (inv_/pub_) to
 * their interview + invite context.
 */

import { randomBytes } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { sendTemplatedEmail } from "@/lib/email";
import { createUserNotification } from "@/lib/notifications-store";
import type { Requester } from "@/lib/form-builder/server/context";
import { parseInterviewKey, type LiftInterviewDoc, type LiftInterviewInviteDoc } from "../types";
import { createInvite, findUserUidByEmail, getInterview, getInviteByToken, getPublishedInterviewBySlug, updateInvite } from "./repo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://portal.kdm-assoc.com";

export function interviewLink(key: string): string {
  return `${APP_URL}/interview/${key}`;
}

export function inviteKey(token: string): string {
  return `inv_${token}`;
}

export function publicKey(slug: string): string {
  return `pub_${slug}`;
}

export interface InviteRecipient {
  name: string;
  email: string;
}

export interface InviteSendResult {
  inviteId: string;
  email: string;
  emailSent: boolean;
  onPlatform: boolean;
  error?: string;
}

/**
 * Create and send invites. Email + notification failures are per-recipient —
 * one bad address never blocks the batch.
 */
export async function sendInvites(
  interview: LiftInterviewDoc,
  recipients: InviteRecipient[],
  requester: Requester
): Promise<InviteSendResult[]> {
  const results: InviteSendResult[] = [];

  for (const recipient of recipients) {
    const email = recipient.email.trim().toLowerCase();
    const name = recipient.name.trim() || email.split("@")[0];
    const token = randomBytes(24).toString("base64url");
    const link = interviewLink(inviteKey(token));

    const invite = await createInvite({
      interviewId: interview.id,
      interviewTitle: interview.title,
      token,
      recipientName: name,
      recipientEmail: email,
      status: "sent",
      emailSent: false,
      sentAt: Timestamp.now().toDate().toISOString(),
    });

    // Email delivery (external + platform recipients alike)
    let emailSent = false;
    let error: string | undefined;
    try {
      const res = await sendTemplatedEmail("interviewInvite", email, {
        name,
        interviewTitle: interview.title,
        description: interview.description,
        estimatedMinutes: interview.estimatedMinutes,
        senderName: requester.name,
        interviewUrl: link,
      });
      emailSent = res.success;
      if (!res.success) error = res.error || "Email send failed";
    } catch (e) {
      error = e instanceof Error ? e.message : "Email send failed";
    }

    // On-platform delivery: match by email → in-app notification + uid on invite
    let onPlatform = false;
    try {
      const uid = await findUserUidByEmail(email);
      if (uid) {
        onPlatform = true;
        await updateInvite(invite.id, { recipientUid: uid });
        await createUserNotification({
          userId: uid,
          type: "system",
          title: `You're invited to an interview: ${interview.title}`,
          message: `${requester.name} invited you to complete an AI interview (${interview.estimatedMinutes} min).`,
          link,
        });
      }
    } catch (e) {
      console.error("Interview invite notification failed:", e);
    }

    await updateInvite(invite.id, { emailSent });
    results.push({ inviteId: invite.id, email, emailSent, onPlatform, error });
  }

  return results;
}

export interface ResolvedKey {
  interview: LiftInterviewDoc;
  invite: LiftInterviewInviteDoc | null;
  kind: "invite" | "public";
}

/**
 * Resolve an access key (inv_<token> | pub_<slug>) to its interview and
 * invite. Returns null when the key is invalid, the interview is not
 * published, or the public link is disabled.
 */
export async function resolveInterviewKey(key: string): Promise<ResolvedKey | null> {
  const parsed = parseInterviewKey(key);
  if (!parsed) return null;

  if (parsed.kind === "invite") {
    const invite = await getInviteByToken(parsed.token);
    if (!invite) return null;
    const interview = await getInterview(invite.interviewId);
    if (!interview || interview.status !== "published") return null;
    return { interview, invite, kind: "invite" };
  }

  const interview = await getPublishedInterviewBySlug(parsed.slug);
  if (!interview || !interview.publicLinkEnabled) return null;
  return { interview, invite: null, kind: "public" };
}
