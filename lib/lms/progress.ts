/**
 * Course Progress Tracking Utilities
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
import { db } from "../firebase";
import { generateCertificateNumber } from "./courses";

/**
 * Mark a session as completed for a user
 */
export async function markSessionComplete(
  userId: string,
  courseId: string,
  sessionId: string,
  moduleId: string,
  timeSpentSeconds?: number
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  // Check if progress already exists
  const progressQuery = query(
    collection(db, "course_session_progress"),
    where("userId", "==", userId),
    where("sessionId", "==", sessionId),
    where("courseId", "==", courseId)
  );
  const progressSnap = await getDocs(progressQuery);

  if (progressSnap.empty) {
    // Create new progress record
    await addDoc(collection(db, "course_session_progress"), {
      userId,
      courseId,
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
  await updatemembershipProgress(userId, courseId);
}

/**
 * Update session access time (for tracking engagement)
 */
export async function updateSessionAccess(
  userId: string,
  courseId: string,
  sessionId: string,
  moduleId: string,
  timeSpentSeconds?: number
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  const progressQuery = query(
    collection(db, "course_session_progress"),
    where("userId", "==", userId),
    where("sessionId", "==", sessionId),
    where("courseId", "==", courseId)
  );
  const progressSnap = await getDocs(progressQuery);

  if (progressSnap.empty) {
    // Create new progress record
    await addDoc(collection(db, "course_session_progress"), {
      userId,
      courseId,
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
 * Get user's progress for a specific course
 */
export async function getUserCourseProgress(userId: string, courseId: string) {
  if (!db) throw new Error("Firebase not initialized");

  const progressQuery = query(
    collection(db, "course_session_progress"),
    where("userId", "==", userId),
    where("courseId", "==", courseId)
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
export async function updatemembershipProgress(
  userId: string,
  courseId: string
): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  // Get all sessions for the course
  const sessionsQuery = query(
    collection(db, "course_sessions"),
    where("courseId", "==", courseId)
  );
  const sessionsSnap = await getDocs(sessionsQuery);
  const totalSessions = sessionsSnap.size;

  if (totalSessions === 0) return;

  // Get user's completed sessions
  const progressQuery = query(
    collection(db, "course_session_progress"),
    where("userId", "==", userId),
    where("courseId", "==", courseId),
    where("isCompleted", "==", true)
  );
  const progressSnap = await getDocs(progressQuery);
  const completedSessions = progressSnap.size;

  // Calculate progress percentage
  const progressPercentage = Math.round((completedSessions / totalSessions) * 100);

  // Update membership
  const membershipQuery = query(
    collection(db, "course_memberships"),
    where("userId", "==", userId),
    where("courseId", "==", courseId)
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

    // Check if course is now completed
    if (progressPercentage >= 100 && membershipDoc.data().status !== "completed") {
      updates.status = "completed";
      updates.completedAt = Timestamp.now();

      // Issue certificate
      await issueCourseCertificate(userId, courseId);
    }

    await updateDoc(membershipDoc.ref, updates);
  }
}

/**
 * Issue certificate upon course completion
 */
async function issueCourseCertificate(userId: string, courseId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  // Get course details
  const courseDoc = await getDoc(doc(db, "courses", courseId));
  if (!courseDoc.exists()) return;

  const courseData = courseDoc.data();

  // Get user details
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) return;

  const userData = userDoc.data();

  // Check if certificate already exists
  const existingCertQuery = query(
    collection(db, "course_certificates"),
    where("userId", "==", userId),
    where("courseId", "==", courseId)
  );
  const existingCertSnap = await getDocs(existingCertQuery);

  if (!existingCertSnap.empty) return; // Certificate already issued

  // Generate certificate
  const certificateNumber = generateCertificateNumber();

  await addDoc(collection(db, "course_certificates"), {
    userId,
    courseId,
    courseTitle: courseData.title,
    userName: userData.displayName || userData.name || "Student",
    facilitatorName: courseData.facilitatorName,
    completionDate: Timestamp.now(),
    certificateNumber,
    issuedAt: Timestamp.now(),
    status: "active",
  });

  // Send notification
  await addDoc(collection(db, "course_notifications"), {
    courseId,
    userId,
    type: "certificate",
    title: "Certificate Issued!",
    message: `Congratulations! Your certificate for ${courseData.title} is ready to download.`,
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
  courseId: string,
  moduleId: string
) {
  if (!db) throw new Error("Firebase not initialized");

  // Get all sessions in the module
  const sessionsQuery = query(
    collection(db, "course_sessions"),
    where("moduleId", "==", moduleId)
  );
  const sessionsSnap = await getDocs(sessionsQuery);
  const totalSessions = sessionsSnap.size;

  // Get completed sessions
  const progressQuery = query(
    collection(db, "course_session_progress"),
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
 * Get detailed progress for all modules in a course
 */
export async function getCourseModulesProgress(userId: string, courseId: string) {
  if (!db) throw new Error("Firebase not initialized");

  // Get all modules for the course
  const modulesQuery = query(
    collection(db, "course_modules"),
    where("courseId", "==", courseId)
  );
  const modulesSnap = await getDocs(modulesQuery);

  const moduleProgress = await Promise.all(
    modulesSnap.docs.map(async (moduleDoc) => {
      const progress = await getModuleProgress(userId, courseId, moduleDoc.id);
      return {
        id: moduleDoc.id,
        title: moduleDoc.data().title,
        weeknumber: moduleDoc.data().weeknumber,
        ...progress,
      };
    })
  );

  return moduleProgress.sort((a, b) => a.weeknumber - b.weeknumber);
}

/**
 * Reset user progress for a course (admin function)
 */
export async function resetCourseProgress(userId: string, courseId: string): Promise<void> {
  if (!db) throw new Error("Firebase not initialized");

  const batch = writeBatch(db);

  // Delete all session progress
  const progressQuery = query(
    collection(db, "course_session_progress"),
    where("userId", "==", userId),
    where("courseId", "==", courseId)
  );
  const progressSnap = await getDocs(progressQuery);

  progressSnap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Reset membership progress
  const membershipQuery = query(
    collection(db, "course_memberships"),
    where("userId", "==", userId),
    where("courseId", "==", courseId)
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
 * Get course completion statistics
 */
export async function getCourseCompletionStats(courseId: string) {
  if (!db) throw new Error("Firebase not initialized");

  // Get all memberships
  const membershipsQuery = query(
    collection(db, "course_memberships"),
    where("courseId", "==", courseId)
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
