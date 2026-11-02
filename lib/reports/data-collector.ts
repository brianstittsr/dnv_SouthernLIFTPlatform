/**
 * Aggregates Firestore into a compact, PII-redacted "data pack" for AI report
 * generation. Two scopes: the whole platform (fixed + free-form reports) and a
 * single client (deep dives). Counts and distributions only — raw emails,
 * phones, names, street addresses, and federal identifiers never enter the
 * pack (mirroring lib/form-builder/server/ai-summary.ts).
 */
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { requireDb } from "@/lib/form-builder/server/context";
import type { FieldValue, FormValues } from "@/lib/form-builder/types";

export interface ReportPeriod {
  /** Inclusive ISO date bounds; undefined means "all time". */
  start?: Date;
  end?: Date;
  label: string;
}

/** Keys never copied from submission/profile values into a data pack. */
const REDACTED_VALUE_KEYS = new Set([
  "email", "contactEmail", "phone", "contactPhone", "mobilePhone",
  "fullName", "contactName", "firstName", "lastName", "signatureName",
  "address", "streetAddress", "linkedin", "emailOptIn",
  "attachments", "aiDisclosure",
]);
/** Identifier keys replaced with presence booleans (hasUei, hasCageCode, ...). */
const PRESENCE_KEYS = new Set(["uei", "dunsUei", "cageCode", "ein"]);

const MAX_DOCS = 2000;
const ATTACHMENT_SAMPLE_LIMIT = 15;
const ATTACHMENT_EXCERPT_CHARS = 1500;

const toDate = (value: unknown): Date | null => {
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const inPeriod = (value: unknown, period: ReportPeriod): boolean => {
  const date = toDate(value);
  if (!date) return false;
  if (period.start && date < period.start) return false;
  if (period.end && date > period.end) return false;
  return true;
};

const bucket = (counts: Record<string, number>, key: string): void => {
  counts[key || "Unspecified"] = (counts[key || "Unspecified"] ?? 0) + 1;
};

const sum = (counts: Record<string, number>, key: string, amount: number): void => {
  counts[key] = (counts[key] ?? 0) + amount;
};

const money = (cents: number): string =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const str = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/** Copies submission values with contact/identifier fields removed. */
function redactValues(values: FormValues): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (REDACTED_VALUE_KEYS.has(key)) continue;
    if (PRESENCE_KEYS.has(key)) {
      const has = Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== "";
      out[`has${key.charAt(0).toUpperCase()}${key.slice(1)}`] = has;
      continue;
    }
    if (value === undefined) continue;
    out[key] = value as FieldValue;
  }
  return out;
}

interface DocRow {
  id: string;
  data: Record<string, unknown>;
}

async function fetchAll(collectionName: string): Promise<DocRow[]> {
  const snapshot = await requireDb().collection(collectionName).limit(MAX_DOCS).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() as Record<string, unknown> }));
}

const centsOf = (data: Record<string, unknown>, key: string): number =>
  typeof data[key] === "number" && Number.isFinite(data[key]) ? (data[key] as number) : 0;

/**
 * Whole-platform data pack: LIFT collections + platform-wide signals.
 * Aggregates only — safe to store on the report and send to the AI provider.
 */
