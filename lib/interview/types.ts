/**
 * LIFT AI Interview Tool - shared types.
 *
 * A configurable, prompt-driven AI interviewer that admins build in the Form
 * Studio area and deploy via tracked email invites or a public link. Based on
 * docs/svp-kdm-features/Interviewtool/inverviewtool.md, scoped to prompt
 * customization + multi-recipient deployment (attachments, spec generation,
 * and approval workflows are intentionally out of scope).
 *
 * Server-only collections (client SDK denied in firestore.rules):
 *   liftInterviews, liftInterviewInvites, liftInterviewSessions
 */

import { z } from "zod";

/** How the AI drives the conversation. */
export type InterviewMode = "conversational" | "scripted";

/** Recommendation + categorization domain for the interview. */
export type InterviewDomain =
  | "business_advising"
  | "hiring_screening"
  | "customer_research"
  | "program_readiness"
  | "custom";

export type InterviewStatus = "draft" | "published" | "archived";

export type InterviewTone = "professional" | "warm" | "formal" | "conversational";

/** How aggressively the interviewer probes beyond the primary question. */
export type FollowUpDepth = "none" | "light" | "deep";

export type InterviewOutput = "summary" | "insights" | "score" | "next_steps";

export const INTERVIEW_DOMAINS: { value: InterviewDomain; label: string }[] = [
  { value: "business_advising", label: "Business advising & intake" },
  { value: "hiring_screening", label: "Hiring & screening" },
  { value: "customer_research", label: "Customer & market research" },
  { value: "program_readiness", label: "Program & grant readiness" },
  { value: "custom", label: "Custom" },
];

export const INTERVIEW_TONES: { value: InterviewTone; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Neutral, businesslike, and efficient." },
  { value: "warm", label: "Warm & encouraging", description: "Friendly, supportive, puts respondents at ease." },
  { value: "formal", label: "Formal", description: "Structured and precise, suited to compliance-style interviews." },
  { value: "conversational", label: "Conversational", description: "Casual, chatty, feels like a relaxed discussion." },
];

export const FOLLOW_UP_DEPTHS: { value: FollowUpDepth; label: string; description: string }[] = [
  { value: "none", label: "None", description: "Move straight through the agenda; fastest for respondents." },
  { value: "light", label: "Light", description: "One clarifying follow-up when an answer is vague or thin." },
  { value: "deep", label: "Deep", description: "Up to two probing follow-ups to fully explore each topic." },
];

export const INTERVIEW_OUTPUTS: { value: InterviewOutput; label: string; description: string }[] = [
  { value: "summary", label: "Executive summary", description: "A concise narrative of what was learned." },
  { value: "insights", label: "Key insights & themes", description: "Bulleted findings, patterns, and notable quotes." },
  { value: "score", label: "Rubric score", description: "Numeric evaluation against your scoring rubric." },
  { value: "next_steps", label: "Recommended next steps", description: "Suggested actions for the creator based on the interview." },
];

/** Zod schema for the setup fields an admin edits (no server-generated data). */
export const interviewConfigSchema = z.object({
  title: z.string().min(2).max(200),
  /** Respondent-facing description of what the interview is about. */
  description: z.string().max(2000).default(""),
  /** Respondent-facing explanation of the process; sensible default applied. */
  processDescription: z.string().max(2000).default(""),
  domain: z.enum(["business_advising", "hiring_screening", "customer_research", "program_readiness", "custom"]),
  mode: z.enum(["conversational", "scripted"]),
  /** What the creator wants to learn / decide from the interviews. */
  objective: z.string().max(2000).default(""),
  /** Who the interviews are intended for (helps the AI calibrate questions). */
  targetAudience: z.string().max(500).default(""),
  tone: z.enum(["professional", "warm", "formal", "conversational"]).default("professional"),
  /** Topics the interviewer must cover before finishing. */
  topicsToCover: z.array(z.string().min(1).max(200)).max(20).default([]),
  /** Fixed questions (scripted mode) or must-ask questions (conversational). */
  keyQuestions: z.array(z.string().min(1).max(500)).max(30).default([]),
  followUpDepth: z.enum(["none", "light", "deep"]).default("light"),
  /** Target length shown to respondents; also bounds question count. */
  estimatedMinutes: z.number().int().min(2).max(60).default(10),
  /** Free-text rubric the AI applies when evaluating the transcript. */
  evaluationRubric: z.string().max(2000).default(""),
  outputs: z.array(z.enum(["summary", "insights", "score", "next_steps"])).default(["summary", "insights"]),
  greetingMessage: z.string().max(1000).default(""),
  closingMessage: z.string().max(1000).default(""),
  /** The full interviewer system prompt; editable, usually AI-generated. */
  systemPrompt: z.string().max(12000).default(""),
});

