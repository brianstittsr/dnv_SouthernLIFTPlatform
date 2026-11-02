/**
 * Course Capacity Management Utilities
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
import { db } from "../firebase";
import type { CapacityCheck, Waitlist } from "@/types/courses";

/**
 * Check course capacity and availability
 */
export async function checkCapacity(courseId: string): Promise<CapacityCheck> {
  if (!db) throw new Error("Firebase not initialized");
  
  const courseRef = doc(db, "courses", courseId);
  const courseSnap = await getDoc(courseRef);
  
  if (!courseSnap.exists()) {
    throw new Error("Course not found");
  }
  
  const course = courseSnap.data();
  const enrolled = course.currentParticipants || 0;
  const max = course.maxParticipants || 0;
  
  // Get waitlist count
  const waitlistQuery = query(
    collection(db, "course_waitlist"),
    where("courseId", "==", courseId),
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
  courseId: string
): Promise<string> {
  if (!db) throw new Error("Firebase not initialized");
  
  // Check if already on waitlist
  const existingQuery = query(
    collection(db, "course_waitlist"),
    where("userId", "==", userId),
    where("courseId", "==", courseId),
    where("status", "in", ["waiting", "notified"])
  );
  const existingSnap = await getDocs(existingQuery);
  
  if (!existingSnap.empty) {
    throw new Error("Already on waitlist");
  }
  
  // Get current waitlist size for position
  const waitlistQuery = query(
    collection(db, "course_waitlist"),
    where("courseId", "==", courseId),
    where("status", "==", "waiting")
  );
  const waitlistSnap = await getDocs(waitlistQuery);
  const position = waitlistSnap.size + 1;
  
  const waitlistData: Omit<Waitlist, 'id'> = {
    userId,
    courseId,
    position,
    addedAt: Timestamp.now(),
    status: "waiting",
  };
  
  const docRef = await addDoc(collection(db, "course_waitlist"), waitlistData);
  return docRef.id;
}

/**
 * Remove user from waitlist
 */
export async function removeFromWaitlist(waitlistId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const waitlistRef = doc(db, "course_waitlist", waitlistId);
  await updateDoc(waitlistRef, {
    status: "expired",
  });
}

/**
 * Notify next person on waitlist when spot opens
 */
export async function notifyNextOnWaitlist(courseId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  // Get next person on waitlist
  const waitlistQuery = query(
    collection(db, "course_waitlist"),
    where("courseId", "==", courseId),
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
  await addDoc(collection(db, "course_notifications"), {
    courseId,
    userId: waitlistData.userId,
    type: "waitlist_spot_available",
    title: "Spot Available!",
    message: "A spot has opened up in your waitlisted course. Enroll now before it's taken!",
    emailSent: false,
    pushSent: false,
    createdAt: Timestamp.now(),
  });
}

/**
 * Auto-close enrollment when capacity reached
 */
export async function autoCloseEnrollment(courseId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const capacity = await checkCapacity(courseId);
  
  if (!capacity.available) {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      status: "full",
      enrollmentClosedAt: Timestamp.now(),
    });
  }
}

/**
 * Release seat when user drops out
 */
export async function releaseSeat(
  courseId: string,
  userId: string
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  // Decrement participant count
  const courseRef = doc(db, "courses", courseId);
  await updateDoc(courseRef, {
    currentParticipants: increment(-1),
  });
  
  // Update membership status
  const membershipQuery = query(
    collection(db, "course_memberships"),
    where("userId", "==", userId),
    where("courseId", "==", courseId),
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
  await notifyNextOnWaitlist(courseId);
}

/**
 * Get user's waitlist position
 */
export async function getWaitlistPosition(
  userId: string,
  courseId: string
): Promise<number | null> {
  if (!db) throw new Error("Firebase not initialized");
  
  const waitlistQuery = query(
    collection(db, "course_waitlist"),
    where("userId", "==", userId),
    where("courseId", "==", courseId),
    where("status", "==", "waiting"),
    limit(1)
  );
  
  const waitlistSnap = await getDocs(waitlistQuery);
  
  if (waitlistSnap.empty) return null;
  
  const waitlistData = waitlistSnap.docs[0].data();
  return waitlistData.position;
}

/**
 * Get all waitlist entries for a course
 */
export async function getCourseWaitlist(courseId: string): Promise<Waitlist[]> {
  if (!db) throw new Error("Firebase not initialized");
  
  const waitlistQuery = query(
    collection(db, "course_waitlist"),
    where("courseId", "==", courseId),
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
export async function reorderWaitlist(courseId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const waitlist = await getCourseWaitlist(courseId);
  
  // Update positions sequentially
  for (let i = 0; i < waitlist.length; i++) {
    const waitlistRef = doc(db, "course_waitlist", waitlist[i].id);
    await updateDoc(waitlistRef, {
      position: i + 1,
    });
  }
}
