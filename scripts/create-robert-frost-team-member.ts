/**
 * Create Team Member & Consortium Member Profile for Robert Frost
 * 
 * This script creates both a TeamMemberDoc and ConsortiumMemberDoc for Robert Frost.
 * 
 * Usage:
 * pnpm tsx scripts/create-robert-frost-team-member.ts
 */

import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!SERVICE_ACCOUNT_PATH) {
  console.error("ERROR: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set");
  console.error("Set it to the path of your Firebase service account JSON file");
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
const app = getApps().length === 0 ? initializeApp({
  credential: cert(serviceAccount),
}) : getApp();

const db = getFirestore(app);

async function createProfiles(): Promise<void> {
  try {
    const userId = "mock_robert_frost_001";
    
    console.log("Creating profiles for Robert Frost...");
    console.log(`User ID: ${userId}`);
    
    // ==================== Create Team Member Profile ====================
    console.log("\n--- Creating Team Member Profile ---");
    const teamMemberRef = db.collection("teamMembers").doc(userId);
    const existingTeamDoc = await teamMemberRef.get();
    
    const teamMemberData = {
      id: userId,
      firebaseUid: userId,
      firstName: "Robert",
      lastName: "Frost",
      emailPrimary: "robert.frost@frostmanufacturing.com",
      emailSecondary: "",
      mobile: "",
      expertise: "Manufacturing, CNC Machining, OEM Supplier Qualification",
      title: "President",
      company: "Frost Manufacturing",
      location: "United States",
      bio: "President of Frost Manufacturing, specializing in precision CNC machining and OEM supplier qualification. Leading the company's expansion into federal contracting and defense manufacturing.",
      avatar: "",
      linkedIn: "",
      website: "",
      role: "affiliate" as const,
      status: "active" as const,
      isCEO: true,
      isCOO: false,
      createdAt: existingTeamDoc.exists ? existingTeamDoc.data()?.createdAt : Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await teamMemberRef.set(teamMemberData, { merge: true });
    console.log("✓ Team Member profile created/updated");
    
    // ==================== Create Consortium Member Profile ====================
    console.log("\n--- Creating Consortium Member Profile ---");
    const consortiumMemberRef = db.collection("consortiumMembers").doc(userId);
    const existingConsortiumDoc = await consortiumMemberRef.get();
    
    const consortiumMemberData = {
      id: userId,
      firebaseUid: userId,
      firstName: "Robert",
      lastName: "Frost",
      emailPrimary: "robert.frost@frostmanufacturing.com",
      emailSecondary: "",
      mobile: "",
      expertise: "Manufacturing, CNC Machining, OEM Supplier Qualification",
      title: "President",
      company: "Frost Manufacturing",
      location: "United States",
      bio: "President of Frost Manufacturing, specializing in precision CNC machining and OEM supplier qualification. Leading the company's expansion into federal contracting and defense manufacturing.",
      avatar: "",
      linkedIn: "",
      website: "",
      // Consortium-specific fields
      membershipTier: "elite" as const,
      membershipStatus: "active" as const,
      subscriptionId: "",
      onboardingComplete: true,
      consortiumOnboardingComplete: true,
      // NAICS codes and certifications
      naicsCodes: ["332710", "332720", "332730"],
      certifications: ["ISO 9001", "CMMC Level 2"],
      consortiumPillarFocus: ["capture", "teaming", "procurement"],
      // Tags for categorization
      tags: ["manufacturing", "CNC", "OEM", "defense"],
      createdAt: existingConsortiumDoc.exists ? existingConsortiumDoc.data()?.createdAt : Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await consortiumMemberRef.set(consortiumMemberData, { merge: true });
    console.log("✓ Consortium Member profile created/updated");
    
    // ==================== Summary ====================
    console.log("\n" + "=".repeat(60));
    console.log("SUCCESS: Profiles Created");
    console.log("=".repeat(60));
    console.log(`Name: ${teamMemberData.firstName} ${teamMemberData.lastName}`);
    console.log(`Email: ${teamMemberData.emailPrimary}`);
    console.log(`Company: ${teamMemberData.company}`);
    console.log(`Title: ${teamMemberData.title}`);
    console.log(`\nTeam Member Role: ${teamMemberData.role}`);
    console.log(`Team Member Status: ${teamMemberData.status}`);
    console.log(`\nConsortium Membership Tier: ${consortiumMemberData.membershipTier}`);
    console.log(`Consortium Membership Status: ${consortiumMemberData.membershipStatus}`);
    console.log(`Consortium Onboarding: ${consortiumMemberData.consortiumOnboardingComplete ? "Complete" : "Incomplete"}`);
    console.log(`NAICS Codes: ${consortiumMemberData.naicsCodes?.join(", ")}`);
    console.log(`Certifications: ${consortiumMemberData.certifications?.join(", ")}`);
    
  } catch (error: any) {
    console.error("Error creating profiles:", error);
    process.exit(1);
  }
}

createProfiles().catch(console.error);
