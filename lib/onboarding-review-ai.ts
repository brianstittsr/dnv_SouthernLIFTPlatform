import { createOpenAIClient } from "@/lib/openai-config";
import type { ConsortiumMemberDoc } from "@/lib/schema";

/**
 * AI-assisted onboarding sufficiency review.
 *
 * Combines a deterministic rule-based checklist (are the required fields
 * present at all?) with an LLM pass that judges whether the free-text
 * content (company description, expertise, past performance) is detailed
 * enough to power good semantic search, AI opportunity matching, and AI
 * teaming recommendations.
 */

const MODEL = "gpt-4o-mini";

export interface ReviewFinding {
  field: string; // human-readable field label, e.g. "Company Description"
  severity: "missing" | "weak" | "ok";
  note: string; // why it was flagged, or confirmation it's sufficient
  source: "rule" | "ai";
}

export interface OnboardingSufficiencyResult {
  findings: ReviewFinding[];
  readyForApproval: boolean;
  aiSummary: string;
}

function safeJsonParse<T>(content: string | null | undefined, fallback: T): T {
  if (!content) return fallback;
  try {
    const cleaned = content.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

/**
 * Deterministic checklist: flags fields that are missing/empty outright.
 * These never require the LLM and always run.
 */
function runRuleBasedChecklist(member: ConsortiumMemberDoc): ReviewFinding[] {
  const ci = member.companyIntelligence;
  const findings: ReviewFinding[] = [];

  const check = (
    field: string,
    present: boolean,
    missingNote: string
  ) => {
    findings.push({
      field,
      severity: present ? "ok" : "missing",
      note: present ? "Provided." : missingNote,
      source: "rule",
    });
  };

  check(
    "Company Description",
    Boolean(ci?.companyDescription && ci.companyDescription.trim().length > 0),
    "No company description on file — required for AI semantic matching."
  );
  check(
    "NAICS Codes",
    Boolean((ci?.primaryNaicsCodes?.length || member.naicsCodes?.length || 0) > 0),
    "No NAICS codes on file — required for opportunity matching."
  );
  check(
    "Certifications / Designations",
    Boolean(
      (member.certifications?.length || 0) > 0 ||
        ci?.certifications?.cmmcLevel ||
        (ci?.certifications?.otherCertifications?.length || 0) > 0 ||
        Object.values(ci?.federalDesignations || {}).some((v) => v === true)
    ),
    "No certifications or federal designations on file."
  );
  check(
    "Technical Expertise / Service Offerings",
    Boolean((ci?.technicalExpertise?.length || 0) > 0 || (ci?.serviceOfferings?.length || 0) > 0 || (member.expertise || "").trim().length > 0),
    "No technical expertise or service offerings listed."
  );
  check(
    "Past Performance",
    Boolean((ci?.notableContracts?.length || 0) > 0),
    "No notable past contracts listed — reduces AI teaming recommendation quality."
  );
  check(
    "Readiness Documents",
    Boolean((member.readinessDocuments?.length || 0) > 0),
    "No readiness documents uploaded (SAM registration, capability statement, etc.)."
  );
  check(
    "Geographic / Partnership Preferences",
    Boolean((ci?.statesServed?.length || 0) > 0 || ci?.willingToPrime !== undefined || ci?.willingToSub !== undefined),
    "No geographic service area or prime/sub partnership preferences set."
  );
  check(
    "SAM.gov Registration",
    Boolean(ci?.samRegistration?.status === "active" || ci?.uei || ci?.cageCode),
    "No active SAM.gov registration, UEI, or CAGE code on file."
  );

  return findings;
}

/**
 * LLM pass: judges whether the free-text content is detailed/specific
 * enough for high-quality AI matching, beyond simply being non-empty.
 */
async function runAiQualityReview(member: ConsortiumMemberDoc): Promise<ReviewFinding[]> {
  const openai = await createOpenAIClient();
  const ci = member.companyIntelligence;
  if (!openai) return [];

  const hasAnyText =
    (ci?.companyDescription && ci.companyDescription.trim().length > 0) ||
    (ci?.technicalExpertise?.length || 0) > 0 ||
    (ci?.notableContracts?.length || 0) > 0;
  if (!hasAnyText) return [];

  const profileText = [
    ci?.companyDescription ? `Company Description: ${ci.companyDescription}` : null,
    ci?.ceoBiography ? `CEO Bio: ${ci.ceoBiography}` : null,
    ci?.technicalExpertise?.length ? `Technical Expertise: ${ci.technicalExpertise.join(", ")}` : null,
    ci?.serviceOfferings?.length ? `Service Offerings: ${ci.serviceOfferings.join(", ")}` : null,
    ci?.keyDifferentiators?.length ? `Key Differentiators: ${ci.keyDifferentiators.join(", ")}` : null,
    ci?.notableContracts?.length
      ? `Past Contracts: ${ci.notableContracts
          .map((c) => `${c.contractTitle} for ${c.client} — ${c.description}`)
          .join(" | ")}`
      : null,
    ci?.idealPartnerProfile ? `Ideal Partner Profile: ${ci.idealPartnerProfile}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  if (!profileText.trim()) return [];

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a federal contracting profile reviewer helping an admin decide whether a member's onboarding profile has ENOUGH DETAIL for AI-driven semantic search, opportunity matching, and teaming recommendations. Judge specificity and usefulness, not just presence. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: `Member profile content:\n${profileText}\n\nEvaluate these aspects: "Company Description", "Technical Expertise", "Past Performance". For each, return whether it is "weak" (too vague/generic to power good AI matching) or "ok" (specific and detailed enough). Only flag "weak" if genuinely insufficient. Return JSON: {"findings": [{"field": string, "severity": "weak"|"ok", "note": string (1 sentence)}]}`,
        },
      ],
    });

    const parsed = safeJsonParse<{ findings: { field: string; severity: "weak" | "ok"; note: string }[] }>(
      response.choices[0]?.message?.content,
      { findings: [] }
    );

    return (parsed.findings || [])
      .filter((f) => f.field && f.severity)
      .map((f) => ({ field: f.field, severity: f.severity, note: f.note || "", source: "ai" as const }));
  } catch (error) {
    console.error("runAiQualityReview: OpenAI request failed", error);
    return [];
  }
}

/**
 * Full sufficiency analysis: rule-based checklist + AI quality review.
 * `readyForApproval` is true only if there are no "missing" or "weak"
 * findings at all.
 */
export async function analyzeOnboardingSufficiency(
  member: ConsortiumMemberDoc
): Promise<OnboardingSufficiencyResult> {
  const ruleFindings = runRuleBasedChecklist(member);
  const aiFindings = await runAiQualityReview(member);

  const findings = [...ruleFindings, ...aiFindings];
  const readyForApproval = findings.every((f) => f.severity === "ok");

  const issues = findings.filter((f) => f.severity !== "ok");
  const aiSummary = issues.length
    ? `${issues.length} item${issues.length === 1 ? "" : "s"} flagged for follow-up: ${issues
        .map((f) => f.field)
        .join(", ")}.`
    : "Profile content is complete and sufficiently detailed for AI search, recommendations, and teaming.";

  return { findings, readyForApproval, aiSummary };
}
