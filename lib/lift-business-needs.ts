/**
 * Top business needs for Louisiana companies — ranked pick-list shared by the
 * B1 LIFT intake form and the client onboarding wizard. Respondents select
 * their top 5 (MAX_BUSINESS_NEED_SELECTIONS). Rank and priority come from the
 * advisor-suggested list; descriptions explain what the company must
 * accomplish so users can pick accurately.
 */

export const MAX_BUSINESS_NEED_SELECTIONS = 5;

export interface BusinessNeed {
  rank: number;
  label: string;
  /** What the company must accomplish. */
  description: string;
  priority: "Critical" | "High";
}

export const BUSINESS_NEEDS: BusinessNeed[] = [
  {
    rank: 1,
    label: "Customer acquisition and industrial market access",
    description: "Secure paying customers, pilot projects, and repeat orders from industrial buyers.",
    priority: "Critical",
  },
  {
    rank: 2,
    label: "Startup and growth capital",
    description: "Finance equipment, facilities, materials, employees, testing, and operating expenses.",
    priority: "Critical",
  },
  {
    rank: 3,
    label: "Commercialization and product-market fit",
    description: "Identify applications where your product or process solves a measurable customer problem.",
    priority: "Critical",
  },
  {
    rank: 4,
    label: "Quality management and certification",
    description: "Establish process controls, traceability, inspection, and appropriate industry certifications.",
    priority: "Critical",
  },
  {
    rank: 5,
    label: "Skilled technical workforce",
    description: "Recruit and train engineers, technicians, designers, operators, and quality specialists.",
    priority: "Critical",
  },
  {
    rank: 6,
    label: "Technology selection and equipment utilization",
    description: "Choose appropriate production technologies and maximize productive machine usage.",
    priority: "High",
  },
  {
    rank: 7,
    label: "Design for additive manufacturing expertise",
    description: "Develop components optimized for additive processes rather than conventional production.",
    priority: "High",
  },
  {
    rank: 8,
    label: "Material qualification and supply-chain reliability",
    description: "Obtain consistent, qualified feedstock and establish reliable material sourcing.",
    priority: "High",
  },
  {
    rank: 9,
    label: "Testing, validation, and inspection",
    description: "Prove mechanical performance, dimensional accuracy, and repeatability.",
    priority: "High",
  },
  {
    rank: 10,
    label: "Pricing, cost accounting, and cash-flow management",
    description: "Understand true part costs and build sustainable operating margins.",
    priority: "High",
  },
  {
    rank: 11,
    label: "Industrial partnerships and supplier integration",
    description: "Establish relationships with OEMs, machine shops, universities, and integrators.",
    priority: "High",
  },
  {
    rank: 12,
    label: "Government contracting and defense readiness",
    description: "Navigate supplier qualification, procurement requirements, cybersecurity, and federal contracting rules.",
    priority: "High",
  },
  {
    rank: 13,
    label: "Digital infrastructure and cybersecurity",
    description: "Integrate design files, enterprise systems, manufacturing data, IP protection, and cybersecurity controls.",
    priority: "High",
  },
  {
    rank: 14,
    label: "Facility readiness, safety, and regulatory compliance",
    description: "Address ventilation, hazardous materials, fire protection, worker safety, environmental requirements, and utilities.",
    priority: "High",
  },
  {
    rank: 15,
    label: "State incentives, research partnerships, and innovation funding",
    description: "Identify applicable tax incentives, training programs, research support, and commercialization funding.",
    priority: "High",
  },
];

/** Option labels only — for form-builder `multi_select` options. */
export const BUSINESS_NEED_OPTIONS: string[] = BUSINESS_NEEDS.map((need) => need.label);
