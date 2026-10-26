import { COLLECTIONS } from "@/lib/schema";
import { buildPrefill, fromClientRegistration, fromUserProfile } from "../crosswalk";
import type { CrosswalkKey, FieldValue, FormValues, LiftFormDoc } from "../types";
import { requireDb, type Requester } from "./context";
import { getLatestBaseline } from "./postprocess";

/**
 * Builds default answers for a signed-in client. Priority:
 * 1. LIFT client profile (answers given in earlier LIFT forms)
 * 2. Existing client registration (flows A1/A2), matched by login email
 * 3. Existing portal profile (flows A3/A5)
 */
export async function buildPrefillForRequester(form: LiftFormDoc, requester: Requester): Promise<FormValues> {
  const db = requireDb();
  const sources: Partial<Record<CrosswalkKey, FieldValue>>[] = [];

  const owned = await db.collection(COLLECTIONS.LIFT_CLIENTS).where("ownerUid", "==", requester.uid).limit(1).get();
  const liftClientId = owned.docs[0]?.id;
  if (liftClientId) {
    const profile = await db.collection(COLLECTIONS.LIFT_CLIENT_PROFILES).doc(liftClientId).get();
    const stored = (profile.data()?.values ?? {}) as Record<string, { value: FieldValue }>;
    sources.push(Object.fromEntries(Object.entries(stored).map(([key, entry]) => [key, entry.value])) as Partial<Record<CrosswalkKey, FieldValue>>);
  }

  if (requester.email) {
    const registration = await db.collection(COLLECTIONS.CLIENT_REGISTRATIONS).where("companyEmail", "==", requester.email).limit(1).get();
    if (registration.docs[0]) sources.push(fromClientRegistration(registration.docs[0].data()));
  }

  const user = await db.collection(COLLECTIONS.USERS).doc(requester.uid).get();
  if (user.exists) sources.push(fromUserProfile({ email: requester.email, ...user.data() }));

  const defaults = buildPrefill(form.fields, sources);

  if (liftClientId && form.fields.some((field) => field.key === "baselineRevenue")) {
    const baseline = await getLatestBaseline(liftClientId);
    if (typeof baseline?.revenueLast12MonthsCents === "number") defaults.baselineRevenue = baseline.revenueLast12MonthsCents / 100;
  }
  return defaults;
}
