/**
 * Course Lifecycle State Management
 * Handles state transitions and lifecycle automation
 */

import {
  doc,
  updateDoc,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { CourseLifecycleStatus } from "@/types/courses";

/**
 * Valid state transitions
 */
const VALID_TRANSITIONS: Record<CourseLifecycleStatus, CourseLifecycleStatus[]> = {
  draft: ["scheduled", "cancelled"],
  scheduled: ["enrolling", "cancelled"],
  enrolling: ["active", "cancelled"],
  active: ["completed", "cancelled"],
  completed: ["archived"],
  archived: [],
  cancelled: [],
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(
  fromState: CourseLifecycleStatus,
  toState: CourseLifecycleStatus
): boolean {
  return VALID_TRANSITIONS[fromState]?.includes(toState) || false;
}

/**
 * Transition course to a new state
 */
export async function transitionCourseState(
  courseId: string,
  toState: CourseLifecycleStatus,
  triggeredBy: string,
  reason?: string
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const courseRef = doc(db, "courses", courseId);
  const { getDoc } = await import("firebase/firestore");
  const courseSnap = await getDoc(courseRef);
  
  if (!courseSnap.exists()) {
    throw new Error("Course not found");
  }
  
  const currentState = courseSnap.data()?.status as CourseLifecycleStatus;
  
  // Validate transition
  if (!isValidTransition(currentState, toState)) {
    throw new Error(
      `Invalid state transition from ${currentState} to ${toState}`
    );
  }
  
  // Update course state
  await updateDoc(courseRef, {
    status: toState,
    updatedAt: Timestamp.now(),
  });
  
  // Log state transition
  await addDoc(collection(db, "course_state_transitions"), {
    courseId,
    fromState: currentState,
    toState,
    triggeredBy,
    triggeredAt: Timestamp.now(),
    reason: reason || null,
  });
  
  // Trigger state-specific actions
  await handleStateTransitionActions(courseId, toState, triggeredBy);
}

/**
 * Handle actions that should occur on state transitions
 */
async function handleStateTransitionActions(
  courseId: string,
  newState: CourseLifecycleStatus,
  triggeredBy: string
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  switch (newState) {
    case "scheduled":
      // Send notification to facilitator
      await addDoc(collection(db, "course_notifications"), {
        courseId,
        userId: null, // To facilitator
        type: "course_scheduled",
        title: "Course Scheduled",
        message: "Your course has been scheduled and is ready for enrollment.",
        emailSent: false,
        pushSent: false,
        createdAt: Timestamp.now(),
      });
      break;
      
    case "enrolling":
      // Open enrollment
      await updateDoc(doc(db, "courses", courseId), {
        enrollmentOpenedAt: Timestamp.now(),
      });
      break;
      
    case "active":
      // Send welcome notifications to all participants
      await addDoc(collection(db, "course_notifications"), {
        courseId,
        userId: null, // To all participants
        type: "course_started",
        title: "Course Started!",
        message: "Your course has officially started. Access your first module now!",
        emailSent: false,
        pushSent: false,
        createdAt: Timestamp.now(),
      });
      break;
      
    case "completed":
      // Trigger certificate generation for all participants
      await addDoc(collection(db, "course_notifications"), {
        courseId,
        userId: null, // To all participants
        type: "course_completed",
        title: "Course Completed!",
        message: "Congratulations on completing the course! Your certificate is being generated.",
        emailSent: false,
        pushSent: false,
        createdAt: Timestamp.now(),
      });
      break;
      
    case "cancelled":
      // Notify all participants of cancellation
      await addDoc(collection(db, "course_notifications"), {
        courseId,
        userId: null, // To all participants
        type: "course_cancelled",
        title: "Course Cancelled",
        message: "This course has been cancelled. You will receive a full refund if applicable.",
        emailSent: false,
        pushSent: false,
        createdAt: Timestamp.now(),
      });
      break;
  }
}

/**
 * Publish course (draft → scheduled)
 */
export async function publishCourse(
  courseId: string,
  publishedBy: string
): Promise<void> {
  await transitionCourseState(courseId, "scheduled", publishedBy, "Course published");
}

/**
 * Open enrollment (scheduled → enrolling)
 */
export async function openEnrollment(
  courseId: string,
  openedBy: string
): Promise<void> {
  await transitionCourseState(courseId, "enrolling", openedBy, "Enrollment opened");
}

/**
 * Start course (enrolling → active)
 */
export async function startCourse(
  courseId: string,
  startedBy: string
): Promise<void> {
  await transitionCourseState(courseId, "active", startedBy, "Course started");
}

/**
 * Complete course (active → completed)
 */
export async function completeCourse(
  courseId: string,
  completedBy: string
): Promise<void> {
  await transitionCourseState(courseId, "completed", completedBy, "Course completed");
}

/**
 * Archive course (completed → archived)
 */
export async function archiveCourse(
  courseId: string,
  archivedBy: string
): Promise<void> {
  await transitionCourseState(courseId, "archived", archivedBy, "Course archived");
}

/**
 * Cancel course (any state → cancelled)
 */
export async function cancelCourse(
  courseId: string,
  cancelledBy: string,
  reason: string
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const courseRef = doc(db, "courses", courseId);
  
  // Update course state directly (cancellation bypasses normal flow)
  await updateDoc(courseRef, {
    status: "cancelled",
    cancelledAt: Timestamp.now(),
    cancellationReason: reason,
    updatedAt: Timestamp.now(),
  });
  
  // Log cancellation
  await addDoc(collection(db, "course_state_transitions"), {
    courseId,
    fromState: "unknown", // We don't enforce from state for cancellation
    toState: "cancelled",
    triggeredBy: cancelledBy,
    triggeredAt: Timestamp.now(),
    reason,
  });
  
  // Trigger cancellation actions
  await handleStateTransitionActions(courseId, "cancelled", cancelledBy);
}

/**
 * Get state transition history for a course
 */
export async function getStateTransitionHistory(courseId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const { query, collection, where, orderBy, getDocs } = await import("firebase/firestore");
  
  const transitionsQuery = query(
    collection(db, "course_state_transitions"),
    where("courseId", "==", courseId),
    orderBy("triggeredAt", "desc")
  );
  
  const snapshot = await getDocs(transitionsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Auto-transition courses based on dates
 * This should be called by a scheduled job/cron
 */
export async function autoTransitionCourses(): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const { query, collection, where, getDocs, Timestamp } = await import("firebase/firestore");
  const now = Timestamp.now();
  
  // Find courses that should start (enrolling → active)
  const startingQuery = query(
    collection(db, "courses"),
    where("status", "==", "enrolling"),
    where("courseStartDate", "<=", now)
  );
  const startingSnap = await getDocs(startingQuery);
  
  for (const courseDoc of startingSnap.docs) {
    await startCourse(courseDoc.id, "system");
  }
  
  // Find courses that should complete (active → completed)
  const completingQuery = query(
    collection(db, "courses"),
    where("status", "==", "active"),
    where("courseEndDate", "<=", now)
  );
  const completingSnap = await getDocs(completingQuery);
  
  for (const courseDoc of completingSnap.docs) {
    await completeCourse(courseDoc.id, "system");
  }
}
