import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { extractCrosswalkValues } from "../crosswalk";
import { hashCanonical, sha256 } from "../hash";
import { buildTargetWrites, TARGET_WRITE_MODE } from "../mapping";
import { validateFormValues } from "../validation";
import type {
  FormValues,
  IntakeAiSummary,
  LiftFormDoc,
  LiftTarget,
  SignatureValue,
  StoredFile,
  StoredSignature,
  UploadRef,
} from "../types";
import { requireDb, stripUndefined, type Requester } from "./context";
import { resolveClient } from "./identity";
import { runPostProcess } from "./postprocess";
import { resolveUploads, storeSignatureImage } from "./uploads";

/** Raised for problems the respondent can fix; mapped to HTTP 400. */
export class SubmissionError extends Error {
  constructor(message: string, public readonly fieldErrors: Record<string, string> = {}) {
    super(message);
  }
}

const COLLECTION_FOR_TARGET: Record<LiftTarget, string> = {
  liftClients: COLLECTIONS.LIFT_CLIENTS,
  liftBaselines: COLLECTIONS.LIFT_BASELINES,
  liftServicePlans: COLLECTIONS.LIFT_SERVICE_PLANS,
  liftSessions: COLLECTIONS.LIFT_SESSIONS,
  liftTrainingAttendance: COLLECTIONS.LIFT_TRAINING_ATTENDANCE,
  liftFeedback: COLLECTIONS.LIFT_FEEDBACK,
  liftCapitalPackages: COLLECTIONS.LIFT_CAPITAL_PACKAGES,
  liftCapabilityLibraries: COLLECTIONS.LIFT_CAPABILITY_LIBRARIES,
  liftProposalResponses: COLLECTIONS.LIFT_PROPOSAL_RESPONSES,
  liftOutcomeClaims: COLLECTIONS.LIFT_OUTCOME_CLAIMS,
  liftImpactConsents: COLLECTIONS.LIFT_IMPACT_CONSENTS,
  liftExits: COLLECTIONS.LIFT_EXITS,
};

export interface SubmissionResult {
  submissionId: string;
  liftClientId?: string;
  contentHash: string;
  completionMessage?: string;
  nextFormSlug?: string;
  aiSummary?: IntakeAiSummary;
}

