/**
 * Course Cloning Utilities
 * Handles duplication of courses with all content
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { getModules, getSessions } from "./courses";
import type { CourseCloneOptions } from "@/types/courses";

/**
 * Clone a course with all its modules and sessions
 */
export async function cloneCourse(options: CourseCloneOptions): Promise<string> {
  if (!db) throw new Error("Firebase not initialized");

  const {
    sourceCourseId,
    newTitle,
    newStartDate,
    newFacilitatorId,
    copyModules = true,
    copySessions = true,
    resetEnrollment = true,
  } = options;

  // Get source course
  const sourceCourseRef = doc(db, "courses", sourceCourseId);
  const sourceCourseSnap = await getDoc(sourceCourseRef);

  if (!sourceCourseSnap.exists()) {
    throw new Error("Source course not found");
  }

  const sourceCourse = sourceCourseSnap.data();

  // Calculate new end date based on duration
  const durationMs = sourceCourse.courseEndDate?.toMillis() - sourceCourse.courseStartDate?.toMillis();
  const newEndDate = new Date(newStartDate.getTime() + durationMs);

  // Create new course
  const newCourseData = {
    ...sourceCourse,
    title: newTitle,
    slug: generateSlug(newTitle),
    courseStartDate: Timestamp.fromDate(newStartDate),
    courseEndDate: Timestamp.fromDate(newEndDate),
    facilitatorId: newFacilitatorId || sourceCourse.facilitatorId,
    currentParticipants: resetEnrollment ? 0 : sourceCourse.currentParticipants,
    status: "draft",
    isPublished: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Remove fields that shouldn't be copied
  const { id: _id, ...courseWithoutId } = newCourseData as any;

  const newCourseRef = await addDoc(collection(db, "courses"), courseWithoutId);
  const newCourseId = newCourseRef.id;

  // Copy modules if requested
  if (copyModules) {
    const modules = await getModules(sourceCourseId);

    for (const module of modules) {
      const { id: _moduleId, sessions: _sessions, ...moduleData } = module as any;
      
      const newModuleData = {
        ...moduleData,
        courseId: newCourseId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const newModuleRef = await addDoc(collection(db, "course_modules"), newModuleData);
      const newModuleId = newModuleRef.id;

      // Copy sessions if requested
      if (copySessions) {
        const sessions = await getSessions(module.id);

        for (const session of sessions) {
          const { id: _sessionId, ...sessionData } = session as any;
          
          const newSessionData = {
            ...sessionData,
            courseId: newCourseId,
            moduleId: newModuleId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          await addDoc(collection(db, "course_sessions"), newSessionData);
        }
      }
    }
  }

  return newCourseId;
}

/**
 * Create a course template (without dates)
 */
export async function createCourseTemplate(
  courseId: string,
  templateName: string
): Promise<string> {
  if (!db) throw new Error("Firebase not initialized");

  // Get source course
  const sourceCourseRef = doc(db, "courses", courseId);
  const sourceCourseSnap = await getDoc(sourceCourseRef);

  if (!sourceCourseSnap.exists()) {
    throw new Error("Source course not found");
  }

  const sourceCourse = sourceCourseSnap.data();

  // Create template
  const templateData = {
    ...sourceCourse,
    title: templateName,
    slug: generateSlug(templateName),
    courseStartDate: null,
    courseEndDate: null,
    currentParticipants: 0,
    status: "template",
    isPublished: false,
    isTemplate: true,
    sourceId: courseId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const { id: _templateId, ...templateWithoutId } = templateData as any;

  const templateRef = await addDoc(collection(db, "course_templates"), templateWithoutId);
  const templateId = templateRef.id;

  // Copy modules and sessions
  const modules = await getModules(courseId);

  for (const module of modules) {
    const { id: _modId, sessions: _sess, ...modData } = module as any;
    
    const newModuleData = {
      ...modData,
      courseId: templateId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const newModuleRef = await addDoc(collection(db, "course_template_modules"), newModuleData);
    const newModuleId = newModuleRef.id;

    const sessions = await getSessions(module.id);

    for (const session of sessions) {
      const { id: _sessId, ...sessData } = session as any;
      
      const newSessionData = {
        ...sessData,
        courseId: templateId,
        moduleId: newModuleId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "course_template_sessions"), newSessionData);
    }
  }

  return templateId;
}

/**
 * Create course from template
 */
export async function createFromTemplate(
  templateId: string,
  title: string,
  startDate: Date,
  facilitatorId: string
): Promise<string> {
  if (!db) throw new Error("Firebase not initialized");

  // Get template
  const templateRef = doc(db, "course_templates", templateId);
  const templateSnap = await getDoc(templateRef);

  if (!templateSnap.exists()) {
    throw new Error("Template not found");
  }

  const template = templateSnap.data();

  // Calculate end date
  const durationWeeks = template.estimatedDurationWeeks || 12;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationWeeks * 7);

  // Create new course
  const newCourseData = {
    ...template,
    title,
    slug: generateSlug(title),
    courseStartDate: Timestamp.fromDate(startDate),
    courseEndDate: Timestamp.fromDate(endDate),
    facilitatorId,
    currentParticipants: 0,
    status: "draft",
    isPublished: false,
    isTemplate: false,
    templateId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const { id: _newId, sourceId: _sourceId, ...courseDataWithoutIds } = newCourseData as any;

  const newCourseRef = await addDoc(collection(db, "courses"), courseDataWithoutIds);
  const newCourseId = newCourseRef.id;

  // Copy modules from template
  const modulesQuery = query(
    collection(db, "course_template_modules"),
    where("courseId", "==", templateId),
    orderBy("sortOrder", "asc")
  );
  const modulesSnap = await getDocs(modulesQuery);

  for (const moduleDoc of modulesSnap.docs) {
    const module = moduleDoc.data();
    const { id: _mId, ...mData } = module as any;

    const newModuleData = {
      ...mData,
      courseId: newCourseId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const newModuleRef = await addDoc(collection(db, "course_modules"), newModuleData);
    const newModuleId = newModuleRef.id;

    // Copy sessions from template
    const sessionsQuery = query(
      collection(db, "course_template_sessions"),
      where("moduleId", "==", moduleDoc.id),
      orderBy("sortOrder", "asc")
    );
    const sessionsSnap = await getDocs(sessionsQuery);

    for (const sessionDoc of sessionsSnap.docs) {
      const session = sessionDoc.data();
      const { id: _sId, ...sData } = session as any;

      const newSessionData = {
        ...sData,
        courseId: newCourseId,
        moduleId: newModuleId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "course_sessions"), newSessionData);
    }
  }

  return newCourseId;
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Get all available templates
 */
export async function getCourseTemplates() {
  if (!db) throw new Error("Firebase not initialized");

  const templatesQuery = query(
    collection(db, "course_templates"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(templatesQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Duplicate course for next session (quick clone)
 */
export async function duplicateForNextSession(
  courseId: string,
  weeksOffset: number = 12
): Promise<string> {
  if (!db) throw new Error("Firebase not initialized");

  const courseRef = doc(db, "courses", courseId);
  const courseSnap = await getDoc(courseRef);

  if (!courseSnap.exists()) {
    throw new Error("Course not found");
  }

  const course = courseSnap.data();

  // Calculate new start date (offset from original start)
  const originalStart = course.courseStartDate.toDate();
  const newStart = new Date(originalStart);
  newStart.setDate(newStart.getDate() + weeksOffset * 7);

  // Generate new title with session number
  const sessionMatch = course.title.match(/Session (\d+)/);
  const sessionnumber = sessionMatch ? parseInt(sessionMatch[1]) + 1 : 2;
  const newTitle = sessionMatch
    ? course.title.replace(/Session \d+/, `Session ${sessionnumber}`)
    : `${course.title} - Session ${sessionnumber}`;

  return cloneCourse({
    sourceCourseId: courseId,
    newTitle,
    newStartDate: newStart,
    copyModules: true,
    copySessions: true,
    resetEnrollment: true,
  });
}
