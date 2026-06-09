/**
 * Migration Script for Existing Consortium Members
 * 
 * This script migrates existing Consortium Members to the new KDM Consortium Intelligence Platform
 * data structure and onboarding process.
 * 
 * Usage:
 * 1. Run this script in a Node.js environment with Firebase admin SDK
 * 2. The script will:
 *    - Identify existing Consortium Members (users with consortium_member role or consortium tag)
 *    - Create comprehensive consortium profiles
 *    - Calculate initial readiness scores
 *    - Assign appropriate membership tiers
 *    - Set up E2G alignment data
 *    - Update onboarding tracking
 * 
 * Run with: node scripts/migrate-consortium-members.ts
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Timestamp } from "firebase/firestore";
import {
  ConsortiumProfile,
  OnboardingStage,
  OnboardingStatus,
  MembershipTier,
  calculateReadinessScore,
} from "../lib/consortium-schema";
import { determineMembershipTier } from "../lib/membership-tiers";
import { assessE2GReadiness } from "../lib/e2g-alignment";

// ============================================================================
// CONFIGURATION
// ============================================================================

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const DRY_RUN = process.env.DRY_RUN === "true"; // Set to true to test without making changes

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
// MIGRATION FUNCTIONS
// ============================================================================

interface ExistingMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  svpRole?: string;
  tags?: string[];
  consortiumOnboardingComplete?: boolean;
  naicsCodes?: string[];
  certifications?: string[];
  consortiumPillarFocus?: string[];
  companyName?: string;
  companyDescription?: string;
  website?: string;
  linkedIn?: string;
  bio?: string;
  avatar?: string;
  title?: string;
}

/**
 * Fetch existing Consortium Members from the database
 */
async function fetchExistingMembers(): Promise<ExistingMember[]> {
  console.log("Fetching existing Consortium Members...");

  const members: ExistingMember[] = [];

  if (DRY_RUN) {
    // Mock data for dry run
    members.push({
      id: "mock_user_1",
      email: "user1@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "consortium_member",
      tags: ["kdm-consortium"],
      consortiumOnboardingComplete: true,
      naicsCodes: ["541511", "541512"],
      certifications: ["8a", "hubzone"],
      consortiumPillarFocus: ["us-manufacturing", "defense-contracting"],
      companyName: "Acme Manufacturing",
      companyDescription: "Manufacturing excellence for government contracts",
      website: "https://acme.com",
      title: "CEO",
    });
    console.log(`Found ${members.length} existing members (dry run)`);
    return members;
  }

  // Fetch from team_members collection
  const teamMembersSnapshot = await db.collection("team_members").get();
  
  for (const doc of teamMembersSnapshot.docs) {
    const data = doc.data();
    const isConsortiumMember = 
      data.role === "consortium_member" ||
      data.svpRole === "consortium_member" ||
      (data.tags && data.tags.includes("kdm-consortium"));

    if (isConsortiumMember) {
      members.push({
        id: doc.id,
        email: data.email || "",
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        svpRole: data.svpRole,
        tags: data.tags,
        consortiumOnboardingComplete: data.consortiumOnboardingComplete,
        naicsCodes: data.naicsCodes,
        certifications: data.certifications,
        consortiumPillarFocus: data.consortiumPillarFocus,
        companyName: data.companyName,
        companyDescription: data.companyDescription,
        website: data.website,
        linkedIn: data.linkedIn,
        bio: data.bio,
        avatar: data.avatar,
        title: data.title,
      });
    }
  }

  console.log(`Found ${members.length} existing Consortium Members`);
  return members;
}

/**
 * Map existing member data to new consortium profile structure
 */
