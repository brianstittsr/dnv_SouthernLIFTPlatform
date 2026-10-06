/**
 * One-off cleanup: delete specific members/users by email or display name
 * across users, teamMembers, and consortiumMembers. Deletes the Firebase
 * Auth account for matched users docs too.
 *
 * Usage:
 *   npx tsx scripts/delete-users.ts            # list matches only
 *   npx tsx scripts/delete-users.ts --apply    # delete them
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const TARGETS = [
  "ronfrost@gmail.com",
  "didjdj@dhdhd.com",
  "cxvxcv@123123.com",
  "Strategic Value Plus Solutions (V+)",
  "sdfsdf sdfsdf",
  "Bruce Orman",
].map((s) => s.trim().toLowerCase());

const COLLECTIONS = ["users", "teamMembers", "consortiumMembers"] as const;

function docMatches(data: Record<string, unknown>): string | null {
  const email = (data.email as string | undefined)?.trim().toLowerCase();
  const emailPrimary = (data.emailPrimary as string | undefined)?.trim().toLowerCase();
  const name = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim().toLowerCase();
  const displayName = (data.displayName as string | undefined)?.trim().toLowerCase();
  const company = (data.company as string | undefined)?.trim().toLowerCase();

  for (const t of TARGETS) {
    if (email === t || emailPrimary === t || name === t || displayName === t || company === t) {
      return t;
    }
  }
  return null;
}

async function main() {
  const { db, auth } = await import("../lib/firebase-admin");
  if (!db || !auth) {
    console.error("Firebase Admin not initialized. Check .env.local credentials.");
    process.exit(1);
  }

  const apply = process.argv.includes("--apply");
  console.log(apply ? "=== APPLY MODE — deleting ===\n" : "=== DRY RUN (pass --apply to delete) ===\n");

  let deleted = 0;
  for (const col of COLLECTIONS) {
    const snap = await db.collection(col).get();
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const matched = docMatches(data);
      if (!matched) continue;

      const label =
        `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() ||
        (data.displayName as string) ||
        (data.company as string) ||
        docSnap.id;
      const email = (data.email as string) || (data.emailPrimary as string) || "no-email";
      console.log(`${col}/${docSnap.id}  ${label} <${email}>  (matched "${matched}")`);

      if (!apply) continue;

      await docSnap.ref.delete();
      deleted += 1;

      if (col === "users") {
        try {
          await auth.deleteUser(docSnap.id);
          console.log(`   deleted Firebase Auth user ${docSnap.id}`);
        } catch (e: unknown) {
          const code = (e as { code?: string }).code;
          console.log(`   auth user ${docSnap.id}: ${code === "auth/user-not-found" ? "not in Firebase Auth" : `delete failed — ${e}`}`);
        }
      }
    }
  }

  console.log(apply ? `\nDeleted ${deleted} docs.` : `\nFound matches above. Re-run with --apply to delete.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
