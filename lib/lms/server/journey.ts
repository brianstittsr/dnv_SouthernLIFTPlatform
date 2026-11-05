/**
 * Server-side LMS journey: enrollment, progress, completion, and
 * certification for the course_* data model.
 *
 * All writes go through the Firebase Admin SDK — the client SDK copies in
 * lib/lms/ are denied by firestore.rules for regular members (membership
 * counters, certificate issuance), which is why the member journey never
 * worked. Server-only — do not import from client components.
 */
import { Timestamp } from "firebase-admin/firestore";
import { requireDb } from "@/lib/form-builder/server/context";
import { sendEmail } from "@/lib/email";
import { archiveGeneratedDocument } from "@/lib/documents/archive";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
import { buildCertificateHtml } from "@/lib/lms/certificates-server";

export const LMS_COLLECTIONS = {
  COURSES: "courses",
  MODULES: "course_modules",
  SESSIONS: "course_sessions",
  MEMBERSHIPS: "course_memberships",
  PROGRESS: "course_session_progress",
  CERTIFICATES: "course_certificates",
  NOTIFICATIONS: "course_notifications",
  PURCHASES: "course_purchases",
} as const;

export interface CourseDoc {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  facilitatorId?: string;
  facilitatorName?: string;
  courseStartDate?: Timestamp;
  courseEndDate?: Timestamp;
  maxParticipants?: number;
  currentParticipants?: number;
  estimatedDurationWeeks?: number;
  status?: string;
  difficultyLevel?: string;
  priceInCents?: number;
  compareAtPriceInCents?: number;
  isFree?: boolean;
  isPublished?: boolean;
  thumbnailUrl?: string;
  tags?: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
}

export interface MembershipDoc {
  id: string;
  userId: string;
  courseId: string;
  courseRole?: string;
  progressPercentage?: number;
  completedSessions?: number;
  totalSessions?: number;
  enrolledAt?: Timestamp;
  lastAccessedAt?: Timestamp;
  completedAt?: Timestamp | null;
  status?: string;
}

const docWithId = <T>(snap: FirebaseFirestore.DocumentSnapshot): T & { id: string } =>
  ({ id: snap.id, ...(snap.data() as T) });

export async function getCourseById(courseId: string): Promise<CourseDoc | null> {
  const snap = await requireDb().collection(LMS_COLLECTIONS.COURSES).doc(courseId).get();
  return snap.exists ? docWithId<CourseDoc>(snap) : null;
}

export async function getMembership(uid: string, courseId: string): Promise<MembershipDoc | null> {
  const snap = await requireDb()
    .collection(LMS_COLLECTIONS.MEMBERSHIPS)
    .where("userId", "==", uid)
    .where("courseId", "==", courseId)
    .limit(1)
    .get();
  return snap.empty ? null : docWithId<MembershipDoc>(snap.docs[0]);
}

function appUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || "https://lift-business.org"}${path}`;
}

// ==================== ENROLLMENT ====================

export type EnrollResult =
  | { ok: true; membershipId: string; alreadyEnrolled: boolean }
  | { ok: false; status: number; error: string; checkoutRequired?: boolean };

/** Enrolls a member in a course. Paid courses must go through Stripe checkout. */
export async function enrollInCourse(uid: string, courseId: string, memberEmail: string | null): Promise<EnrollResult> {
  const firestore = requireDb();
  const course = await getCourseById(courseId);
  if (!course || (!course.isPublished && course.status !== "published" && course.status !== "active")) {
    return { ok: false, status: 404, error: "Course not found" };
  }

  const paid = !course.isFree && (course.priceInCents ?? 0) > 0;
  if (paid) {
    return { ok: false, status: 402, error: "This course requires payment", checkoutRequired: true };
  }

  const existing = await getMembership(uid, courseId);
  if (existing) {
    return { ok: true, membershipId: existing.id, alreadyEnrolled: true };
  }

  if (course.maxParticipants && (course.currentParticipants ?? 0) >= course.maxParticipants) {
    return { ok: false, status: 400, error: "This course is full" };
  }

  const membershipRef = await firestore.collection(LMS_COLLECTIONS.MEMBERSHIPS).add({
    userId: uid,
    courseId,
    courseRole: "participant",
    progressPercentage: 0,
    completedSessions: 0,
    totalSessions: 0,
    enrolledAt: Timestamp.now(),
    lastAccessedAt: Timestamp.now(),
    status: "active",
  });

  await firestore.collection(LMS_COLLECTIONS.COURSES).doc(courseId).update({
    currentParticipants: (course.currentParticipants ?? 0) + 1,
    updatedAt: Timestamp.now(),
  });

  // Recompute totals so the progress bar is right from the start.
  await refreshMembershipTotals(uid, courseId).catch((error) => console.error("[lms] totals refresh failed:", error));

  if (memberEmail) {
    await sendEmail({
      to: memberEmail,
      subject: `You're enrolled: ${course.title}`,
      html: `<h2>Welcome to ${course.title}!</h2>
        <p>Your enrollment is confirmed. You can start learning right away.</p>
        <p><a href="${appUrl(`/portal/sme/courses/${courseId}`)}">Open your course</a></p>`,
      text: `Welcome to ${course.title}! Start learning: ${appUrl(`/portal/sme/courses/${courseId}`)}`,
    }).catch((error) => console.error("[lms] enrollment email failed:", error));
  }

  return { ok: true, membershipId: membershipRef.id, alreadyEnrolled: false };
}

