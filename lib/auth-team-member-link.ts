/**
 * Auth-Team member Linking Utilities
 * 
 * This module provides functions to link Firebase Auth accounts with Team member records.
 * - findTeammemberByEmail: Finds a Team member by email (checks both primary and secondary)
 * - linkAuthToTeammember: Links a Firebase Auth UID to a Team member record
 * - getTeammemberByAuthUid: Gets Team member data by Firebase Auth UID
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
import { COLLECTIONS, type TeammemberDoc } from "./schema";

/**
 * Find a Team member by email address
 * Checks both emailPrimary and emailSecondary fields
 * @param email - Email address to search for
 * @returns TeammemberDoc if found, null otherwise
 */
export async function findTeammemberByEmail(email: string): Promise<TeammemberDoc | null> {
  if (!db) {
    console.error("Firebase not initialized");
    return null;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const teammembersRef = collection(db, COLLECTIONS.TEAM_memberS);

  // Check primary email
  const primaryQuery = query(
    teammembersRef,
    where("emailPrimary", "==", normalizedEmail)
  );
  const primarySnapshot = await getDocs(primaryQuery);
  
  if (!primarySnapshot.empty) {
    const docData = primarySnapshot.docs[0];
    return { id: docData.id, ...docData.data() } as TeammemberDoc;
  }

  // Check secondary email
  const secondaryQuery = query(
    teammembersRef,
    where("emailSecondary", "==", normalizedEmail)
  );
  const secondarySnapshot = await getDocs(secondaryQuery);
  
  if (!secondarySnapshot.empty) {
    const docData = secondarySnapshot.docs[0];
    return { id: docData.id, ...docData.data() } as TeammemberDoc;
  }

  // Also check case-insensitive by fetching all and comparing
  // This handles cases where emails were stored with different casing
  const allmembersSnapshot = await getDocs(teammembersRef);
  for (const docSnap of allmembersSnapshot.docs) {
    const data = docSnap.data();
    const primaryEmail = (data.emailPrimary || "").toLowerCase().trim();
    const secondaryEmail = (data.emailSecondary || "").toLowerCase().trim();
    
    if (primaryEmail === normalizedEmail || secondaryEmail === normalizedEmail) {
      return { id: docSnap.id, ...data } as TeammemberDoc;
    }
  }

  return null;
}

/**
 * Link a Firebase Auth UID to a Team member record
 * @param teammemberId - The Firestore document ID of the Team member
 * @param firebaseUid - The Firebase Auth UID to link
 * @returns true if successful, false otherwise
 */
export async function linkAuthToTeammember(
  teammemberId: string, 
  firebaseUid: string
): Promise<boolean> {
  if (!db) {
    console.error("Firebase not initialized");
    return false;
  }

  try {
    const teammemberRef = doc(db, COLLECTIONS.TEAM_memberS, teammemberId);
    await updateDoc(teammemberRef, {
      firebaseUid: firebaseUid,
      updatedAt: Timestamp.now(),
    });
    console.log(`Linked Firebase Auth UID ${firebaseUid} to Team member ${teammemberId}`);
    return true;
  } catch (error) {
    console.error("Error linking auth to team member:", error);
    return false;
  }
}

/**
 * Get Team member data by Firebase Auth UID
 * @param firebaseUid - The Firebase Auth UID
 * @returns TeammemberDoc if found, null otherwise
 */
export async function getTeammemberByAuthUid(firebaseUid: string): Promise<TeammemberDoc | null> {
  if (!db) {
    console.error("Firebase not initialized");
    return null;
  }

  const teammembersRef = collection(db, COLLECTIONS.TEAM_memberS);
  const uidQuery = query(
    teammembersRef,
    where("firebaseUid", "==", firebaseUid)
  );
  const snapshot = await getDocs(uidQuery);
  
  if (!snapshot.empty) {
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() } as TeammemberDoc;
  }

  return null;
}

/**
 * Find and link a Team member by email during sign-up/sign-in
 * This is the main function to call when a user authenticates
 * @param email - User's email address
 * @param firebaseUid - User's Firebase Auth UID
 * @returns TeammemberDoc if found and linked, null if no matching Team member
 */
export async function findAndLinkTeammember(
  email: string, 
  firebaseUid: string
): Promise<TeammemberDoc | null> {
  // First check if already linked by UID
  const existingByUid = await getTeammemberByAuthUid(firebaseUid);
  if (existingByUid) {
    console.log(`User ${firebaseUid} already linked to Team member ${existingByUid.id}`);
    return existingByUid;
  }

  // Find Team member by email
  const teammember = await findTeammemberByEmail(email);
  if (!teammember) {
    console.log(`No Team member found for email: ${email}`);
    return null;
  }

  // Check if this Team member is already linked to a different auth account
  if (teammember.firebaseUid && teammember.firebaseUid !== firebaseUid) {
    console.warn(`Team member ${teammember.id} is already linked to a different auth account`);
    return null;
  }

  // Link the auth account to the Team member
  const linked = await linkAuthToTeammember(teammember.id, firebaseUid);
  if (linked) {
    return { ...teammember, firebaseUid };
  }

  return null;
}
