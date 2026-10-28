import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { IntakeAiSummary, LiftFormDoc, StoredFile, TableRow } from "../types";
import { requireDb } from "./context";
import { generateIntakeSummary } from "./ai-summary";

export interface PostProcessContext {
  form: LiftFormDoc;
  submissionId: string;
  liftClientId?: string;
  values: Record<string, unknown>;
  files: StoredFile[];
}

/** A claimed outcome awaiting staff verification (feeds MBDA measures once verified). */
interface OutcomeClaim {
  measure: "capital_infusion" | "contracts_secured" | "jobs_supported" | "new_business_starts" | "revenue_growth" | "readiness_completions" | "digital_adoption";
  value: number;
  unit: "usd_cents" | "jobs" | "count";
  occurredAt: string | null;
  detail: Record<string, unknown>;
}

const cents = (value: unknown): number => {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
};

const rows = (value: unknown): TableRow[] => (Array.isArray(value) ? (value as TableRow[]) : []);

/** Reads the client's most recent baseline (sorted in memory to avoid a composite index). */
export async function getLatestBaseline(liftClientId: string): Promise<Record<string, unknown> | null> {
  const snapshot = await requireDb().collection(COLLECTIONS.LIFT_BASELINES).where("liftClientId", "==", liftClientId).get();
  const docs = snapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  return docs[0] ?? null;
}

/** Derives individual outcome claims from a B9 check-in. */
async function deriveOutcomeClaims(context: PostProcessContext): Promise<OutcomeClaim[]> {
  const { values } = context;
  const claims: OutcomeClaim[] = [];
  const today = new Date().toISOString().slice(0, 10);

  const jobs = Number(values.jobsCreated ?? 0) + Number(values.jobsRetained ?? 0);
  if (jobs > 0) {
    claims.push({ measure: "jobs_supported", value: jobs, unit: "jobs", occurredAt: today, detail: { created: Number(values.jobsCreated ?? 0), retained: Number(values.jobsRetained ?? 0) } });
  }
  for (const row of rows(values.capitalObtained)) {
    claims.push({ measure: "capital_infusion", value: cents(row.amount), unit: "usd_cents", occurredAt: (row.closingDate as string) ?? null, detail: { source: row.source, type: row.type } });
  }
  for (const row of rows(values.contractsWon)) {
    claims.push({ measure: "contracts_secured", value: cents(row.value), unit: "usd_cents", occurredAt: (row.awardDate as string) ?? null, detail: { customer: row.customer, contractNumber: row.contractNumber, type: row.type } });
  }
  if (values.registeredNewBusiness === "yes") {
    claims.push({ measure: "new_business_starts", value: 1, unit: "count", occurredAt: (values.registrationDate as string) ?? null, detail: { registrationNumber: values.registrationNumber ?? null } });
  }
  if (Array.isArray(values.readinessPrograms) && values.readinessPrograms.length) {
    claims.push({ measure: "readiness_completions", value: values.readinessPrograms.length, unit: "count", occurredAt: today, detail: { programs: values.readinessPrograms } });
  }
  if (Array.isArray(values.newDigitalTools) && values.newDigitalTools.length) {
    claims.push({ measure: "digital_adoption", value: 1, unit: "count", occurredAt: today, detail: { tools: values.newDigitalTools } });
  }

  if (context.liftClientId && typeof values.revenueLast12 === "number") {
    const baseline = await getLatestBaseline(context.liftClientId);
    const baselineCents = typeof baseline?.revenueLast12MonthsCents === "number" ? baseline.revenueLast12MonthsCents : null;
    const currentCents = cents(values.revenueLast12);
    claims.push({
      measure: "revenue_growth",
      value: baselineCents === null ? 0 : currentCents - baselineCents,
      unit: "usd_cents",
      occurredAt: today,
      detail: { currentCents, baselineCents, checkinType: values.checkinType ?? null, comparable: baselineCents !== null },
    });
  }
  return claims;
}

/** Writes outcome claims (status "claimed", or "needs_info" when no evidence was uploaded). */
async function writeOutcomeClaims(context: PostProcessContext, claims: OutcomeClaim[]): Promise<void> {
  if (!claims.length) return;
  const db = requireDb();
  const batch = db.batch();
  const evidence = context.files.map((file) => ({ uploadId: file.uploadId, fileName: file.fileName, sha256: file.sha256 }));
  claims.forEach((claim, index) => {
    const ref = db.collection(COLLECTIONS.LIFT_OUTCOME_CLAIMS).doc(`${context.submissionId}_${index + 1}`);
    batch.set(ref, {
      ...claim,
      liftClientId: context.liftClientId ?? null,
      submissionId: context.submissionId,
      formSlug: context.form.slug,
      attribution: context.values.attribution ?? null,
      evidence,
      status: evidence.length || claim.measure === "revenue_growth" ? "claimed" : "needs_info",
      createdAt: Timestamp.now(),
    });
  });
  await batch.commit();
}

/** Runs the form's post-processing hooks. Returns the AI summary for B1 when generated. */
export async function runPostProcess(context: PostProcessContext): Promise<{ aiSummary?: IntakeAiSummary }> {
  const db = requireDb();
  const hooks = context.form.postProcess ?? [];
  const clientRef = context.liftClientId ? db.collection(COLLECTIONS.LIFT_CLIENTS).doc(context.liftClientId) : null;
  const result: { aiSummary?: IntakeAiSummary } = {};

  for (const hook of hooks) {
    try {
      if (hook === "enrollment_consent" && clientRef) {
        await clientRef.set(
          {
            status: "intake_submitted",
            enrollment: {
              consentSubmissionId: context.submissionId,
              consentSignedAt: Timestamp.now(),
              loeFormVersion: `${context.form.ombControlNumber ?? "form"} v${context.form.version}`,
            },
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }
      if (hook === "rural_attestation" && clientRef) {
        await clientRef.set(
          { eligibility: { rural: { status: "pending", parish: context.values.parish ?? null, submissionId: context.submissionId } }, updatedAt: Timestamp.now() },
          { merge: true }
        );
      }
      if (hook === "outcome_claims") {
        await writeOutcomeClaims(context, await deriveOutcomeClaims(context));
      }
      if (hook === "proposal_award" && context.values.outcome === "Awarded") {
        await writeOutcomeClaims(context, [
          {
            measure: "contracts_secured",
            value: cents(context.values.awardAmount),
            unit: "usd_cents",
            occurredAt: (context.values.awardDate as string) ?? null,
            detail: { noticeId: context.values.noticeId ?? null, noticeTitle: context.values.noticeTitle ?? null },
          },
        ]);
      }
      if (hook === "intake_ai_summary") {
        result.aiSummary = await generateIntakeSummary(context.form.fields, context.values as never);
        await db.collection(COLLECTIONS.LIFT_FORM_SUBMISSIONS).doc(context.submissionId).update({ aiSummary: result.aiSummary });
      }
    } catch (error) {
      console.error(`LIFT post-process hook "${hook}" failed:`, error);
    }
  }
  return result;
}
