import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { checkRateLimit, hashIp, writeAudit } from "@/lib/form-builder/server/context";
import { evaluateSession, runTurn } from "@/lib/interview/server/engine";
import { resolveInterviewKey } from "@/lib/interview/server/invites";
import { incrementInterviewCounter, updateInvite, updateSession } from "@/lib/interview/server/repo";
import { requireInterviewSession } from "@/lib/interview/server/session-guard";
import type { InterviewMessage, LiftInterviewSessionDoc } from "@/lib/interview/types";

const messageSchema = z.object({
  sessionId: z.string().min(1).max(200),
  message: z.string().min(1).max(8000),
});

/** POST /api/public/interview/[key]/message - append a respondent answer and get the next interviewer turn. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const ipHash = hashIp(request);
    if (!checkRateLimit(`iv-msg:${ipHash}`, 120, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many messages — please slow down" }, { status: 429 });
    }

    const { key } = await params;
    const resolved = await resolveInterviewKey(key);
    if (!resolved) {
      return NextResponse.json({ error: "This interview link is invalid or no longer available" }, { status: 404 });
    }
    const { interview, invite } = resolved;

    const parsed = messageSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });

    const session = await requireInterviewSession(request, parsed.data.sessionId, interview.id);
    if (session instanceof NextResponse) return session;
    if (session.status === "completed") {
      return NextResponse.json({ error: "This interview is already complete", finished: true }, { status: 409 });
    }

    const respondentMsg: InterviewMessage = {
      role: "respondent",
      content: parsed.data.message.trim(),
      at: Timestamp.now().toDate().toISOString(),
    };
    const working: LiftInterviewSessionDoc = {
      ...session,
      messages: [...session.messages, respondentMsg],
    };

    const turn = await runTurn(interview, working);
    const assistantMsg: InterviewMessage = {
      role: "assistant",
      content: turn.reply,
      at: Timestamp.now().toDate().toISOString(),
    };
    working.messages = [...working.messages, assistantMsg];
    working.coveredTopics = turn.coveredTopics;
    if (interview.mode === "scripted") {
      working.questionIndex = Math.min(working.questionIndex + 1, interview.keyQuestions.length);
    }

    if (turn.finished) {
      const evaluation = await evaluateSession(interview, working);
      await updateSession(session.id, {
        messages: working.messages,
        coveredTopics: working.coveredTopics,
        questionIndex: working.questionIndex,
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
      await writeAudit("interview.sessionCompleted", session.id, null, { interviewId: interview.id });
    } else {
      await updateSession(session.id, {
        messages: working.messages,
        coveredTopics: working.coveredTopics,
        questionIndex: working.questionIndex,
      });
    }

    return NextResponse.json({
      data: {
        reply: turn.reply,
        finished: turn.finished,
        coveredTopics: turn.coveredTopics,
        questionIndex: working.questionIndex,
        totalQuestions: interview.mode === "scripted" ? interview.keyQuestions.length : null,
      },
    });
  } catch (error) {
    console.error("Interview message failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
