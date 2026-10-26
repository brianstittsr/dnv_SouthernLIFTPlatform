import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { FormDefinitionInput } from "../form-schema";
import type { FormPdfConfig, LiftFormDoc, PublicFormSchema } from "../types";
import { requireDb, serializeFirestore, stripUndefined, type Requester } from "./context";

const DEFAULT_PDF: FormPdfConfig = {
  enabled: true,
  headerTitle: "Southern University LIFT Center",
  headerSubtitle: "MBDA Rural Business Center",
  footerText: "Confidential - Southern University LIFT Center",
  includeSignatureBlock: true,
  includeTimestampAndAuditHash: true,
};

/** Reads a form by document id. */
export async function getFormById(formId: string): Promise<LiftFormDoc | null> {
  const snapshot = await requireDb().collection(COLLECTIONS.LIFT_FORMS).doc(formId).get();
  return snapshot.exists ? serializeFirestore({ ...(snapshot.data() as LiftFormDoc), id: snapshot.id }) : null;
}

/** Reads the immutable snapshot of a published form version (falls back to the current form). */
export async function getFormVersion(formId: string, version: number): Promise<LiftFormDoc | null> {
  const snapshot = await requireDb().collection(COLLECTIONS.LIFT_FORMS).doc(formId).collection("versions").doc(String(version)).get();
  if (snapshot.exists) return serializeFirestore({ ...(snapshot.data() as LiftFormDoc), id: formId });
  return getFormById(formId);
}

/** Reads a form by slug; only published forms unless includeDrafts is true. */
export async function getFormBySlug(slug: string, includeDrafts = false): Promise<LiftFormDoc | null> {
  const snapshot = await requireDb().collection(COLLECTIONS.LIFT_FORMS).where("slug", "==", slug).limit(1).get();
  const doc = snapshot.docs[0];
  if (!doc) return null;
  const form = serializeFirestore({ ...(doc.data() as LiftFormDoc), id: doc.id });
  return includeDrafts || form.status === "published" ? form : null;
}

/** Lists all forms (admin). */
export async function listForms(): Promise<LiftFormDoc[]> {
  const snapshot = await requireDb().collection(COLLECTIONS.LIFT_FORMS).get();
  return snapshot.docs
    .map((doc) => serializeFirestore({ ...(doc.data() as LiftFormDoc), id: doc.id }))
    .sort((a, b) => (a.lifecycleRef ?? "Z").localeCompare(b.lifecycleRef ?? "Z", undefined, { numeric: true }) || a.title.localeCompare(b.title));
}

/** Returns true when the requester may open a form with the given audience. */
export function canAccessForm(form: Pick<LiftFormDoc, "audience">, requester: Requester | null): boolean {
  if (form.audience === "public") return true;
  if (!requester) return false;
  return form.audience === "client" || requester.isStaff;
}

/** Removes mappings and, for non-staff, staff-only sections and fields. */
export function toPublicSchema(form: LiftFormDoc, isStaff: boolean): PublicFormSchema {
  const staffSections = new Set(form.sections.filter((section) => section.staffOnly).map((section) => section.id));
  const { analytics: _analytics, createdByUid: _uid, createdByName: _name, fields, ...rest } = form;
  void _analytics;
  void _uid;
  void _name;
  return {
    ...rest,
    sections: isStaff ? form.sections : form.sections.filter((section) => !section.staffOnly),
    fields: fields
      .filter((field) => isStaff || (!field.staffOnly && !(field.section && staffSections.has(field.section))))
      .map(({ mappings: _mappings, ...field }) => {
        void _mappings;
        return field;
      }),
  };
}

/** Creates or replaces a form definition; editing a published form returns it to draft. */
export async function saveFormDefinition(input: FormDefinitionInput, requester: Requester, formId?: string): Promise<LiftFormDoc> {
  const db = requireDb();
  const collection = db.collection(COLLECTIONS.LIFT_FORMS);
  const duplicate = await collection.where("slug", "==", input.slug).limit(1).get();
  if (duplicate.docs[0] && duplicate.docs[0].id !== formId) throw new Error(`A form with slug "${input.slug}" already exists`);

  const now = Timestamp.now();
  const ref = formId ? collection.doc(formId) : collection.doc();
  const existing = formId ? await ref.get() : null;
  if (formId && !existing?.exists) throw new Error("Form not found");

  const previous = existing?.data() as Partial<LiftFormDoc> | undefined;
  const record = {
    ...input,
    pdfConfig: input.pdfConfig ?? DEFAULT_PDF,
    status: "draft",
    version: previous?.version ?? 0,
    analytics: previous?.analytics ?? { totalViews: 0, totalStarts: 0, totalSubmissions: 0 },
    createdByUid: previous?.createdByUid ?? requester.uid,
    createdByName: previous?.createdByName ?? requester.name,
    createdAt: previous?.createdAt ?? now,
    ...(previous?.publishedAt ? { publishedAt: previous.publishedAt } : {}),
    updatedAt: now,
  };
  await ref.set(stripUndefined(record));
  const saved = await getFormById(ref.id);
  if (!saved) throw new Error("Form could not be saved");
  return saved;
}

/** Publishes a form: increments version and stores an immutable snapshot of the definition. */
export async function publishForm(formId: string, requester: Requester): Promise<LiftFormDoc> {
  const db = requireDb();
  const ref = db.collection(COLLECTIONS.LIFT_FORMS).doc(formId);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new Error("Form not found");
    const data = snapshot.data() as LiftFormDoc;
    const version = (data.version ?? 0) + 1;
    const now = Timestamp.now();
    transaction.update(ref, { status: "published", version, publishedAt: now, updatedAt: now });
    transaction.set(ref.collection("versions").doc(String(version)), {
      ...data,
      status: "published",
      version,
      publishedAt: now,
      publishedByUid: requester.uid,
    });
  });
  const saved = await getFormById(formId);
  if (!saved) throw new Error("Form not found");
  return saved;
}

/** Increments a form analytics counter. Never throws. */
export async function incrementFormCounter(formId: string, counter: "totalViews" | "totalStarts" | "totalSubmissions"): Promise<void> {
  try {
    const { FieldValue } = await import("firebase-admin/firestore");
    await requireDb().collection(COLLECTIONS.LIFT_FORMS).doc(formId).update({ [`analytics.${counter}`]: FieldValue.increment(1) });
  } catch (error) {
    console.error("Form analytics update failed:", error);
  }
}
