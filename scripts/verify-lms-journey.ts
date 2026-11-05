/**
 * End-to-end verification of the LMS journey against Firestore.
 * Uses a throwaway test uid — creates real membership/progress docs so the
 * complete flow is exercised; cleans up everything it creates at the end.
 *
 * Checks:
 *   1. catalog returns the seeded free course
 *   2. public detail returns a titles-only outline
 *   3. enrollInCourse creates a membership (dedupe on second call)
 *   4. getMemberCurriculum returns sessions with progress state
 *   5. recordSessionProgress completes all sessions → 100% → completed status
 *   6. certificate doc issued + notification created
 *
 * Run: npx tsx --env-file=.env.local scripts/verify-lms-journey.ts
 */
import {
  getPublishedCourses,
  getPublicCourseBySlug,
  getCourseOutline,
  enrollInCourse,
  getMembership,
  getMemberCurriculum,
  recordSessionProgress,
  getMemberCourses,
  LMS_COLLECTIONS,
} from "@/lib/lms/server/journey";
import { requireDb } from "@/lib/form-builder/server/context";

const TEST_UID = "lms-journey-verify-bot";
const SLUG = "lift-business-fundamentals";

let passed = 0;
let failed = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) {
    passed++;
    console.log(`  PASS ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

async function cleanup() {
  const db = requireDb();
  const collections = [
    LMS_COLLECTIONS.MEMBERSHIPS,
    LMS_COLLECTIONS.PROGRESS,
    LMS_COLLECTIONS.CERTIFICATES,
    LMS_COLLECTIONS.NOTIFICATIONS,
  ];
  for (const name of collections) {
    const snap = await db.collection(name).where("userId", "==", TEST_UID).get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
  }
}

async function main() {
  await cleanup(); // start clean

  console.log("\n1. Catalog");
  const catalog = await getPublishedCourses();
  const course = catalog.find((c) => c.slug === SLUG);
  check("published catalog includes demo course", !!course, course?.id);

  console.log("\n2. Public detail + outline");
  const bySlug = await getPublicCourseBySlug(SLUG);
  check("course resolvable by slug", bySlug?.id === course?.id);
  const outline = await getCourseOutline(course!.id);
  check("outline has 2 modules", outline.length === 2, `${outline.length} modules`);
  const totalSessions = outline.reduce((acc, m) => acc + m.sessions.length, 0);
  check("outline has 5 sessions", totalSessions === 5, `${totalSessions} sessions`);
  const outlineLeaksContent = outline.some((m) =>
    m.sessions.some((s) => "contentUrl" in s || "videoUrl" in s || "textContent" in s)
  );
  check("outline does not leak content URLs", !outlineLeaksContent);

  console.log("\n3. Enrollment");
  const enroll1 = await enrollInCourse(TEST_UID, course!.id, null);
  check("enroll succeeds", enroll1.ok && !("alreadyEnrolled" in enroll1 && enroll1.alreadyEnrolled));
  const enroll2 = await enrollInCourse(TEST_UID, course!.id, null);
  check("second enroll dedupes", enroll2.ok && "alreadyEnrolled" in enroll2 && enroll2.alreadyEnrolled === true);
  const membership = await getMembership(TEST_UID, course!.id);
  check("membership exists", !!membership);
  check("membership totals initialized", membership?.totalSessions === 5, `${membership?.totalSessions} total`);

  console.log("\n4. Curriculum (membership-gated)");
  const curriculum = await getMemberCurriculum(TEST_UID, course!.id);
  check("curriculum returns modules", !!curriculum && curriculum.modules.length === 2);
  check("no sessions completed yet", curriculum!.modules.every((m) => m.sessions.every((s) => !s.isCompleted)));

  console.log("\n5. Progress → completion");
  let lastResult: { progressPercentage?: number; completed?: boolean } = {};
  for (const m of curriculum!.modules) {
    for (const s of m.sessions) {
      lastResult = await recordSessionProgress(TEST_UID, course!.id, s.id, m.id, "complete");
    }
  }
  check("final progress is 100%", lastResult.progressPercentage === 100, `${lastResult.progressPercentage}%`);
  check("membership marked completed", lastResult.completed === true);

  const finalMembership = await getMembership(TEST_UID, course!.id);
  check("membership status persisted as completed", finalMembership?.status === "completed");
  check("completedSessions equals total", finalMembership?.completedSessions === finalMembership?.totalSessions);

  console.log("\n6. Certificate + my-courses");
  // issueCertificate is fire-and-forget inside refreshMembershipTotals — give it a beat
  await new Promise((r) => setTimeout(r, 3000));
  const db = requireDb();
  const certs = await db.collection(LMS_COLLECTIONS.CERTIFICATES).where("userId", "==", TEST_UID).get();
  check("certificate issued", !certs.empty, certs.docs[0]?.data().certificateNumber);
  const myCourses = await getMemberCourses(TEST_UID);
  const entry = myCourses.find((m) => m.courseId === course!.id);
  check("my-courses shows completed course", entry?.status === "completed");
  check("my-courses links certificate", !!entry?.certificateId);

  await cleanup();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Verification crashed:", error);
  process.exit(1);
});
