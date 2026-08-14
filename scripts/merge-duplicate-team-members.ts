/**
 * Merge duplicate team member profiles.
 *
 * Use case: a person has more than one teamMembers document. This script keeps
 * the "best" record (the one with the most data/tags), merges in any missing
 * values from the duplicate, updates linked user documents, deletes the
 * duplicate team member document, and optionally notifies the member by email.
 *
 * Usage:
 *   npx tsx scripts/merge-duplicate-team-members.ts --email <email> --dry-run
 *   npx tsx scripts/merge-duplicate-team-members.ts --email <email> --execute
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as fs from "fs";
import { sendEmail } from "../lib/email";

const TEAM_MEMBERS_COLLECTION = "teamMembers";
const USERS_COLLECTION = "users";

interface TeamMemberData {
  id: string;
  firstName?: string;
  lastName?: string;
  emailPrimary?: string;
  title?: string;
  expertise?: string;
  bio?: string;
  company?: string;
  avatar?: string;
  role?: string;
  status?: string;
  tags?: string[];
  firebaseUid?: string;
  companyIntelligence?: Record<string, unknown>;
  isFoundingMember?: boolean;
  membershipTier?: string;
  linkedIn?: string;
  website?: string;
  mobile?: string;
  [key: string]: unknown;
}

function getArgs() {
  const email = process.argv.find((arg, idx) => arg === "--email" && process.argv[idx + 1]) ? process.argv[process.argv.indexOf("--email") + 1] : undefined;
  const name = process.argv.find((arg, idx) => arg === "--name" && process.argv[idx + 1]) ? process.argv[process.argv.indexOf("--name") + 1] : undefined;
  const dryRun = process.argv.includes("--dry-run");
  const execute = process.argv.includes("--execute");
  const notify = process.argv.includes("--notify");
  return { email, name, dryRun, execute, notify };
}

function scoreRecord(data: TeamMemberData): number {
  let score = 0;
  if (data.tags && data.tags.length > 0) score += data.tags.length * 10;
  if (data.companyIntelligence) score += 20;
  if (data.avatar) score += 5;
  if (data.bio) score += 3;
  if (data.title || data.expertise) score += 2;
  if (data.firebaseUid) score += 5;
  return score;
}

function dedupeTags(tags: string[] | undefined): string[] {
  return Array.from(new Set(tags || []));
}

function mergeTags(primary: TeamMemberData, duplicate: TeamMemberData): string[] {
  return dedupeTags([...(primary.tags || []), ...(duplicate.tags || [])]);
}

function mergeCompanyIntelligence(primary: TeamMemberData, duplicate: TeamMemberData): Record<string, unknown> | undefined {
  const primaryCi = primary.companyIntelligence || {};
  const duplicateCi = duplicate.companyIntelligence || {};
  return { ...duplicateCi, ...primaryCi };
}

function buildEmailHtml(name: string, bugTrackerUrl: string): string {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #c9a227 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">KDM Profile Updated</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Hi ${name},</p>
        <p>Your KDM profile has been updated. Duplicate records were merged into a single profile so your company information, tags, and membership status are consistent across the platform.</p>
        <p>If anything looks incorrect or you have trouble accessing your account, please click the button below to submit an issue:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${bugTrackerUrl}" style="background: #c9a227; color: #1e3a5f; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
            Submit an Issue
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">If you have questions, contact us at <a href="mailto:kmoore@kdm-assoc.com" style="color: #c9a227;">kmoore@kdm-assoc.com</a>.</p>
      </div>
      <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="margin: 0; font-size: 14px;">KDM &amp; Associates — Federal Procurement &amp; Industrial Readiness</p>
      </div>
    </div>
  `;
}

async function main() {
  const { email, name, dryRun, execute, notify } = getArgs();

  if (!email && !name) {
    console.error("Please provide --email <email> or --name <name> to identify duplicates.");
    console.error("Usage: npx tsx scripts/merge-duplicate-team-members.ts --email <email> [--dry-run | --execute] [--notify]");
    process.exit(1);
  }

  if (!dryRun && !execute) {
    console.error("Please specify --dry-run or --execute.");
    process.exit(1);
  }

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

  let snapshot = await db.collection(TEAM_MEMBERS_COLLECTION).get();
  let candidates: TeamMemberData[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as TeamMemberData;
    data.id = docSnap.id;
    const matchesEmail = email && data.emailPrimary?.toLowerCase() === email.toLowerCase();
    const matchesName = name && `${data.firstName || ""} ${data.lastName || ""}`.trim().toLowerCase() === name.toLowerCase();
    if (matchesEmail || matchesName) {
      candidates.push(data);
    }
  });

  if (candidates.length < 2) {
    console.log(`Only ${candidates.length} record(s) found for ${email || name}. No merge needed.`);
    return;
  }

  // Sort by score descending; highest score is the primary record to keep.
  candidates.sort((a, b) => scoreRecord(b) - scoreRecord(a));
  const [primary, ...duplicates] = candidates;

  console.log(`\nFound ${candidates.length} matching records for ${email || name}`);
  console.log(`Primary record to keep: ${primary.id} (${primary.emailPrimary}, score ${scoreRecord(primary)})`);
  duplicates.forEach((d) => console.log(`Duplicate record: ${d.id} (${d.emailPrimary}, score ${scoreRecord(d)})`));

  const mergedTags = mergeTags(primary, duplicates[0]);
  const mergedCompanyIntelligence = mergeCompanyIntelligence(primary, duplicates[0]);

  console.log(`\nPlanned merge:`);
  console.log(`  Primary ID: ${primary.id}`);
  console.log(`  Merged tags: ${JSON.stringify(mergedTags)}`);
  console.log(`  Merged companyIntelligence keys: ${Object.keys(mergedCompanyIntelligence || {}).join(", ")}`);
  console.log(`  Duplicate IDs to delete: ${duplicates.map((d) => d.id).join(", ")}`);

  if (dryRun) {
    console.log("\nDry run complete. No changes made.");
    return;
  }

  // Execute merge
  const now = Timestamp.now();
  const primaryRef = db.collection(TEAM_MEMBERS_COLLECTION).doc(primary.id);
  const updates: Record<string, unknown> = {
    tags: mergedTags,
    updatedAt: now,
  };
  if (mergedCompanyIntelligence && Object.keys(mergedCompanyIntelligence).length > 0) {
    updates.companyIntelligence = mergedCompanyIntelligence;
  }
  // Prefer active status and any founding-member flags
  updates.status = "active";
  if (duplicates.some((d) => d.isFoundingMember)) {
    updates.isFoundingMember = true;
  }
  if (duplicates.some((d) => d.membershipTier)) {
    const tier = duplicates.find((d) => d.membershipTier)?.membershipTier;
    if (tier) updates.membershipTier = tier;
  }

  await primaryRef.update(updates);
  console.log(`Updated primary record ${primary.id}`);

  // Update any user documents that point to the duplicate records so they now point to the primary record.
  for (const duplicate of duplicates) {
    const usersSnapshot = await db.collection(USERS_COLLECTION).where("companyId", "==", duplicate.id).get();
    for (const userDoc of usersSnapshot.docs) {
      await userDoc.ref.update({
        companyId: primary.id,
        companyName: primary.company || userDoc.data().companyName,
        updatedAt: now,
      });
      console.log(`Updated user ${userDoc.id} companyId from ${duplicate.id} to ${primary.id}`);
    }
  }

  // Delete duplicate team member records
  for (const duplicate of duplicates) {
    await db.collection(TEAM_MEMBERS_COLLECTION).doc(duplicate.id).delete();
    console.log(`Deleted duplicate record ${duplicate.id}`);
  }

  console.log("\nMerge complete.");

  if (notify || true) {
    const targetEmail = primary.emailPrimary || email;
    if (targetEmail) {
      const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.kdm-assoc.com";
      const bugTrackerUrl = `${baseUrl}/portal/bug-tracker?open=new`;
      const displayName = `${primary.firstName || ""} ${primary.lastName || ""}`.trim() || "there";

      try {
        const result = await sendEmail({
          to: targetEmail,
          subject: "Your KDM Profile Has Been Updated",
          html: buildEmailHtml(displayName, bugTrackerUrl),
          text: `Hi ${displayName},\n\nYour KDM profile has been updated. Duplicate records were merged into a single profile.\n\nIf you have issues, submit a ticket here: ${bugTrackerUrl}\n\nKDM & Associates`,
        });

        if (result.success) {
          console.log(`Notification email sent to ${targetEmail} (messageId: ${result.messageId})`);
        } else {
          console.error(`Failed to send notification email: ${result.error}`);
        }
      } catch (emailError) {
        console.error("Error sending notification email:", emailError);
      }
    }
  }
}

main().catch((error) => {
  console.error("Merge failed:", error);
  process.exit(1);
});
