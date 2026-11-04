/**
 * Firestore repository for the LIFT AI Interview Tool.
 * All access is server-side via Firebase Admin — the liftInterview*
 * collections deny client SDK access in firestore.rules.
 */

import { randomBytes } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { requireDb, serializeFirestore, stripUndefined } from "@/lib/form-builder/server/context";
import type { Requester } from "@/lib/form-builder/server/context";
import { COLLECTIONS } from "@/lib/schema";
import type {
  InterviewConfig,
  LiftInterviewDoc,
  LiftInterviewInviteDoc,
  LiftInterviewSessionDoc,
  SessionSource,
} from "../types";

const INTERVIEWS = COLLECTIONS.LIFT_INTERVIEWS;
const INVITES = COLLECTIONS.LIFT_INTERVIEW_INVITES;
const SESSIONS = COLLECTIONS.LIFT_INTERVIEW_SESSIONS;

// ─── Interviews ─────────────────────────────────────────────────────────────

export async function listInterviews(): Promise<LiftInterviewDoc[]> {
  const snap = await requireDb().collection(INTERVIEWS).get();
  return snap.docs
    .map((d) => serializeFirestore({ id: d.id, ...d.data() }) as LiftInterviewDoc)
    .filter((i) => i.status !== "archived")
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}

export async function getInterview(id: string): Promise<LiftInterviewDoc | null> {
  const snap = await requireDb().collection(INTERVIEWS).doc(id).get();
  if (!snap.exists) return null;
  return serializeFirestore({ id: snap.id, ...snap.data() }) as LiftInterviewDoc;
}

export async function getPublishedInterviewBySlug(slug: string): Promise<LiftInterviewDoc | null> {
  const snap = await requireDb()
    .collection(INTERVIEWS)
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return serializeFirestore({ id: d.id, ...d.data() }) as LiftInterviewDoc;
}

export async function createInterview(config: InterviewConfig, requester: Requester): Promise<LiftInterviewDoc> {
  const db = requireDb();
  const slug = `${config.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "interview"}-${randomBytes(3).toString("hex")}`;
  const now = Timestamp.now();
  const ref = db.collection(INTERVIEWS).doc();
  const doc = stripUndefined({
    ...config,
    slug,
    status: "draft",
    version: 0,
    publicLinkEnabled: false,
    analytics: { invitesSent: 0, sessionsStarted: 0, sessionsCompleted: 0 },
    createdByUid: requester.uid,
    createdByName: requester.name,
    createdAt: now,
    updatedAt: now,
  });
  await ref.set(doc);
  return serializeFirestore({ id: ref.id, ...doc }) as unknown as LiftInterviewDoc;
}

/**
 * Save config edits. Editing a published interview returns it to draft so a
 * fresh publish is required before new sessions use the changes (same rule
 * as the form builder).
 */
