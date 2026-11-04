/**
 * The AI interview engine.
 *
 * Runs the conversational/scripted interview against OpenAI when
 * configured (createOpenAIClient + LIFT_AI_MODEL), with a deterministic
 * fallback that walks the agenda when no key is present — so interviews
 * still complete and produce transcripts without AI.
 */

import { Timestamp } from "firebase-admin/firestore";
import { createOpenAIClient } from "@/lib/openai-config";
import { recommendationsForDomain } from "../recommendations";
import { buildEvaluationPrompt, buildSuggestPrompt, buildSystemPrompt, formatTranscript } from "../prompts";
import {
  INTERVIEW_MAX_TURNS,
  type InterviewConfig,
  type InterviewEvaluation,
  type InterviewMessage,
  type LiftInterviewDoc,
  type LiftInterviewSessionDoc,
} from "../types";

const MODEL = process.env.LIFT_AI_MODEL || "gpt-4o-mini";

export interface TurnResult {
  reply: string;
  coveredTopics: string[];
  finished: boolean;
  aiPowered: boolean;
}

export interface SuggestResult {
  systemPrompt: string;
  suggestedQuestions: string[];
  tips: string[];
  aiPowered: boolean;
}

/** Extract the first {...} JSON object from a model response. */
function parseJson<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

const GENERIC_TOPICS = ["background and context", "current situation", "challenges and needs", "goals and next steps"];

function closingLine(interview: InterviewConfig): string {
  return interview.closingMessage.trim() ||
    "Thank you — that covers everything I needed. Your responses have been recorded and will be reviewed by the team that sent this interview.";
}

function greetingLine(interview: InterviewConfig, respondentName: string): string {
  return (
    interview.greetingMessage.trim() ||
    `Hi${respondentName ? ` ${respondentName.split(" ")[0]}` : ""}, thanks for taking this interview. I'll ask you a few questions, one at a time.`
  );
}

// ─── AI turns ───────────────────────────────────────────────────────────────

interface ModelTurn {
  reply: string;
  coveredTopics: string[];
  finished: boolean;
}

/** One AI turn over the transcript; returns null when OpenAI is unavailable. */
async function aiTurn(interview: InterviewConfig, messages: InterviewMessage[]): Promise<ModelTurn | null> {
  const client = await createOpenAIClient();
  if (!client) return null;

  const chat = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(interview) },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })),
      ...(messages.length === 0
        ? [{ role: "user" as const, content: "Begin the interview now." }]
        : []),
    ],
  });

  const parsed = parseJson<Partial<ModelTurn>>(chat.choices[0]?.message?.content);
  if (!parsed || typeof parsed.reply !== "string" || !parsed.reply.trim()) return null;
  return {
    reply: parsed.reply.trim(),
    coveredTopics: Array.isArray(parsed.coveredTopics)
      ? parsed.coveredTopics.filter((t): t is string => typeof t === "string")
      : [],
    finished: parsed.finished === true,
  };
}

/** Deterministic turn used when OpenAI is not configured. */
function fallbackTurn(interview: InterviewConfig, session: LiftInterviewSessionDoc): ModelTurn {
  const isFirst = session.messages.length === 0;
  const prefix = isFirst ? `${greetingLine(interview, session.respondentName)}\n\n` : "";

  if (interview.mode === "scripted") {
    const questions = interview.keyQuestions.length ? interview.keyQuestions : GENERIC_TOPICS.map((t) => `Could you tell me about ${t}?`);
    const next = interview.keyQuestions.length ? session.questionIndex : Math.floor(session.messages.filter((m) => m.role === "assistant").length);
    if (next < questions.length) {
      return { reply: `${prefix}${questions[next]}`, coveredTopics: session.coveredTopics, finished: false };
    }
    return { reply: `${prefix}${closingLine(interview)}`, coveredTopics: session.coveredTopics, finished: true };
  }

  const agenda = interview.topicsToCover.length ? interview.topicsToCover : GENERIC_TOPICS;
  const covered = new Set(session.coveredTopics);
  const nextTopic = agenda.find((t) => !covered.has(t));
  if (nextTopic) {
    return {
      reply: `${prefix}Could you tell me about ${nextTopic}?`,
      coveredTopics: [...session.coveredTopics, nextTopic],
      finished: false,
    };
  }
  return { reply: `${prefix}${closingLine(interview)}`, coveredTopics: session.coveredTopics, finished: true };
}

/**
 * Produce the interviewer's opening message (greeting + first question).
 */
export async function generateOpening(interview: LiftInterviewDoc, session: LiftInterviewSessionDoc): Promise<TurnResult> {
  const ai = await aiTurn(interview, session.messages).catch(() => null);
  if (ai) {
    // The configured greeting is creator-controlled text the model never sees —
    // prepend it verbatim so it always opens the conversation.
    const greeting = interview.greetingMessage.trim();
    const reply = greeting ? `${greeting}\n\n${ai.reply}` : ai.reply;
    return { reply, coveredTopics: ai.coveredTopics, finished: ai.finished, aiPowered: true };
  }
  const fb = fallbackTurn(interview, session);
  return { reply: fb.reply, coveredTopics: fb.coveredTopics, finished: fb.finished, aiPowered: false };
}