/** Creates memberships after a successful Stripe course purchase. Idempotent. */
export async function fulfillCoursePurchase(userId: string, courseIds: string[], stripeSessionId: string): Promise<{ enrolled: number; alreadyFulfilled: boolean }> {
  const firestore = requireDb();

  const purchaseSnap = await firestore
    .collection(LMS_COLLECTIONS.PURCHASES)
    .where("stripeSessionId", "==", stripeSessionId)
    .limit(1)
    .get();
  if (!purchaseSnap.empty && purchaseSnap.docs[0].data().status === "paid") {
    return { enrolled: 0, alreadyFulfilled: true };
  }

  const userDoc = await firestore.collection("users").doc(userId).get();
  const userData = userDoc.data();
  const name = (userData?.displayName as string | undefined) || [userData?.firstName, userData?.lastName].filter(Boolean).join(" ") || "Student";
  const email = (userData?.email as string | undefined) ?? null;

  let enrolled = 0;
  for (const courseId of courseIds) {
    const existing = await getMembership(userId, courseId);
    if (existing) continue;
    const course = await getCourseById(courseId);
    if (!course) continue;

    await firestore.collection(LMS_COLLECTIONS.MEMBERSHIPS).add({
      userId,
      courseId,
      courseRole: "participant",
      progressPercentage: 0,
      completedSessions: 0,
      totalSessions: 0,
      enrolledAt: Timestamp.now(),
      lastAccessedAt: Timestamp.now(),
      status: "active",
      purchaseSessionId: stripeSessionId,
    });
    await firestore.collection(LMS_COLLECTIONS.COURSES).doc(courseId).update({
      currentParticipants: (course.currentParticipants ?? 0) + 1,
      updatedAt: Timestamp.now(),
    });
    enrolled += 1;

    if (email) {
      await sendEmail({
        to: email,
        subject: `You're enrolled: ${course.title}`,
        html: `<h2>Welcome to ${course.title}!</h2>
          <p>Your payment was received and your enrollment is confirmed.</p>
          <p><a href="${appUrl(`/portal/sme/courses/${courseId}`)}">Start your course</a></p>`,
        text: `Welcome to ${course.title}! Start learning: ${appUrl(`/portal/sme/courses/${courseId}`)}`,
      }).catch((error) => console.error("[lms] purchase email failed:", error));
    }
  }

  if (!purchaseSnap.empty) {
    await purchaseSnap.docs[0].ref.update({ status: "paid", paidAt: Timestamp.now(), updatedAt: Timestamp.now() });
  }

  return { enrolled, alreadyFulfilled: false };
}

// ==================== PROGRESS & COMPLETION ====================

