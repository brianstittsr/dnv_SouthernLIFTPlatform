/**
 * Set Robert Frost's svpRole to consortium_member in the users collection
 * 
 * This script updates the user document to set the svpRole field so that
 * the consortium member navigation items are displayed in the sidebar.
 * 
 * Usage:
 * pnpm tsx scripts/set-robert-frost-consortium-role.ts
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

async function setConsortiumRole(): Promise<void> {
  try {
    const firebaseUid = "Vs2cRPNmsVdXDSr5EPfuNQv50Kx1";
    
    console.log("Setting consortium_member role for Robert Frost...");
    console.log(`Firebase UID: ${firebaseUid}`);
    
    // Update the users collection
    const userDocRef = db.collection("users").doc(firebaseUid);
    const userDocSnap = await userDocRef.get();
    
    if (userDocSnap.exists) {
      await userDocRef.update({
        svpRole: "consortium_member",
        updatedAt: Timestamp.now(),
      });
      console.log("✓ User document updated with svpRole: consortium_member");
    } else {
      console.log("User document not found, creating it...");
      await userDocRef.set({
        email: "robert.frost@frostmanufacturing.com",
        firstName: "Robert",
        lastName: "Frost",
        svpRole: "consortium_member",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log("✓ User document created with svpRole: consortium_member");
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("SUCCESS: Consortium Member Role Set");
    console.log("=".repeat(60));
    console.log("Robert Frost will now see the Consortium Member navigation items");
    
  } catch (error: any) {
    console.error("Error setting consortium role:", error);
    process.exit(1);
  }
}

setConsortiumRole().catch(console.error);