function mapToConsortiumProfile(member: ExistingMember): Partial<ConsortiumProfile> {
  const now = Timestamp.now();

  // Calculate readiness score from existing data
  const readinessInput = {
    samRegistrationStatus: "not_registered" as const, // Default - will need manual update
    uei: undefined,
    cageCode: undefined,
    naicsCodes: (member.naicsCodes || []).map((code) => ({ code, description: code, isPrimary: true })),
    certifications: (member.certifications || []).map((cert) => ({
      type: cert as any,
      certificationNumber: "",
      issuingAgency: "",
      isActive: true,
    })),
    pastPerformanceCount: 0, // Will need manual entry
    gsaScheduleHolder: false, // Default - will need manual update
  };

  const readinessScore = calculateReadinessScore(readinessInput);

  // Determine membership tier
  const tierCriteria = {
    profileCompleteness: member.consortiumOnboardingComplete ? 85 : 60,
    readinessScore: readinessScore.overallScore,
    engagementScore: 50, // Default for migrated members
    pastPerformanceCount: 0,
    federalCertifications: (member.certifications || []).filter((cert) =>
      ["8a", "wosb", "sdvosb", "hubzone"].includes(cert)
    ).length,
  };

  const tierAssignment = determineMembershipTier(tierCriteria);

  // Map pillar focus to E2G pillars
  const pillarMap: Record<string, any> = {
    "us-manufacturing": "manufacturing_focus",
    "defense-contracting": "business_growth",
    "critical-minerals": "manufacturing_focus",
    "access-to-capital": "business_growth",
    "opportunity-zones": "rural_focus",
  };

  const pillars: any[] = [];
  const pillarFocus = member.consortiumPillarFocus || [];
  if (pillarFocus.includes("us-manufacturing") || pillarFocus.includes("critical-minerals")) {
    pillars.push("manufacturing_focus" as any);
  }
  if (pillarFocus.includes("defense-contracting")) {
    pillars.push("business_growth" as any);
  }

  // Create E2G alignment
  const e2gAlignment = {
    partnerId: member.id,
    targetRegions: ["all"] as any,
    ruralDeploymentExperience: false,
    ruralRegionsServed: [],
    pillarCapabilities: pillars.map((pillar) => ({
      pillar,
      capabilityLevel: "intermediate" as const,
      relevantProjects: 0,
    })),
    hubZoneCertified: (member.certifications || []).includes("hubzone"),
    communityRelationshipStrength: 50, // Default for migrated members
    ruralManufacturingSpecialization: pillarFocus.includes("us-manufacturing"),
    e2gReadinessScore: 50, // Will be calculated
    lastAssessed: now,
  };

  return {
    id: member.id,
    userId: member.id,
    onboardingTracking: {
      partnerId: member.id,
      currentStage: "engagement_tracking" as OnboardingStage,
      status: member.consortiumOnboardingComplete 
        ? ("fully_onboarded" as OnboardingStatus)
        : ("profile_complete" as OnboardingStatus),
      stageProgress: {
        discovery_intake: { status: "completed" as const },
        account_creation: { status: "completed" as const },
        profile_build: { status: "completed" as const },
        readiness_validation: { status: "completed" as const },
        matching_activation: { status: "completed" as const },
        engagement_tracking: { status: "in_progress" as const },
      },
      referralSource: "existing_member" as const,
      referralDetails: "Migrated from previous onboarding system",
      initialContact: {
        date: now,
        method: "migration",
        details: "Migrated during KDM Consortium Intelligence Platform upgrade",
      },
      welcomeSequence: {
        sent: false,
        opened: false,
        clicked: false,
      },
      notes: ["Migrated from previous onboarding system"],
      createdAt: now,
      updatedAt: now,
    },
    companyIdentity: {
      legalCompanyName: member.companyName || `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Unknown Company",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
      },
      companyDescription: member.companyDescription || "",
      ceoBiography: member.bio || "",
      companyLogo: member.avatar || "",
      yearsInBusiness: 0,
      annualRevenueRange: "",
      employeeCountRange: "",
      website: member.website || "",
      dunsNumber: "",
    },
    naicsCodes: (member.naicsCodes || []).map((code) => ({
      code,
      description: code,
      isPrimary: true,
    })),
    certifications: (member.certifications || []).map((cert) => ({
      type: cert as any,
      certificationNumber: "",
      issuingAgency: "",
      isActive: true,
    })),
    capabilities: [],
    serviceOfferings: [],
    technologySpecializations: [],
    pastPerformance: [],
    governmentContractingProfile: {
      cageCode: "",
      uei: "",
      samRegistrationStatus: "not_registered" as const,
      gsaScheduleHolder: false,
      gsaScheduleNumbers: [],
      preferredContractTypes: [],
      contractSizePreferences: [],
      setAsidePreferences: (member.certifications || []) as any[],
      pastFederalContracts: 0,
    },
    geographicCoverage: {
      statesServed: [],
      regionsServed: [],
      geographicServiceArea: "",
      willingToDeployToRural: false,
      ruralDeploymentExperience: false,
      ruralRegionsServed: [],
    },
    teamingPreferences: {
      willingToPrime: true,
      willingToSub: true,
      seekingPartners: true,
      idealPartnerProfile: "",
      contractSizePreferences: [],
      setAsidePreferences: (member.certifications || []) as any[],
      teamingRolePreferences: [],
    },
    consortiumPillarAlignment: {
      pillars: pillars,
      marketplaceSellerProfile: member.companyDescription || "",
      primaryServiceCategories: [],
      secondaryServiceCategories: [],
      e2gFocus: true,
      ruralFocus: pillarFocus.includes("opportunity-zones"),
      manufacturingFocus: pillarFocus.includes("us-manufacturing"),
    },
    readinessScore,
    membershipTier: {
      tier: tierAssignment.recommendedTier,
      assignedAt: now,
      assignedBy: "migration_script",
      assignmentReason: "Migrated from previous system",
      features: [],
      restrictions: [],
      upgradeEligibility: tierAssignment.upgradeEligible,
      downgradeEligibility: tierAssignment.downgradeEligible,
      autoRenew: true,
    },
    e2gAlignment,
    engagementMetrics: {
      profileCompleteness: member.consortiumOnboardingComplete ? 85 : 60,
      lastProfileUpdate: now,
      marketplaceListingsCount: 0,
      opportunityWinRate: 0,
      meetingsAttended: 0,
      meetingsHosted: 0,
      teamingRequestsSent: 0,
      teamingRequestsReceived: 0,
      teamingRequestsAccepted: 0,
      proposalsSubmitted: 0,
      proposalsWon: 0,
      averageResponseTime: 0,
      activeEngagementScore: 50,
      connections: 0,
      calculatedAt: now,
    },
    capabilityMatches: [],
    teamingMatches: [],
    e2gAlignmentMatches: [],
    createdAt: now,
    updatedAt: now,
    lastActive: now,
  };
}

/**
 * Create consortium profile for a member
 */
async function createConsortiumProfile(member: ExistingMember): Promise<boolean> {
  const profile = mapToConsortiumProfile(member);

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would create consortium profile for ${member.email}`);
    console.log(`  - Tier: ${profile.membershipTier?.tier}`);
    console.log(`  - Readiness Score: ${profile.readinessScore?.overallScore}`);
    return true;
  }

  try {
    const profileRef = db.collection("consortium_profiles").doc(member.id);
    await profileRef.set(profile);
    console.log(`✓ Created consortium profile for ${member.email}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to create profile for ${member.email}:`, error);
    return false;
  }
}

