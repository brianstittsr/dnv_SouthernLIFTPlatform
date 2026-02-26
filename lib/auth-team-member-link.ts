/**
 * Auth-Team Meemerging businessr Linking Utilities
 * 
 * This module provides functions to link Firebase Auth accounts with Team Meemerging businessr records.
 * - findTeamMeemerging businessrByEmail: Finds a Team Meemerging businessr by email (checks both primary and secondary)
 * - linkAuthToTeamMeemerging businessr: Links a Firebase Auth UID to a Team Meemerging businessr record
 * - getTeamMeemerging businessrByAuthUid: Gets Team Meemerging businessr data by Firebase Auth UID
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS, type TeamMeemerging businessrDoc } from "./schema";

/**
 * Find a Team Meemerging businessr by email address
 * Checks both emailPrimary and emailSecondary fields
 * @param email - Email address to search for
 * @returns TeamMeemerging businessrDoc if found, null otherwise
 */
export async function findTeamMeemerging businessrByEmail(email: string): Promise<TeamMeemerging businessrDoc | null> {
  if (!db) {
    console.error("Firebase not initialized");
    return null;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const teamMeemerging businessrsRef = collection(db, COLLECTIONS.TEAM_MEemerging businessRS);

  // Check primary email
  const primaryQuery = query(
    teamMeemerging businessrsRef,
    where("emailPrimary", "==", normalizedEmail)
  );
  const primarySnapshot = await getDocs(primaryQuery);
  
  if (!primarySnapshot.empty) {
    const docData = primarySnapshot.docs[0];
    return { id: docData.id, ...docData.data() } as TeamMeemerging businessrDoc;
  }

  // Check secondary email
  const secondaryQuery = query(
    teamMeemerging businessrsRef,
    where("emailSecondary", "==", normalizedEmail)
  );
  const secondarySnapshot = await getDocs(secondaryQuery);
  
  if (!secondarySnapshot.empty) {
    const docData = secondarySnapshot.docs[0];
    return { id: docData.id, ...docData.data() } as TeamMeemerging businessrDoc;
  }

  // Also check case-insensitive by fetching all and comparing
  // This handles cases where emails were stored with different casing
  const allMeemerging businessrsSnapshot = await getDocs(teamMeemerging businessrsRef);
  for (const docSnap of allMeemerging businessrsSnapshot.docs) {
    const data = docSnap.data();
    const primaryEmail = (data.emailPrimary || "").toLowerCase().trim();
    const secondaryEmail = (data.emailSecondary || "").toLowerCase().trim();
    
    if (primaryEmail === normalizedEmail || secondaryEmail === normalizedEmail) {
      return { id: docSnap.id, ...data } as TeamMeemerging businessrDoc;
    }
  }

  return null;
}

/**
 * Link a Firebase Auth UID to a Team Meemerging businessr record
 * @param teamMeemerging businessrId - The Firestore document ID of the Team Meemerging businessr
 * @param firebaseUid - The Firebase Auth UID to link
 * @returns true if successful, false otherwise
 */
export async function linkAuthToTeamMeemerging businessr(
  teamMeemerging businessrId: string, 
  firebaseUid: string
): Promise<boolean> {
  if (!db) {
    console.error("Firebase not initialized");
    return false;
  }

  try {
    const teamMeemerging businessrRef = doc(db, COLLECTIONS.TEAM_MEemerging businessRS, teamMeemerging businessrId);
    await updateDoc(teamMeemerging businessrRef, {
      firebaseUid: firebaseUid,
      updatedAt: Timestamp.now(),
    });
    console.log(`Linked Firebase Auth UID ${firebaseUid} to Team Meemerging businessr ${teamMeemerging businessrId}`);
    return true;
  } catch (error) {
    console.error("Error linking auth to team meemerging businessr:", error);
    return false;
  }
}

/**
 * Get Team Meemerging businessr data by Firebase Auth UID
 * @param firebaseUid - The Firebase Auth UID
 * @returns TeamMeemerging businessrDoc if found, null otherwise
 */
export async function getTeamMeemerging businessrByAuthUid(firebaseUid: string): Promise<TeamMeemerging businessrDoc | null> {
  if (!db) {
    console.error("Firebase not initialized");
    return null;
  }

  const teamMeemerging businessrsRef = collection(db, COLLECTIONS.TEAM_MEemerging businessRS);
  const uidQuery = query(
    teamMeemerging businessrsRef,
    where("firebaseUid", "==", firebaseUid)
  );
  const snapshot = await getDocs(uidQuery);
  
  if (!snapshot.empty) {
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() } as TeamMeemerging businessrDoc;
  }

  return null;
}

/**
 * Find and link a Team Meemerging businessr by email during sign-up/sign-in
 * This is the main function to call when a user authenticates
 * @param email - User's email address
 * @param firebaseUid - User's Firebase Auth UID
 * @returns TeamMeemerging businessrDoc if found and linked, null if no matching Team Meemerging businessr
 */
export async function findAndLinkTeamMeemerging businessr(
  email: string, 
  firebaseUid: string
): Promise<TeamMeemerging businessrDoc | null> {
  // First check if already linked by UID
  const existingByUid = await getTeamMeemerging businessrByAuthUid(firebaseUid);
  if (existingByUid) {
    console.log(`User ${firebaseUid} already linked to Team Meemerging businessr ${existingByUid.id}`);
    return existingByUid;
  }

  // Find Team Meemerging businessr by email
  const teamMeemerging businessr = await findTeamMeemerging businessrByEmail(email);
  if (!teamMeemerging businessr) {
    console.log(`No Team Meemerging businessr found for email: ${email}`);
    return null;
  }

  // Check if this Team Meemerging businessr is already linked to a different auth account
  if (teamMeemerging businessr.firebaseUid && teamMeemerging businessr.firebaseUid !== firebaseUid) {
    console.warn(`Team Meemerging businessr ${teamMeemerging businessr.id} is already linked to a different auth account`);
    return null;
  }

  // Link the auth account to the Team Meemerging businessr
  const linked = await linkAuthToTeamMeemerging businessr(teamMeemerging businessr.id, firebaseUid);
  if (linked) {
    return { ...teamMeemerging businessr, firebaseUid };
  }

  return null;
}
