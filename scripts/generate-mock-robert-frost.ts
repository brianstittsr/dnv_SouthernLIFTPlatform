/**
 * Mock User Generator: Robert Frost
 * 
 * This script generates comprehensive mock data for a fictitious user "Robert Frost"
 * across all KDM Consortium Intelligence Platform processes including:
 * - Onboarding
 * - Opportunities
 * - Teaming
 * - In-Platform Teaming Communications
 * - Proposals
 * 
 * Usage:
 * 1. Run with DRY_RUN=true to preview data without inserting
 *    - PowerShell: $env:DRY_RUN="true"; pnpm tsx scripts/generate-mock-robert-frost.ts
 *    - Bash: DRY_RUN=true pnpm tsx scripts/generate-mock-robert-frost.ts
 * 2. Run without DRY_RUN to insert into Firestore
 *    - pnpm tsx scripts/generate-mock-robert-frost.ts
 * 
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY environment variable for actual insertion
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// ============================================================================
// CONFIGURATION
// ============================================================================

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const DRY_RUN = process.env.DRY_RUN === "true";

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

let adminApp: any;
let db: any;

if (!DRY_RUN) {
  if (!SERVICE_ACCOUNT_PATH) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required");
  }

  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  adminApp = initializeApp({
    credential: cert(serviceAccount),
  });
  db = getFirestore(adminApp);
  console.log("Firebase Admin initialized");
} else {
  console.log("DRY RUN MODE - No changes will be made");
}

// ============================================================================
// MOCK USER DATA: ROBERT FROST
// ============================================================================

const MOCK_USER_ID = "mock_robert_frost_001";
const MOCK_EMAIL = "robert.frost@frostmanufacturing.com";
const MOCK_PASSWORD = "TestPassword123!";

const mockUserProfile = {
  id: MOCK_USER_ID,
  email: MOCK_EMAIL,
  password: MOCK_PASSWORD,
  firstName: "Robert",
  lastName: "Frost",
  phone: "+1 (555) 234-5678",
  company: "Frost Defense Technologies LLC",
  jobTitle: "CEO & Founder",
  location: "Baltimore, MD",
  bio: "Retired Army veteran and cybersecurity executive with 20+ years in federal IT contracting. Specializing in CMMC compliance, cybersecurity services, and defense IT solutions for DoD prime contractors and federal agencies.",
  avatarUrl: "https://ui-avatars.com/api/?name=Robert+Frost&background=0D8ABC&color=fff",
  role: "consortium_member" as const,
  svpRole: "consortium_member" as const,
  isOnboardingComplete: true,
  consortiumOnboardingComplete: true,
  onboardingStatus: "fully_onboarded" as const,
  onboardingType: "consortium" as const,
  onboardingStartedAt: "2024-01-15T10:00:00Z",
  onboardingCompletedAt: "2024-01-20T14:30:00Z",
  primaryNaics: ["541512", "541513", "541519", "541690", "541330"],
  certifications: ["8a", "sdvosb", "cmmc", "hubzone"],
  isAffiliate: false,
  affiliateOnboardingComplete: false,
  affiliateAgreementSigned: false,
  affiliateAgreementDate: null,
  // SAM.gov opportunity matching preferences
  samGovMatchingPreferences: {
    enabled: true,
    naicsCodes: ["541512", "541513", "541519", "541690"],
    setAsides: ["8a", "sdvosb", "hubzone", "small_business"],
    targetAgencies: ["DoD", "DHS", "VA", "Department of State", "NASA"],
    contractSizeMin: 100000,
    contractSizeMax: 10000000,
    noticeTypes: ["o", "p", "k"],
    keywords: ["CMMC", "cybersecurity", "information assurance", "RMF", "NIST 800-171", "zero trust"],
    autoSync: true,
    lastSyncedAt: null,
  },
  networkingProfile: {
    expertise: ["CMMC Compliance", "Cybersecurity", "Federal IT Contracting", "DoD Contracts", "RMF/ATO"],
    categories: ["Cybersecurity", "Government Services", "Defense IT"],
    idealReferralPartner: "DoD prime contractors needing CMMC Level 2/3 compliance support",
    topReferralSources: "MBDA Federal Procurement Center, AFCEA, NCMA",
    goalsThisQuarter: "Secure 2 new DoD CMMC compliance contracts and 1 VA cybersecurity contract",
    uniqueValueProposition: "SDVOSB-certified CMMC Level 2 Certified Assessor with HUBZone status — one-stop shop for DoD cyber compliance",
    targetClientProfile: "DoD prime contractors, defense subcontractors requiring CMMC Level 2 certification",
  },
};

const mockConsortiumProfile: any = {
  id: MOCK_USER_ID,
  userId: MOCK_USER_ID,
  // SAM.gov integration: contracts pushed to profile based on matching preferences
  samGovOpportunities: [],
  samGovLastSynced: null,
  onboardingTracking: {
    partnerId: MOCK_USER_ID,
    currentStage: "engagement_tracking",
    status: "fully_onboarded",
    stageProgress: {
      discovery_intake: { status: "completed" as const, completedAt: Timestamp.fromDate(new Date("2024-01-15")) },
      account_creation: { status: "completed" as const, completedAt: Timestamp.fromDate(new Date("2024-01-16")) },
      profile_build: { status: "completed" as const, completedAt: Timestamp.fromDate(new Date("2024-01-17")) },
      readiness_validation: { status: "completed" as const, completedAt: Timestamp.fromDate(new Date("2024-01-18")) },
      matching_activation: { status: "completed" as const, completedAt: Timestamp.fromDate(new Date("2024-01-19")) },
      engagement_tracking: { status: "in_progress" as const, startedAt: Timestamp.fromDate(new Date("2024-01-20")) },
    },
    referralSource: "other",
    referralDetails: "Referred by MBDA Federal Procurement Center",
    initialContact: {
      date: Timestamp.fromDate(new Date("2024-01-15")),
      method: "referral",
      details: "Initial contact through MBDA networking event",
    },
    welcomeSequence: {
      sent: true,
      sentAt: Timestamp.fromDate(new Date("2024-01-15")),
      opened: true,
      openedAt: Timestamp.fromDate(new Date("2024-01-15T10:30:00")),
      clicked: true,
      clickedAt: Timestamp.fromDate(new Date("2024-01-15T11:00:00")),
    },
    notes: [
      "Highly engaged member",
      "Strong manufacturing background",
      "Active in HUBZone community",
    ],
    createdAt: Timestamp.fromDate(new Date("2024-01-15")),
    updatedAt: Timestamp.fromDate(new Date("2024-06-01")),
  },
  companyIdentity: {
    legalCompanyName: "Frost Defense Technologies LLC",
    address: {
      street: "7890 Cyber Defense Plaza, Suite 400",
      city: "Baltimore",
      state: "MD",
      zip: "21201",
    },
    companyDescription: "Frost Defense Technologies is a SDVOSB- and HUBZone-certified cybersecurity firm specializing in CMMC Level 2 and Level 3 compliance assessments, Risk Management Framework (RMF) support, and zero-trust architecture implementations for DoD contractors and federal agencies. We help defense industrial base (DIB) companies achieve and maintain CMMC certification.",
    ceoBiography: "Robert Frost is a retired Army CW4 with 22 years of military intelligence and cybersecurity experience. After retiring, he founded Frost Defense Technologies in 2018 to help fellow veterans and small businesses navigate the complex world of DoD CMMC compliance. He holds CISSP, CISM, and DoD 8570 IAM Level III certifications and is a licensed CMMC Registered Practitioner (RP).",
    companyLogo: "https://ui-avatars.com/api/?name=FDT&background=1E3A5F&color=fff&size=128",
    yearsInBusiness: 7,
    annualRevenueRange: "$2M-$5M",
    employeeCountRange: "10-25",
    website: "https://frostdefensetech.com",
    dunsNumber: "987654321",
  },
  naicsCodes: [
    { code: "541512", description: "Computer Systems Design Services", isPrimary: true },
    { code: "541513", description: "Computer Facilities Management Services", isPrimary: false },
    { code: "541519", description: "Other Computer Related Services", isPrimary: false },
    { code: "541690", description: "Other Scientific and Technical Consulting Services", isPrimary: false },
    { code: "541330", description: "Engineering Services", isPrimary: false },
  ],
  certifications: [
    {
      type: "8a" as const,
      certificationNumber: "8A-654321",
      issuingAgency: "SBA",
      isActive: true,
      expirationDate: Timestamp.fromDate(new Date("2027-03-15")),
    },
    {
      type: "hubzone" as const,
      certificationNumber: "HUB-112233",
      issuingAgency: "SBA",
      isActive: true,
      expirationDate: Timestamp.fromDate(new Date("2026-09-30")),
    },
    {
      type: "sdvosb" as const,
      certificationNumber: "SDV-998877",
      issuingAgency: "VA",
      isActive: true,
      expirationDate: Timestamp.fromDate(new Date("2027-06-30")),
    },
    {
      type: "cmmc" as const,
      certificationNumber: "CMMC-L2-2024-00412",
      issuingAgency: "Cyber AB (C3PAO: CyberShield Assessors LLC)",
      isActive: true,
      level: "Level 2",
      expirationDate: Timestamp.fromDate(new Date("2027-01-15")),
    },
    {
      type: "iso_27001" as const,
      certificationNumber: "ISO27K-55678",
      issuingAgency: "BSI Group",
      isActive: true,
      expirationDate: Timestamp.fromDate(new Date("2026-05-31")),
    },
  ],
  capabilities: [
    { id: "cap_001", name: "CMMC Level 2/3 Assessment", description: "Full-scope CMMC readiness assessments and gap analysis aligned to NIST SP 800-171 and 800-172", category: "Cybersecurity", yearsExperience: 6, keyDifferentiators: ["Licensed CMMC RP", "C3PAO partnership", "DoD DIB experience"], relevantProjects: ["HC1047-24-C-0023", "FA8750-23-C-0011"] },
    { id: "cap_002", name: "Risk Management Framework (RMF)", description: "DoD RMF ATO lifecycle support including system categorization, security controls, and continuous monitoring", category: "Cybersecurity", yearsExperience: 10, keyDifferentiators: ["eMASS proficient", "DISA STIG hardening", "Full ATO packages"], relevantProjects: ["HC1047-24-C-0023"] },
    { id: "cap_003", name: "Zero Trust Architecture", description: "Design and implementation of Zero Trust security frameworks for federal networks", category: "Cybersecurity", yearsExperience: 4, keyDifferentiators: ["CISA ZTA alignment", "Cloud-native ZT", "Identity-centric approach"], relevantProjects: ["FA8750-23-C-0011"] },
    { id: "cap_004", name: "Incident Response & Forensics", description: "24/7 incident response, digital forensics, and threat hunting for federal agencies", category: "Cybersecurity", yearsExperience: 8, keyDifferentiators: ["DFIR certified staff", "DoD cleared personnel", "Chain of custody procedures"], relevantProjects: [] },
    { id: "cap_005", name: "NIST 800-171 Compliance", description: "Implementation of all 110 NIST SP 800-171 controls for CUI protection in DoD supply chain", category: "Compliance", yearsExperience: 7, keyDifferentiators: ["System Security Plan (SSP) authoring", "POAM management", "Subcontractor cascade"], relevantProjects: ["W52P1J-22-C-0091"] },
    { id: "cap_006", name: "Penetration Testing", description: "Adversarial red team assessments and vulnerability testing for DoD systems", category: "Cybersecurity", yearsExperience: 6, keyDifferentiators: ["OSCP/CEH certified", "DoD secret clearance", "SCADA/ICS expertise"], relevantProjects: [] },
    { id: "cap_007", name: "Security Operations Center (SOC)", description: "Managed SOC services including SIEM, threat intelligence, and 24/7 monitoring", category: "Cybersecurity", yearsExperience: 5, keyDifferentiators: ["Splunk/Sentinel proficient", "MITRE ATT&CK mapped", "FedRAMP authorized tools"], relevantProjects: ["W52P1J-22-C-0091"] },
    { id: "cap_008", name: "Cybersecurity Training & Awareness", description: "DoD 8570/8140 compliant cyber workforce training and certification preparation", category: "Training", yearsExperience: 9, keyDifferentiators: ["CompTIA, CISSP, CISM courseware", "Live-fire cyber ranges", "Role-based training tracks"], relevantProjects: [] },
  ],
  serviceOfferings: [
    { name: "CMMC Compliance Advisory & Assessment", description: "End-to-end CMMC Level 1/2/3 readiness, gap analysis, remediation planning, and C3PAO-partnered assessments", targetMarkets: ["DoD", "Defense Industrial Base"], pricingModel: "Fixed price", deliveryMethods: ["On-site", "Remote"] },
    { name: "RMF/ATO Support Services", description: "Full lifecycle RMF support from initiation through ATO issuance and continuous monitoring", targetMarkets: ["DoD", "Federal Civilian"], pricingModel: "T&M", deliveryMethods: ["On-site", "Remote"] },
    { name: "Managed Security Services (MSSP)", description: "SOC-as-a-Service, SIEM management, threat monitoring, and incident response retainer", targetMarkets: ["Federal", "Defense"], pricingModel: "Monthly retainer", deliveryMethods: ["Remote", "Hybrid"] },
    { name: "Zero Trust Implementation", description: "Architecture design, pillar-by-pillar implementation, and validation for ZTA mandates (EO 14028)", targetMarkets: ["Federal", "DoD", "IC"], pricingModel: "Fixed price", deliveryMethods: ["On-site", "Remote"] },
    { name: "Cybersecurity Workforce Development", description: "DoD 8570/8140-aligned training, cyber range exercises, and certification bootcamps", targetMarkets: ["DoD", "Federal", "Commercial DIB"], pricingModel: "Per-seat / Fixed price", deliveryMethods: ["On-site", "Virtual"] },
  ],
  technologySpecializations: [
    { technology: "Splunk Enterprise Security", proficiencyLevel: "expert", yearsExperience: 8, certifications: ["Splunk Certified Architect"] },
    { technology: "Microsoft Sentinel / Azure Security", proficiencyLevel: "expert", yearsExperience: 5, certifications: ["Microsoft SC-200", "AZ-500"] },
    { technology: "DISA STIG / SCAP Compliance", proficiencyLevel: "expert", yearsExperience: 10, certifications: [] },
    { technology: "eMASS (Enterprise Mission Assurance Support Service)", proficiencyLevel: "advanced", yearsExperience: 7, certifications: [] },
    { technology: "Tenable.sc / Nessus", proficiencyLevel: "advanced", yearsExperience: 6, certifications: ["Tenable Certified Security Engineer"] },
    { technology: "CrowdStrike Falcon", proficiencyLevel: "intermediate", yearsExperience: 3, certifications: ["CCFA"] },
    { technology: "Palo Alto NGFW / Prisma", proficiencyLevel: "intermediate", yearsExperience: 4, certifications: ["PCNSA"] },
    { technology: "NIST 800-171 / 800-53 Controls", proficiencyLevel: "expert", yearsExperience: 9, certifications: ["CISSP", "CISM"] },
  ],
  pastPerformance: [
    {
      id: "pp_001",
      contractTitle: "CMMC Level 2 Compliance Assessment & Remediation — Defense Logistics Agency Supplier",
      agency: "Defense Logistics Agency (DLA)",
      contractNumber: "HC1047-24-C-0023",
      contractValue: "$875,000",
      performancePeriod: {
        start: Timestamp.fromDate(new Date("2024-02-01")),
        end: Timestamp.fromDate(new Date("2024-11-30")),
      },
      contractType: "fixed_price",
      performanceRating: "excellent",
      description: "Conducted full CMMC Level 2 gap analysis, authored SSP and POAM, implemented all 110 NIST 800-171 controls, and coordinated C3PAO assessment for a 200-person defense logistics supplier. Company achieved CMMC Level 2 certification ahead of schedule.",
    },
    {
      id: "pp_002",
      contractTitle: "Air Force Research Lab Cybersecurity Engineering & RMF ATO Support",
      agency: "Department of the Air Force — AFRL",
      contractNumber: "FA8750-23-C-0011",
      contractValue: "$1,450,000",
      performancePeriod: {
        start: Timestamp.fromDate(new Date("2023-04-01")),
        end: Timestamp.fromDate(new Date("2024-03-31")),
      },
      contractType: "cost_plus",
      performanceRating: "excellent",
      description: "Provided RMF lifecycle support for two classified research systems including system categorization, security control implementation, STIG hardening, eMASS package management, and ATO issuance. Delivered zero critical findings on ISSM assessment.",
    },
    {
      id: "pp_003",
      contractTitle: "Army Managed Security Services — SOC Operations and SIEM Management",
      agency: "Department of the Army — PEO Enterprise",
      contractNumber: "W52P1J-22-C-0091",
      contractValue: "$2,200,000",
      performancePeriod: {
        start: Timestamp.fromDate(new Date("2022-08-01")),
        end: Timestamp.fromDate(new Date("2024-07-31")),
      },
      contractType: "time_and_materials",
      performanceRating: "very_good",
      description: "Delivered 24/7 Tier 1-3 SOC operations, Splunk SIEM management, threat hunting, and incident response for 15,000-user Army enterprise network. Maintained 99.8% SLA compliance over 24-month PoP.",
    },
  ],
  governmentContractingProfile: {
    cageCode: "7XYZ9",
    uei: "P4Q5R6S7T8U9",
    samRegistrationStatus: "active" as const,
    samRegistrationExpiry: Timestamp.fromDate(new Date("2026-08-31")),
    gsaScheduleHolder: true,
    gsaScheduleNumbers: ["47QTCA-25-D-0082"],  // IT Schedule 70 / MAS IT
    preferredContractTypes: ["fixed_price", "time_and_materials", "cost_plus"],
    contractSizePreferences: ["$500K-$1M", "$1M-$5M", "$5M-$10M"],
    setAsidePreferences: ["8a", "sdvosb", "hubzone", "small_business"],
    pastFederalContracts: 11,
    // SAM.gov API matching configuration
    samGovMatching: {
      enabled: true,
      naicsCodes: ["541512", "541513", "541519", "541690"],
      keywords: ["CMMC", "cybersecurity", "information assurance", "RMF", "NIST 800-171", "zero trust", "ATO", "SIEM", "incident response"],
      setAsides: ["8a", "SDVOSB", "HUBZone", "SBA"],
      targetAgencies: ["DoD", "DHS", "VA", "Department of State", "NSA", "DISA"],
      contractSizeMin: 500000,
      contractSizeMax: 10000000,
      noticeTypes: ["Solicitation", "Pre-Solicitation", "Sources Sought"],
      autoSync: true,
      syncFrequency: "daily",
    },
  },
  geographicCoverage: {
    statesServed: ["MD", "VA", "PA", "DC", "TX", "CO", "GA"],
    regionsServed: ["mid_atlantic", "southeast", "national", "remote"],
    geographicServiceArea: "National capability with primary presence in Mid-Atlantic; cleared staff available on-site at DoD installations nationwide",
    willingToDeployToRural: true,
    ruralDeploymentExperience: true,
    ruralRegionsServed: ["MD", "VA", "WV"],
  },
  teamingPreferences: {
    willingToPrime: true,
    willingToSub: true,
    seekingPartners: true,
    idealPartnerProfile: "Large defense IT prime contractors (Leidos, SAIC, Booz Allen) seeking CMMC-certified small business subcontractors for DIB supply chain requirements; OR small DIB manufacturers needing CMMC compliance support",
    contractSizePreferences: ["$500K-$1M", "$1M-$5M", "$5M-$10M"],
    setAsidePreferences: ["8a", "sdvosb", "hubzone", "small_business"],
    teamingRolePreferences: ["subcontractor", "prime", "joint_venture"],
  },
  consortiumPillarAlignment: {
    pillars: ["defense_contracting", "business_growth", "us_manufacturing"],
    marketplaceSellerProfile: "CMMC Level 2 certified cybersecurity firm. SDVOSB and HUBZone certified. GSA Schedule holder (MAS IT). Specializing in CMMC assessments, RMF/ATO support, managed SOC services, and zero trust implementations for DoD contractors and federal agencies.",
    primaryServiceCategories: ["Cybersecurity", "Defense Contracting", "Federal IT"],
    secondaryServiceCategories: ["Compliance", "Training", "Managed Security Services"],
    e2gFocus: true,
    ruralFocus: false,
    manufacturingFocus: false,
    defenseContractingFocus: true,
    cmmcFocus: true,
  },
  readinessScore: {
    overallScore: 85,
    category: "Ready",
    breakdown: {
      samRegistration: 20,
      uei: 15,
      cageCode: 15,
      naicsCoverage: 15,
      federalCertifications: 15,
      pastPerformance: 8,
      gsaSchedule: 2,
    },
    gaps: [
      "Not a GSA Schedule holder - consider applying for access to GSA contracts",
      "Expand past performance in civilian agencies",
    ],
    remediationRecommendations: [
      "Apply for GSA Schedule to increase contract opportunities",
      "Pursue civilian agency contracts to diversify portfolio",
      "Consider ISO 14001 certification for environmental projects",
    ],
    resources: [
      {
        title: "GSA Schedule Application Guide",
        url: "https://www.gsa.gov/about-us/organization/office-of-acquisition-management/office-of-acquisition-programs/schedules",
        description: "Step-by-step guide for GSA Schedule application",
      },
      {
        title: "SBA 8(a) Program Resources",
        url: "https://www.sba.gov/business-guide/grow-your-business/8a-business-development-program",
        description: "Resources for 8(a) certified businesses",
      },
    ],
    scoreHistory: [
      { score: 70, calculatedAt: Timestamp.fromDate(new Date("2024-01-18")) },
      { score: 78, calculatedAt: Timestamp.fromDate(new Date("2024-02-15")) },
      { score: 82, calculatedAt: Timestamp.fromDate(new Date("2024-03-15")) },
      { score: 85, calculatedAt: Timestamp.fromDate(new Date("2024-06-01")) },
    ],
  },
  membershipTier: {
    tier: "elite",
    assignedAt: Timestamp.fromDate(new Date("2024-01-20")),
    assignedBy: "system",
    assignmentReason: "High readiness score and engagement",
    features: [
      "full_marketplace_access",
      "ai_matching",
      "priority_support",
      "advanced_analytics",
      "exclusive_events",
    ],
    restrictions: [],
    upgradeEligibility: true,
    downgradeEligibility: false,
    autoRenew: true,
  },
  e2gAlignment: {
    partnerId: MOCK_USER_ID,
    targetRegions: ["MD", "VA", "PA", "WV", "all"],
    ruralDeploymentExperience: true,
    ruralRegionsServed: ["MD", "PA", "WV"],
    pillarCapabilities: [
      {
        pillar: "quality_systems",
        capabilityLevel: "advanced" as const,
        relevantProjects: 8,
      },
      {
        pillar: "business_growth",
        capabilityLevel: "intermediate" as const,
        relevantProjects: 3,
      },
    ],
    hubZoneCertified: true,
    communityRelationshipStrength: 85,
    ruralManufacturingSpecialization: true,
    e2gReadinessScore: 82,
    lastAssessed: Timestamp.fromDate(new Date("2024-06-01")),
  },
  engagementMetrics: {
    profileCompleteness: 95,
    lastProfileUpdate: Timestamp.fromDate(new Date("2024-06-01")),
    marketplaceListingsCount: 5,
    opportunityWinRate: 67,
    meetingsAttended: 12,
    meetingsHosted: 3,
    teamingRequestsSent: 8,
    teamingRequestsReceived: 15,
    teamingRequestsAccepted: 5,
    proposalsSubmitted: 7,
    proposalsWon: 3,
    averageResponseTime: 4,
    activeEngagementScore: 88,
    connections: 23,
    calculatedAt: Timestamp.fromDate(new Date("2024-06-01")),
  },
  capabilityMatches: [
    {
      partnerId: MOCK_USER_ID,
      opportunityId: "SOL-2024-001",
      matchScore: 92,
      confidence: 88,
      matchReasons: [
        "NAICS code match: 332710",
        "HUBZone set-aside alignment",
        "Past performance in defense",
        "Geographic proximity",
      ],
      gaps: [
        "Contract size larger than typical",
      ],
      recommendedActions: [
        "Consider joint venture for larger contract",
        "Highlight ISO 9001 certification",
        "Emphasize HUBZone status",
      ],
    },
    {
      partnerId: MOCK_USER_ID,
      opportunityId: "SOL-2024-002",
      matchScore: 87,
      confidence: 85,
      matchReasons: [
        "NAICS code match: 332999",
        "SDVOSB set-aside alignment",
        "Aerospace past performance",
      ],
      gaps: [
        "Requires AS9100 certification",
      ],
      recommendedActions: [
        "Pursue AS9100 certification",
        "Partner with AS9100-certified firm",
      ],
    },
  ],
  teamingMatches: [
    {
      partner1Id: MOCK_USER_ID,
      partner2Id: "partner_defense_prime_001",
      matchScore: 89,
      confidence: 85,
      complementaryStrengths: [
        "Manufacturing capabilities",
        "Large prime contractor status",
        "HUBZone certification",
        "Defense sector experience",
      ],
      potentialSynergies: [
        "Joint venture opportunities",
        "Subcontracting partnerships",
        "Shared proposal resources",
      ],
      recommendedRoles: {
        partner1Role: "subcontractor",
        partner2Role: "prime",
      },
      matchedAt: Timestamp.fromDate(new Date("2024-04-10")),
    },
    {
      partner1Id: MOCK_USER_ID,
      partner2Id: "partner_aerospace_002",
      matchScore: 84,
      confidence: 80,
      complementaryStrengths: [
        "Precision machining",
        "Aerospace expertise",
        "Quality systems",
      ],
      potentialSynergies: [
        "Aerospace component manufacturing",
        "Shared quality protocols",
      ],
      recommendedRoles: {
        partner1Role: "subcontractor",
        partner2Role: "prime",
      },
      matchedAt: Timestamp.fromDate(new Date("2024-04-25")),
    },
  ],
  e2gAlignmentMatches: [
    {
      partnerId: MOCK_USER_ID,
      alignmentScore: 90,
      reasons: [
        "HUBZone certified in MD",
        "Rural manufacturing specialization",
        "Strong community relationships",
      ],
      recommendedActions: [
        "Target MD E2G manufacturing opportunities",
        "Leverage community relationships",
      ],
    },
  ],
  createdAt: Timestamp.fromDate(new Date("2024-01-15")),
  updatedAt: Timestamp.fromDate(new Date("2024-06-01")),
  lastActive: Timestamp.fromDate(new Date("2024-06-05")),
};

// Mock Opportunities (SAM.gov opportunities Robert is interested in — CMMC/Cybersecurity focused)
const mockOpportunities = [
  {
    id: "SOL-2024-001",
    title: "CMMC Level 2 Compliance Assessment and Remediation Services",
    agency: "Defense Logistics Agency (DLA)",
    solicitationNumber: "HC1047-24-R-0077",
    postedDate: "2024-05-01",
    deadline: "2024-07-15",
    location: "Fort Belvoir, VA (Remote eligible)",
    value: "$2,500,000",
    naicsCodes: ["541512", "541519"],
    description: "Seek CMMC Level 2 compliance assessment, gap analysis, System Security Plan (SSP) authoring, and remediation services for DLA supplier base. SDVOSB set-aside.",
    setAside: "SDVOSB",
    interestedInTeaming: true,
    teamingCount: 5,
    isMockData: true,
    samGovNoticeId: "sam-mock-notice-001",
    samGovLink: "https://sam.gov/opp/mock001",
    matchScore: 94,
    matchReasons: ["NAICS 541512 exact match", "SDVOSB set-aside match", "CMMC keyword match", "DLA target agency"],
  },
  {
    id: "SOL-2024-002",
    title: "Risk Management Framework (RMF) and ATO Support — DoD Research Lab",
    agency: "Defense Advanced Research Projects Agency (DARPA)",
    solicitationNumber: "HR001124R0055",
    postedDate: "2024-05-10",
    deadline: "2024-08-01",
    location: "Arlington, VA",
    value: "$1,800,000",
    naicsCodes: ["541512", "541690"],
    description: "Provide RMF lifecycle support, eMASS package management, DISA STIG hardening, and ATO issuance for classified research systems. HUBZone set-aside preferred.",
    setAside: "HUBZone",
    interestedInTeaming: true,
    teamingCount: 3,
    isMockData: true,
    samGovNoticeId: "sam-mock-notice-002",
    samGovLink: "https://sam.gov/opp/mock002",
    matchScore: 89,
    matchReasons: ["NAICS 541512 match", "HUBZone set-aside match", "RMF keyword match", "DoD target agency"],
  },
  {
    id: "SOL-2024-003",
    title: "Zero Trust Architecture Implementation — VA Enterprise Network",
    agency: "Department of Veterans Affairs (VA)",
    solicitationNumber: "36C10B24R0062",
    postedDate: "2024-06-01",
    deadline: "2024-09-15",
    location: "Washington, DC (Hybrid)",
    value: "$4,200,000",
    naicsCodes: ["541512", "541513"],
    description: "Design and implement Zero Trust security framework across VA enterprise network. Aligned to CISA ZTA pillars and EO 14028 mandates. 8(a) set-aside.",
    setAside: "8(a)",
    interestedInTeaming: false,
    teamingCount: 0,
    isMockData: true,
    samGovNoticeId: "sam-mock-notice-003",
    samGovLink: "https://sam.gov/opp/mock003",
    matchScore: 87,
    matchReasons: ["NAICS 541512 match", "8(a) set-aside match", "Zero trust keyword match", "VA target agency"],
  },
];

// Mock Teaming Communications
const mockTeamingCommunications = [
  {
    id: "comm_001",
    fromUserId: "partner_defense_prime_001",
    toUserId: MOCK_USER_ID,
    type: "teaming_request",
    subject: "Teaming Opportunity: W91QUZ-24-R-0001",
    message: "We saw your profile in the KDM Consortium and would like to discuss a potential teaming arrangement for the precision machining opportunity at Aberdeen Proving Ground. Your HUBZone certification and manufacturing capabilities would be a great fit for our prime contract.",
    opportunityId: "SOL-2024-001",
    status: "accepted",
    sentAt: Timestamp.fromDate(new Date("2024-05-20T09:00:00")),
    respondedAt: Timestamp.fromDate(new Date("2024-05-21T14:30:00")),
  },
  {
    id: "comm_002",
    fromUserId: MOCK_USER_ID,
    toUserId: "partner_aerospace_002",
    type: "teaming_inquiry",
    subject: "Partnership Inquiry: Aerospace Manufacturing",
    message: "We're interested in exploring potential partnerships for aerospace manufacturing opportunities. Our precision machining capabilities combined with your assembly expertise could create a strong offering for NASA and DoD contracts.",
    opportunityId: null,
    status: "pending",
    sentAt: Timestamp.fromDate(new Date("2024-05-25T10:15:00")),
  },
  {
    id: "comm_003",
    fromUserId: "partner_manufacturing_003",
    toUserId: MOCK_USER_ID,
    type: "teaming_request",
    subject: "Joint Venture Opportunity",
    message: "We're forming a joint venture for a large manufacturing contract and would like to invite Frost Manufacturing Solutions to participate. Your HUBZone status and ISO certification would strengthen our proposal.",
    opportunityId: "SOL-2024-003",
    status: "under_review",
    sentAt: Timestamp.fromDate(new Date("2024-06-01T11:00:00")),
  },
];

// Mock Proposals
const mockProposals = [
  {
    id: "prop_001",
    opportunityId: "SOL-2024-001",
    title: "Precision Machining Services for Military Vehicles",
    partnerId: MOCK_USER_ID,
    role: "subcontractor",
    primeContractor: "partner_defense_prime_001",
    status: "submitted",
    submittedAt: Timestamp.fromDate(new Date("2024-06-10")),
    estimatedValue: 750000,
    teamingPartners: ["partner_defense_prime_001"],
    description: "Submitted as subcontractor for precision machining components. Joint proposal with Defense Prime Inc.",
  },
  {
    id: "prop_002",
    opportunityId: "SOL-2024-002",
    title: "Aerospace Component Manufacturing",
    partnerId: MOCK_USER_ID,
    role: "prime",
    primeContractor: MOCK_USER_ID,
    status: "in_preparation",
    submittedAt: null,
    estimatedValue: 1800000,
    teamingPartners: ["partner_aerospace_002"],
    description: "Preparing prime proposal with Aerospace Partners Inc. as assembly subcontractor.",
  },
  {
    id: "prop_003",
    opportunityId: "SOL-2023-015",
    title: "Engineering Services and Machining Support",
    partnerId: MOCK_USER_ID,
    role: "subcontractor",
    primeContractor: "partner_engineering_004",
    status: "awarded",
    submittedAt: Timestamp.fromDate(new Date("2024-02-15")),
    awardedAt: Timestamp.fromDate(new Date("2024-03-01")),
    estimatedValue: 450000,
    actualValue: 420000,
    teamingPartners: ["partner_engineering_004"],
    description: "Awarded subcontract for engineering and machining services. Contract completed successfully.",
  },
];

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

async function insertUserProfile(): Promise<boolean> {
  if (DRY_RUN) {
    console.log("[DRY RUN] Would insert user profile for Robert Frost");
    console.log(JSON.stringify(mockUserProfile, null, 2));
    return true;
  }

  try {
    const userRef = db.collection("users").doc(MOCK_USER_ID);
    await userRef.set(mockUserProfile);
    console.log("✓ Inserted user profile for Robert Frost");
    return true;
  } catch (error) {
    console.error("✗ Failed to insert user profile:", error);
    return false;
  }
}

async function insertConsortiumProfile(): Promise<boolean> {
  if (DRY_RUN) {
    console.log("[DRY RUN] Would insert consortium profile for Robert Frost");
    console.log(JSON.stringify(mockConsortiumProfile, null, 2));
    return true;
  }

  try {
    const profileRef = db.collection("consortium_profiles").doc(MOCK_USER_ID);
    await profileRef.set(mockConsortiumProfile);
    console.log("✓ Inserted consortium profile for Robert Frost");
    return true;
  } catch (error) {
    console.error("✗ Failed to insert consortium profile:", error);
    return false;
  }
}

async function insertTeamMember(): Promise<boolean> {
  const teamMemberData = {
    ...mockUserProfile,
    consortiumOnboardingComplete: true,
    consortiumPillarFocus: ["us-manufacturing", "defense-contracting"],
    companyName: "Frost Manufacturing Solutions",
    companyDescription: mockConsortiumProfile.companyIdentity?.companyDescription,
    website: mockConsortiumProfile.companyIdentity?.website,
    linkedIn: "https://linkedin.com/in/robertfrostfms",
    bio: mockConsortiumProfile.companyIdentity?.ceoBiography,
    avatar: mockUserProfile.avatarUrl,
    title: "CEO & Founder",
    createdAt: Timestamp.fromDate(new Date("2024-01-15")),
    updatedAt: Timestamp.fromDate(new Date("2024-06-01")),
  };

  if (DRY_RUN) {
    console.log("[DRY RUN] Would insert team member for Robert Frost");
    return true;
  }

  try {
    const teamMemberRef = db.collection("team_members").doc(MOCK_USER_ID);
    await teamMemberRef.set(teamMemberData);
    console.log("✓ Inserted team member for Robert Frost");
    return true;
  } catch (error) {
    console.error("✗ Failed to insert team member:", error);
    return false;
  }
}

async function insertTeamingCommunications(): Promise<boolean> {
  if (DRY_RUN) {
    console.log("[DRY RUN] Would insert teaming communications for Robert Frost");
    console.log(JSON.stringify(mockTeamingCommunications, null, 2));
    return true;
  }

  try {
    const batch = db.batch();
    const commRef = db.collection("teaming_communications");
    
    mockTeamingCommunications.forEach((comm) => {
      const doc = commRef.doc(comm.id);
      batch.set(doc, comm);
    });
    
    await batch.commit();
    console.log(`✓ Inserted ${mockTeamingCommunications.length} teaming communications`);
    return true;
  } catch (error) {
    console.error("✗ Failed to insert teaming communications:", error);
    return false;
  }
}

async function insertProposals(): Promise<boolean> {
  if (DRY_RUN) {
    console.log("[DRY RUN] Would insert proposals for Robert Frost");
    console.log(JSON.stringify(mockProposals, null, 2));
    return true;
  }

  try {
    const batch = db.batch();
    const propRef = db.collection("proposals");
    
    mockProposals.forEach((prop) => {
      const doc = propRef.doc(prop.id);
      batch.set(doc, prop);
    });
    
    await batch.commit();
    console.log(`✓ Inserted ${mockProposals.length} proposals`);
    return true;
  } catch (error) {
    console.error("✗ Failed to insert proposals:", error);
    return false;
  }
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

async function generateMockRobertFrost(): Promise<void> {
  console.log("=".repeat(60));
  console.log("Generating Mock User: Robert Frost");
  console.log("=".repeat(60));
  console.log(`User ID: ${MOCK_USER_ID}`);
  console.log(`Email: ${MOCK_EMAIL}`);
  console.log(`Password: ${MOCK_PASSWORD}`);
  console.log(`Company: Frost Manufacturing Solutions`);
  console.log(`Role: consortium_member`);
  console.log(`Membership Tier: elite`);
  console.log(`Readiness Score: 85`);
  console.log("=".repeat(60));
  console.log();

  try {
    // Insert user profile
    const userInserted = await insertUserProfile();
    
    // Insert consortium profile
    const profileInserted = await insertConsortiumProfile();
    
    // Insert team member
    const teamMemberInserted = await insertTeamMember();
    
    // Insert teaming communications
    const commsInserted = await insertTeamingCommunications();
    
    // Insert proposals
    const proposalsInserted = await insertProposals();

    console.log();
    console.log("=".repeat(60));
    console.log("GENERATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`User Profile: ${userInserted ? "✓" : "✗"}`);
    console.log(`Consortium Profile: ${profileInserted ? "✓" : "✗"}`);
    console.log(`Team Member: ${teamMemberInserted ? "✓" : "✗"}`);
    console.log(`Teaming Communications: ${commsInserted ? "✓" : "✗"} (${mockTeamingCommunications.length} records)`);
    console.log(`Proposals: ${proposalsInserted ? "✓" : "✗"} (${mockProposals.length} records)`);
    console.log("=".repeat(60));
    console.log();
    console.log("Mock Data Generated Successfully!");
    console.log();
    console.log("Next Steps:");
    console.log("1. Log in as robert.frost@frostmanufacturing.com");
    console.log("2. Review onboarding status (should be fully_onboarded)");
    console.log("3. Check readiness score (should be 85)");
    console.log("4. View AI matching results");
    console.log("5. Review teaming communications");
    console.log("6. Check proposal status");
    console.log();

  } catch (error) {
    console.error("Generation failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

// ============================================================================
// RUN GENERATION
// ============================================================================

generateMockRobertFrost().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