/**
 * Update user document with new onboarding status
 */
async function updateUserDocument(member: ExistingMember): Promise<boolean> {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would update user document for ${member.email}`);
    return true;
  }

  try {
    const userRef = db.collection("users").doc(member.id);
    await userRef.update({
      profileComplete: true,
      onboardingStatus: "fully_onboarded",
      onboardingType: "consortium_member",
      onboardingStartedAt: Timestamp.now(),
      onboardingCompletedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`✓ Updated user document for ${member.email}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to update user document for ${member.email}:`, error);
    return false;
  }
}

/**
 * Generate migration report
 */
function generateMigrationReport(
  members: ExistingMember[],
  results: { success: boolean; error?: string }[]
): void {
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  console.log("\n" + "=".repeat(60));
  console.log("MIGRATION REPORT");
  console.log("=".repeat(60));
  console.log(`Total Members: ${members.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  console.log(`Success Rate: ${((successCount / members.length) * 100).toFixed(1)}%`);

  if (failureCount > 0) {
    console.log("\nFailed Migrations:");
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`  - ${members[index].email}: ${result.error}`);
      }
    });
  }

  console.log("\nNext Steps:");
  console.log("1. Review migrated profiles in Firestore");
  console.log("2. Manually update missing data:");
  console.log("   - SAM.gov registration status");
  console.log("   - UEI and CAGE codes");
  console.log("   - Past performance entries");
  console.log("   - Geographic coverage");
  console.log("3. Notify members of the new platform features");
  console.log("4. Provide training on new onboarding workflow");
  console.log("=".repeat(60));
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

async function migrateConsortiumMembers(): Promise<void> {
  console.log("Starting KDM Consortium Member Migration...\n");

  try {
    // Fetch existing members
    const members = await fetchExistingMembers();

    if (members.length === 0) {
      console.log("No existing Consortium Members found. Migration complete.");
      return;
    }

    // Migrate each member
    const results: { success: boolean; error?: string }[] = [];

    for (const member of members) {
      console.log(`\nMigrating: ${member.email}`);

      try {
        // Create consortium profile
        const profileCreated = await createConsortiumProfile(member);
        
        // Update user document
        const userUpdated = await updateUserDocument(member);

        results.push({
          success: profileCreated && userUpdated,
          error: !profileCreated ? "Failed to create profile" : !userUpdated ? "Failed to update user" : undefined,
        });
      } catch (error: any) {
        console.error(`Migration failed for ${member.email}:`, error);
        results.push({
          success: false,
          error: error.message,
        });
      }
    }

    // Generate report
    generateMigrationReport(members, results);

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  console.log("\nMigration complete!");
  process.exit(0);
}

// ============================================================================
// RUN MIGRATION
// ============================================================================

migrateConsortiumMembers().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
