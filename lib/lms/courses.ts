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
import { db } from "../firebase";

export const COURSE_COLLECTIONS = {
  COURSES: "courses",
  COURSE_MODULES: "course_modules",
  SESSIONS: "course_sessions",
  MEMBERSHIPS: "course_memberships",
  SESSION_PROGRESS: "course_session_progress",
  LIVE_TRAININGS: "course_live_trainings",
  TRAINING_REGISTRATIONS: "course_training_registrations",
  CERTIFICATES: "course_certificates",
  DISCUSSIONS: "course_discussions",
  DISCUSSION_REPLIES: "course_discussion_replies",
} as const;

// ==================== COURSE OPERATIONS ====================

export async function createCourse(data: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const courseData = {
    ...data,
    currentParticipants: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(collection(db, COURSE_COLLECTIONS.COURSES), courseData);
  return docRef.id;
}

export async function getCourse(courseId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COURSE_COLLECTIONS.COURSES, courseId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return { id: docSnap.id, ...docSnap.data() } as any;
}

export async function getCourseBySlug(slug: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COURSE_COLLECTIONS.COURSES),
    where("slug", "==", slug),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as any;
}

export async function getCourses(options: {
  status?: string | string[];
  facilitatorId?: string;
  isPublished?: boolean;
  difficultyLevel?: string;
  isFree?: boolean;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
} = {}) {
  if (!db) throw new Error("Firebase not initialized");
  
  let q = collection(db, COURSE_COLLECTIONS.COURSES);
  const constraints: any[] = [];
  
  // Apply filters
  if (options.status) {
    if (Array.isArray(options.status)) {
      constraints.push(where("status", "in", options.status));
    } else {
      constraints.push(where("status", "==", options.status));
    }
  }
  
  if (options.facilitatorId) {
    constraints.push(where("facilitatorId", "==", options.facilitatorId));
  }
  
  if (options.isPublished !== undefined) {
    constraints.push(where("isPublished", "==", options.isPublished));
  }
  
  if (options.difficultyLevel) {
    constraints.push(where("difficultyLevel", "==", options.difficultyLevel));
  }
  
  if (options.isFree !== undefined) {
    constraints.push(where("isFree", "==", options.isFree));
  }
  
  // Apply ordering
  const orderByField = options.orderBy || "createdAt";
  const orderDirection = options.orderDirection || "desc";
  constraints.push(orderBy(orderByField, orderDirection));
  
  // Apply limit
  if (options.limit) {
    constraints.push(limit(options.limit));
  }
  
  const finalQuery = query(q, ...constraints);
  const snapshot = await getDocs(finalQuery);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateCourse(courseId: string, updates: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COURSE_COLLECTIONS.COURSES, courseId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function publishCourse(courseId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COURSE_COLLECTIONS.COURSES, courseId);
  await updateDoc(docRef, {
    isPublished: true,
    status: "published",
    updatedAt: Timestamp.now(),
  });
}

export async function deleteCourse(courseId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const batch = writeBatch(db);
  
  // Delete course
  const courseRef = doc(db, COURSE_COLLECTIONS.COURSES, courseId);
  batch.delete(courseRef);
  
  // Delete modules and sessions
  const modulesQuery = query(
    collection(db, COURSE_COLLECTIONS.COURSE_MODULES),
    where("courseId", "==", courseId)
  );
  const modulesSnapshot = await getDocs(modulesQuery);
  
  for (const moduleDoc of modulesSnapshot.docs) {
    batch.delete(moduleDoc.ref);
    
    // Delete sessions for this module
    const sessionsQuery = query(
      collection(db, COURSE_COLLECTIONS.SESSIONS),
      where("moduleId", "==", moduleDoc.id)
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);
    sessionsSnapshot.docs.forEach(sessionDoc => {
      batch.delete(sessionDoc.ref);
    });
  }
  
  await batch.commit();
}

export async function getCourseWithModulesAndSessions(courseId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const course = await getCourse(courseId);
  if (!course) return null;
  
  const modules = await getModules(courseId);
  
  const modulesWithSessions = await Promise.all(
    modules.map(async (module: any) => {
      const sessions = await getSessions(module.id);
      return { ...module, sessions };
    })
  );
  
  return { ...course, modules: modulesWithSessions };
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  if (!db) throw new Error("Firebase not initialized");
  
  const batch = writeBatch(db);
  const dbInstance = db; // Capture for use in forEach
  
  moduleIds.forEach((moduleId, index) => {
    const moduleRef = doc(dbInstance, COURSE_COLLECTIONS.COURSE_MODULES, moduleId);
    batch.update(moduleRef, {
      sortOrder: index,
      updatedAt: Timestamp.now(),
    });
  });
  
  await batch.commit();
}

export async function reorderSessions(moduleId: string, sessionIds: string[]) {
  if (!db) throw new Error("Firebase not initialized");
  
  const batch = writeBatch(db);
  const dbInstance = db; // Capture for use in forEach
  
  sessionIds.forEach((sessionId, index) => {
    const sessionRef = doc(dbInstance, COURSE_COLLECTIONS.SESSIONS, sessionId);
    batch.update(sessionRef, {
      sortOrder: index,
      updatedAt: Timestamp.now(),
    });
  });
  
  await batch.commit();
}

// ==================== MODULE OPERATIONS ====================

export async function createModule(data: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const moduleData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(collection(db, COURSE_COLLECTIONS.COURSE_MODULES), moduleData);
  return docRef.id;
}

export async function getModules(courseId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COURSE_COLLECTIONS.COURSE_MODULES),
    where("courseId", "==", courseId),
    orderBy("sortOrder", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateModule(moduleId: string, updates: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COURSE_COLLECTIONS.COURSE_MODULES, moduleId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteModule(moduleId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const batch = writeBatch(db);
  
  // Delete module
  const moduleRef = doc(db, COURSE_COLLECTIONS.COURSE_MODULES, moduleId);
  batch.delete(moduleRef);
  
  // Delete associated sessions
  const sessionsQuery = query(
    collection(db, COURSE_COLLECTIONS.SESSIONS),
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
  
  const docRef = await addDoc(collection(db, COURSE_COLLECTIONS.SESSIONS), sessionData);
  return docRef.id;
}

export async function getSessions(moduleId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COURSE_COLLECTIONS.SESSIONS),
    where("moduleId", "==", moduleId),
    orderBy("sortOrder", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getCourseSessions(courseId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COURSE_COLLECTIONS.SESSIONS),
    where("courseId", "==", courseId),
    orderBy("sortOrder", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateSession(sessionId: string, updates: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COURSE_COLLECTIONS.SESSIONS, sessionId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteSession(sessionId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COURSE_COLLECTIONS.SESSIONS, sessionId);
  await deleteDoc(docRef);
}

// ==================== memberSHIP OPERATIONS ====================

export async function joinCourse(userId: string, courseId: string, role: string = "participant") {
  if (!db) throw new Error("Firebase not initialized");
  
  const membershipData = {
    userId,
    courseId,
    courseRole: role,
    progressPercentage: 0,
    completedSessions: 0,
    totalSessions: 0,
    enrolledAt: Timestamp.now(),
    lastAccessedAt: Timestamp.now(),
    status: "active",
  };
  
  const docRef = await addDoc(collection(db, COURSE_COLLECTIONS.MEMBERSHIPS), membershipData);
  
  // Increment participant count
  const courseRef = doc(db, COURSE_COLLECTIONS.COURSES, courseId);
  await updateDoc(courseRef, {
    currentParticipants: increment(1),
  });
  
  return docRef.id;
}

export async function getMembership(userId: string, courseId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COURSE_COLLECTIONS.MEMBERSHIPS),
    where("userId", "==", userId),
    where("courseId", "==", courseId),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function getCourseMemberships(courseId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COURSE_COLLECTIONS.MEMBERSHIPS),
    where("courseId", "==", courseId),
    orderBy("enrolledAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ==================== CERTIFICATE OPERATIONS ====================

export async function issueCertificate(data: {
  userId: string;
  courseId: string;
  courseTitle: string;
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
  
  const docRef = await addDoc(collection(db, COURSE_COLLECTIONS.CERTIFICATES), certificateData);
  return docRef.id;
}

export async function getUserCertificates(userId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COURSE_COLLECTIONS.CERTIFICATES),
    where("userId", "==", userId),
    orderBy("issuedAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getCourseCertificates(courseId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COURSE_COLLECTIONS.CERTIFICATES),
    where("courseId", "==", courseId),
    orderBy("issuedAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function verifyCertificate(certificateNumber: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COURSE_COLLECTIONS.CERTIFICATES),
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
  courseId: string;
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
  
  const docRef = await addDoc(collection(db, COURSE_COLLECTIONS.DISCUSSIONS), discussionData);
  return docRef.id;
}

export async function getDiscussions(courseId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const q = query(
    collection(db, COURSE_COLLECTIONS.DISCUSSIONS),
    where("courseId", "==", courseId),
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
  const replyRef = doc(collection(db, COURSE_COLLECTIONS.DISCUSSION_REPLIES));
  batch.set(replyRef, replyData);
  
  // Update discussion reply count and last activity
  const discussionRef = doc(db, COURSE_COLLECTIONS.DISCUSSIONS, data.discussionId);
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
    collection(db, COURSE_COLLECTIONS.DISCUSSION_REPLIES),
    where("discussionId", "==", discussionId),
    orderBy("createdAt", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateDiscussion(discussionId: string, updates: any) {
  if (!db) throw new Error("Firebase not initialized");
  
  const docRef = doc(db, COURSE_COLLECTIONS.DISCUSSIONS, discussionId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteDiscussion(discussionId: string) {
  if (!db) throw new Error("Firebase not initialized");
  
  const batch = writeBatch(db);
  
  // Delete discussion
  const discussionRef = doc(db, COURSE_COLLECTIONS.DISCUSSIONS, discussionId);
  batch.delete(discussionRef);
  
  // Delete associated replies
  const repliesQuery = query(
    collection(db, COURSE_COLLECTIONS.DISCUSSION_REPLIES),
    where("discussionId", "==", discussionId)
  );
  const repliesSnapshot = await getDocs(repliesQuery);
  repliesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}