export async function collectPlatformDataPack(period: ReportPeriod): Promise<Record<string, unknown>> {
  const [
    clients, submissions, sessions, training, feedback, outcomes, capital,
    proposals, plans, baselines, partners, invoices, kpiTargets, consents,
    stories, exits, users, events, attachments,
  ] = await Promise.all([
    fetchAll(COLLECTIONS.LIFT_CLIENTS),
    fetchAll(COLLECTIONS.LIFT_FORM_SUBMISSIONS),
    fetchAll(COLLECTIONS.LIFT_SESSIONS),
    fetchAll(COLLECTIONS.LIFT_TRAINING_ATTENDANCE),
    fetchAll(COLLECTIONS.LIFT_FEEDBACK),
    fetchAll(COLLECTIONS.LIFT_OUTCOME_CLAIMS),
    fetchAll(COLLECTIONS.LIFT_CAPITAL_PACKAGES),
    fetchAll(COLLECTIONS.LIFT_PROPOSAL_RESPONSES),
    fetchAll(COLLECTIONS.LIFT_SERVICE_PLANS),
    fetchAll(COLLECTIONS.LIFT_BASELINES),
    fetchAll(COLLECTIONS.LIFT_PARTNER_AGREEMENTS),
    fetchAll(COLLECTIONS.LIFT_INVOICES),
    fetchAll(COLLECTIONS.LIFT_KPI_TARGETS),
    fetchAll(COLLECTIONS.LIFT_IMPACT_CONSENTS),
    fetchAll(COLLECTIONS.LIFT_IMPACT_STORIES),
    fetchAll(COLLECTIONS.LIFT_EXITS),
    fetchAll(COLLECTIONS.USERS),
    fetchAll(COLLECTIONS.EVENTS),
    fetchAll(COLLECTIONS.MEMBER_ATTACHMENTS),
  ]);

  // --- Clients ---
  const clientsByStatus: Record<string, number> = {};
  const clientsByReferredByOrg: Record<string, number> = {};
  const clientsByReferralSource: Record<string, number> = {};
  const clientsByParish: Record<string, number> = {};
  let newClientsInPeriod = 0;
  for (const { data } of clients) {
    bucket(clientsByStatus, str(data.status));
    bucket(clientsByReferredByOrg, str(data.referredByOrg));
    bucket(clientsByReferralSource, str(data.referralSource));
    const rural = data.eligibility as { rural?: { parish?: string; status?: string } } | undefined;
    bucket(clientsByParish, str(rural?.rural?.parish) || str(data.parish));
    if (inPeriod(data.createdAt, period)) newClientsInPeriod += 1;
  }

  // --- Submissions ---
  const submissionsByForm: Record<string, number> = {};
  const submissionsByFormInPeriod: Record<string, number> = {};
  const intakeReferredBy: Record<string, number> = {};
  const intakeParishes: Record<string, number> = {};
  let submissionsInPeriod = 0;
  let aiSummaries = 0;
  for (const { data } of submissions) {
    const slug = str(data.formSlug);
    bucket(submissionsByForm, slug);
    if (inPeriod(data.createdAt, period)) {
      submissionsInPeriod += 1;
      bucket(submissionsByFormInPeriod, slug);
    }
    if (data.aiSummary) aiSummaries += 1;
    if (slug === "lift-intake") {
      const values = (data.values ?? {}) as Record<string, unknown>;
      const referredBy = str(values.referredBy);
      if (referredBy) bucket(intakeReferredBy, referredBy);
      const parish = str(data.derivedParish);
      if (parish) bucket(intakeParishes, parish);
    }
  }

  // --- Sessions ---
  const sessionsByArea: Record<string, number> = {};
  const minutesByArea: Record<string, number> = {};
  let sessionsInPeriod = 0;
  let minutesInPeriod = 0;
  for (const { data } of sessions) {
    if (!inPeriod(data.createdAt, period) && !(typeof data.sessionDate === "string" && inPeriod(data.sessionDate, period))) {
      continue;
    }
    sessionsInPeriod += 1;
    const area = str(data.serviceArea);
    bucket(sessionsByArea, area);
    const minutes = centsOf(data, "durationMinutes");
    sum(minutesByArea, area, minutes);
    minutesInPeriod += minutes;
  }

  // --- Training & feedback ---
  let registrationsInPeriod = 0;
  let attendedInPeriod = 0;
  for (const { data } of training) {
    if (!inPeriod(data.createdAt, period)) continue;
    registrationsInPeriod += 1;
    if (data.attended === true) attendedInPeriod += 1;
  }
  let feedbackCount = 0;
  let npsTotal = 0;
  let npsCount = 0;
  let ratingTotal = 0;
  let ratingCount = 0;
  for (const { data } of feedback) {
    if (!inPeriod(data.createdAt, period)) continue;
    feedbackCount += 1;
    if (typeof data.nps === "number") { npsTotal += data.nps; npsCount += 1; }
    if (typeof data.overallRating === "number") { ratingTotal += data.overallRating; ratingCount += 1; }
  }

  // --- Outcome claims (verified only counts toward MBDA measures) ---
  const verifiedByMeasure: Record<string, { count: number; usdCents: number }> = {};
  const claimsByStatus: Record<string, number> = {};
  for (const { data } of outcomes) {
    bucket(claimsByStatus, str(data.status));
    if (data.status !== "verified") continue;
    if (period.start || period.end) {
      const occurred = str(data.occurredAt);
      const reportingPeriod = str(data.reportingPeriod);
      const inWindow = (occurred && inPeriod(occurred, period)) || inPeriod(data.createdAt, period) || Boolean(reportingPeriod && reportingPeriod === period.label);
      if (!inWindow) continue;
    }
    const measure = str(data.measure);
    const entry = verifiedByMeasure[measure] ?? { count: 0, usdCents: 0 };
    entry.count += 1;
    if (data.unit === "usd_cents" && typeof data.value === "number") entry.usdCents += data.value;
    verifiedByMeasure[measure] = entry;
  }

  // --- Capital & proposals ---
  let capitalPackagesInPeriod = 0;
  let capitalSoughtCents = 0;
  for (const { data } of capital) {
    if (inPeriod(data.createdAt, period)) capitalPackagesInPeriod += 1;
    capitalSoughtCents += centsOf(data, "amountSoughtCents");
  }
  let proposalsInPeriod = 0;
  let proposalsSubmitted = 0;
  let proposalsAwarded = 0;
  let awardCents = 0;
  for (const { data } of proposals) {
    if (inPeriod(data.createdAt, period)) proposalsInPeriod += 1;
    if (data.submitted === true) proposalsSubmitted += 1;
    if (data.outcome === "Awarded") {
      proposalsAwarded += 1;
      awardCents += centsOf(data, "awardAmountCents");
    }
  }

  // --- Partners, invoices ---
  const partnersByStatus: Record<string, number> = {};
  for (const { data } of partners) bucket(partnersByStatus, str(data.status));
  const executed = partnersByStatus.executed ?? 0;
  const executedPct = partners.length ? Math.round((executed / partners.length) * 100) : 0;

  const invoicesByStatus: Record<string, number> = {};
  const invoicesByPeriod: Record<string, string> = {};
  for (const { data } of invoices) {
    bucket(invoicesByStatus, str(data.status));
    const periodKey = str(data.period);
    if (periodKey) invoicesByPeriod[periodKey] = money(centsOf(data, "amountCents"));
  }

  // --- KPI targets ---
  const activeTargets = kpiTargets
    .filter(({ data }) => data.status === "active")
    .map(({ data }) => ({
      year: data.year,
      targets: Array.isArray(data.targets)
        ? (data.targets as Record<string, unknown>[]).map((t) => ({
            measure: t.measure,
            targetCount: t.targetCount,
            targetUsd: typeof t.targetCents === "number" ? money(t.targetCents) : undefined,
          }))
        : [],
      unresolvedConflicts: Array.isArray(data.flagConflicts)
        ? (data.flagConflicts as Record<string, unknown>[]).filter((c) => c.resolved !== true).map((c) => c.measure)
        : [],
    }));

  // --- Stories, consents, exits ---
  const storiesPublished = stories.filter(({ data }) => data.status === "published").length;
  const shareStory = consents.filter(({ data }) => data.shareStory === true || data.consentToUse === true).length;
  let exitCount = 0;
  let exitNpsTotal = 0;
  let exitNpsCount = 0;
  for (const { data } of exits) {
    if (!inPeriod(data.createdAt, period)) continue;
    exitCount += 1;
    if (typeof data.nps === "number") { exitNpsTotal += data.nps; exitNpsCount += 1; }
  }

  // --- Platform signals ---
  const usersByRole: Record<string, number> = {};
  let usersInPeriod = 0;
  for (const { data } of users) {
    bucket(usersByRole, str(data.role) || str(data.accountType));
    if (inPeriod(data.createdAt, period)) usersInPeriod += 1;
  }
  let eventsInPeriod = 0;
  for (const { data } of events) {
    if (inPeriod(data.startDate, period) || inPeriod(data.createdAt, period)) eventsInPeriod += 1;
  }
  const attachmentsByType: Record<string, number> = {};
  let attachmentsWithMarkdown = 0;
  for (const { data } of attachments) {
    bucket(attachmentsByType, str(data.type));
    if (str(data.markdownContent)) attachmentsWithMarkdown += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    period: {
      label: period.label,
      start: period.start?.toISOString().slice(0, 10),
      end: period.end?.toISOString().slice(0, 10),
    },
    clients: {
      total: clients.length,
      newInPeriod: newClientsInPeriod,
      byStatus: clientsByStatus,
      byReferredByOrg: clientsByReferredByOrg,
      byReferralSource: clientsByReferralSource,
      byParish: clientsByParish,
    },
    submissions: {
      total: submissions.length,
      inPeriod: submissionsInPeriod,
      byForm: submissionsByForm,
      byFormInPeriod: submissionsByFormInPeriod,
      withAiSummary: aiSummaries,
      /** Referral-partner attribution + AI-inferred parish from B1 intake answers. */
      intakeReferredBy,
      intakeParishes,
    },
    sessions: {
      total: sessions.length,
      inPeriod: sessionsInPeriod,
      minutesInPeriod,
      byServiceAreaInPeriod: sessionsByArea,
      minutesByServiceAreaInPeriod: minutesByArea,
    },
    training: {
      registrationsTotal: training.length,
      registrationsInPeriod,
      attendedInPeriod,
      attendanceRateInPeriod: registrationsInPeriod ? Math.round((attendedInPeriod / registrationsInPeriod) * 100) : null,
    },
    feedback: {
      responsesInPeriod: feedbackCount,
      avgNps: npsCount ? Math.round((npsTotal / npsCount) * 10) / 10 : null,
      avgRating: ratingCount ? Math.round((ratingTotal / ratingCount) * 10) / 10 : null,
    },
    outcomes: {
      claimsByStatus,
      verifiedByMeasure,
    },
    capital: {
      packagesTotal: capital.length,
      packagesInPeriod: capitalPackagesInPeriod,
      amountSoughtUsd: money(capitalSoughtCents),
    },
    proposals: {
      total: proposals.length,
      inPeriod: proposalsInPeriod,
      submitted: proposalsSubmitted,
      awarded: proposalsAwarded,
      awardAmountUsd: money(awardCents),
    },
    servicePlans: { total: plans.length },
    baselines: { total: baselines.length },
    partners: { total: partners.length, byStatus: partnersByStatus, executedPct },
    invoices: { byStatus: invoicesByStatus, amountByPeriod: invoicesByPeriod },
    kpiTargets: activeTargets,
    stories: { published: storiesPublished, shareStoryConsents: shareStory },
    exits: { inPeriod: exitCount, avgNps: exitNpsCount ? Math.round((exitNpsTotal / exitNpsCount) * 10) / 10 : null },
    platform: {
      usersTotal: users.length,
      usersByRole,
      newUsersInPeriod: usersInPeriod,
      eventsInPeriod,
      attachmentsByType,
      attachmentsWithMarkdown,
    },
  };
}

