import { Timestamp } from "firebase-admin/firestore";
import { requireDb } from "@/lib/form-builder/server/context";

interface CourseInfo {
  title?: string;
  description?: string;
  startDate?: { toDate?: () => Date } | string;
  duration?: number;
}

function courseStartText(course: CourseInfo): string {
  const raw = course.startDate;
  const date =
    raw && typeof raw === "object" && typeof raw.toDate === "function"
      ? raw.toDate()
      : raw
        ? new Date(String(raw))
        : null;
  return date
    ? date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "soon";
}

/**
 * Creates a LinkedIn announcement draft for a course in the existing
 * linkedinArticles pipeline (reviewed + posted from the LinkedIn drafts
 * UI). Idempotent per course via the courseId field.
 */
export async function createCourseAnnouncementDraft(
  courseId: string,
  course: CourseInfo,
  userId: string | null
): Promise<string | null> {
  const db = requireDb();
  const existing = await db
    .collection("linkedinArticles")
    .where("courseId", "==", courseId)
    .limit(1)
    .get();
  if (!existing.empty) return existing.docs[0].id;

  const title = course.title || "New LIFT Training Course";
  const description = (course.description || "").slice(0, 400);
  const start = courseStartText(course);
  const duration = course.duration ? `${course.duration}-week` : "multi-week";

  const ref = await db.collection("linkedinArticles").add({
    title: `Course announcement — ${title}`,
    content: [
      `We're launching a new no-cost training program for rural small businesses: ${title}.`,
      "",
      description,
      "",
      `This ${duration} program starts ${start}. Enrollment is open now for Southern University LIFT Rural Business Center clients.`,
      "",
      "Register through the LIFT client portal, or contact your LIFT advisor for details.",
    ]
      .filter((line) => line !== "")
      .join("\n"),
    hashtags: "#LIFT #RuralBusiness #SouthernUniversity #MBDA #SmallBusiness #GovCon #Entrepreneurship",
    glossary: [],
    references: [],
    images: [],
    tone: "professional",
    length: "short",
    prompt: "auto: course announcement",
    status: "draft",
    courseId,
    userId: userId || "system",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}
