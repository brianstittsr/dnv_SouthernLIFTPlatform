/**
 * Create Firebase Auth User for Mock Robert Frost
 * 
 * This script creates the Firebase Auth user account for the mock user.
 * Run after generating the mock data to enable sign-in.
 * 
 * Usage:
 * pnpm tsx scripts/create-firebase-auth-user.ts
 */

import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!SERVICE_ACCOUNT_PATH) {
  console.error("ERROR: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set");
  console.error("Set it to the path of your Firebase service account JSON file");
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = require(SERVICE_ACCOUNT_PATH);
const app = getApps().length === 0 ? initializeApp({
  credential: cert(serviceAccount),
}) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

async function createMockUser(): Promise<void> {
  try {
    console.log("Creating Firebase Auth user for Robert Frost...");
    
    const email = "robert.frost@frostmanufacturing.com";
    const password = "TestPassword123!";
    const uid = "mock_robert_frost_001";
    
    // Create the user in Firebase Auth
    const userRecord = await auth.createUser({
      uid: uid,
      email: email,
      password: password,
      emailVerified: true,
      displayName: "Robert Frost",
    });
    
    console.log("✓ Firebase Auth user created successfully");
    console.log(`  UID: ${userRecord.uid}`);
    console.log(`  Email: ${userRecord.email}`);
    console.log(`  Display Name: ${userRecord.displayName}`);
    
    // Set custom claims for consortium_member role
    await auth.setCustomUserClaims(uid, {
      role: "consortium_member",
      svpRole: "partner_user",
    });
    
    console.log("✓ Custom claims set (consortium_member, partner_user)");
    
    console.log("\n" + "=".repeat(60));
    console.log("SUCCESS: Mock user created");
    console.log("=".repeat(60));
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("\nYou can now sign in with these credentials.");
    
  } catch (error: any) {
    if (error.code === "auth/uid-already-exists") {
      console.log("User already exists. Updating custom claims...");
      
      const uid = "mock_robert_frost_001";
      await auth.setCustomUserClaims(uid, {
        role: "consortium_member",
        svpRole: "partner_user",
      });
      
      console.log("✓ Custom claims updated");
      console.log("\nUser already exists. You can sign in with:");
      console.log("Email: robert.frost@frostmanufacturing.com");
      console.log("Password: TestPassword123!");
    } else {
      console.error("Error creating user:", error);
      process.exit(1);
    }
  }
}

createMockUser().catch(console.error);
