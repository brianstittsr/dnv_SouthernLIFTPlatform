/**
 * Fix Robert Frost's Firebase UID in Team Member and Consortium Member documents
 * 
 * This script updates the firebaseUid field to match the actual Firebase Auth user UID.
 * 
 * Usage:
 * pnpm tsx scripts/fix-robert-frost-uid.ts
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

async function fixFirebaseUid(): Promise<void> {
  try {
    const oldUid = "mock_robert_frost_001";
    const newUid = "Vs2cRPNmsVdXDSr5EPfuNQv50Kx1";
    
    console.log("Fixing Firebase UID for Robert Frost...");
    console.log(`Old UID: ${oldUid}`);
    console.log(`New UID: ${newUid}`);
    
    // Update Team Member document
    console.log("\n--- Updating Team Member Document ---");
    const teamMemberRef = db.collection("teamMembers").doc(oldUid);
    const teamMemberDoc = await teamMemberRef.get();
    
    if (teamMemberDoc.exists) {
      const data = teamMemberDoc.data();
      await teamMemberRef.update({
        firebaseUid: newUid,
        id: newUid,
        updatedAt: Timestamp.now(),
      });
      console.log("✓ Team Member document updated");
      
      // Move document to new ID
      const newTeamMemberRef = db.collection("teamMembers").doc(newUid);
      await newTeamMemberRef.set({ ...data, firebaseUid: newUid, id: newUid, updatedAt: Timestamp.now() });
      await teamMemberRef.delete();
      console.log("✓ Team Member document moved to new ID");
    } else {
      console.log("Team Member document not found");
    }
    
    // Update Consortium Member document
    console.log("\n--- Updating Consortium Member Document ---");
    const consortiumMemberRef = db.collection("consortiumMembers").doc(oldUid);
    const consortiumDoc = await consortiumMemberRef.get();
    
    if (consortiumDoc.exists) {
      const data = consortiumDoc.data();
      await consortiumMemberRef.update({
        firebaseUid: newUid,
        id: newUid,
        updatedAt: Timestamp.now(),
      });
      console.log("✓ Consortium Member document updated");
      
      // Move document to new ID
      const newConsortiumRef = db.collection("consortiumMembers").doc(newUid);
      await newConsortiumRef.set({ ...data, firebaseUid: newUid, id: newUid, updatedAt: Timestamp.now() });
      await consortiumMemberRef.delete();
      console.log("✓ Consortium Member document moved to new ID");
    } else {
      console.log("Consortium Member document not found");
    }
    
    // Update users collection
    console.log("\n--- Updating Users Collection ---");
    const userRef = db.collection("users").doc(newUid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      await userRef.update({
        linkedTeamMemberId: newUid,
        updatedAt: Timestamp.now(),
      });
      console.log("✓ Users collection updated");
    } else {
      console.log("Users document not found");
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("SUCCESS: Firebase UID Fixed");
    console.log("=".repeat(60));
    console.log(`All documents now use Firebase Auth UID: ${newUid}`);
    
  } catch (error: any) {
    console.error("Error fixing Firebase UID:", error);
    process.exit(1);
  }
}

fixFirebaseUid().catch(console.error);
