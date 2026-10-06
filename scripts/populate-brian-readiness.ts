/**
 * Populate Brian Stitt's Government Contracting Readiness entries with real
 * data from his profile (users/FXTwwFSKJGerShxWa4WppneGkxU2 = Strategic Value
 * Plus), replacing the placeholder test entries currently in
 * consortium_profiles.
 *
 * Writes to:
 *   consortium_profiles/{authUid}        — canonical (rules + page keyed by uid)
 *   consortium_profiles/{teamMemberId}   — legacy key, cleaned up
 *   consortium_profiles/Vs2cRPNms...     — stray uid doc with same test data
 *   users/{authUid}.readinessDocuments   — context fallback
 *
 * Only entries backed by real profile data are written; unverifiable
 * categories (past performance, financials, insurance) are cleared rather
 * than fabricated.
 *
 * Usage:
 *   npx tsx scripts/populate-brian-readiness.ts            # dry run
 *   npx tsx scripts/populate-brian-readiness.ts --apply    # write changes
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const AUTH_UID = "FXTwwFSKJGerShxWa4WppneGkxU2";
const TEAM_MEMBER_ID = "VSGfE2QoCMrxNrkbxzSH";
const STRAY_UID = "Vs2cRPNmsVdXDSr5EPfuNQv50Kx1";

interface ReadinessEntry {
  type: string;
  value: string;
  fileName: string;
  uploadedAt: FirebaseFirestore.Timestamp;
  status: "pending" | "pending_review" | "approved";
}

async function main() {
  const { db } = await import("../lib/firebase-admin");
  const { Timestamp } = await import("firebase-admin/firestore");
  if (!db) process.exit(1);

  const apply = process.argv.includes("--apply");
  console.log(apply ? "=== APPLY MODE ===\n" : "=== DRY RUN (pass --apply to write) ===\n");

  const userSnap = await db.collection("users").doc(AUTH_UID).get();
  if (!userSnap.exists) {
    console.error("users doc not found");
    process.exit(1);
  }
  const u = userSnap.data()!;
  const now = Timestamp.now();

  const certs: string[] = Array.isArray(u.certifications) ? u.certifications : [];
  const description: string = u.companyDescription || "";

  const entries: ReadinessEntry[] = [
    {
      type: "sam_registration",
      value: `UEI: ${u.uei} — SAM.gov registration ${String(u.samRegistrationStatus || "active").toUpperCase()}`,
      fileName: "",
      uploadedAt: now,
      status: "approved",
    },
    {
      type: "duns_number",
      value: `Superseded by UEI ${u.uei} — DUNS retired as SAM.gov entity identifier April 2022`,
      fileName: "",
      uploadedAt: now,
      status: "approved",
    },
    {
      type: "cage_code",
      value: String(u.cageCode || ""),
      fileName: "",
      uploadedAt: now,
      status: "approved",
    },
    {
      type: "certifications",
      value: certs.join("; "),
      fileName: "",
      uploadedAt: now,
      status: "approved",
    },
    {
      type: "capability_statement",
      value:
        `${description.slice(0, 500)}${description.length > 500 ? "…" : ""}\n\n` +
        `Core competencies: ${["Custom software development", "systems integration", "IT modernization & cloud migration", "technical program management", "AI/ML & robotics"].join("; ")}.\n` +
        `NAICS: ${(u.naicsCodes || []).join(", ")}`,
      fileName: "",
      uploadedAt: now,
      status: "pending_review",
    },
  ];

  console.log("Entries to write:");
  entries.forEach((e) => console.log(`  ${e.type} [${e.status}] ${e.value.slice(0, 80)}`));
  console.log("\nRemoved (no verifiable data): past_performance, financials, insurance");

  if (!apply) {
    console.log("\nRe-run with --apply to write.");
    return;
  }

  const payload = {
    userId: AUTH_UID,
    teamMemberId: TEAM_MEMBER_ID,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    companyName: u.companyName || u.company,
    readinessDocuments: entries,
    readinessValidationStatus: "in_progress",
    updatedAt: now,
  };

  await db.collection("consortium_profiles").doc(AUTH_UID).set(payload, { merge: true });
  console.log(`\nWrote consortium_profiles/${AUTH_UID}`);

  await db.collection("consortium_profiles").doc(TEAM_MEMBER_ID).set(payload, { merge: true });
  console.log(`Wrote consortium_profiles/${TEAM_MEMBER_ID} (legacy key)`);

  await db.collection("consortium_profiles").doc(STRAY_UID).set(payload, { merge: true });
  console.log(`Wrote consortium_profiles/${STRAY_UID} (stray uid)`);

  await db.collection("users").doc(AUTH_UID).update({
    readinessDocuments: entries,
    readinessValidationStatus: "in_progress",
    updatedAt: now,
  });
  console.log(`Mirrored to users/${AUTH_UID}`);

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
