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
  company: "Frost Manufacturing Solutions",
  jobTitle: "CEO & Founder",
  location: "Baltimore, MD",
  bio: "Seasoned manufacturing executive with 20+ years in federal contracting. Specializing in precision manufacturing for defense and aerospace sectors.",
  avatarUrl: "https://ui-avatars.com/api/?name=Robert+Frost&background=0D8ABC&color=fff",
  role: "consortium_member" as const,
  svpRole: "partner_user" as const,
  isOnboardingComplete: true,
  onboardingStatus: "fully_onboarded" as const,
  onboardingType: "consortium" as const,
  onboardingStartedAt: "2024-01-15T10:00:00Z",
  onboardingCompletedAt: "2024-01-20T14:30:00Z",
  primaryNaics: ["332710", "332999", "541330"],
  certifications: ["8a", "hubzone", "sdvosb"],
  isAffiliate: false,
  affiliateOnboardingComplete: false,
  affiliateAgreementSigned: false,
  affiliateAgreementDate: null,
  networkingProfile: {
    expertise: ["Federal Contracting", "Manufacturing", "Defense Contracts"],
    categories: ["Manufacturing", "Government Services"],
    idealReferralPartner: "Large prime contractors seeking manufacturing partners",
    topReferralSources: "MBDA Federal Procurement Center",
    goalsThisQuarter: "Secure 3 new federal manufacturing contracts",
    uniqueValueProposition: "HUBZone-certified precision manufacturing with SDVOSB status",
    targetClientProfile: "Federal agencies, Defense prime contractors",
  },
};

