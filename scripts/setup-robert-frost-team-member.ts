/**
 * Create/update the teamMembers document for Robert Frost using his real Firebase Auth UID.
 * This links the onboarding wizard to his Firestore record so handleComplete can write data.
 *
 * Usage:
 * pnpm tsx scripts/setup-robert-frost-team-member.ts
 */

import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!SERVICE_ACCOUNT_PATH) {
  console.error("ERROR: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
const app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApp();
const db = getFirestore(app);

// Robert Frost's real Firebase Auth UID
const REAL_UID = "Vs2cRPNmsVdXDSr5EPfuNQv50Kx1";
const MOCK_EMAIL = "robert.frost@frostmanufacturing.com";

async function setupTeamMember(): Promise<void> {
  try {
    console.log("Setting up teamMembers document for Robert Frost...");
    console.log(`Firebase UID: ${REAL_UID}`);

    const teamMemberRef = db.collection("teamMembers").doc(REAL_UID);
    const snap = await teamMemberRef.get();

    const teamMemberData = {
      id: REAL_UID,
      firebaseUid: REAL_UID,
      firstName: "Robert",
      lastName: "Frost",
      emailPrimary: MOCK_EMAIL,
      title: "CEO & Founder",
      bio: "Retired Army veteran and cybersecurity executive with 20+ years in federal IT contracting. Specializing in CMMC compliance, cybersecurity services, and defense IT solutions for DoD prime contractors and federal agencies.",
      avatar: "https://ui-avatars.com/api/?name=Robert+Frost&background=0D8ABC&color=fff",
      companyName: "Frost Defense Technologies LLC",
      companyDescription: "SDVOSB- and HUBZone-certified cybersecurity firm specializing in CMMC Level 2 compliance assessments, RMF/ATO support, and zero-trust architecture for DoD contractors.",
      website: "https://frostdefensetech.com",
      linkedIn: "https://linkedin.com/company/frost-defense-technologies",
      role: "affiliate",
      status: "active",
      membershipTier: "standard",
      membershipStatus: "active",
      naicsCodes: ["541512", "541513", "541519", "541690", "541330"],
      certifications: ["8a", "sdvosb", "cmmc", "hubzone"],
      consortiumPillarFocus: ["defense-contracting", "access-to-capital"],
      consortiumOnboardingComplete: false, // false so the wizard triggers
      onboardingStage: "profile",
      readinessDocuments: [],
      readinessValidationStatus: "not_started",
      matchingPreferences: {
        targetContractSizes: ["$500K-$1M", "$1M-$5M", "$5M-$10M"],
        targetAgencies: ["DoD", "DHS", "VA", "Department of State", "NASA"],
        targetRegions: ["National", "Northeast", "Southeast"],
        preferredPartnerships: [],
      },
      performanceMetrics: {
        totalOpportunitiesViewed: 0,
        totalPartnershipsInitiated: 0,
        totalProposalsSubmitted: 0,
        totalContractsWon: 0,
        totalContractValue: 0,
        averageResponseTime: 0,
        partnershipSuccessRate: 0,
        lastActivityAt: Timestamp.now(),
      },
      engagementScore: 0,
      createdAt: snap.exists ? snap.data()?.createdAt || Timestamp.now() : Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await teamMemberRef.set(teamMemberData, { merge: true });

    if (snap.exists) {
      console.log("✓ teamMembers document updated for Robert Frost");
    } else {
      console.log("✓ teamMembers document created for Robert Frost");
    }

    // Also update the users doc to ensure svpRole and consortiumOnboardingComplete=false
    // so the onboarding wizard triggers on next login
    const userRef = db.collection("users").doc(REAL_UID);
    await userRef.set({
      svpRole: "consortium_member",
      consortiumOnboardingComplete: false,
      firstName: "Robert",
      lastName: "Frost",
      company: "Frost Defense Technologies LLC",
      jobTitle: "CEO & Founder",
      updatedAt: Timestamp.now(),
    }, { merge: true });
    console.log("✓ users document updated (onboarding wizard will re-trigger)");

    console.log("\n" + "=".repeat(60));
    console.log("SUCCESS");
    console.log("=".repeat(60));
    console.log("Robert Frost teamMembers doc is ready.");
    console.log("Log in as robert.frost@frostmanufacturing.com");
    console.log("The onboarding wizard will appear and 'Complete Profile'");
    console.log("will now write to teamMembers/" + REAL_UID);

  } catch (error: any) {
    console.error("Error:", error);
    process.exit(1);
  }
}

setupTeamMember().catch(console.error);
