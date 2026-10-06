/**
 * One-off setup for Brian Stitt's linked profile
 * (users/FXTwwFSKJGerShxWa4WppneGkxU2 = bstitt@strategicvalueplus.com):
 *  1. Writes 10 skills/expertise entries to users.skills (the profile UI
 *     renders these via profile.expertise) and mirrors them to the
 *     teamMembers/consortiumMembers `expertise` fields.
 *  2. Generates AI NAICS suggestions via lib/samgov-ai (same code path as
 *     POST /api/samgov/naics-suggestions), persists them to
 *     samgovNaicsSuggestions/{uid}, and merges new codes into naicsCodes.
 *  3. Ensures aiMatchingActivated=true on users + teamMembers +
 *     consortiumMembers docs.
 *
 * Usage:
 *   npx tsx scripts/setup-brian-matching.ts            # dry run
 *   npx tsx scripts/setup-brian-matching.ts --apply    # write changes
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const USER_ID = "FXTwwFSKJGerShxWa4WppneGkxU2";
const TEAM_MEMBER_ID = "VSGfE2QoCMrxNrkbxzSH";
const CONSORTIUM_MEMBER_ID = "j8oGcR5HmVoWunQkGfcp";

const SKILLS: string[] = [
  "Robotics & Automation Systems",
  "Advanced Manufacturing Technologies",
  "Artificial Intelligence & Machine Learning",
  "Custom Software Development",
  "Systems Integration & Engineering",
  "IT Modernization & Cloud Migration",
  "Emerging Technology Strategy",
  "Solutions Architecture",
  "Federal IT Advisory & Consulting",
  "Technical Program Management",
];

async function main() {
  const { db } = await import("../lib/firebase-admin");
  const { suggestNaicsCodes } = await import("../lib/samgov-ai");
  const { Timestamp } = await import("firebase-admin/firestore");

  if (!db) {
    console.error("Firebase Admin not initialized. Check .env.local credentials.");
    process.exit(1);
  }

  const apply = process.argv.includes("--apply");
  console.log(apply ? "=== APPLY MODE ===\n" : "=== DRY RUN (pass --apply to write) ===\n");

  const userRef = db.collection("users").doc(USER_ID);
  const teamRef = db.collection("teamMembers").doc(TEAM_MEMBER_ID);
  const consRef = db.collection("consortiumMembers").doc(CONSORTIUM_MEMBER_ID);

  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    console.error(`users/${USER_ID} not found`);
    process.exit(1);
  }
  const userData = userSnap.data()!;
  console.log(`users/${USER_ID}  ${userData.firstName} ${userData.lastName} <${userData.email}>`);
  console.log(`Existing skills: ${JSON.stringify(userData.skills ?? [])}`);
  console.log(`Existing NAICS: ${JSON.stringify(userData.naicsCodes ?? [])}`);
  console.log(`aiMatchingActivated: ${userData.aiMatchingActivated ?? false}`);
  console.log(`matchingPreferences: ${JSON.stringify(userData.matchingPreferences ?? null)}`);

  const now = Timestamp.now();

  // --- 1. Skills ---
  console.log(`\n[1] Writing ${SKILLS.length} skills to users.skills`);
  for (const s of SKILLS) console.log(`   - ${s}`);
  if (apply) {
    await userRef.update({ skills: SKILLS, updatedAt: now });
    await teamRef.update({ expertise: SKILLS.join(", "), updatedAt: now }).catch(() => null);
    await consRef.update({ expertise: SKILLS.join(", "), updatedAt: now }).catch(() => null);
  }

  // --- 2. NAICS suggestions ---
  console.log("\n[2] Generating NAICS suggestions…");
  const suggestions = await suggestNaicsCodes({
    userId: USER_ID,
    name: [userData.firstName, userData.lastName].filter(Boolean).join(" ") || "Brian Stitt",
    companyName: userData.companyName || userData.company || userData.legalCompanyName || undefined,
    companyDescription: userData.companyDescription || undefined,
    naicsCodes: Array.isArray(userData.naicsCodes) ? userData.naicsCodes : undefined,
    certifications: Array.isArray(userData.certifications) ? userData.certifications : undefined,
    expertise: SKILLS.join(", "),
  });

  if (suggestions.length === 0) {
    console.log("   No suggestions returned (LLM key missing or empty profile data).");
  } else {
    for (const s of suggestions) {
      console.log(`   ${s.code} — ${s.title} (${s.confidence}%) ${s.reason}`);
    }
    if (apply) {
      await db.collection("samgovNaicsSuggestions").doc(USER_ID).set(
        {
          userId: USER_ID,
          suggestedCodes: suggestions,
          basedOn: userData.companyDescription
            ? String(userData.companyDescription).slice(0, 200)
            : "profile data",
          status: "active",
          generatedAt: now,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
      const existing: string[] = Array.isArray(userData.naicsCodes) ? userData.naicsCodes : [];
      const merged = Array.from(new Set([...existing, ...suggestions.map((s) => s.code)]));
      await userRef.update({ naicsCodes: merged, updatedAt: now });
      await teamRef.update({ naicsCodes: merged, updatedAt: now }).catch(() => null);
      await consRef.update({ naicsCodes: merged, updatedAt: now }).catch(() => null);
      console.log(`   naicsCodes now: ${merged.join(", ")}`);
    }
  }

  // --- 3. Activate AI Matching ---
  console.log("\n[3] Ensuring AI Matching is activated");
  if (apply) {
    await userRef.update({ aiMatchingActivated: true, aiMatchingActivatedAt: now, updatedAt: now });
    await teamRef
      .update({ aiMatchingActivated: true, aiMatchingActivatedAt: now, updatedAt: now })
      .catch(() => null);
    await consRef
      .update({ aiMatchingActivated: true, aiMatchingActivatedAt: now, updatedAt: now })
      .catch(() => null);
    console.log("   aiMatchingActivated=true on users + teamMembers + consortiumMembers");
  }

  console.log(apply ? "\nDone." : "\nRe-run with --apply to write changes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
