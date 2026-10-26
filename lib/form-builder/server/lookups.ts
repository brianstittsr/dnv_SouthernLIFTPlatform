import { COLLECTIONS } from "@/lib/schema";
import { LIFT_SERVICE_AREAS, LOOKUP_SOURCES, LOUISIANA_PARISHES } from "../controls";
import type { LookupSource } from "../types";
import { requireDb, type Requester } from "./context";

export interface LookupOption {
  value: string;
  label: string;
}

const STAFF_ROLES = ["admin", "team", "team_member", "consultant", "partner_user"];

const byLabel = (a: LookupOption, b: LookupOption) => a.label.localeCompare(b.label);

/** Returns options for a lookup source; staff-only sources require a staff requester. */
export async function getLookupOptions(source: LookupSource, requester: Requester | null): Promise<LookupOption[]> {
  const definition = LOOKUP_SOURCES.find((item) => item.value === source);
  if (!definition) throw new Error("Unknown lookup source");
  if (definition.staffOnly && !requester?.isStaff) throw new Error("Forbidden");

  if (source === "parishes") return LOUISIANA_PARISHES.map((parish) => ({ value: parish, label: `${parish} Parish` }));
  if (source === "service_areas") return LIFT_SERVICE_AREAS.map((area) => ({ value: area, label: area }));
  if (source === "manual_list") return [];

  const db = requireDb();
  if (source === "events") {
    const snapshot = await db.collection(COLLECTIONS.EVENTS).limit(200).get();
    return snapshot.docs.map((doc) => ({ value: doc.id, label: String(doc.data().title ?? "Untitled event") })).sort(byLabel);
  }
  if (source === "cohorts") {
    const snapshot = await db.collection(COLLECTIONS.COHORTS).limit(200).get();
    return snapshot.docs.map((doc) => ({ value: doc.id, label: String(doc.data().title ?? "Untitled cohort") })).sort(byLabel);
  }
  if (source === "partners") {
    const snapshot = await db.collection(COLLECTIONS.STRATEGIC_PARTNERS).limit(300).get();
    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const person = [data.firstName, data.lastName].filter(Boolean).join(" ");
        return { value: doc.id, label: String(data.company || person || "Partner") };
      })
      .sort(byLabel);
  }
  if (source === "advisors") {
    const snapshot = await db.collection(COLLECTIONS.USERS).where("role", "in", STAFF_ROLES).limit(300).get();
    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const name = String(data.displayName || [data.firstName, data.lastName].filter(Boolean).join(" ") || data.email || "Staff member");
        return { value: doc.id, label: name };
      })
      .sort(byLabel);
  }
  // lift_clients
  const snapshot = await db.collection(COLLECTIONS.LIFT_CLIENTS).limit(1000).get();
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return { value: doc.id, label: `${String(data.legalName ?? "Unnamed business")}${data.contactEmail ? ` (${data.contactEmail})` : ""}` };
    })
    .sort(byLabel);
}
