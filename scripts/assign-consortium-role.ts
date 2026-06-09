/**
 * Assign Consortium Member Role to Robert Frost
 * 
 * This script updates the user document to include the consortium_member role.
 * 
 * Usage:
 * pnpm tsx scripts/assign-consortium-role.ts
 */

import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
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

async function assignConsortiumRole(): Promise<void> {
  try {
    const userId = "mock_robert_frost_001";
    
    console.log("Assigning consortium_member role to Robert Frost...");
    console.log(`User ID: ${userId}`);
    
    // Update the user document
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error("User document not found. Run the mock data generation script first.");
      process.exit(1);
    }
    
    const userData = userDoc.data();
    const currentRoles = userData?.roles || [];
    
    // Add consortium_member if not already present
    if (!currentRoles.includes("consortium_member")) {
      await userRef.update({
        roles: [...currentRoles, "consortium_member"],
        svpRole: "partner_user",
        updatedAt: new Date(),
      });
      console.log("✓ consortium_member role added");
      console.log("✓ svpRole set to partner_user");
    } else {
      console.log("User already has consortium_member role");
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("SUCCESS: Role assigned");
    console.log("=".repeat(60));
    console.log(`User ID: ${userId}`);
    console.log(`Roles: ${[...currentRoles, "consortium_member"].join(", ")}`);
    console.log(`SVP Role: partner_user`);
    
  } catch (error: any) {
    console.error("Error assigning role:", error);
    process.exit(1);
  }
}

assignConsortiumRole().catch(console.error);
