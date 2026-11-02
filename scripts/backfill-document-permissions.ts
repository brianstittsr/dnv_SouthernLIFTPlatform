/**
 * One-time migration for per-document role visibility:
 * 1. Sets allowedRoles: ['all'] on every documents record missing the field,
 *    so member array-contains-any queries keep returning legacy docs.
 * 2. Merges "MOU" and "Partner Agreements" into
 *    platformSettings/global.dropdownLists.documentTypes so the new types
 *    appear in the upload picker (the settings list overrides page defaults).
 * Run: npx tsx --env-file=.env.local scripts/backfill-document-permissions.ts
 */
import { requireDb } from "../lib/form-builder/server/context";
import { COLLECTIONS } from "../lib/schema";

const DEFAULT_TYPES = [
  "Proposal",
  "Contract",
  "MOU",
  "Partner Agreements",
  "Template",
  "Report",
  "Invoice",
  "Other",
];
const BATCH_LIMIT = 400;

async function main() {
  const db = requireDb();

  const docsSnap = await db.collection(COLLECTIONS.DOCUMENTS).get();
  let batch = db.batch();
  let pending = 0;
  let backfilled = 0;
  for (const docSnap of docsSnap.docs) {
    if (Array.isArray(docSnap.data().allowedRoles)) continue;
    batch.set(docSnap.ref, { allowedRoles: ["all"] }, { merge: true });
    pending += 1;
    backfilled += 1;
    if (pending >= BATCH_LIMIT) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }
  if (pending > 0) await batch.commit();
  console.log(`documents total=${docsSnap.size} backfilled allowedRoles=${backfilled}`);

  const settingsRef = db.collection(COLLECTIONS.PLATFORM_SETTINGS).doc("global");
  const settingsSnap = await settingsRef.get();
  const existing = settingsSnap.data()?.dropdownLists?.documentTypes;
  const cleaned: string[] = Array.isArray(existing)
    ? existing.filter((value): value is string => typeof value === "string")
    : [];
  // The settings list overrides the page defaults — seed the canonical order
  // and preserve any custom entries admins added (inserted before "Other").
  const customs = cleaned.filter((type) => !DEFAULT_TYPES.includes(type));
  const otherIndex = DEFAULT_TYPES.indexOf("Other");
  const next = [
    ...DEFAULT_TYPES.slice(0, otherIndex),
    ...customs,
    ...DEFAULT_TYPES.slice(otherIndex),
  ];
  if (cleaned.join("") !== next.join("")) {
    await settingsRef.set(
      { dropdownLists: { documentTypes: next } },
      { merge: true }
    );
    console.log(`documentTypes updated (${next.length} types): ${next.join(", ")}`);
  } else {
    console.log(`documentTypes already complete (${next.length} types)`);
  }
}

main().catch((error) => {
  console.error("migration failed:", error);
  process.exit(1);
});
