/**
 * Cohort Capacity Management Utilities
 * Handles capacity checking, waitlists, and enrollment management
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CapacityCheck, Waitlist } from "@/types/cohorts";

/**
 * Check cohort capacity and availability
 */
export async function checkCapacity(cohortId: string): Promise<CapacityCheck> {
  if (!db) throw new Error("Firebase not initialized");
  
  const cohortRef = doc(db, "cohorts", cohortId);
  const cohortSnap = await getDoc(cohortRef);
  
  if (!cohortSnap.exists()) {
    throw new Error("Cohort not found");
  }
  
  const cohort = cohortSnap.data();
  const enrolled = cohort.currentParticipants || 0;
  const max = cohort.maxParticipants || 0;
  
  // Get waitlist count
  const waitlistQuery = query(
    collection(db, "cohort_waitlist"),
    where("cohortId", "==", cohortId),
    where("status", "==", "waiting")
  );
  const waitlistSnap = await getDocs(waitlistQuery);
  const waitlistCount = waitlistSnap.size;
  
  const spotsRemaining = Math.max(0, max - enrolled);
  const isOverbooked = enrolled > max;
  
  return {
    available: spotsRemaining > 0,
    spotsRemaining,
    waitlistCount,
    isOverbooked,
  };
}

/**
 * Add user to waitlist
 */
export async function addToWaitlist(
  userId: string,
  cohortId: string
): Promise<string> {
  if (!db) throw new Error("Firebase not initialized");
  
  // Check if already on waitlist
  const existingQuery = query(
    collection(db, "cohort_waitlist"),
    where("userId", "==", userId),
    where("cohortId", "==", cohortId),
    where("status", "in", ["waiting", "notified"])
  );
  const existingSnap = await getDocs(existingQuery);
  
  if (!existingSnap.empty) {
    throw new Error("Already on waitlist");
  }
  
  // Get current waitlist size for position
  const waitlistQuery = query(
    collection(db, "cohort_waitlist"),
    where("cohortId", "==", cohortId),
    where("status", "==", "waiting")
  );
  const waitlistSnap = await getDocs(waitlistQuery);
  const position = waitlistSnap.size + 1;
  
  const waitlistData: Omit<Waitlist, 'id'> = {
    userId,
    cohortId,
    position,
    addedAt: Timestamp.now(),
    status: "waiting",
  };
  
  const docRef = await addDoc(collection(db, "cohort_waitlist"), waitlistData);
  return docRef.id;
}

/**
 * Remove user from waitlist
 */
export async function removeFromWaitlist(waitlistId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const waitlistRef = doc(db, "cohort_waitlist", waitlistId);
  await updateDoc(waitlistRef, {
    status: "expired",
  });
}

/**
 * Notify next person on waitlist when spot opens
 */
export async function notifyNextOnWaitlist(cohortId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  // Get next person on waitlist
  const waitlistQuery = query(
    collection(db, "cohort_waitlist"),
    where("cohortId", "==", cohortId),
    where("status", "==", "waiting"),
    orderBy("position", "asc"),
    limit(1)
  );
  
  const waitlistSnap = await getDocs(waitlistQuery);
  
  if (waitlistSnap.empty) return;
  
  const waitlistDoc = waitlistSnap.docs[0];
  const waitlistData = waitlistDoc.data();
  
  // Update status to notified
  await updateDoc(waitlistDoc.ref, {
    status: "notified",
    notifiedAt: Timestamp.now(),
  });
  
  // Create notification
  await addDoc(collection(db, "cohort_notifications"), {
    cohortId,
    userId: waitlistData.userId,
    type: "waitlist_spot_available",
    title: "Spot Available!",
    message: "A spot has opened up in your waitlisted cohort. Enroll now before it's taken!",
    emailSent: false,
    pushSent: false,
    createdAt: Timestamp.now(),
  });
}

/**
 * Auto-close enrollment when capacity reached
 */
export async function autoCloseEnrollment(cohortId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const capacity = await checkCapacity(cohortId);
  
  if (!capacity.available) {
    const cohortRef = doc(db, "cohorts", cohortId);
    await updateDoc(cohortRef, {
      status: "full",
      enrollmentClosedAt: Timestamp.now(),
    });
  }
}

/**
 * Release seat when user drops out
 */
export async function releaseSeat(
  cohortId: string,
  userId: string
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  // Decrement participant count
  const cohortRef = doc(db, "cohorts", cohortId);
  await updateDoc(cohortRef, {
    currentParticipants: increment(-1),
  });
  
  // Update membership status
  const membershipQuery = query(
    collection(db, "cohort_memberships"),
    where("userId", "==", userId),
    where("cohortId", "==", cohortId),
    limit(1)
  );
  const membershipSnap = await getDocs(membershipQuery);
  
  if (!membershipSnap.empty) {
    const membershipDoc = membershipSnap.docs[0];
    await updateDoc(membershipDoc.ref, {
      status: "dropped",
      droppedAt: Timestamp.now(),
    });
  }
  
  // Notify next person on waitlist
  await notifyNextOnWaitlist(cohortId);
}

/**
 * Get user's waitlist position
 */
export async function getWaitlistPosition(
  userId: string,
  cohortId: string
): Promise<number | null> {
  if (!db) throw new Error("Firebase not initialized");
  
  const waitlistQuery = query(
    collection(db, "cohort_waitlist"),
    where("userId", "==", userId),
    where("cohortId", "==", cohortId),
    where("status", "==", "waiting"),
    limit(1)
  );
  
  const waitlistSnap = await getDocs(waitlistQuery);
  
  if (waitlistSnap.empty) return null;
  
  const waitlistData = waitlistSnap.docs[0].data();
  return waitlistData.position;
}

/**
 * Get all waitlist entries for a cohort
 */
export async function getCohortWaitlist(cohortId: string): Promise<Waitlist[]> {
  if (!db) throw new Error("Firebase not initialized");
  
  const waitlistQuery = query(
    collection(db, "cohort_waitlist"),
    where("cohortId", "==", cohortId),
    where("status", "==", "waiting"),
    orderBy("position", "asc")
  );
  
  const waitlistSnap = await getDocs(waitlistQuery);
  return waitlistSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Waitlist));
}

/**
 * Calculate and update waitlist positions after removal
 */
export async function reorderWaitlist(cohortId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const waitlist = await getCohortWaitlist(cohortId);
  
  // Update positions sequentially
  for (let i = 0; i < waitlist.length; i++) {
    const waitlistRef = doc(db, "cohort_waitlist", waitlist[i].id);
    await updateDoc(waitlistRef, {
      position: i + 1,
    });
  }
}
