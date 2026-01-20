import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

export const COHORT_COLLECTIONS = {
  COHORTS: "cohorts",
  COHORT_MODULES: "cohort_modules",
  SESSIONS: "cohort_sessions",
  MEMBERSHIPS: "cohort_memberships",
  SESSION_PROGRESS: "cohort_session_progress",
  LIVE_TRAININGS: "cohort_live_trainings",
  TRAINING_REGISTRATIONS: "cohort_training_registrations",
  CERTIFICATES: "cohort_certificates",
  DISCUSSIONS: "cohort_discussions",
  DISCUSSION_REPLIES: "cohort_discussion_replies",
} as const;

// ==================== COHORT OPERATIONS ====================

export async function createCohort(data: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const cohortData = {
    ...data,
    currentParticipants: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(collection(db, COHORT_COLLECTIONS.COHORTS), cohortData);
  return docRef.id;
}

export async function getCohort(cohortId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COHORT_COLLECTIONS.COHORTS, cohortId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return { id: docSnap.id, ...docSnap.data() } as any;
}

export async function updateCohort(cohortId: string, updates: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COHORT_COLLECTIONS.COHORTS, cohortId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

// ==================== MODULE OPERATIONS ====================

export async function createModule(data: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const moduleData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(collection(db, COHORT_COLLECTIONS.COHORT_MODULES), moduleData);
  return docRef.id;
}

export async function getModules(cohortId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COHORT_COLLECTIONS.COHORT_MODULES),
    where("cohortId", "==", cohortId),
    orderBy("sortOrder", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateModule(moduleId: string, updates: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COHORT_COLLECTIONS.COHORT_MODULES, moduleId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteModule(moduleId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const batch = writeBatch(db);
  
  // Delete module
  const moduleRef = doc(db, COHORT_COLLECTIONS.COHORT_MODULES, moduleId);
  batch.delete(moduleRef);
  
  // Delete associated sessions
  const sessionsQuery = query(
    collection(db, COHORT_COLLECTIONS.SESSIONS),
    where("moduleId", "==", moduleId)
  );
  const sessionsSnapshot = await getDocs(sessionsQuery);
  sessionsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}

// ==================== SESSION OPERATIONS ====================

export async function createSession(data: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const sessionData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(collection(db, COHORT_COLLECTIONS.SESSIONS), sessionData);
  return docRef.id;
}

export async function getSessions(moduleId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COHORT_COLLECTIONS.SESSIONS),
    where("moduleId", "==", moduleId),
    orderBy("sortOrder", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getCohortSessions(cohortId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COHORT_COLLECTIONS.SESSIONS),
    where("cohortId", "==", cohortId),
    orderBy("sortOrder", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateSession(sessionId: string, updates: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COHORT_COLLECTIONS.SESSIONS, sessionId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteSession(sessionId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COHORT_COLLECTIONS.SESSIONS, sessionId);
  await deleteDoc(docRef);
}

// ==================== MEMBERSHIP OPERATIONS ====================

export async function joinCohort(userId: string, cohortId: string, role: string = "participant") {
  if (!db) throw new Error("Firebase not initialized");
  
  const membershipData = {
    userId,
    cohortId,
    cohortRole: role,
    progressPercentage: 0,
    completedSessions: 0,
    totalSessions: 0,
    enrolledAt: Timestamp.now(),
    lastAccessedAt: Timestamp.now(),
    status: "active",
  };
  
  const docRef = await addDoc(collection(db, COHORT_COLLECTIONS.MEMBERSHIPS), membershipData);
  
  // Increment participant count
  const cohortRef = doc(db, COHORT_COLLECTIONS.COHORTS, cohortId);
  await updateDoc(cohortRef, {
    currentParticipants: increment(1),
  });
  
  return docRef.id;
}

export async function getMembership(userId: string, cohortId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COHORT_COLLECTIONS.MEMBERSHIPS),
    where("userId", "==", userId),
    where("cohortId", "==", cohortId),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function getCohortMemberships(cohortId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COHORT_COLLECTIONS.MEMBERSHIPS),
    where("cohortId", "==", cohortId),
    orderBy("enrolledAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ==================== CERTIFICATE OPERATIONS ====================

export async function issueCertificate(data: {
  userId: string;
  cohortId: string;
  cohortTitle: string;
  userName: string;
  facilitatorName: string;
  completionDate: Timestamp;
  certificateNumber: string;
}) {
  if (!db) throw new Error("Firebase not initialized");
  
  const certificateData = {
    ...data,
    issuedAt: Timestamp.now(),
    status: "active",
  };
  
  const docRef = await addDoc(collection(db, COHORT_COLLECTIONS.CERTIFICATES), certificateData);
  return docRef.id;
}

export async function getUserCertificates(userId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COHORT_COLLECTIONS.CERTIFICATES),
    where("userId", "==", userId),
    orderBy("issuedAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getCohortCertificates(cohortId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COHORT_COLLECTIONS.CERTIFICATES),
    where("cohortId", "==", cohortId),
    orderBy("issuedAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function verifyCertificate(certificateNumber: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COHORT_COLLECTIONS.CERTIFICATES),
    where("certificateNumber", "==", certificateNumber),
    where("status", "==", "active"),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${timestamp}-${random}`;
}

// ==================== DISCUSSION OPERATIONS ====================

export async function createDiscussion(data: {
  cohortId: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  isPinned?: boolean;
}) {
  if (!db) throw new Error("Firebase not initialized");
  
  const discussionData = {
    ...data,
    isPinned: data.isPinned || false,
    replyCount: 0,
    lastActivityAt: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(collection(db, COHORT_COLLECTIONS.DISCUSSIONS), discussionData);
  return docRef.id;
}

export async function getDiscussions(cohortId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COHORT_COLLECTIONS.DISCUSSIONS),
    where("cohortId", "==", cohortId),
    orderBy("isPinned", "desc"),
    orderBy("lastActivityAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createDiscussionReply(data: {
  discussionId: string;
  userId: string;
  userName: string;
  content: string;
}) {
  if (!db) throw new Error("Firebase not initialized");
  
  const replyData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const batch = writeBatch(db);
  
  // Add reply
  const replyRef = doc(collection(db, COHORT_COLLECTIONS.DISCUSSION_REPLIES));
  batch.set(replyRef, replyData);
  
  // Update discussion reply count and last activity
  const discussionRef = doc(db, COHORT_COLLECTIONS.DISCUSSIONS, data.discussionId);
  batch.update(discussionRef, {
    replyCount: increment(1),
    lastActivityAt: Timestamp.now(),
  });
  
  await batch.commit();
  return replyRef.id;
}

export async function getDiscussionReplies(discussionId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COHORT_COLLECTIONS.DISCUSSION_REPLIES),
    where("discussionId", "==", discussionId),
    orderBy("createdAt", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateDiscussion(discussionId: string, updates: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COHORT_COLLECTIONS.DISCUSSIONS, discussionId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteDiscussion(discussionId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const batch = writeBatch(db);
  
  // Delete discussion
  const discussionRef = doc(db, COHORT_COLLECTIONS.DISCUSSIONS, discussionId);
  batch.delete(discussionRef);
  
  // Delete associated replies
  const repliesQuery = query(
    collection(db, COHORT_COLLECTIONS.DISCUSSION_REPLIES),
    where("discussionId", "==", discussionId)
  );
  const repliesSnapshot = await getDocs(repliesQuery);
  repliesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}