/**
 * Append the respondent's message, run the interviewer turn, and return the
 * reply. Callers persist the returned message list themselves.
 */
export async function runTurn(interview: LiftInterviewDoc, session: LiftInterviewSessionDoc): Promise<TurnResult> {
  const respondentTurns = session.messages.filter((m) => m.role === "respondent").length;
  const ai = await aiTurn(interview, session.messages).catch(() => null);

  let result: TurnResult;
  if (ai) {
    result = { reply: ai.reply, coveredTopics: ai.coveredTopics, finished: ai.finished, aiPowered: true };
  } else {
    const fb = fallbackTurn(interview, session);
    result = { reply: fb.reply, coveredTopics: fb.coveredTopics, finished: fb.finished, aiPowered: false };
  }

  // Hard turn cap — never let a session run past the ceiling.
  if (!result.finished && respondentTurns >= INTERVIEW_MAX_TURNS) {
    result = { ...result, reply: `${result.reply}\n\n${closingLine(interview)}`, finished: true };
  }
  return result;
}

// ─── Finalization ───────────────────────────────────────────────────────────

async function aiEvaluation(interview: LiftInterviewDoc, transcript: string): Promise<InterviewEvaluation | null> {
  const client = await createOpenAIClient();
  if (!client) return null;
  const chat = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: buildEvaluationPrompt(interview, transcript) }],
  });
  const parsed = parseJson<Partial<InterviewEvaluation>>(chat.choices[0]?.message?.content);
  if (!parsed) return null;
  return {
    source: "ai",
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    insights: Array.isArray(parsed.insights) ? parsed.insights.filter((i): i is string => typeof i === "string") : [],
    rubricScores: Array.isArray(parsed.rubricScores)
      ? parsed.rubricScores.filter(
          (r): r is InterviewEvaluation["rubricScores"][number] =>
            typeof r === "object" && r !== null && typeof (r as { criterion?: unknown }).criterion === "string"
        )
      : [],
    overallScore: typeof parsed.overallScore === "number" ? parsed.overallScore : undefined,
    recommendedNextSteps: Array.isArray(parsed.recommendedNextSteps)
      ? parsed.recommendedNextSteps.filter((s): s is string => typeof s === "string")
      : [],
    generatedAt: Timestamp.now().toDate().toISOString(),
  };
}

function fallbackEvaluation(interview: LiftInterviewDoc, session: LiftInterviewSessionDoc): InterviewEvaluation {
  const topics = session.coveredTopics.length ? session.coveredTopics : interview.topicsToCover;
  return {
    source: "fallback",
    summary: `Interview with ${session.respondentName} completed over ${session.messages.filter((m) => m.role === "respondent").length} responses${
      topics.length ? `, covering: ${topics.join(", ")}` : ""
    }. Full transcript available below.`,
    insights: [],
    rubricScores: [],
    recommendedNextSteps: [],
    generatedAt: Timestamp.now().toDate().toISOString(),
  };
}

/** Produce the closing evaluation for a completed session. */
export async function evaluateSession(
  interview: LiftInterviewDoc,
  session: LiftInterviewSessionDoc
): Promise<InterviewEvaluation> {
  const transcript = formatTranscript(session.messages);
  const ai = await aiEvaluation(interview, transcript).catch((error) => {
    console.error("Interview evaluation failed:", error);
    return null;
  });
  return ai ?? fallbackEvaluation(interview, session);
}

// ─── Prompt suggestion (setup assistant) ────────────────────────────────────

/**
 * Generate a recommended system prompt + questions from the setup fields.
 * Falls back to the closest curated domain recommendation.
 */
export async function suggestPrompt(interview: InterviewConfig): Promise<SuggestResult> {
  const client = await createOpenAIClient();
  if (client) {
    try {
      const chat = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: buildSuggestPrompt(interview) }],
      });
      const parsed = parseJson<Partial<SuggestResult>>(chat.choices[0]?.message?.content);
      if (parsed && typeof parsed.systemPrompt === "string" && parsed.systemPrompt.trim()) {
        return {
          systemPrompt: parsed.systemPrompt.trim(),
          suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
            ? parsed.suggestedQuestions.filter((q): q is string => typeof q === "string")
            : [],
          tips: Array.isArray(parsed.tips) ? parsed.tips.filter((t): t is string => typeof t === "string") : [],
          aiPowered: true,
        };
      }
    } catch (error) {
      console.error("Prompt suggestion failed:", error);
    }
  }

  // Fallback: nearest curated recommendation for the domain.
  const recs = recommendationsForDomain(interview.domain);
  const rec = recs[0] ?? recommendationsForDomain("custom")[0];
  return {
    systemPrompt: rec.systemPrompt,
    suggestedQuestions: rec.suggestedQuestions,
    tips: [
      "OpenAI is not configured, so this is the closest template from the built-in recommendations — edit it to fit your objective.",
      `Falling back to the "${rec.title}" template.`,
    ],
    aiPowered: false,
  };
}
