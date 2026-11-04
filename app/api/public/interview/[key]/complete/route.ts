import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { checkRateLimit, hashIp, writeAudit } from "@/lib/form-builder/server/context";
import { evaluateSession } from "@/lib/interview/server/engine";
import { resolveInterviewKey } from "@/lib/interview/server/invites";
import { incrementInterviewCounter, updateInvite, updateSession } from "@/lib/interview/server/repo";
import { requireInterviewSession } from "@/lib/interview/server/session-guard";

const completeSchema = z.object({ sessionId: z.string().min(1).max(200) });

/** POST /api/public/interview/[key]/complete - end the interview early and generate the evaluation. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    if (!checkRateLimit(`iv-complete:${hashIp(request)}`, 20, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { key } = await params;
    const resolved = await resolveInterviewKey(key);
    if (!resolved) {
      return NextResponse.json({ error: "This interview link is invalid or no longer available" }, { status: 404 });
    }
    const { interview, invite } = resolved;

    const parsed = completeSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const session = await requireInterviewSession(request, parsed.data.sessionId, interview.id);
    if (session instanceof NextResponse) return session;
    if (session.status === "completed") {
      return NextResponse.json({ data: { finished: true } });
    }

    const closing =
      interview.closingMessage.trim() ||
      "Thank you for your time. Your responses have been recorded and will be reviewed by the team that sent this interview.";
    const closingMsg = { role: "assistant" as const, content: closing, at: Timestamp.now().toDate().toISOString() };
    const messages = [...session.messages, closingMsg];

    const evaluation = await evaluateSession(interview, { ...session, messages });
    await updateSession(session.id, {
      messages,
      evaluation,
      status: "completed",
      completedAt: Timestamp.now().toDate().toISOString(),
      completionSeconds: Math.max(0, Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)),
    });
    if (invite) {
      await updateInvite(invite.id, {
        status: "completed",
        sessionId: session.id,
        completedAt: Timestamp.now().toDate().toISOString(),
      });
    }
    await incrementInterviewCounter(interview.id, "sessionsCompleted");
    await writeAudit("interview.sessionCompleted", session.id, null, { interviewId: interview.id, endedEarly: true });

    return NextResponse.json({ data: { finished: true, reply: closing } });
  } catch (error) {
    console.error("Interview complete failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
