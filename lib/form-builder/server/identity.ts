import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { FormValues } from "../types";
import { requireDb, type Requester } from "./context";

/** Field keys that LIFT templates use for identity (see lift-templates.ts). */
const NAME_KEYS = ["businessName", "companyName", "legalName"];
const EMAIL_KEYS = ["email", "contactEmail", "companyEmail"];
const UEI_KEYS = ["uei", "ueiNumber"];

const firstText = (values: FormValues, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = values[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
};

export interface ClientResolution {
  liftClientId?: string;
  created: boolean;
}

/**
 * Resolves the LIFT client a submission belongs to.
 * - Staff forms use the explicit `liftClientId` lookup answer.
 * - Signed-in clients link by owner uid, then UEI, then email.
 * - Public intake creates a draft client (matched by email when possible).
 */
export async function resolveClient(options: {
  requester: Requester | null;
  values: FormValues;
  allowCreate: boolean;
}): Promise<ClientResolution> {
  const db = requireDb();
  const clients = db.collection(COLLECTIONS.LIFT_CLIENTS);
  const { requester, values } = options;

  const explicit = typeof values.liftClientId === "string" ? values.liftClientId : undefined;
  if (explicit && requester?.isStaff) {
    const snapshot = await clients.doc(explicit).get();
    return { liftClientId: snapshot.exists ? snapshot.id : undefined, created: false };
  }

  if (requester) {
    const owned = await clients.where("ownerUid", "==", requester.uid).limit(1).get();
    if (owned.docs[0]) return { liftClientId: owned.docs[0].id, created: false };
  }

  const uei = firstText(values, UEI_KEYS)?.toUpperCase();
  const email = (firstText(values, EMAIL_KEYS) ?? requester?.email ?? undefined)?.toLowerCase();

  // A signed-in user whose UEI matches an existing client is a colleague at
  // the same company — link them to that business record regardless of who
  // owns it, and record them as an additional member.
  if (requester && uei) {
    const byUei = await clients.where("uei", "==", uei).limit(1).get();
    const match = byUei.docs[0];
    if (match) {
      await match.ref.update({
        memberUids: FieldValue.arrayUnion(requester.uid),
        updatedAt: Timestamp.now(),
      });
      return { liftClientId: match.id, created: false };
    }
  }

  const emailMatch = email
    ? (await clients.where("contactEmail", "==", email).limit(1).get()).docs[0]
    : undefined;
  if (emailMatch) {
    const data = emailMatch.data();
    // Public (signed-out) submissions only attach to unclaimed draft records, never to an owned client.
    if (!requester) {
      if (!data.ownerUid && data.status === "intake_draft") return { liftClientId: emailMatch.id, created: false };
    } else {
      if (data.ownerUid === requester.uid) return { liftClientId: emailMatch.id, created: false };
      // A signed-in user may claim an unowned record only when it matches their verified login email.
      const loginEmail = requester.email?.toLowerCase();
      if (!data.ownerUid && loginEmail && data.contactEmail === loginEmail) {
        await emailMatch.ref.update({ ownerUid: requester.uid, updatedAt: Timestamp.now() });
        return { liftClientId: emailMatch.id, created: false };
      }
    }
  }

  if (!options.allowCreate) return { created: false };

  const now = Timestamp.now();
  const ref = clients.doc();
  await ref.set({
    id: ref.id,
    legalName: firstText(values, NAME_KEYS) ?? "Unnamed business",
    status: "intake_draft",
    ownerUid: requester?.uid ?? null,
    contactEmail: email ?? null,
    uei: uei ?? null,
    source: requester ? "portal_form" : "public_intake",
    createdAt: now,
    updatedAt: now,
  });
  return { liftClientId: ref.id, created: true };
}
