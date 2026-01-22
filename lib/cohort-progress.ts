/**
 * Cohort Progress Tracking Utilities
 * Handles session progress, completion tracking, and progress calculations
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
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { generateCertificateNumber } from "./firebase-cohorts";

/**
 * Mark a session as completed for a user
 */
export async function markSessionComplete(
  userId: string,
  cohortId: string,
  sessionId: string,
  moduleId: string,
  timeSpentSeconds?: number
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  // Check if progress already exists
  const progressQuery = query(
    collection(db, "cohort_session_progress"),
    where("userId", "==", userId),
    where("sessionId", "==", sessionId),
    where("cohortId", "==", cohortId)
  );
  const progressSnap = await getDocs(progressQuery);

  if (progressSnap.empty) {
    // Create new progress record
    await addDoc(collection(db, "cohort_session_progress"), {
      userId,
      cohortId,
      sessionId,
      moduleId,
      isCompleted: true,
      completedAt: Timestamp.now(),
      timeSpentSeconds: timeSpentSeconds || 0,
      lastAccessedAt: Timestamp.now(),
    });
  } else {
    // Update existing progress
    const progressDoc = progressSnap.docs[0];
    await updateDoc(progressDoc.ref, {
      isCompleted: true,
      completedAt: Timestamp.now(),
      timeSpentSeconds: (progressDoc.data().timeSpentSeconds || 0) + (timeSpentSeconds || 0),
      lastAccessedAt: Timestamp.now(),
    });
  }

  // Update membership progress
  await updateMembershipProgress(userId, cohortId);
}

/**
 * Update session access time (for tracking engagement)
 */
export async function updateSessionAccess(
  userId: string,
  cohortId: string,
  sessionId: string,
  moduleId: string,
  timeSpentSeconds?: number
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  const progressQuery = query(
    collection(db, "cohort_session_progress"),
    where("userId", "==", userId),
    where("sessionId", "==", sessionId),
    where("cohortId", "==", cohortId)
  );
  const progressSnap = await getDocs(progressQuery);

  if (progressSnap.empty) {
    // Create new progress record
    await addDoc(collection(db, "cohort_session_progress"), {
      userId,
      cohortId,
      sessionId,
      moduleId,
      isCompleted: false,
      timeSpentSeconds: timeSpentSeconds || 0,
      lastAccessedAt: Timestamp.now(),
    });
  } else {
    // Update existing progress
    const progressDoc = progressSnap.docs[0];
    await updateDoc(progressDoc.ref, {
      timeSpentSeconds: (progressDoc.data().timeSpentSeconds || 0) + (timeSpentSeconds || 0),
      lastAccessedAt: Timestamp.now(),
    });
  }
}

/**
 * Get user's progress for a specific cohort
 */
export async function getUserCohortProgress(userId: string, cohortId: string) {
  if (!db) throw new Error("Firebase not initialized");

  const progressQuery = query(
    collection(db, "cohort_session_progress"),
    where("userId", "==", userId),
    where("cohortId", "==", cohortId)
  );

  const progressSnap = await getDocs(progressQuery);
  return progressSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Calculate and update membership progress
 */
export async function updateMembershipProgress(
  userId: string,
  cohortId: string
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  // Get all sessions for the cohort
  const sessionsQuery = query(
    collection(db, "cohort_sessions"),
    where("cohortId", "==", cohortId)
  );
  const sessionsSnap = await getDocs(sessionsQuery);
  const totalSessions = sessionsSnap.size;

  if (totalSessions === 0) return;

  // Get user's completed sessions
  const progressQuery = query(
    collection(db, "cohort_session_progress"),
    where("userId", "==", userId),
    where("cohortId", "==", cohortId),
    where("isCompleted", "==", true)
  );
  const progressSnap = await getDocs(progressQuery);
  const completedSessions = progressSnap.size;

  // Calculate progress percentage
  const progressPercentage = Math.round((completedSessions / totalSessions) * 100);

  // Update membership
  const membershipQuery = query(
    collection(db, "cohort_memberships"),
    where("userId", "==", userId),
    where("cohortId", "==", cohortId)
  );
  const membershipSnap = await getDocs(membershipQuery);

  if (!membershipSnap.empty) {
    const membershipDoc = membershipSnap.docs[0];
    const updates: any = {
      progressPercentage,
      completedSessions,
      totalSessions,
      lastAccessedAt: Timestamp.now(),
    };

    // Check if cohort is now completed
    if (progressPercentage >= 100 && membershipDoc.data().status !== "completed") {
      updates.status = "completed";
      updates.completedAt = Timestamp.now();

      // Issue certificate
      await issueCohortCertificate(userId, cohortId);
    }

    await updateDoc(membershipDoc.ref, updates);
  }
}

/**
 * Issue certificate upon cohort completion
 */
async function issueCohortCertificate(userId: string, cohortId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  // Get cohort details
  const cohortDoc = await getDoc(doc(db, "cohorts", cohortId));
  if (!cohortDoc.exists()) return;

  const cohortData = cohortDoc.data();

  // Get user details
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) return;

  const userData = userDoc.data();

  // Check if certificate already exists
  const existingCertQuery = query(
    collection(db, "cohort_certificates"),
    where("userId", "==", userId),
    where("cohortId", "==", cohortId)
  );
  const existingCertSnap = await getDocs(existingCertQuery);

  if (!existingCertSnap.empty) return; // Certificate already issued

  // Generate certificate
  const certificateNumber = generateCertificateNumber();

  await addDoc(collection(db, "cohort_certificates"), {
    userId,
    cohortId,
    cohortTitle: cohortData.title,
    userName: userData.displayName || userData.name || "Student",
    facilitatorName: cohortData.facilitatorName,
    completionDate: Timestamp.now(),
    certificateNumber,
    issuedAt: Timestamp.now(),
    status: "active",
  });

  // Send notification
  await addDoc(collection(db, "cohort_notifications"), {
    cohortId,
    userId,
    type: "certificate",
    title: "Certificate Issued!",
    message: `Congratulations! Your certificate for ${cohortData.title} is ready to download.`,
    emailSent: false,
    pushSent: false,
    createdAt: Timestamp.now(),
  });
}