export type InterviewConfig = z.infer<typeof interviewConfigSchema>;

/** Firestore: liftInterviews/{interviewId} */
export interface LiftInterviewDoc extends InterviewConfig {
  id: string;
  slug: string;
  status: InterviewStatus;
  version: number;
  /** Shared public link enabled — published interviews only. */
  publicLinkEnabled: boolean;
  analytics: {
    invitesSent: number;
    sessionsStarted: number;
    sessionsCompleted: number;
  };
  createdByUid: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type InviteStatus = "sent" | "started" | "completed" | "bounced";

/** Firestore: liftInterviewInvites/{inviteId} */
export interface LiftInterviewInviteDoc {
  id: string;
  interviewId: string;
  interviewTitle: string;
  /** Random unguessable token embedded in the respondent link. */
  token: string;
  recipientName: string;
  recipientEmail: string;
  status: InviteStatus;
  emailSent: boolean;
  /** Set when the recipient is a platform user (matched by email). */
  recipientUid?: string;
  sessionId?: string;
  sentAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface InterviewMessage {
  role: "assistant" | "respondent";
  content: string;
  at: string;
}

export interface InterviewRubricScore {
  criterion: string;
  score: number;
  maxScore: number;
  note: string;
}

/** AI-generated (or fallback) evaluation written when a session completes. */
export interface InterviewEvaluation {
  source: "ai" | "fallback";
  summary: string;
  insights: string[];
  rubricScores: InterviewRubricScore[];
  overallScore?: number;
  recommendedNextSteps: string[];
  generatedAt: string;
}

export type SessionStatus = "in_progress" | "completed";
export type SessionSource = "invite" | "public_link" | "test";

/** Firestore: liftInterviewSessions/{sessionId} */
export interface LiftInterviewSessionDoc {
  id: string;
  interviewId: string;
  interviewVersion: number;
  interviewTitle: string;
  inviteId?: string;
  respondentName: string;
  respondentEmail?: string;
  source: SessionSource;
  status: SessionStatus;
  /** Server-generated bearer token; compared against the httpOnly cookie. */
  sessionToken: string;
  messages: InterviewMessage[];
  /** Topics the engine has confirmed covered so far. */
  coveredTopics: string[];
  /** Index into keyQuestions for scripted mode progress. */
  questionIndex: number;
  evaluation?: InterviewEvaluation;
  startedAt: string;
  completedAt?: string;
  completionSeconds?: number;
}

/** Sanitized payload the public landing page receives. */
export interface PublicInterviewInfo {
  title: string;
  description: string;
  processDescription: string;
  estimatedMinutes: number;
  mode: InterviewMode;
  /** Set when this invite/link already produced a completed session. */
  alreadyCompleted: boolean;
  /** Prefilled identity from the invite (respondent can correct it). */
  recipientName?: string;
  recipientEmail?: string;
}

/** A curated prompt recommendation shown in the Prompt tab. */
export interface InterviewPromptRecommendation {
  id: string;
  domain: InterviewDomain;
  title: string;
  description: string;
  suggestedObjective: string;
  suggestedTopics: string[];
  suggestedQuestions: string[];
  suggestedRubric: string;
  systemPrompt: string;
}

/** Access key embedded in respondent links: inv_<token> or pub_<slug>. */
export function parseInterviewKey(key: string): { kind: "invite"; token: string } | { kind: "public"; slug: string } | null {
  if (key.startsWith("inv_") && key.length > 4) return { kind: "invite", token: key.slice(4) };
  if (key.startsWith("pub_") && key.length > 4) return { kind: "public", slug: key.slice(4) };
  return null;
}

export const INTERVIEW_SESSION_COOKIE = "lift_interview_session";
/** Hard ceiling on conversation turns regardless of configuration. */
export const INTERVIEW_MAX_TURNS = 40;
