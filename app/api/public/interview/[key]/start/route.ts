import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { checkRateLimit, hashIp, verifyCaptcha, writeAudit } from "@/lib/form-builder/server/context";
import { INTERVIEW_SESSION_COOKIE } from "@/lib/interview/types";
import { generateOpening } from "@/lib/interview/server/engine";
import { resolveInterviewKey } from "@/lib/interview/server/invites";
import { createSession, getSessionForInvite, updateInvite, updateSession } from "@/lib/interview/server/repo";

const startSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320).optional().or(z.literal("")),
  captchaToken: z.string().max(4000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

/**
 * POST /api/public/interview/[key]/start - create (or resume) a session and
 * return the interviewer's opening message. Sets an httpOnly cookie holding
 * the session token; subsequent calls must present it.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const ipHash = hashIp(request);
    if (!checkRateLimit(`iv-start:${ipHash}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts — please wait a few minutes" }, { status: 429 });
    }

    const { key } = await params;
    const resolved = await resolveInterviewKey(key);
    if (!resolved) {
      return NextResponse.json({ error: "This interview link is invalid or no longer available" }, { status: 404 });
    }
    const { interview, invite, kind } = resolved;

    const parsed = startSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Please provide your name" }, { status: 400 });
    if (!(await verifyCaptcha(parsed.data.captchaToken, request))) {
      return NextResponse.json({ error: "Please complete the verification check" }, { status: 400 });
    }

    // Invite links are single-use per invite: resume an in-progress session,
    // reject a completed one.
    if (invite) {
      const existing = await getSessionForInvite(invite.id);
      if (existing?.status === "completed") {
        return NextResponse.json({ error: "This interview has already been completed" }, { status: 409 });
      }
      if (existing?.status === "in_progress") {
        return respond(existing.sessionToken, {
          sessionId: existing.id,
          messages: existing.messages,
          resumed: true,
        });
      }
    }

    const session = await createSession(interview, {
      respondentName: parsed.data.name.trim(),
      respondentEmail: parsed.data.email?.trim() || undefined,
      source: kind === "invite" ? "invite" : "public_link",
      inviteId: invite?.id,
    });

    const opening = await generateOpening(interview, session);
    const messages = [{ role: "assistant" as const, content: opening.reply, at: Timestamp.now().toDate().toISOString() }];
    await updateSession(session.id, { messages, coveredTopics: opening.coveredTopics });

    if (invite) {
      await updateInvite(invite.id, { status: "started", sessionId: session.id, startedAt: Timestamp.now().toDate().toISOString() });
    }
    await writeAudit("interview.sessionStarted", session.id, null, { interviewId: interview.id, source: session.source });

    return respond(session.sessionToken, {
      sessionId: session.id,
      messages,
      resumed: false,
      finished: opening.finished,
    });
  } catch (error) {
    console.error("Interview start failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

function respond(sessionToken: string, body: Record<string, unknown>): NextResponse {
  const res = NextResponse.json({ data: body });
  res.cookies.set(INTERVIEW_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/public/interview",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