/**
 * Single-client data pack for deep-dive reports. Includes redacted submission
 * values, the client's LIFT lifecycle records, and sampled markdown extracted
 * from their uploaded documents (capability statements, worksheets).
 */
export async function collectClientDataPack(liftClientId: string, period: ReportPeriod): Promise<Record<string, unknown>> {
  const db = requireDb();
  const clientDoc = await db.collection(COLLECTIONS.LIFT_CLIENTS).doc(liftClientId).get();
  if (!clientDoc.exists) throw new Error("Client not found");
  const client = clientDoc.data() as Record<string, unknown>;

  const [
    submissions, sessions, outcomes, capital, proposals, plans, baselines,
    attachmentsAll, profileDoc,
  ] = await Promise.all([
    db.collection(COLLECTIONS.LIFT_FORM_SUBMISSIONS).where("liftClientId", "==", liftClientId).limit(200).get(),
    db.collection(COLLECTIONS.LIFT_SESSIONS).where("liftClientId", "==", liftClientId).limit(200).get(),
    db.collection(COLLECTIONS.LIFT_OUTCOME_CLAIMS).where("liftClientId", "==", liftClientId).limit(200).get(),
    db.collection(COLLECTIONS.LIFT_CAPITAL_PACKAGES).where("liftClientId", "==", liftClientId).limit(50).get(),
    db.collection(COLLECTIONS.LIFT_PROPOSAL_RESPONSES).where("liftClientId", "==", liftClientId).limit(50).get(),
    db.collection(COLLECTIONS.LIFT_SERVICE_PLANS).where("liftClientId", "==", liftClientId).limit(50).get(),
    db.collection(COLLECTIONS.LIFT_BASELINES).where("liftClientId", "==", liftClientId).limit(20).get(),
    fetchAll(COLLECTIONS.MEMBER_ATTACHMENTS),
    db.collection(COLLECTIONS.LIFT_CLIENT_PROFILES).doc(liftClientId).get(),
  ]);

  const ownerUid = str(client.ownerUid);
  const clientAttachments = attachmentsAll.filter(({ data }) => data.userId === ownerUid);
  const attachmentExcerpts = clientAttachments
    .filter(({ data }) => str(data.markdownContent))
    .slice(0, ATTACHMENT_SAMPLE_LIMIT)
    .map(({ data }) => ({
      fileName: str(data.originalFileName),
      type: str(data.type),
      excerpt: str(data.markdownContent).slice(0, ATTACHMENT_EXCERPT_CHARS),
    }));

  const redactedClient: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(client)) {
    if (["contactEmail", "ownerUid"].includes(key)) continue;
    redactedClient[key] = value instanceof Timestamp ? value.toDate().toISOString() : value;
  }

  return {
    generatedAt: new Date().toISOString(),
    period: { label: period.label },
    client: redactedClient,
    submissions: submissions.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        formSlug: str(data.formSlug),
        formTitle: str(data.formTitle),
        status: str(data.status),
        submittedAt: toDate(data.createdAt)?.toISOString(),
        aiSummary: data.aiSummary ?? null,
        values: redactValues((data.values as FormValues) ?? {}),
      };
    }),
    sessions: sessions.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        serviceArea: str(data.serviceArea), sessionType: str(data.sessionType),
        sessionDate: str(data.sessionDate), durationMinutes: data.durationMinutes ?? null,
        partnerOrg: str(data.partnerOrg), nextSteps: str(data.nextSteps),
      };
    }),
    outcomeClaims: outcomes.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        measure: str(data.measure), value: data.value ?? null, unit: str(data.unit),
        status: str(data.status), occurredAt: str(data.occurredAt),
      };
    }),
    capitalPackages: capital.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        purpose: str(data.purpose), amountSoughtUsd: money(centsOf(data, "amountSoughtCents")),
        capitalType: str(data.capitalType),
      };
    }),
    proposalResponses: proposals.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        noticeTitle: str(data.noticeTitle), go: data.go ?? null, submitted: data.submitted ?? null,
        outcome: str(data.outcome), awardAmountUsd: money(centsOf(data, "awardAmountCents")),
      };
    }),
    servicePlans: plans.docs.map((doc) => doc.data() as Record<string, unknown>),
    baselines: baselines.docs.map((doc) => doc.data() as Record<string, unknown>),
    profileValues: profileDoc.exists ? (profileDoc.data() as Record<string, unknown>).values ?? {} : {},
    attachmentExcerpts,
    attachmentCount: clientAttachments.length,
  };
}
