/**
 * One-time backfill: link consortiumMembers docs to their users docs.
 *
 * Many consortiumMembers lack firebaseUid, so admin approval / auto-approve
 * can't mirror status onto the users doc that the SAM.gov cron eligibility
 * query reads. This script matches member.emailPrimary → users.email and
 * stamps firebaseUid (+ updatedAt) on the member doc.
 *
 * Usage:
 *   npx tsx scripts/backfill-consortium-firebase-uids.ts           # dry-run
 *   npx tsx scripts/backfill-consortium-firebase-uids.ts --apply   # write changes
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

interface MemberDoc {
  id: string;
  emailPrimary?: string;
  firebaseUid?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
}

async function main() {
  const { db } = await import("../lib/firebase-admin");
  const { Timestamp } = await import("firebase-admin/firestore");
  if (!db) {
    console.error("Firebase Admin not initialized. Check .env.local credentials.");
    process.exit(1);
  }

  const apply = process.argv.includes("--apply");
  console.log(apply ? "=== APPLY MODE ===" : "=== DRY RUN (pass --apply to write) ===\n");

  const [membersSnap, usersSnap] = await Promise.all([
    db.collection("consortiumMembers").get(),
    db.collection("users").get(),
  ]);

  // Index users by normalized email
  const usersByEmail = new Map<string, string[]>();
  usersSnap.docs.forEach((d) => {
    const email = (d.data().email as string | undefined)?.trim().toLowerCase();
    if (!email) return;
    const list = usersByEmail.get(email) ?? [];
    list.push(d.id);
    usersByEmail.set(email, list);
  });

  const stats = { alreadyLinked: 0, linked: 0, noEmail: 0, unmatched: 0, ambiguous: 0 };
  const unmatched: MemberDoc[] = [];
  const ambiguous: { member: MemberDoc; userIds: string[] }[] = [];
  const batch = db.batch();

  for (const docSnap of membersSnap.docs) {
    const member = { id: docSnap.id, ...docSnap.data() } as MemberDoc;

    if (member.firebaseUid && usersSnap.docs.some((u) => u.id === member.firebaseUid)) {
      stats.alreadyLinked += 1;
      continue;
    }

    const email = member.emailPrimary?.trim().toLowerCase();
    if (!email) {
      stats.noEmail += 1;
      unmatched.push(member);
      continue;
    }

    const candidates = usersByEmail.get(email) ?? [];
    if (candidates.length === 0) {
      stats.unmatched += 1;
      unmatched.push(member);
      continue;
    }
    if (candidates.length > 1) {
      stats.ambiguous += 1;
      ambiguous.push({ member, userIds: candidates });
      continue;
    }

    if (member.firebaseUid === candidates[0]) {
      stats.alreadyLinked += 1;
      continue;
    }

    batch.update(docSnap.ref, {
      firebaseUid: candidates[0],
      updatedAt: Timestamp.now(),
    });
    stats.linked += 1;
    console.log(`LINK  ${member.id} (${email}) → users/${candidates[0]}${member.firebaseUid ? ` [replacing stale ${member.firebaseUid}]` : ""}`);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Members total:      ${membersSnap.size}`);
  console.log(`Already linked:     ${stats.alreadyLinked}`);
  console.log(`To link:            ${stats.linked}`);
  console.log(`No email on member: ${stats.noEmail}`);
  console.log(`No users match:     ${stats.unmatched}`);
  console.log(`Ambiguous (>1 user):${stats.ambiguous}`);

  if (unmatched.length) {
    console.log("\n--- Unmatched members ---");
    unmatched.forEach((m) =>
      console.log(`  ${m.id}  ${m.emailPrimary ?? "(no email)"}  ${[m.firstName, m.lastName].filter(Boolean).join(" ") || "-"}`)
    );
  }
  if (ambiguous.length) {
    console.log("\n--- Ambiguous members (manual review) ---");
    ambiguous.forEach(({ member, userIds }) =>
      console.log(`  ${member.id}  ${member.emailPrimary}  → candidates: ${userIds.join(", ")}`)
    );
  }

  if (!apply) {
    console.log("\nDry run — re-run with --apply to write changes.");
    return;
  }
  if (stats.linked > 0) {
    await batch.commit();
    console.log(`\nApplied ${stats.linked} firebaseUid link(s).`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