export async function updateInterview(id: string, config: InterviewConfig): Promise<LiftInterviewDoc | null> {
  const db = requireDb();
  const ref = db.collection(INTERVIEWS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const current = snap.data() as LiftInterviewDoc;
  await ref.set(
    stripUndefined({
      ...config,
      status: current.status === "published" ? "draft" : current.status,
      updatedAt: Timestamp.now(),
    }),
    { merge: true }
  );
  return getInterview(id);
}

export async function publishInterview(id: string): Promise<LiftInterviewDoc | null> {
  const db = requireDb();
  const ref = db.collection(INTERVIEWS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const version = Number(snap.data()?.version ?? 0) + 1;
  await ref.set({ status: "published", version, publishedAt: Timestamp.now(), updatedAt: Timestamp.now() }, { merge: true });
  return getInterview(id);
}

export async function setPublicLinkEnabled(id: string, enabled: boolean): Promise<void> {
  await requireDb().collection(INTERVIEWS).doc(id).set({ publicLinkEnabled: enabled, updatedAt: Timestamp.now() }, { merge: true });
}

export async function setInterviewStatus(id: string, status: "draft" | "published" | "archived"): Promise<void> {
  await requireDb().collection(INTERVIEWS).doc(id).set({ status, updatedAt: Timestamp.now() }, { merge: true });
}

export async function incrementInterviewCounter(
  id: string,
  field: "invitesSent" | "sessionsStarted" | "sessionsCompleted",
  amount = 1
): Promise<void> {
  try {
    await requireDb()
      .collection(INTERVIEWS)
      .doc(id)
      .set({ analytics: { [field]: FieldValue.increment(amount) } }, { merge: true });
  } catch (error) {
    console.error("Interview counter update failed:", error);
  }
}

// ─── Invites ────────────────────────────────────────────────────────────────

export async function listInvites(interviewId: string): Promise<LiftInterviewInviteDoc[]> {
  const snap = await requireDb().collection(INVITES).where("interviewId", "==", interviewId).get();
  return snap.docs
    .map((d) => serializeFirestore({ id: d.id, ...d.data() }) as LiftInterviewInviteDoc)
    .sort((a, b) => (b.sentAt ?? "").localeCompare(a.sentAt ?? ""));
}

export async function getInviteByToken(token: string): Promise<LiftInterviewInviteDoc | null> {
  const snap = await requireDb().collection(INVITES).where("token", "==", token).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return serializeFirestore({ id: d.id, ...d.data() }) as LiftInterviewInviteDoc;
}

export async function createInvite(data: Omit<LiftInterviewInviteDoc, "id">): Promise<LiftInterviewInviteDoc> {
  const ref = await requireDb().collection(INVITES).add(stripUndefined(data));
  return { id: ref.id, ...data };
}

export async function updateInvite(id: string, patch: Partial<LiftInterviewInviteDoc>): Promise<void> {
  await requireDb().collection(INVITES).doc(id).set(stripUndefined(patch), { merge: true });
}

// ─── Sessions ───────────────────────────────────────────────────────────────

export async function listSessions(interviewId: string): Promise<LiftInterviewSessionDoc[]> {
  const snap = await requireDb().collection(SESSIONS).where("interviewId", "==", interviewId).get();
  return snap.docs
    .map((d) => serializeFirestore({ id: d.id, ...d.data() }) as LiftInterviewSessionDoc)
    .sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));
}

export async function getSession(id: string): Promise<LiftInterviewSessionDoc | null> {
  const snap = await requireDb().collection(SESSIONS).doc(id).get();
  if (!snap.exists) return null;
  return serializeFirestore({ id: snap.id, ...snap.data() }) as LiftInterviewSessionDoc;
}

export async function getSessionForInvite(inviteId: string): Promise<LiftInterviewSessionDoc | null> {
  const snap = await requireDb().collection(SESSIONS).where("inviteId", "==", inviteId).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return serializeFirestore({ id: d.id, ...d.data() }) as LiftInterviewSessionDoc;
}

export async function createSession(
  interview: LiftInterviewDoc,
  identity: { respondentName: string; respondentEmail?: string; source: SessionSource; inviteId?: string }
): Promise<LiftInterviewSessionDoc> {
  const db = requireDb();
  const ref = db.collection(SESSIONS).doc();
  const doc = stripUndefined({
    interviewId: interview.id,
    interviewVersion: interview.version,
    interviewTitle: interview.title,
    inviteId: identity.inviteId,
    respondentName: identity.respondentName,
    respondentEmail: identity.respondentEmail,
    source: identity.source,
    status: "in_progress",
    sessionToken: randomBytes(24).toString("base64url"),
    messages: [],
    coveredTopics: [],
    questionIndex: 0,
    startedAt: Timestamp.now(),
  });
  await ref.set(doc);
  void incrementInterviewCounter(interview.id, "sessionsStarted");
  return serializeFirestore({ id: ref.id, ...doc }) as unknown as LiftInterviewSessionDoc;
}

export async function updateSession(id: string, patch: Partial<LiftInterviewSessionDoc>): Promise<void> {
  await requireDb().collection(SESSIONS).doc(id).set(stripUndefined(patch), { merge: true });
}

/** Look up a platform user's uid by email (for on-platform invite delivery). */
export async function findUserUidByEmail(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const snap = await requireDb().collection(COLLECTIONS.USERS).where("email", "==", normalized).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].id;
}