const mockConsortiumProfile: any = {
  id: MOCK_USER_ID,
  userId: MOCK_USER_ID,
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
    legalCompanyName: "Frost Manufacturing Solutions, LLC",
    address: {
      street: "123 Industrial Parkway",
      city: "Baltimore",
      state: "MD",
      zip: "21201",
    },
    companyDescription: "Precision manufacturing company specializing in defense and aerospace components. HUBZone-certified and SDVOSB-owned. We provide high-quality machined parts, assemblies, and sub-assemblies for federal agencies and prime contractors.",
    ceoBiography: "Robert Frost is a retired Army veteran with 25 years of experience in manufacturing and federal contracting. He founded Frost Manufacturing Solutions in 2015 to bring precision manufacturing capabilities to the federal marketplace while creating opportunities in HUBZone communities.",
    companyLogo: "https://ui-avatars.com/api/?name=FMS&background=0D8ABC&color=fff&size=128",
    yearsInBusiness: 9,
    annualRevenueRange: "$5M-$10M",
    employeeCountRange: "25-50",
    website: "https://frostmanufacturing.com",
    dunsNumber: "123456789",
  },
  naicsCodes: [
    { code: "332710", description: "Machine Shops", isPrimary: true },
    { code: "332999", description: "All Other General Purpose Machinery Manufacturing", isPrimary: false },
    { code: "541330", description: "Engineering Services", isPrimary: false },
    { code: "332721", description: "Precision Turned Product Manufacturing", isPrimary: false },
  ],
  certifications: [
    {
      type: "8a" as const,
      certificationNumber: "8A-123456",
      issuingAgency: "SBA",
      isActive: true,
      expirationDate: Timestamp.fromDate(new Date("2025-12-31")),
    },
    {
      type: "hubzone" as const,
      certificationNumber: "HUB-789012",
      issuingAgency: "SBA",
      isActive: true,
      expirationDate: Timestamp.fromDate(new Date("2025-06-30")),
    },
    {
      type: "sdvosb" as const,
      certificationNumber: "SDV-345678",
      issuingAgency: "VA",
      isActive: true,
      expirationDate: Timestamp.fromDate(new Date("2026-03-31")),
    },
    {
      type: "iso_9001" as const,
      certificationNumber: "ISO-901234",
      issuingAgency: "ISO",
      isActive: true,
      expirationDate: Timestamp.fromDate(new Date("2025-09-30")),
    },
  ],
  capabilities: [
    { id: "cap_001", name: "Precision CNC Machining", description: "High-precision CNC milling and turning services", category: "Manufacturing", yearsExperience: 15, keyDifferentiators: ["ISO 9001 certified", "5-axis capability"], relevantProjects: ["W91QUZ-23-C-0001", "NNC25BA01C"] },
    { id: "cap_002", name: "Assembly and Integration", description: "Component assembly and system integration", category: "Manufacturing", yearsExperience: 12, keyDifferentiators: ["Clean room assembly", "Quality inspection"], relevantProjects: ["W91QUZ-23-C-0001"] },
    { id: "cap_003", name: "Quality Inspection", description: "CMM inspection and quality assurance", category: "Quality", yearsExperience: 10, keyDifferentiators: ["CMM equipment", "AS9100 compliant"], relevantProjects: ["NNC25BA01C"] },
    { id: "cap_004", name: "Prototyping", description: "Rapid prototyping and low-volume production", category: "Manufacturing", yearsExperience: 8, keyDifferentiators: ["Quick turnaround", "Design for manufacturability"], relevantProjects: [] },
    { id: "cap_005", name: "Low-Volume Production", description: "Low-volume manufacturing runs", category: "Manufacturing", yearsExperience: 9, keyDifferentiators: ["Flexible scheduling", "Cost-effective"], relevantProjects: ["W15QKN-22-C-0012"] },
    { id: "cap_006", name: "Metal Fabrication", description: "Custom metal fabrication services", category: "Manufacturing", yearsExperience: 7, keyDifferentiators: ["Welding certification", "Various materials"], relevantProjects: [] },
    { id: "cap_007", name: "Welding Services", description: "Certified welding services", category: "Manufacturing", yearsExperience: 6, keyDifferentiators: ["AWS certified", "Multiple processes"], relevantProjects: [] },
    { id: "cap_008", name: "Surface Treatment", description: "Surface finishing and treatment", category: "Manufacturing", yearsExperience: 5, keyDifferentiators: ["Anodizing", "Plating partnerships"], relevantProjects: [] },
  ],
  serviceOfferings: [
    { name: "Defense Component Manufacturing", description: "Manufacturing components for defense applications", targetMarkets: ["Defense", "Military"], pricingModel: "Fixed price", deliveryMethods: ["On-site", "Shipment"] },
    { name: "Aerospace Parts Production", description: "Production of aerospace-grade components", targetMarkets: ["Aerospace", "NASA"], pricingModel: "Fixed price", deliveryMethods: ["Shipment"] },
    { name: "Custom Machining Services", description: "Custom CNC machining to specifications", targetMarkets: ["Federal", "Commercial"], pricingModel: "Hourly rate", deliveryMethods: ["On-site", "Shipment"] },
    { name: "Contract Manufacturing", description: "Full contract manufacturing services", targetMarkets: ["Federal", "Commercial"], pricingModel: "Project-based", deliveryMethods: ["On-site", "Shipment"] },
    { name: "Quality Assurance Services", description: "Quality inspection and certification support", targetMarkets: ["Federal", "Commercial"], pricingModel: "Hourly rate", deliveryMethods: ["On-site"] },
  ],
  technologySpecializations: [
    { technology: "CNC Milling", proficiencyLevel: "expert", yearsExperience: 15, certifications: ["Haas Certification"] },
    { technology: "CNC Turning", proficiencyLevel: "expert", yearsExperience: 14, certifications: [] },
    { technology: "5-Axis Machining", proficiencyLevel: "advanced", yearsExperience: 8, certifications: [] },
    { technology: "CAD/CAM Programming", proficiencyLevel: "advanced", yearsExperience: 12, certifications: ["Mastercam"] },
    { technology: "CMM Inspection", proficiencyLevel: "intermediate", yearsExperience: 6, certifications: [] },
    { technology: "Laser Cutting", proficiencyLevel: "intermediate", yearsExperience: 5, certifications: [] },
  ],
  pastPerformance: [
    {
      id: "pp_001",
      contractTitle: "Precision Components for Military Vehicles",
      agency: "Department of Defense",
      contractNumber: "W91QUZ-23-C-0001",
      contractValue: "$2,500,000",
      performancePeriod: {
        start: Timestamp.fromDate(new Date("2023-01-01")),
        end: Timestamp.fromDate(new Date("2023-12-31")),
      },
      contractType: "fixed_price",
      performanceRating: "excellent",
      description: "Manufactured precision components for military vehicles",
    },
    {
      id: "pp_002",
      contractTitle: "Engineering Services and Machining Support",
      agency: "Department of the Army",
      contractNumber: "W15QKN-22-C-0012",
      contractValue: "$1,200,000",
      performancePeriod: {
        start: Timestamp.fromDate(new Date("2022-06-01")),
        end: Timestamp.fromDate(new Date("2023-05-31")),
      },
      contractType: "cost_plus",
      performanceRating: "very_good",
      description: "Provided engineering services and machining support",
    },
    {
      id: "pp_003",
      contractTitle: "Specialized Aerospace Components",
      agency: "NASA",
      contractNumber: "NNC25BA01C",
      contractValue: "$850,000",
      performancePeriod: {
        start: Timestamp.fromDate(new Date("2023-03-01")),
        end: Timestamp.fromDate(new Date("2023-10-31")),
      },
      contractType: "fixed_price",
      performanceRating: "excellent",
      description: "Produced specialized aerospace components",
    },
  ],
  governmentContractingProfile: {
    cageCode: "1ABC2",
    uei: "K7J8L9M0N1O2",
    samRegistrationStatus: "active" as const,
    samRegistrationExpiry: Timestamp.fromDate(new Date("2025-06-30")),
    gsaScheduleHolder: false,
    gsaScheduleNumbers: [],
    preferredContractTypes: ["fixed_price", "cost_plus"],
    contractSizePreferences: ["$100K-$500K", "$500K-$1M", "$1M-$5M"],
    setAsidePreferences: ["8a", "hubzone", "sdvosb", "wosb"],
    pastFederalContracts: 15,
  },
  geographicCoverage: {
    statesServed: ["MD", "VA", "PA", "DC", "WV"],
    regionsServed: ["mid_atlantic", "national"],
    geographicServiceArea: "Mid-Atlantic region with nationwide capability",
    willingToDeployToRural: true,
    ruralDeploymentExperience: true,
    ruralRegionsServed: ["MD", "PA", "WV"],
  },
  teamingPreferences: {
    willingToPrime: true,
    willingToSub: true,
    seekingPartners: true,
    idealPartnerProfile: "Large prime contractors in defense/aerospace seeking HUBZone manufacturing partners",
    contractSizePreferences: ["$1M-$5M", "$5M-$10M"],
    setAsidePreferences: ["8a", "hubzone", "sdvosb", "wosb"],
    teamingRolePreferences: ["subcontractor", "joint_venture"],
  },
  consortiumPillarAlignment: {
    pillars: ["quality_systems", "business_growth"],
    marketplaceSellerProfile: "Precision manufacturing for defense and aerospace. HUBZone and SDVOSB certified. ISO 9001 compliant. Capabilities include CNC machining, assembly, and quality inspection.",
    primaryServiceCategories: ["Manufacturing", "Defense Contracting", "Aerospace"],
    secondaryServiceCategories: ["Engineering Services", "Quality Assurance"],
    e2gFocus: true,
    ruralFocus: true,
    manufacturingFocus: true,
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

// Mock Opportunities (SAM.gov opportunities Robert is interested in)
const mockOpportunities = [
  {
    id: "SOL-2024-001",
    title: "Precision Machining Services for Military Vehicles",
    agency: "Department of Defense",
    solicitationNumber: "W91QUZ-24-R-0001",
    postedDate: "2024-05-01",
    deadline: "2024-07-15",
    location: "Aberdeen Proving Ground, MD",
    value: "$2,500,000",
    naicsCodes: ["332710", "332999"],
    description: "Seek precision machining services for military vehicle components. HUBZone set-aside.",
    setAside: "HUBZone",
    interestedInTeaming: true,
    teamingCount: 5,
    isMockData: true,
  },
  {
    id: "SOL-2024-002",
    title: "Aerospace Component Manufacturing",
    agency: "NASA",
    solicitationNumber: "NNC25BA02C",
    postedDate: "2024-05-10",
    deadline: "2024-08-01",
    location: "Goddard Space Flight Center, MD",
    value: "$1,800,000",
    naicsCodes: ["332721", "332999"],
    description: "Manufacture specialized aerospace components. SDVOSB set-aside.",
    setAside: "SDVOSB",
    interestedInTeaming: true,
    teamingCount: 3,
    isMockData: true,
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
