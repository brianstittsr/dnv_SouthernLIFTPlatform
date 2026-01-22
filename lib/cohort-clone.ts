/**
 * Cohort Cloning Utilities
 * Handles duplication of cohorts with all content
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
import { db } from "./firebase";
import { getModules, getSessions } from "./firebase-cohorts";
import type { CohortCloneOptions } from "@/types/cohorts";

/**
 * Clone a cohort with all its modules and sessions
 */
export async function cloneCohort(options: CohortCloneOptions): Promise<string> {
  if (!db) throw new Error("Firebase not initialized");

  const {
    sourceCohortId,
    newTitle,
    newStartDate,
    newFacilitatorId,
    copyModules = true,
    copySessions = true,
    resetEnrollment = true,
  } = options;

  // Get source cohort
  const sourceCohortRef = doc(db, "cohorts", sourceCohortId);
  const sourceCohortSnap = await getDoc(sourceCohortRef);

  if (!sourceCohortSnap.exists()) {
    throw new Error("Source cohort not found");
  }

  const sourceCohort = sourceCohortSnap.data();

  // Calculate new end date based on duration
  const durationMs = sourceCohort.cohortEndDate?.toMillis() - sourceCohort.cohortStartDate?.toMillis();
  const newEndDate = new Date(newStartDate.getTime() + durationMs);

  // Create new cohort
  const newCohortData = {
    ...sourceCohort,
    title: newTitle,
    slug: generateSlug(newTitle),
    cohortStartDate: Timestamp.fromDate(newStartDate),
    cohortEndDate: Timestamp.fromDate(newEndDate),
    facilitatorId: newFacilitatorId || sourceCohort.facilitatorId,
    currentParticipants: resetEnrollment ? 0 : sourceCohort.currentParticipants,
    status: "draft",
    isPublished: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Remove fields that shouldn't be copied
  const { id: _id, ...cohortWithoutId } = newCohortData as any;

  const newCohortRef = await addDoc(collection(db, "cohorts"), cohortWithoutId);
  const newCohortId = newCohortRef.id;

  // Copy modules if requested
  if (copyModules) {
    const modules = await getModules(sourceCohortId);

    for (const module of modules) {
      const { id: _moduleId, sessions: _sessions, ...moduleData } = module as any;
      
      const newModuleData = {
        ...moduleData,
        cohortId: newCohortId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const newModuleRef = await addDoc(collection(db, "cohort_modules"), newModuleData);
      const newModuleId = newModuleRef.id;

      // Copy sessions if requested
      if (copySessions) {
        const sessions = await getSessions(module.id);

        for (const session of sessions) {
          const { id: _sessionId, ...sessionData } = session as any;
          
          const newSessionData = {
            ...sessionData,
            cohortId: newCohortId,
            moduleId: newModuleId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          await addDoc(collection(db, "cohort_sessions"), newSessionData);
        }
      }
    }
  }

  return newCohortId;
}

/**
 * Create a cohort template (without dates)
 */
export async function createCohortTemplate(
  cohortId: string,
  templateName: string
): Promise<string> {
  if (!db) throw new Error("Firebase not initialized");

  // Get source cohort
  const sourceCohortRef = doc(db, "cohorts", cohortId);
  const sourceCohortSnap = await getDoc(sourceCohortRef);

  if (!sourceCohortSnap.exists()) {
    throw new Error("Source cohort not found");
  }

  const sourceCohort = sourceCohortSnap.data();

  // Create template
  const templateData = {
    ...sourceCohort,
    title: templateName,
    slug: generateSlug(templateName),
    cohortStartDate: null,
    cohortEndDate: null,
    currentParticipants: 0,
    status: "template",
    isPublished: false,
    isTemplate: true,
    sourceId: cohortId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const { id: _templateId, ...templateWithoutId } = templateData as any;

  const templateRef = await addDoc(collection(db, "cohort_templates"), templateWithoutId);
  const templateId = templateRef.id;

  // Copy modules and sessions
  const modules = await getModules(cohortId);

  for (const module of modules) {
    const { id: _modId, sessions: _sess, ...modData } = module as any;
    
    const newModuleData = {
      ...modData,
      cohortId: templateId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const newModuleRef = await addDoc(collection(db, "cohort_template_modules"), newModuleData);
    const newModuleId = newModuleRef.id;

    const sessions = await getSessions(module.id);

    for (const session of sessions) {
      const { id: _sessId, ...sessData } = session as any;
      
      const newSessionData = {
        ...sessData,
        cohortId: templateId,
        moduleId: newModuleId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "cohort_template_sessions"), newSessionData);
    }
  }

  return templateId;
}

/**
 * Create cohort from template
 */
export async function createFromTemplate(
  templateId: string,
  title: string,
  startDate: Date,
  facilitatorId: string
): Promise<string> {
  if (!db) throw new Error("Firebase not initialized");

  // Get template
  const templateRef = doc(db, "cohort_templates", templateId);
  const templateSnap = await getDoc(templateRef);

  if (!templateSnap.exists()) {
    throw new Error("Template not found");
  }

  const template = templateSnap.data();

  // Calculate end date
  const durationWeeks = template.estimatedDurationWeeks || 12;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationWeeks * 7);

  // Create new cohort
  const newCohortData = {
    ...template,
    title,
    slug: generateSlug(title),
    cohortStartDate: Timestamp.fromDate(startDate),
    cohortEndDate: Timestamp.fromDate(endDate),
    facilitatorId,
    currentParticipants: 0,
    status: "draft",
    isPublished: false,
    isTemplate: false,
    templateId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const { id: _newId, sourceId: _sourceId, ...cohortDataWithoutIds } = newCohortData as any;

  const newCohortRef = await addDoc(collection(db, "cohorts"), cohortDataWithoutIds);
  const newCohortId = newCohortRef.id;

  // Copy modules from template
  const modulesQuery = query(
    collection(db, "cohort_template_modules"),
    where("cohortId", "==", templateId),
    orderBy("sortOrder", "asc")
  );
  const modulesSnap = await getDocs(modulesQuery);

  for (const moduleDoc of modulesSnap.docs) {
    const module = moduleDoc.data();
    const { id: _mId, ...mData } = module as any;

    const newModuleData = {
      ...mData,
      cohortId: newCohortId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const newModuleRef = await addDoc(collection(db, "cohort_modules"), newModuleData);
    const newModuleId = newModuleRef.id;

    // Copy sessions from template
    const sessionsQuery = query(
      collection(db, "cohort_template_sessions"),
      where("moduleId", "==", moduleDoc.id),
      orderBy("sortOrder", "asc")
    );
    const sessionsSnap = await getDocs(sessionsQuery);

    for (const sessionDoc of sessionsSnap.docs) {
      const session = sessionDoc.data();
      const { id: _sId, ...sData } = session as any;

      const newSessionData = {
        ...sData,
        cohortId: newCohortId,
        moduleId: newModuleId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "cohort_sessions"), newSessionData);
    }
  }

  return newCohortId;
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
export async function getCohortTemplates() {
  if (!db) throw new Error("Firebase not initialized");

  const templatesQuery = query(
    collection(db, "cohort_templates"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(templatesQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Duplicate cohort for next session (quick clone)
 */
export async function duplicateForNextSession(
  cohortId: string,
  weeksOffset: number = 12
): Promise<string> {
  if (!db) throw new Error("Firebase not initialized");

  const cohortRef = doc(db, "cohorts", cohortId);
  const cohortSnap = await getDoc(cohortRef);

  if (!cohortSnap.exists()) {
    throw new Error("Cohort not found");
  }

  const cohort = cohortSnap.data();

  // Calculate new start date (offset from original start)
  const originalStart = cohort.cohortStartDate.toDate();
  const newStart = new Date(originalStart);
  newStart.setDate(newStart.getDate() + weeksOffset * 7);

  // Generate new title with session number
  const sessionMatch = cohort.title.match(/Session (\d+)/);
  const sessionNumber = sessionMatch ? parseInt(sessionMatch[1]) + 1 : 2;
  const newTitle = sessionMatch
    ? cohort.title.replace(/Session \d+/, `Session ${sessionNumber}`)
    : `${cohort.title} - Session ${sessionNumber}`;

  return cloneCohort({
    sourceCohortId: cohortId,
    newTitle,
    newStartDate: newStart,
    copyModules: true,
    copySessions: true,
    resetEnrollment: true,
  });
}