/** Recomputes completedSessions/totalSessions/percentage and flips status at 100%. */
async function refreshMembershipTotals(uid: string, courseId: string): Promise<void> {
  const firestore = requireDb();
  const sessionsSnap = await firestore.collection(LMS_COLLECTIONS.SESSIONS).where("courseId", "==", courseId).get();
  const totalSessions = sessionsSnap.size;
  const membership = await getMembership(uid, courseId);
  if (!membership || totalSessions === 0) return;

  const progressSnap = await firestore
    .collection(LMS_COLLECTIONS.PROGRESS)
    .where("userId", "==", uid)
    .where("courseId", "==", courseId)
    .where("isCompleted", "==", true)
    .get();
  const completedSessions = progressSnap.size;
  const progressPercentage = Math.min(100, Math.round((completedSessions / totalSessions) * 100));

  const updates: Record<string, unknown> = {
    totalSessions,
    completedSessions,
    progressPercentage,
    lastAccessedAt: Timestamp.now(),
  };
  if (progressPercentage >= 100 && membership.status !== "completed") {
    updates.status = "completed";
    updates.completedAt = Timestamp.now();
  }
  await firestore.collection(LMS_COLLECTIONS.MEMBERSHIPS).doc(membership.id).update(updates);

  // Cert work happens after the membership commit so a PDF/email failure
  // can never strand the completed status (the old client-side flow did).
  if (progressPercentage >= 100) {
    await issueCertificate(uid, courseId, await memberDisplayName(uid)).catch((error) =>
      console.error("[lms] certificate issuance failed:", error)
    );
  }
}

async function memberDisplayName(uid: string): Promise<string> {
  const userDoc = await requireDb().collection("users").doc(uid).get();
  const data = userDoc.data();
  return (data?.displayName as string | undefined) || [data?.firstName, data?.lastName].filter(Boolean).join(" ") || "Student";
}

/** Records session access/completion and advances the member's progress. */
export async function recordSessionProgress(
  uid: string,
  courseId: string,
  sessionId: string,
  moduleId: string,
  action: "access" | "complete",
  timeSpentSeconds = 0
): Promise<{ ok: boolean; progressPercentage?: number; completed?: boolean; error?: string }> {
  const firestore = requireDb();
  const membership = await getMembership(uid, courseId);
  if (!membership) return { ok: false, error: "Not enrolled in this course" };

  const progressSnap = await firestore
    .collection(LMS_COLLECTIONS.PROGRESS)
    .where("userId", "==", uid)
    .where("sessionId", "==", sessionId)
    .limit(1)
    .get();

  const now = Timestamp.now();
  if (progressSnap.empty) {
    await firestore.collection(LMS_COLLECTIONS.PROGRESS).add({
      userId: uid,
      courseId,
      sessionId,
      moduleId,
      isCompleted: action === "complete",
      completedAt: action === "complete" ? now : null,
      timeSpentSeconds,
      lastAccessedAt: now,
    });
  } else {
    const doc = progressSnap.docs[0];
    const updates: Record<string, unknown> = {
      timeSpentSeconds: (doc.data().timeSpentSeconds ?? 0) + timeSpentSeconds,
      lastAccessedAt: now,
    };
    if (action === "complete" && !doc.data().isCompleted) {
      updates.isCompleted = true;
      updates.completedAt = now;
    }
    await doc.ref.update(updates);
  }

  await refreshMembershipTotals(uid, courseId);
  const updated = await getMembership(uid, courseId);
  return {
    ok: true,
    progressPercentage: updated?.progressPercentage ?? 0,
    completed: updated?.status === "completed",
  };
}

