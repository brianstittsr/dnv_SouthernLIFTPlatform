/**
 * Cohort Lifecycle State Management
 * Handles state transitions and lifecycle automation
 */

import {
  doc,
  updateDoc,
  addDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CohortLifecycleStatus } from "@/types/cohorts";

/**
 * Valid state transitions
 */
const VALID_TRANSITIONS: Record<CohortLifecycleStatus, CohortLifecycleStatus[]> = {
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
  fromState: CohortLifecycleStatus,
  toState: CohortLifecycleStatus
): boolean {
  return VALID_TRANSITIONS[fromState]?.includes(toState) || false;
}

/**
 * Transition cohort to a new state
 */
export async function transitionCohortState(
  cohortId: string,
  toState: CohortLifecycleStatus,
  triggeredBy: string,
  reason?: string
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const cohortRef = doc(db, "cohorts", cohortId);
  const { getDoc } = await import("firebase/firestore");
  const cohortSnap = await getDoc(cohortRef);
  
  if (!cohortSnap.exists()) {
    throw new Error("Cohort not found");
  }
  
  const currentState = cohortSnap.data()?.status as CohortLifecycleStatus;
  
  // Validate transition
  if (!isValidTransition(currentState, toState)) {
    throw new Error(
      `Invalid state transition from ${currentState} to ${toState}`
    );
  }
  
  // Update cohort state
  await updateDoc(cohortRef, {
    status: toState,
    updatedAt: Timestamp.now(),
  });
  
  // Log state transition
  await addDoc(collection(db, "cohort_state_transitions"), {
    cohortId,
    fromState: currentState,
    toState,
    triggeredBy,
    triggeredAt: Timestamp.now(),
    reason: reason || null,
  });
  
  // Trigger state-specific actions
  await handleStateTransitionActions(cohortId, toState, triggeredBy);
}

/**
 * Handle actions that should occur on state transitions
 */
async function handleStateTransitionActions(
  cohortId: string,
  newState: CohortLifecycleStatus,
  triggeredBy: string
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  switch (newState) {
    case "scheduled":
      // Send notification to facilitator
      await addDoc(collection(db, "cohort_notifications"), {
        cohortId,
        userId: null, // To facilitator
        type: "cohort_scheduled",
        title: "Cohort Scheduled",
        message: "Your cohort has been scheduled and is ready for enrollment.",
        emailSent: false,
        pushSent: false,
        createdAt: Timestamp.now(),
      });
      break;
      
    case "enrolling":
      // Open enrollment
      await updateDoc(doc(db, "cohorts", cohortId), {
        enrollmentOpenedAt: Timestamp.now(),
      });
      break;
      
    case "active":
      // Send welcome notifications to all participants
      await addDoc(collection(db, "cohort_notifications"), {
        cohortId,
        userId: null, // To all participants
        type: "cohort_started",
        title: "Cohort Started!",
        message: "Your cohort has officially started. Access your first module now!",
        emailSent: false,
        pushSent: false,
        createdAt: Timestamp.now(),
      });
      break;
      
    case "completed":
      // Trigger certificate generation for all participants
      await addDoc(collection(db, "cohort_notifications"), {
        cohortId,
        userId: null, // To all participants
        type: "cohort_completed",
        title: "Cohort Completed!",
        message: "Congratulations on completing the cohort! Your certificate is being generated.",
        emailSent: false,
        pushSent: false,
        createdAt: Timestamp.now(),
      });
      break;
      
    case "cancelled":
      // Notify all participants of cancellation
      await addDoc(collection(db, "cohort_notifications"), {
        cohortId,
        userId: null, // To all participants
        type: "cohort_cancelled",
        title: "Cohort Cancelled",
        message: "This cohort has been cancelled. You will receive a full refund if applicable.",
        emailSent: false,
        pushSent: false,
        createdAt: Timestamp.now(),
      });
      break;
  }
}

/**
 * Publish cohort (draft → scheduled)
 */
export async function publishCohort(
  cohortId: string,
  publishedBy: string
): Promise<void> {
  await transitionCohortState(cohortId, "scheduled", publishedBy, "Cohort published");
}

/**
 * Open enrollment (scheduled → enrolling)
 */
export async function openEnrollment(
  cohortId: string,
  openedBy: string
): Promise<void> {
  await transitionCohortState(cohortId, "enrolling", openedBy, "Enrollment opened");
}

/**
 * Start cohort (enrolling → active)
 */
export async function startCohort(
  cohortId: string,
  startedBy: string
): Promise<void> {
  await transitionCohortState(cohortId, "active", startedBy, "Cohort started");
}

/**
 * Complete cohort (active → completed)
 */
export async function completeCohort(
  cohortId: string,
  completedBy: string
): Promise<void> {
  await transitionCohortState(cohortId, "completed", completedBy, "Cohort completed");
}

/**
 * Archive cohort (completed → archived)
 */
export async function archiveCohort(
  cohortId: string,
  archivedBy: string
): Promise<void> {
  await transitionCohortState(cohortId, "archived", archivedBy, "Cohort archived");
}

/**
 * Cancel cohort (any state → cancelled)
 */
export async function cancelCohort(
  cohortId: string,
  cancelledBy: string,
  reason: string
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const cohortRef = doc(db, "cohorts", cohortId);
  
  // Update cohort state directly (cancellation bypasses normal flow)
  await updateDoc(cohortRef, {
    status: "cancelled",
    cancelledAt: Timestamp.now(),
    cancellationReason: reason,
    updatedAt: Timestamp.now(),
  });
  
  // Log cancellation
  await addDoc(collection(db, "cohort_state_transitions"), {
    cohortId,
    fromState: "unknown", // We don't enforce from state for cancellation
    toState: "cancelled",
    triggeredBy: cancelledBy,
    triggeredAt: Timestamp.now(),
    reason,
  });
  
  // Trigger cancellation actions
  await handleStateTransitionActions(cohortId, "cancelled", cancelledBy);
}

/**
 * Get state transition history for a cohort
 */
export async function getStateTransitionHistory(cohortId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const { query, collection, where, orderBy, getDocs } = await import("firebase/firestore");
  
  const transitionsQuery = query(
    collection(db, "cohort_state_transitions"),
    where("cohortId", "==", cohortId),
    orderBy("triggeredAt", "desc")
  );
  
  const snapshot = await getDocs(transitionsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Auto-transition cohorts based on dates
 * This should be called by a scheduled job/cron
 */
export async function autoTransitionCohorts(): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");
  
  const { query, collection, where, getDocs, Timestamp } = await import("firebase/firestore");
  const now = Timestamp.now();
  
  // Find cohorts that should start (enrolling → active)
  const startingQuery = query(
    collection(db, "cohorts"),
    where("status", "==", "enrolling"),
    where("cohortStartDate", "<=", now)
  );
  const startingSnap = await getDocs(startingQuery);
  
  for (const cohortDoc of startingSnap.docs) {
    await startCohort(cohortDoc.id, "system");
  }
  
  // Find cohorts that should complete (active → completed)
  const completingQuery = query(
    collection(db, "cohorts"),
    where("status", "==", "active"),
    where("cohortEndDate", "<=", now)
  );
  const completingSnap = await getDocs(completingQuery);
  
  for (const cohortDoc of completingSnap.docs) {
    await completeCohort(cohortDoc.id, "system");
  }
}