/**
 * Get module progress for a user
 */
export async function getModuleProgress(
  userId: string,
  cohortId: string,
  moduleId: string
) {
  if (!db) throw new Error("Firebase not initialized");

  // Get all sessions in the module
  const sessionsQuery = query(
    collection(db, "cohort_sessions"),
    where("moduleId", "==", moduleId)
  );
  const sessionsSnap = await getDocs(sessionsQuery);
  const totalSessions = sessionsSnap.size;

  // Get completed sessions
  const progressQuery = query(
    collection(db, "cohort_session_progress"),
    where("userId", "==", userId),
    where("moduleId", "==", moduleId),
    where("isCompleted", "==", true)
  );
  const progressSnap = await getDocs(progressQuery);
  const completedSessions = progressSnap.size;

  return {
    moduleId,
    totalSessions,
    completedSessions,
    progressPercentage: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    isCompleted: completedSessions === totalSessions && totalSessions > 0,
  };
}

/**
 * Get detailed progress for all modules in a cohort
 */
export async function getCohortModulesProgress(userId: string, cohortId: string) {
  if (!db) throw new Error("Firebase not initialized");

  // Get all modules for the cohort
  const modulesQuery = query(
    collection(db, "cohort_modules"),
    where("cohortId", "==", cohortId)
  );
  const modulesSnap = await getDocs(modulesQuery);

  const moduleProgress = await Promise.all(
    modulesSnap.docs.map(async (moduleDoc) => {
      const progress = await getModuleProgress(userId, cohortId, moduleDoc.id);
      return {
        id: moduleDoc.id,
        title: moduleDoc.data().title,
        weekNumber: moduleDoc.data().weekNumber,
        ...progress,
      };
    })
  );

  return moduleProgress.sort((a, b) => a.weekNumber - b.weekNumber);
}

/**
 * Reset user progress for a cohort (admin function)
 */
export async function resetCohortProgress(userId: string, cohortId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  const batch = writeBatch(db);

  // Delete all session progress
  const progressQuery = query(
    collection(db, "cohort_session_progress"),
    where("userId", "==", userId),
    where("cohortId", "==", cohortId)
  );
  const progressSnap = await getDocs(progressQuery);

  progressSnap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Reset membership progress
  const membershipQuery = query(
    collection(db, "cohort_memberships"),
    where("userId", "==", userId),
    where("cohortId", "==", cohortId)
  );
  const membershipSnap = await getDocs(membershipQuery);

  if (!membershipSnap.empty) {
    const membershipDoc = membershipSnap.docs[0];
    batch.update(membershipDoc.ref, {
      progressPercentage: 0,
      completedSessions: 0,
      status: "active",
      completedAt: null,
    });
  }

  await batch.commit();
}

/**
 * Get cohort completion statistics
 */
export async function getCohortCompletionStats(cohortId: string) {
  if (!db) throw new Error("Firebase not initialized");

  // Get all memberships
  const membershipsQuery = query(
    collection(db, "cohort_memberships"),
    where("cohortId", "==", cohortId)
  );
  const membershipsSnap = await getDocs(membershipsQuery);

  const totalParticipants = membershipsSnap.size;
  let completedCount = 0;
  let totalProgress = 0;

  membershipsSnap.docs.forEach((doc) => {
    const data = doc.data();
    if (data.status === "completed") {
      completedCount++;
    }
    totalProgress += data.progressPercentage || 0;
  });

  const completionRate = totalParticipants > 0 ? Math.round((completedCount / totalParticipants) * 100) : 0;
  const averageProgress = totalParticipants > 0 ? Math.round(totalProgress / totalParticipants) : 0;

  return {
    totalParticipants,
    completedCount,
    completionRate,
    averageProgress,
    inProgressCount: totalParticipants - completedCount,
  };
}