/** Issues a certificate + notification + Documents archive. Idempotent per user+course. */
async function issueCertificate(uid: string, courseId: string, userName: string): Promise<void> {
  const firestore = requireDb();
  const existing = await firestore
    .collection(LMS_COLLECTIONS.CERTIFICATES)
    .where("userId", "==", uid)
    .where("courseId", "==", courseId)
    .limit(1)
    .get();
  if (!existing.empty) return;

  const course = await getCourseById(courseId);
  if (!course) return;

  const certificateNumber = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const certRef = await firestore.collection(LMS_COLLECTIONS.CERTIFICATES).add({
    userId: uid,
    courseId,
    courseTitle: course.title,
    userName,
    facilitatorName: course.facilitatorName ?? "LIFT Instructor",
    completionDate: Timestamp.now(),
    certificateNumber,
    issuedAt: Timestamp.now(),
    status: "active",
  });

  await firestore.collection(LMS_COLLECTIONS.NOTIFICATIONS).add({
    courseId,
    userId: uid,
    type: "certificate",
    title: "Certificate Issued!",
    message: `Congratulations! Your certificate for ${course.title} is ready.`,
    emailSent: false,
    pushSent: false,
    createdAt: Timestamp.now(),
  });

  // Archive the certificate PDF in the member's Documents.
  try {
    const verifyUrl = appUrl(`/verify/certificate/${certificateNumber}`);
    const pdf = await renderHtmlToPdf(
      buildCertificateHtml(
        {
          userId: uid,
          courseId,
          courseTitle: course.title,
          userName,
          facilitatorName: course.facilitatorName,
          completionDate: Timestamp.now(),
          certificateNumber,
        },
        verifyUrl
      )
    );
    await archiveGeneratedDocument({
      buffer: pdf,
      fileName: `certificate-${certificateNumber}.pdf`,
      contentType: "application/pdf",
      category: "certificates",
      folder: "Certificates",
      tags: ["LIFT", "Certificate", course.title],
      visibleToUids: [uid],
      uploadedBy: "LIFT Center",
      source: { type: "course-certificate", id: certRef.id, label: course.title },
    });
  } catch (error) {
    console.error("[lms] certificate archive failed:", error);
  }

  const userDoc = await firestore.collection("users").doc(uid).get();
  const email = userDoc.data()?.email as string | undefined;
  if (email) {
    await sendEmail({
      to: email,
      subject: `Certificate earned: ${course.title}`,
      html: `<h2>Congratulations, ${userName}!</h2>
        <p>You completed <strong>${course.title}</strong>. Your certificate is ready in your portal under Certificates and Documents.</p>
        <p><a href="${appUrl(`/api/lms/certificates/${certRef.id}/pdf`)}">Download your certificate</a></p>`,
      text: `You completed ${course.title}! Download: ${appUrl(`/api/lms/certificates/${certRef.id}/pdf`)}`,
    }).catch((error) => console.error("[lms] certificate email failed:", error));
  }
}

// ==================== READ MODELS ====================

export interface MemberCourseEntry {
  membershipId: string;
  courseId: string;
  status: string;
  progressPercentage: number;
  completedSessions: number;
  totalSessions: number;
  enrolledAt: string | null;
  completedAt: string | null;
  certificateId: string | null;
  course: CourseDoc | null;
}

export async function getMemberCourses(uid: string): Promise<MemberCourseEntry[]> {
  const firestore = requireDb();
  const membershipsSnap = await firestore.collection(LMS_COLLECTIONS.MEMBERSHIPS).where("userId", "==", uid).get();

  const certsSnap = await firestore.collection(LMS_COLLECTIONS.CERTIFICATES).where("userId", "==", uid).get();
  const certByCourse = new Map<string, string>(certsSnap.docs.map((d) => [d.data().courseId as string, d.id]));

  const entries = await Promise.all(
    membershipsSnap.docs.map(async (membershipDoc): Promise<MemberCourseEntry> => {
      const membership = docWithId<MembershipDoc>(membershipDoc);
      return {
        membershipId: membership.id,
        courseId: membership.courseId,
        status: membership.status ?? "active",
        progressPercentage: membership.progressPercentage ?? 0,
        completedSessions: membership.completedSessions ?? 0,
        totalSessions: membership.totalSessions ?? 0,
        enrolledAt: membership.enrolledAt?.toDate().toISOString() ?? null,
        completedAt: membership.completedAt?.toDate().toISOString() ?? null,
        certificateId: certByCourse.get(membership.courseId) ?? null,
        course: await getCourseById(membership.courseId),
      };
    })
  );
  return entries.sort((a, b) => (b.enrolledAt ?? "").localeCompare(a.enrolledAt ?? ""));
}

/** Public catalog: published courses only, safe fields. */
export async function getPublishedCourses(): Promise<CourseDoc[]> {
  const snap = await requireDb().collection(LMS_COLLECTIONS.COURSES).where("isPublished", "==", true).get();
  return snap.docs
    .map((d) => docWithId<CourseDoc>(d))
    .filter((course) => course.status === "published" || course.status === "active")
    .sort((a, b) => (a.courseStartDate?.toMillis() ?? 0) - (b.courseStartDate?.toMillis() ?? 0));
}

