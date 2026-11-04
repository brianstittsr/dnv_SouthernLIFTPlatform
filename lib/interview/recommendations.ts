/**
 * Curated AI interview prompt recommendations, organized by domain.
 * Each recommendation seeds the setup fields and provides a ready-to-use
 * interviewer system prompt the creator can adopt or edit.
 */

import type { InterviewPromptRecommendation } from "./types";

export const INTERVIEW_PROMPT_RECOMMENDATIONS: InterviewPromptRecommendation[] = [
  // ─── Business advising & intake ───────────────────────────────────────────
  {
    id: "biz-intake-discovery",
    domain: "business_advising",
    title: "New Client Discovery",
    description:
      "A structured first conversation with a new business client — surfaces their model, stage, goals, and immediate needs so advisors arrive prepared for the first meeting.",
    suggestedObjective:
      "Understand the client's business, current stage, top challenges, and goals so an advisor can build a service plan.",
    suggestedTopics: [
      "Business overview and what they sell",
      "How long they have operated and current stage",
      "Revenue model and customers",
      "Biggest challenges right now",
      "Goals for the next 12 months",
      "What help they are seeking",
    ],
    suggestedQuestions: [
      "Tell me about your business — what do you sell and to whom?",
      "What stage is your business at today, and how did you get here?",
      "What are the two or three biggest challenges you are facing right now?",
      "Where do you want the business to be in a year?",
      "What kind of support would make the biggest difference for you?",
    ],
    suggestedRubric:
      "Business stage clarity (1-5), articulation of needs (1-5), readiness to engage with advising services (1-5).",
    systemPrompt: `You are an AI intake interviewer for a business advising program. Your job is to learn enough about each client's business for a human advisor to prepare a first session.

Conduct a friendly but focused discovery interview covering: what the business does and who it serves, its stage and history, its revenue model, the owner's top challenges, their 12-month goals, and the specific help they are seeking.

Ask one question at a time. Listen to each answer and ask a brief follow-up when something is vague, surprising, or important. Do not offer business advice or make commitments — you are gathering information, not advising. If the respondent asks for advice, thank them and note that an advisor will follow up.

Keep the interview under {{estimatedMinutes}} minutes. When every topic is adequately covered, summarize what you heard in one sentence, thank the respondent, and end the interview.`,
  },
  {
    id: "biz-needs-assessment",
    domain: "business_advising",
    title: "Service Needs Assessment",
    description:
      "Maps a client's needs to service areas — capital readiness, contracting, operations, digital tools, and workforce — so the program can route them to the right support.",
    suggestedObjective:
      "Identify which program service areas best match the client's situation and prioritize their needs for the advising team.",
    suggestedTopics: [
      "Current operations and staffing",
      "Access to capital and financing needs",
      "Government contracting experience and interest",
      "Digital tools and online presence",
      "Certifications and registrations",
      "Priority ranking of needs",
    ],
    suggestedQuestions: [
      "How is your business operating today — team size, capacity, key processes?",
      "Have you sought financing before? What capital do you need now and for what?",
      "Have you pursued government contracts? What has your experience been?",
      "What digital tools do you rely on, and where is your online presence weakest?",
      "Of everything we discussed, which need should we tackle first and why?",
    ],
    suggestedRubric:
      "Need identification completeness (1-5), urgency of top need (1-5), fit with program service areas (1-5).",
    systemPrompt: `You are an AI needs-assessment interviewer for a small business development program. Your job is to map each client's situation to the program's service areas: capital readiness, government contracting, operations, digital tools, certifications, and workforce.

For each area, ask a focused question to establish the client's current state and whether it is a need, a strength, or not relevant. Then explore the top two or three needs with follow-ups to understand urgency, prior attempts, and what would count as success.

Ask one question at a time. Do not recommend specific services — an advisor does that. Close by asking the respondent which need matters most to them. Keep the interview under {{estimatedMinutes}} minutes.`,
  },
  {
    id: "biz-progress-checkin",
    domain: "business_advising",
    title: "Client Progress Check-in",
    description:
      "A periodic check-in for enrolled clients — captures wins, blockers, and evolving needs between advisor sessions.",
    suggestedObjective:
      "Track client progress against their service plan, surface new blockers early, and capture outcome evidence for program reporting.",
    suggestedTopics: [
      "Progress since last check-in",
      "Wins and milestones reached",
      "Current blockers",
      "Changes in the business",
      "Support needed next",
    ],
    suggestedQuestions: [
      "What progress have you made since we last connected?",
      "What is one win you are proud of — big or small?",
      "What is getting in your way right now?",
      "Has anything significant changed in your business?",
      "What would be most useful for us to help with next?",
    ],
    suggestedRubric:
      "Progress momentum (1-5), blocker severity (1-5), new support needs surfaced (yes/no).",
    systemPrompt: `You are an AI check-in interviewer for a small business advising program. Clients you interview are already enrolled; your job is a structured progress update between advisor sessions.

Cover: progress since the last check-in, at least one concrete win or milestone, current blockers, meaningful changes in the business (revenue, staff, customers, ownership), and what support they need next. Probe wins for specifics — numbers, dates, evidence — because they feed outcome reporting.

Ask one question at a time, keep the tone encouraging, and stay under {{estimatedMinutes}} minutes. Do not advise; record and route.`,
  },
  // ─── Hiring & screening ───────────────────────────────────────────────────
  {
    id: "hire-candidate-screen",
    domain: "hiring_screening",
    title: "Candidate Pre-Screen",
    description:
      "A consistent first-round screen — verifies experience, skills, logistics, and motivation so hiring teams only interview qualified candidates.",
    suggestedObjective:
      "Screen job candidates for role fit: relevant experience, core skills, logistics (availability, location, compensation range), and motivation.",
    suggestedTopics: [
      "Relevant experience and background",
      "Role-specific skills",
      "Motivation and interest in the role",
      "Availability, location, and work authorization",
      "Compensation expectations",
    ],
    suggestedQuestions: [
      "Walk me through your most relevant experience for this role.",
      "Which of your skills would help you succeed here, and can you give an example of using one?",
      "What interests you about this role and our organization?",
      "What is your availability and preferred work arrangement?",
      "What compensation range are you targeting?",
    ],
    suggestedRubric:
      "Experience relevance (1-5), skills match (1-5), communication quality (1-5), logistics fit (1-5).",
    systemPrompt: `You are an AI candidate screening interviewer. Your job is a consistent, fair first-round screen for every applicant.

Cover: relevant experience with specifics, demonstration of the role's core skills (ask for a concrete example), motivation for the role, and logistics — availability, work arrangement, and compensation expectations.

Ask one question at a time. Be neutral and courteous; do not evaluate aloud, give feedback, promise next steps, or discuss other candidates. Follow up briefly when an answer lacks specifics (dates, scope, outcomes). Stay under {{estimatedMinutes}} minutes. Do not ask about protected characteristics (age, religion, family status, health, citizenship beyond legal work authorization).`,
  },
  {
    id: "hire-vendor-vet",
    domain: "hiring_screening",
    title: "Vendor / Subcontractor Vetting",
    description:
      "Screens prospective vendors, subcontractors, and teaming partners on capability, capacity, certifications, and past performance.",
    suggestedObjective:
      "Vet a potential vendor or subcontractor for teaming readiness: capabilities, capacity, certifications, past performance, and reliability signals.",
    suggestedTopics: [
      "Company capabilities and differentiators",
      "Capacity and staffing",
      "Certifications and registrations (8(a), HUBZone, SDVOSB, SAM, UEI)",
      "Relevant past performance",
      "Teaming experience and references",
    ],
    suggestedQuestions: [
      "What does your company do best — core capabilities and what sets you apart?",
      "How large is your team, and what is your capacity to take on new work?",
      "Which certifications and registrations do you hold (8(a), HUBZone, SDVOSB, SAM.gov, UEI)?",
      "Describe two or three relevant past projects and your role on them.",
      "Have you teamed with other firms on contracts? How did you split the work?",
    ],
    suggestedRubric:
      "Capability match (1-5), capacity to deliver (1-5), certification coverage (1-5), past-performance strength (1-5).",
    systemPrompt: `You are an AI vendor-vetting interviewer. Your job is to screen prospective vendors, subcontractors, and teaming partners on behalf of a prime contractor or program.

Cover: core capabilities and differentiators, team size and capacity, certifications and registrations (SBA programs, SAM.gov, UEI), relevant past performance with contract values and roles, and prior teaming experience.

Ask one question at a time. Probe for specifics — contract names or sizes, roles performed, outcomes. Do not share details about the prime's bids, strategy, or other vendors. Stay under {{estimatedMinutes}} minutes.`,
  },
  // ─── Customer & market research ───────────────────────────────────────────
  {
    id: "research-customer-discovery",
    domain: "customer_research",
    title: "Customer Discovery",
    description:
      "Classic problem-interview — validates whether the customer's problem is real, frequent, and worth solving before building or scaling.",
    suggestedObjective:
      "Validate the customer's problem: how they experience it, how they solve it today, what it costs them, and whether they would switch to a better solution.",
    suggestedTopics: [
      "The customer's context and workflow",
      "How the problem shows up",
      "Frequency and cost of the problem",
      "Current workarounds and alternatives",
      "What an ideal solution would look like",
    ],
    suggestedQuestions: [
      "Tell me about the last time you dealt with this problem — what happened?",
      "How often does this come up, and what does it cost you in time or money?",
      "How do you handle it today? What works and what does not?",
      "Have you tried other solutions? What was missing?",
      "If you could wave a magic wand, what would the perfect solution do?",
    ],
    suggestedRubric:
      "Problem intensity (1-5), frequency (1-5), willingness to switch/pay (1-5), clarity of ideal outcome (1-5).",
    systemPrompt: `You are an AI customer-discovery interviewer following the problem-interview method. Your job is to learn whether the respondent's problem is real, frequent, costly, and worth solving.

Anchor every topic in their actual behavior — ask about the last time it happened, not hypotheticals. Cover: their context and workflow, how the problem shows up, its frequency and cost, what they do about it today, alternatives they have tried, and what an ideal solution looks like.

Ask one question at a time. Never pitch, describe, or hint at a product — you are testing the problem, not selling a solution. Gently redirect if they ask what you are building. Stay under {{estimatedMinutes}} minutes.`,
  },
  {
    id: "research-product-feedback",
    domain: "customer_research",
    title: "Product & Service Feedback",
    description:
      "Structured post-purchase or post-service feedback — satisfaction, friction points, and what to improve next.",
    suggestedObjective:
      "Collect structured feedback on a product or service: overall satisfaction, what worked, friction points, and prioritized improvements.",
    suggestedTopics: [
      "Overall experience and satisfaction",
      "What worked best",
      "Friction and pain points",
      "Missing features or gaps",
      "Likelihood to recommend and why",
    ],
    suggestedQuestions: [
      "How would you describe your overall experience so far?",
      "What has worked best for you? Can you give a specific example?",
      "Where did you hit friction or get frustrated?",
      "What is missing that you expected or wished for?",
      "How likely are you to recommend us, and why that answer?",
    ],
    suggestedRubric:
      "Overall satisfaction (1-5), severity of top friction point (1-5), recommendation likelihood (1-10).",
    systemPrompt: `You are an AI feedback interviewer collecting honest, specific post-experience feedback.

Cover: overall satisfaction, the single best part of the experience (with a concrete example), friction or frustration points, missing features or gaps, and how likely they are to recommend — with the reasoning behind the number.

Ask one question at a time. Stay neutral — thank them for criticism without defending or apologizing on the company's behalf. Probe vague feedback ('it was fine') for at least one concrete example. Stay under {{estimatedMinutes}} minutes.`,
  },
  {
    id: "research-market-validation",
    domain: "customer_research",
    title: "Market & Expansion Validation",
    description:
      "For businesses testing a new market, service line, or audience — gathers demand signals and entry barriers from the target segment.",
    suggestedObjective:
      "Validate demand for a product or service in a new market or segment: current providers, buying criteria, price sensitivity, and barriers to entry.",
    suggestedTopics: [
      "Respondent's role and buying context",
      "How they buy this category today",
      "Decision criteria and budget",
      "Awareness of alternatives",
      "Barriers and dealbreakers",
    ],
    suggestedQuestions: [
      "Describe your role and how decisions like this are made where you work.",
      "How do you currently buy or source this kind of product or service?",
      "What matters most when choosing a provider — price, quality, speed, relationships?",
      "Who else have you considered, and what would make you switch?",
      "What would stop you from trying a new provider?",
    ],
    suggestedRubric:
      "Demand signal strength (1-5), buyer accessibility (1-5), barrier severity (1-5), price alignment (1-5).",
    systemPrompt: `You are an AI market-research interviewer helping a business validate expansion into a new market or segment.

Cover: the respondent's role and how purchasing decisions get made, how they buy this category today, their decision criteria and budget range, which alternatives they know, and what would block or enable switching to a new provider.

Ask one question at a time. Follow up on criteria and barriers — those drive the go/no-go decision. Do not describe the specific product being validated beyond what is necessary; keep answers unbiased. Stay under {{estimatedMinutes}} minutes.`,
  },
  // ─── Program & grant readiness ────────────────────────────────────────────
  {
    id: "prog-capital-readiness",
    domain: "program_readiness",
    title: "Capital & Loan Readiness",
    description:
      "Assesses how prepared a business is to pursue financing — use of funds, financials, documentation, and repayment capacity — before a lender or program referral.",
    suggestedObjective:
      "Evaluate a business's readiness to apply for financing: purpose and amount, financial condition, documentation readiness, and repayment capacity.",
    suggestedTopics: [
      "Funding purpose and amount needed",
      "Revenue, margins, and cash flow",
      "Existing debt and obligations",
      "Financial documentation readiness",
      "Credit history and collateral",
    ],
    suggestedQuestions: [
      "What do you need funding for, and how much are you seeking?",
      "How is the business performing — revenue trend and margins over the past year?",
      "What existing debts or obligations does the business carry?",
      "Which financial documents could you produce today — statements, tax returns, projections?",
      "How is your credit history, and what collateral could you offer?",
    ],
    suggestedRubric:
      "Use-of-funds clarity (1-5), financial documentation readiness (1-5), repayment capacity signal (1-5), overall readiness (1-10).",
    systemPrompt: `You are an AI capital-readiness interviewer for a business development program. Your job is to assess how prepared a business is to pursue a loan or other financing.

Cover: the funding purpose and amount, business performance (revenue trend, margins, cash flow), existing obligations, which financial documents they could produce today, and credit/collateral position.

Ask one question at a time. Numbers matter — politely press for ranges ('roughly', 'ballpark') when answers are vague. Do not provide financial advice, rate their chances, or promise funding. Flag missing documentation as a gap to address. Stay under {{estimatedMinutes}} minutes.`,
  },
  {
    id: "prog-cert-readiness",
    domain: "program_readiness",
    title: "Certification & Contracting Readiness",
    description:
      "Gauges readiness for SBA certifications (8(a), HUBZone, WOSB, SDVOSB) and government contracting — registrations, eligibility, and past performance.",
    suggestedObjective:
      "Assess a business's readiness for government certifications and contracting: ownership eligibility, registrations, past performance, and capability gaps.",
    suggestedTopics: [
      "Ownership and eligibility basics",
      "SAM.gov registration and UEI status",
      "Certifications held or in progress",
      "Past performance and contract history",
      "Capabilities statement and gaps",
    ],
    suggestedQuestions: [
      "Who owns the business, and which ownership categories might apply (woman, veteran, minority, HUBZone location)?",
      "Is your business registered in SAM.gov, and do you have a UEI?",
      "Which certifications do you hold or are you pursuing — 8(a), HUBZone, WOSB, SDVOSB?",
      "What past performance do you have — commercial or government work we could cite?",
      "Do you have a capabilities statement, and what gaps would hold back a bid today?",
    ],
    suggestedRubric:
      "Certification eligibility likelihood (1-5), registration completeness (1-5), past-performance readiness (1-5), contracting readiness overall (1-10).",
    systemPrompt: `You are an AI readiness interviewer for a government-contracting support program. Your job is to gauge how ready a business is for SBA certifications and federal contracting.

Cover: ownership structure and likely eligibility categories, SAM.gov/UEI registration status, certifications held or in progress (8(a), HUBZone, WOSB, SDVOSB), citable past performance, and whether they have a capabilities statement plus their own sense of gaps.

Ask one question at a time. Do not make eligibility determinations or give legal advice — record facts; a counselor reviews them. If they do not know a term (UEI, set-aside), briefly explain it neutrally and continue. Stay under {{estimatedMinutes}} minutes.`,
  },
  {
    id: "prog-eligibility-screen",
    domain: "program_readiness",
    title: "Program Eligibility Screen",
    description:
      "A fast, consistent screen to decide whether an applicant qualifies for a program — saves staff time and gives applicants quick clarity.",
    suggestedObjective:
      "Screen applicants for program eligibility by checking the program's qualification criteria in a consistent, documented way.",
    suggestedTopics: [
      "Eligibility criteria check",
      "Situation and need",
      "Timeline and commitment",
      "Documents they can provide",
    ],
    suggestedQuestions: [
      "Tell me about your situation and why you are applying to this program.",
      "Walk me through how you meet each of the program's requirements.",
      "When do you need support, and can you commit to the program's participation requirements?",
      "What documents can you provide to verify your eligibility?",
    ],
    suggestedRubric:
      "Criteria met count, eligibility likelihood (1-5), documentation readiness (1-5), recommended disposition (eligible / needs review / likely ineligible).",
    systemPrompt: `You are an AI eligibility-screening interviewer. Your job is to determine whether an applicant likely qualifies for a program, consistently and fairly.

First ask about their situation and motivation. Then work through each eligibility criterion explicitly — ask the questions needed to check it and record whether each appears met, unmet, or unclear. Finish with their timeline, commitment capacity, and what verification documents they can produce.

Ask one question at a time. Be warm but neutral: never tell them they qualify or do not — a staff member makes the determination. Do not speculate about rules not in your criteria. Stay under {{estimatedMinutes}} minutes.`,
  },
  // ─── Custom ───────────────────────────────────────────────────────────────
  {
    id: "custom-general",
    domain: "custom",
    title: "General Purpose Interview",
    description:
      "A clean starting point for any structured interview — define your objective and topics, and the AI conducts a consistent conversation for every respondent.",
    suggestedObjective: "Conduct a consistent interview that covers the topics you define and produces comparable, evaluable transcripts.",
    suggestedTopics: ["Background and context", "Current situation", "Challenges and needs", "Goals and next steps"],
    suggestedQuestions: [
      "Tell me about yourself and your situation.",
      "What is the most important challenge you are dealing with right now?",
      "What would a successful outcome look like for you?",
    ],
    suggestedRubric: "Coverage of stated topics (1-5), quality of information gathered (1-5).",
    systemPrompt: `You are an AI interviewer conducting a structured interview. Cover the configured topics one at a time, asking one focused question per turn and a brief follow-up when an answer is vague. Do not advise or evaluate aloud. When every topic is covered, thank the respondent and end the interview. Stay under {{estimatedMinutes}} minutes.`,
  },
];

export function recommendationsForDomain(domain: string): InterviewPromptRecommendation[] {
  return INTERVIEW_PROMPT_RECOMMENDATIONS.filter((rec) => rec.domain === domain);
}
