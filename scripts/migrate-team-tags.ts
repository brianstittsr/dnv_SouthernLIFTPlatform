/**
 * Migrate Team Member Tags
 *
 * One-time migration for the KDM Consortium / tag refactor:
 * - teamTag: "leadership"  -> add "kdm-leadership" to tags
 * - teamTag: "staff"       -> add "kdm-staff" to tags
 * - teamTag: "affiliate"   -> add "kdm-consortium" to tags
 * - isFoundingMember / membershipTier: "founder" -> add "kdm-founder", remove "kdm-consortium"
 * - Remove old tag values from tags: "leadership", "staff", "affiliate", "partner"
 *
 * Usage:
 *   npx tsx scripts/migrate-team-tags.ts [--dry-run]
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as fs from "fs";

const COLLECTION_NAME = "teamMembers";
const OLD_TAG_VALUES = new Set(["leadership", "staff", "affiliate", "partner"]);

interface MigrationData {
  teamTag?: string;
  tags?: string[];
  isFoundingMember?: boolean;
  membershipTier?: string;
  firstName?: string;
  lastName?: string;
}

function getNewTagsFromTeamTag(teamTag?: string): string[] {
  switch (teamTag) {
    case "leadership":
      return ["kdm-leadership"];
    case "staff":
      return ["kdm-staff"];
    case "affiliate":
      return ["kdm-consortium"];
    default:
      return [];
  }
}

function dedupe(tags: string[]): string[] {
  return Array.from(new Set(tags));
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  if (!getApps().length) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-service-account.json";
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(`Firebase service account file not found at: ${serviceAccountPath}`);
      process.exit(1);
    }
    initializeApp({
      credential: cert(JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"))),
    });
  }

  const db = getFirestore();
  const snapshot = await db.collection(COLLECTION_NAME).get();
  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as MigrationData;
    const name = `${data.firstName || ""} ${data.lastName || ""}`.trim() || doc.id;

    const newFromTeamTag = getNewTagsFromTeamTag(data.teamTag);
    const isFounder = data.isFoundingMember === true || data.membershipTier === "founder";

    let tags = data.tags ? [...data.tags] : [];

    // Backfill from deprecated teamTag field
    tags.push(...newFromTeamTag);

    if (isFounder) {
      tags.push("kdm-founder");
      // A founder should not be listed as a generic consortium member
      tags = tags.filter((t) => t !== "kdm-consortium");
    }

    // Remove old tag values that are no longer valid
    tags = tags.filter((t) => !OLD_TAG_VALUES.has(t));

    // Final cleanup
    tags = dedupe(tags);

    const originalTags = data.tags || [];
    const changed =
      JSON.stringify(originalTags.slice().sort()) !== JSON.stringify(tags.slice().sort());

    if (changed) {
      if (dryRun) {
        console.log(`[DRY-RUN] Would update ${name}: ${JSON.stringify(originalTags)} -> ${JSON.stringify(tags)}`);
      } else {
        await doc.ref.update({
          tags,
          updatedAt: Timestamp.now(),
        });
        console.log(`✅ Updated ${name}: ${JSON.stringify(originalTags)} -> ${JSON.stringify(tags)}`);
      }
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nMigration complete. ${dryRun ? "Would update" : "Updated"} ${updated} record(s), skipped ${skipped} record(s).`);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
