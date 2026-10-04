/**
 * Dry-run for the admin GovCon readiness scan.
 *
 * Replicates the merge logic of POST /api/admin/team-members/readiness-scan
 * without writing to Firestore or sending email: reads teamMembers,
 * consortiumMembers, and users; computes each member's readiness score;
 * prints the bucket distribution and per-member gaps.
 *
 * Usage:
 *   npx tsx scripts/readiness-scan-dry-run.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import type { CompanyIntelligence, StageSource } from "../lib/member-readiness";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const { db } = await import("../lib/firebase-admin");
  if (!db) {
    console.error("Firebase Admin not initialized. Check .env.local credentials.");
    process.exit(1);
  }
  const {
    computeMemberReadiness,
    resolveMemberCi,
    deriveReadinessStage,
    bucketForScore,
    READINESS_BUCKETS,
  } = await import("../lib/member-readiness");
  const { COLLECTIONS } = await import("../lib/schema");

  const [memberSnap, userSnap, consortiumSnap] = await Promise.all([
    db.collection(COLLECTIONS.TEAM_MEMBERS).get(),
    db.collection(COLLECTIONS.USERS).get(),
    db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).get(),
  ]);

  const userCiByEmail = new Map<string, CompanyIntelligence>();
  userSnap.docs.forEach((d) => {
    const email = (d.data().email as string | undefined)?.trim().toLowerCase();
    if (email && d.data().companyIntelligence) {
      userCiByEmail.set(email, d.data().companyIntelligence as CompanyIntelligence);
    }
  });

  const consortiumByEmail = new Map<string, StageSource>();
  consortiumSnap.docs.forEach((d) => {
    const data = d.data();
    const email = (data.emailPrimary as string | undefined)?.trim().toLowerCase();
    if (!email) return;
    consortiumByEmail.set(email, {
      companyIntelligence: data.companyIntelligence as CompanyIntelligence | undefined,
      onboardingStage: data.onboardingStage,
      onboardingComplete: data.onboardingComplete,
      consortiumOnboardingComplete: data.consortiumOnboardingComplete,
      aiMatchingActivated: data.aiMatchingActivated,
      readinessValidationStatus: data.readinessValidationStatus,
    });
  });

  const buckets = new Map(READINESS_BUCKETS.map((b) => [b.id, 0]));
  let contractReady = 0;
  let noEmail = 0;

  console.log(`teamMembers: ${memberSnap.size} | consortiumMembers: ${consortiumSnap.size} | users: ${userSnap.size}\n`);

  for (const docSnap of memberSnap.docs) {
    const member = { id: docSnap.id, ...docSnap.data() } as import("../lib/schema").TeamMemberDoc;
    const emailKey = member.emailPrimary?.trim().toLowerCase();
    const linked = emailKey ? consortiumByEmail.get(emailKey) : undefined;
    const userCi = emailKey ? userCiByEmail.get(emailKey) : undefined;
    const score = computeMemberReadiness(member, linked?.companyIntelligence, userCi);
    const effectiveCi = resolveMemberCi(member, linked?.companyIntelligence, userCi);
    const stage = deriveReadinessStage(member, linked);
    const bucket = bucketForScore(score.overallScore);
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
    if (score.overallScore >= 60) contractReady += 1;
    if (!member.emailPrimary) noEmail += 1;

    const name = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || member.id;
    const ciFlag = effectiveCi?.legalCompanyName ? "CI" : "no-CI";
    const linkedFlag = linked ? "linked" : "unlinked";
    const gap = score.gaps[0] ?? "";
    console.log(
      `${String(score.overallScore).padStart(3)}  ${bucket.padEnd(17)}  ${stage.padEnd(14)}  ${ciFlag.padEnd(6)} ${linkedFlag.padEnd(9)} ${name}${gap ? `  — ${gap}` : ""}`
    );
  }

  console.log("\n--- Bucket distribution ---");
  for (const b of READINESS_BUCKETS) {
    console.log(`${b.label.padEnd(28)} ${buckets.get(b.id) ?? 0}`);
  }
  console.log(`\nContract-ready (>=60): ${contractReady} / ${memberSnap.size}`);
  console.log(`Members with no email: ${noEmail}`);
  console.log("(dry run — nothing written, no emails sent)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