/** Validates, stores, maps, and post-processes one form submission. */
export async function processSubmission(options: {
  form: LiftFormDoc;
  rawValues: FormValues;
  requester: Requester | null;
  ipHash: string;
  userAgent?: string;
  completionSeconds?: number;
}): Promise<SubmissionResult> {
  const { form, requester, ipHash } = options;
  const db = requireDb();
  const isStaff = Boolean(requester?.isStaff);

  const validation = validateFormValues(form.fields, form.sections, options.rawValues, { isStaff });
  if (!validation.ok) throw new SubmissionError("Please correct the highlighted answers", validation.errors);
  const values = validation.values;

  const needsClientLookup = form.fields.some((field) => field.lookupSource === "lift_clients" && field.key === "liftClientId");
  const client = await resolveClient({ requester, values, allowCreate: form.audience !== "staff" && !needsClientLookup });
  if (needsClientLookup && !client.liftClientId) throw new SubmissionError("Choose a valid client", { liftClientId: "Client not found" });

  const submissionRef = db.collection(COLLECTIONS.LIFT_FORM_SUBMISSIONS).doc();
  const submissionId = submissionRef.id;
  const fieldsByKey = new Map(form.fields.map((field) => [field.key, field]));

  // Files: verify ownership and collect stored metadata.
  const files: StoredFile[] = [];
  for (const [key, value] of Object.entries(values)) {
    const field = fieldsByKey.get(key);
    if (field?.type !== "file_upload") continue;
    try {
      files.push(...(await resolveUploads({ field, refs: value as UploadRef[], formSlug: form.slug, requester, ipHash })));
    } catch (error) {
      throw new SubmissionError(error instanceof Error ? error.message : "Upload error", { [key]: error instanceof Error ? error.message : "Upload error" });
    }
  }

  const consentTextHash = form.consentText ? sha256(form.consentText) : undefined;
  const signedByName = String(values.representativeName ?? values.fullName ?? requester?.name ?? "Respondent");

  // Hash of the answers as submitted (files by content hash, signatures by mode/name).
  const hashable = {
    formId: form.id,
    formVersion: form.version,
    liftClientId: client.liftClientId ?? null,
    consentTextHash: consentTextHash ?? null,
    values: Object.fromEntries(
      Object.entries(values).map(([key, value]) => {
        const field = fieldsByKey.get(key);
        if (field?.type === "file_upload") return [key, files.filter((file) => file.fieldKey === key).map((file) => file.sha256)];
        if (field?.type === "signature") {
          const signature = value as SignatureValue;
          return [key, { mode: signature.mode, typedName: signature.typedName ?? null, image: signature.dataUrl ? sha256(signature.dataUrl) : null }];
        }
        return [key, value];
      })
    ),
  };
  const contentHash = hashCanonical(hashable);

  // Signatures: store drawn images in Storage; keep only references on the submission.
  const signatures: StoredSignature[] = [];
  for (const [key, value] of Object.entries(values)) {
    if (fieldsByKey.get(key)?.type !== "signature") continue;
    const signature = value as SignatureValue;
    const stored = signature.mode === "drawn" && signature.dataUrl ? await storeSignatureImage(signature.dataUrl, submissionId, key) : null;
    signatures.push({
      fieldKey: key,
      mode: signature.mode,
      storagePath: stored?.storagePath,
      typedName: signature.typedName,
      signedByName: signature.typedName || signedByName,
      signedAt: new Date().toISOString(),
      consentTextHash,
      contentHash,
      userAgent: options.userAgent?.slice(0, 300),
      ipHash,
    });
  }

  // Stored answers: file and signature fields become references.
  const storedValues: FormValues = { ...values };
  const mappedValues: FormValues = { ...values };
  for (const key of Object.keys(values)) {
    const type = fieldsByKey.get(key)?.type;
    if (type === "file_upload") {
      const refs = files.filter((file) => file.fieldKey === key).map(({ uploadId, fileName, contentType, sizeBytes }) => ({ uploadId, fileName, contentType, sizeBytes }));
      storedValues[key] = refs;
      mappedValues[key] = files.filter((file) => file.fieldKey === key).map((file) => file.storagePath);
    }
    if (type === "signature") {
      const signature = signatures.find((item) => item.fieldKey === key);
      storedValues[key] = { mode: signature?.mode ?? "typed", typedName: signature?.typedName };
      mappedValues[key] = signature ? `${signature.signedByName} (${signature.signedAt})` : null;
    }
  }

  const now = Timestamp.now();
  const writes = buildTargetWrites(form.fields, mappedValues);
  const crosswalk = extractCrosswalkValues(form.fields, values);

  await db.runTransaction(async (transaction) => {
    const uploadRefs = files.map((file) => db.collection(COLLECTIONS.LIFT_FORM_UPLOADS).doc(file.uploadId));
    const uploadSnapshots = await Promise.all(uploadRefs.map((ref) => transaction.get(ref)));
    if (uploadSnapshots.some((snapshot) => snapshot.data()?.status !== "pending")) throw new SubmissionError("An uploaded file was already used. Please upload it again.");

    transaction.set(
      submissionRef,
      stripUndefined({
        id: submissionId,
        formId: form.id,
        formSlug: form.slug,
        formTitle: form.title,
        formVersion: form.version,
        liftClientId: client.liftClientId,
        submittedByUid: requester?.uid,
        submittedByName: signedByName,
        submittedByEmail: requester?.email ?? (typeof values.email === "string" ? values.email : undefined),
        values: storedValues,
        files,
        signatures,
        contentHash,
        consentTextHash,
        source: isStaff ? "staff" : requester ? "portal" : "public_link",
        status: "submitted",
        mappingStatus: Object.keys(writes).length ? "applied" : "skipped",
        completionSeconds: options.completionSeconds,
        createdAt: now,
      })
    );

    for (const [target, record] of Object.entries(writes) as [LiftTarget, Record<string, unknown>][]) {
      const collection = db.collection(COLLECTION_FOR_TARGET[target]);
      if (TARGET_WRITE_MODE[target] === "client_doc") {
        if (!client.liftClientId) continue;
        transaction.set(collection.doc(client.liftClientId), stripUndefined({ ...record, liftClientId: client.liftClientId, lastSubmissionId: submissionId, updatedAt: now }), { merge: true });
      } else {
        transaction.set(
          collection.doc(submissionId),
          stripUndefined({ ...record, liftClientId: client.liftClientId ?? null, submissionId, formSlug: form.slug, createdAt: now })
        );
      }
    }

    if (client.liftClientId && Object.keys(crosswalk).length) {
      const profileValues = Object.fromEntries(
        Object.entries(crosswalk).map(([key, value]) => [key, { value, sourceSubmissionId: submissionId, updatedAt: now.toDate().toISOString() }])
      );
      transaction.set(
        db.collection(COLLECTIONS.LIFT_CLIENT_PROFILES).doc(client.liftClientId),
        { liftClientId: client.liftClientId, values: profileValues, updatedAt: now },
        { merge: true }
      );
    }

    uploadRefs.forEach((ref) => transaction.update(ref, { status: "attached", submissionId, attachedAt: now }));
  });

  const { aiSummary } = await runPostProcess({ form, submissionId, liftClientId: client.liftClientId, values, files });

  return {
    submissionId,
    liftClientId: client.liftClientId,
    contentHash,
    completionMessage: form.completionMessage,
    nextFormSlug: form.nextFormSlug,
    aiSummary,
  };
}
