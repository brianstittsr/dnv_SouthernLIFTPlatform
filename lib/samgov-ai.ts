import { createOpenAIClient } from "@/lib/openai-config";
import type { SamGovOpportunity } from "@/lib/samgov-service";

/**
 * AI helpers for the SAM.gov integration: opportunity relevance scoring,
 * teaming-partner recommendations, and NAICS code suggestions.
 * Uses the platform's configured LLM (Settings > LLM Configuration).
 */

const MODEL = "gpt-4o-mini";

export interface MemberProfileSummary {
  userId: string;
  name: string;
  companyName?: string;
  companyDescription?: string;
  naicsCodes?: string[];
  certifications?: string[];
  expertise?: string;
}

export interface ScoredOpportunityMatch {
  noticeId: string;
  matchScore: number;
  matchReasons: string[];
}

function safeJsonParse<T>(content: string | null | undefined, fallback: T): T {
  if (!content) return fallback;
  try {
    // Strip markdown code fences if the model wraps its JSON output
    const cleaned = content.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

/**
 * Ask the LLM to rank a batch of SAM.gov opportunities by relevance to a
 * member's profile and return the top matches with reasoning.
 */
export async function scoreOpportunitiesForMember(
  profile: MemberProfileSummary,
  opportunities: SamGovOpportunity[],
  maxMatches = 5
): Promise<ScoredOpportunityMatch[]> {
  const openai = await createOpenAIClient();
  if (!openai || opportunities.length === 0) return [];

  const profileText = [
    `Company: ${profile.companyName || "Unknown"}`,
    profile.companyDescription ? `Description: ${profile.companyDescription}` : null,
    profile.naicsCodes?.length ? `NAICS Codes: ${profile.naicsCodes.join(", ")}` : null,
    profile.certifications?.length ? `Certifications: ${profile.certifications.join(", ")}` : null,
    profile.expertise ? `Expertise: ${profile.expertise}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const opportunityList = opportunities.slice(0, 100).map((opp) => ({
    noticeId: opp.noticeId || opp.id,
    title: opp.title,
    agency: opp.organizationHierarchy,
    naicsCode: opp.naicsCode,
    setAside: opp.typeOfSetAsideDescription,
    responseDeadline: opp.responseDeadLine,
    description: typeof opp.description === "string" ? opp.description.slice(0, 300) : undefined,
  }));

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a federal contracting analyst helping a small business identify the SAM.gov opportunities most relevant to their capabilities. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: `Member profile:\n${profileText}\n\nOpportunities (JSON array):\n${JSON.stringify(
            opportunityList
          )}\n\nReturn the top ${maxMatches} most relevant opportunities for this member as JSON: {"matches": [{"noticeId": string, "matchScore": number (0-100), "matchReasons": string[] (2-4 short reasons)}]}. Only include opportunities that are genuinely relevant; if none are relevant, return an empty array.`,
        },
      ],
    });

    const parsed = safeJsonParse<{ matches: ScoredOpportunityMatch[] }>(
      response.choices[0]?.message?.content,
      { matches: [] }
    );
    return (parsed.matches || []).filter((m) => m.noticeId && typeof m.matchScore === "number");
  } catch (error) {
    console.error("scoreOpportunitiesForMember: OpenAI request failed", error);
    return [];
  }
}

export interface TeamingCandidate {
  memberId: string; // userId or teamMemberId
  companyName: string;
  companyDescription?: string;
  naicsCodes?: string[];
  certifications?: string[];
  expertise?: string;
}

export interface TeamingRecommendationResult {
  memberId: string;
  companyName: string;
  matchScore: number;
  matchReasons: string[];
  complementaryCapabilities: string[];
  relevantCertifications: string[];
  pastPerformanceRelevance: string;
}

/**
 * Ask the LLM to pick the best complementary KDM Consortium partner for a
 * given member + opportunity, from a pool of candidate members.
 */
export async function recommendTeamingPartner(
  requester: MemberProfileSummary,
  opportunity: { title: string; naicsCode?: string; description?: string },
  candidates: TeamingCandidate[]
): Promise<TeamingRecommendationResult | null> {
  const openai = await createOpenAIClient();
  if (!openai || candidates.length === 0) return null;

  const requesterText = [
    `Company: ${requester.companyName || "Unknown"}`,
    requester.companyDescription ? `Description: ${requester.companyDescription}` : null,
    requester.naicsCodes?.length ? `NAICS Codes: ${requester.naicsCodes.join(", ")}` : null,
    requester.certifications?.length ? `Certifications: ${requester.certifications.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a federal contracting teaming advisor. Given a member pursuing a specific opportunity and a pool of potential KDM Consortium teaming partners, pick the ONE best complementary partner (or none, if no good fit exists) and explain why. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: `Requesting member:\n${requesterText}\n\nOpportunity: ${opportunity.title} (NAICS ${
            opportunity.naicsCode || "n/a"
          })\n${opportunity.description ? `Description: ${opportunity.description.slice(0, 400)}\n` : ""}\nCandidate partners (JSON array):\n${JSON.stringify(
            candidates
          )}\n\nReturn JSON: {"memberId": string | null, "companyName": string, "matchScore": number (0-100), "matchReasons": string[], "complementaryCapabilities": string[], "relevantCertifications": string[], "pastPerformanceRelevance": string}. Set memberId to null if no candidate is a good fit.`,
        },
      ],
    });

    type ParsedTeamingResult = Omit<TeamingRecommendationResult, "memberId"> & { memberId: string | null };

    const parsed = safeJsonParse<ParsedTeamingResult>(
      response.choices[0]?.message?.content,
      { memberId: null, companyName: "", matchScore: 0, matchReasons: [], complementaryCapabilities: [], relevantCertifications: [], pastPerformanceRelevance: "" }
    );

    if (!parsed.memberId) return null;
    return { ...parsed, memberId: parsed.memberId };
  } catch (error) {
    console.error("recommendTeamingPartner: OpenAI request failed", error);
    return null;
  }
}

export interface NaicsSuggestion {
  code: string;
  title: string;
  reason: string;
  confidence: number;
}

/**
 * Ask the LLM to recommend NAICS codes based on a member's company profile.
 */
export async function suggestNaicsCodes(profile: MemberProfileSummary): Promise<NaicsSuggestion[]> {
  const openai = await createOpenAIClient();
  if (!openai) return [];

  const profileText = [
    `Company: ${profile.companyName || "Unknown"}`,
    profile.companyDescription ? `Description: ${profile.companyDescription}` : null,
    profile.expertise ? `Expertise: ${profile.expertise}` : null,
    profile.naicsCodes?.length ? `Existing NAICS Codes: ${profile.naicsCodes.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a federal contracting registration consultant. Recommend additional NAICS codes a company should register under in SAM.gov based on their profile. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: `Member profile:\n${profileText}\n\nRecommend up to 5 additional relevant 6-digit NAICS codes not already listed. Return JSON: {"suggestions": [{"code": string, "title": string, "reason": string, "confidence": number (0-100)}]}.`,
        },
      ],
    });

    const parsed = safeJsonParse<{ suggestions: NaicsSuggestion[] }>(
      response.choices[0]?.message?.content,
      { suggestions: [] }
    );
    return parsed.suggestions || [];
  } catch (error) {
    console.error("suggestNaicsCodes: OpenAI request failed", error);
    return [];
  }
}