export async function getPublicCourseBySlug(slug: string): Promise<CourseDoc | null> {
  const snap = await requireDb()
    .collection(LMS_COLLECTIONS.COURSES)
    .where("slug", "==", slug)
    .where("isPublished", "==", true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const course = docWithId<CourseDoc>(snap.docs[0]);
  return course.status === "published" || course.status === "active" ? course : null;
}

export interface CourseOutlineModule {
  id: string;
  title: string;
  description?: string;
  sessions: { id: string; title: string; type?: string }[];
}

/** Module/session outline (titles only) for the public detail page. */
export async function getCourseOutline(courseId: string): Promise<CourseOutlineModule[]> {
  const firestore = requireDb();
  const modulesSnap = await firestore.collection(LMS_COLLECTIONS.MODULES).where("courseId", "==", courseId).get();
  const sortedModules = sortBySortOrder(modulesSnap.docs);
  return Promise.all(
    sortedModules.map(async (moduleDoc) => {
      const sessionsSnap = await firestore.collection(LMS_COLLECTIONS.SESSIONS).where("moduleId", "==", moduleDoc.id).get();
      return {
        id: moduleDoc.id,
        title: moduleDoc.data().title as string,
        description: moduleDoc.data().description as string | undefined,
        sessions: sortBySortOrder(sessionsSnap.docs).map((s) => ({ id: s.id, title: s.data().title as string, type: (s.data().type ?? s.data().contentType) as string | undefined })),
      };
    })
  );
}

/** Single-field where + in-memory sort — avoids composite index requirements. */
function sortBySortOrder(docs: FirebaseFirestore.QueryDocumentSnapshot[]): FirebaseFirestore.QueryDocumentSnapshot[] {
  return docs.sort((a, b) => ((a.data().sortOrder as number | undefined) ?? 0) - ((b.data().sortOrder as number | undefined) ?? 0));
}

/** Full curriculum with content URLs — membership-gated. Includes progress state. */
export async function getMemberCurriculum(uid: string, courseId: string) {
  const membership = await getMembership(uid, courseId);
  if (!membership) return null;
  const firestore = requireDb();

  const progressSnap = await firestore.collection(LMS_COLLECTIONS.PROGRESS).where("userId", "==", uid).where("courseId", "==", courseId).get();
  const progressBySession = new Map<string, { isCompleted: boolean }>(
    progressSnap.docs.map((d) => [d.data().sessionId as string, { isCompleted: d.data().isCompleted === true }])
  );

  const modulesSnap = await firestore.collection(LMS_COLLECTIONS.MODULES).where("courseId", "==", courseId).get();
  const modules = await Promise.all(
    sortBySortOrder(modulesSnap.docs).map(async (moduleDoc) => {
      const sessionsSnap = await firestore.collection(LMS_COLLECTIONS.SESSIONS).where("moduleId", "==", moduleDoc.id).get();
      return {
        id: moduleDoc.id,
        title: moduleDoc.data().title as string,
        description: (moduleDoc.data().description as string | undefined) ?? "",
        sortOrder: moduleDoc.data().sortOrder as number | undefined,
        sessions: sortBySortOrder(sessionsSnap.docs).map((s) => {
          const data = s.data();
          return {
            id: s.id,
            title: data.title as string,
            description: (data.description as string | undefined) ?? "",
            type: (data.type as string | undefined) ?? (data.contentType as string | undefined) ?? "lesson",
            durationMinutes: data.durationMinutes as number | undefined,
            contentUrl: data.contentUrl as string | undefined,
            textContent: data.textContent as string | undefined,
            videoUrl: data.videoUrl as string | undefined,
            zoomJoinUrl: data.zoomJoinUrl as string | undefined,
            zoomStartAt: (data.zoomStartAt as Timestamp | undefined)?.toDate().toISOString() ?? null,
            isCompleted: progressBySession.get(s.id)?.isCompleted ?? false,
          };
        }),
      };
    })
  );

  return { membership, modules };
}
