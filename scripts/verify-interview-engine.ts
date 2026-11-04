/**
 * Offline smoke test for the AI interview engine's deterministic fallback.
 * Run with the OpenAI key cleared so every AI call returns null:
 *   $env:OPENAI_API_KEY=""; npx tsx scripts/verify-interview-engine.ts   (PowerShell)
 *   OPENAI_API_KEY= npx tsx scripts/verify-interview-engine.ts           (bash)
 * Exits non-zero on failure.
 */

import { interviewConfigSchema, parseInterviewKey, type LiftInterviewDoc, type LiftInterviewSessionDoc } from "@/lib/interview/types";
import { buildSystemPrompt, defaultProcessDescription, formatTranscript } from "@/lib/interview/prompts";
import { evaluateSession, generateOpening, runTurn, suggestPrompt } from "@/lib/interview/server/engine";
import { INTERVIEW_PROMPT_RECOMMENDATIONS } from "@/lib/interview/recommendations";

let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  if (ok) console.log(`  PASS ${name}`);
  else {
    failures += 1;
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const config = interviewConfigSchema.parse({
  title: "Capital Readiness Interview",
  domain: "program_readiness",
  mode: "scripted",
  estimatedMinutes: 8,
  topicsToCover: ["funding purpose", "documentation readiness"],
  keyQuestions: [
    "What do you need funding for, and how much are you seeking?",
    "Which financial documents could you produce today?",
    "How is your credit history?",
  ],
  outputs: ["summary", "insights", "score"],
  evaluationRubric: "Use-of-funds clarity (1-5), documentation readiness (1-5).",
});

const interview: LiftInterviewDoc = {
  ...config,
  id: "test-iv",
  slug: "capital-readiness-interview-abc123",
  status: "published",
  version: 1,
  publicLinkEnabled: true,
  analytics: { invitesSent: 0, sessionsStarted: 0, sessionsCompleted: 0 },
  createdByUid: "tester",
  createdByName: "Tester",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function freshSession(): LiftInterviewSessionDoc {
  return {
    id: "test-session",
    interviewId: interview.id,
    interviewVersion: 1,
    interviewTitle: interview.title,
    respondentName: "Test Respondent",
    source: "public_link",
    status: "in_progress",
    sessionToken: "tok",
    messages: [],
    coveredTopics: [],
    questionIndex: 0,
    startedAt: new Date().toISOString(),
  };
}

async function main(): Promise<void> {
  console.log("— Access keys —");
  check("inv_ key parses", parseInterviewKey("inv_abc")?.kind === "invite");
  check("pub_ key parses", parseInterviewKey("pub_my-slug")?.kind === "public");
  check("bad key rejected", parseInterviewKey("nope") === null);

  console.log("— Prompt assembly —");
  const prompt = buildSystemPrompt(interview);
  check("system prompt includes scripted questions", prompt.includes("funding for"));
  check("system prompt includes JSON contract", prompt.includes('"coveredTopics"'));
  check("process description generated", defaultProcessDescription(interview).includes("8 minutes"));

  console.log("— Recommendations —");
  check("recommendations exist for all 4 domains",
    ["business_advising", "hiring_screening", "customer_research", "program_readiness"].every(
      (d) => INTERVIEW_PROMPT_RECOMMENDATIONS.some((r) => r.domain === d)
    )
  );

  console.log("— Fallback engine (scripted) —");
  const session = freshSession();
  const opening = await generateOpening(interview, session);
  check("opening asks first question", opening.reply.includes("funding for"), opening.reply.slice(0, 80));
  check("opening not finished", !opening.finished);

  session.messages.push({ role: "assistant", content: opening.reply, at: new Date().toISOString() });
  let last = opening;
  for (let i = 0; i < 4; i++) {
    session.messages.push({ role: "respondent", content: `Answer ${i + 1}`, at: new Date().toISOString() });
    last = await runTurn(interview, session);
    session.messages.push({ role: "assistant", content: last.reply, at: new Date().toISOString() });
    session.questionIndex += 1;
    if (last.finished) break;
  }
  check("scripted interview finishes after questions", last.finished, `turns=${session.messages.length}`);

  const evaln = await evaluateSession(interview, session);
  check("evaluation produced", evaln.summary.length > 10);
  check("evaluation marked fallback", evaln.source === "fallback");
  check("transcript formats", formatTranscript(session.messages).includes("Interviewer:"));

  console.log("— Fallback engine (conversational) —");
  const conv = freshSession();
  const convInterview = { ...interview, mode: "conversational" as const };
  const convOpen = await generateOpening(convInterview, conv);
  conv.messages.push({ role: "assistant", content: convOpen.reply, at: new Date().toISOString() });
  check("conversational opening produced", convOpen.reply.length > 5);

  let convLast = convOpen;
  for (let i = 0; i < 4; i++) {
    conv.messages.push({ role: "respondent", content: "Some answer.", at: new Date().toISOString() });
    convLast = await runTurn(convInterview, conv);
    conv.messages.push({ role: "assistant", content: convLast.reply, at: new Date().toISOString() });
    conv.coveredTopics = convLast.coveredTopics; // the route applies this between turns
    if (convLast.finished) break;
  }
  check("conversational covers topics then finishes", convLast.finished, `covered=${conv.coveredTopics.length}`);

  const suggestion = await suggestPrompt(config);
  check("suggestPrompt returns a prompt", suggestion.systemPrompt.length > 20);
  console.log(`  INFO suggestPrompt aiPowered=${suggestion.aiPowered} (false expected when OPENAI_API_KEY is unset)`);

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
