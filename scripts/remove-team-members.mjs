/**
 * Remove specific team members from Firestore teamMembers collection.
 * Run: node scripts/remove-team-members.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

// Load .env.local
const envPath = path.join(rootDir, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

const TO_REMOVE = [
  { firstName: "Bentley", lastName: "Charlemagne" },
  { firstName: "Gaylord", lastName: "Neal" },
  { firstName: "Walter", lastName: "Cotton III" },
];

async function remove() {
  for (const member of TO_REMOVE) {
    const fullName = `${member.firstName} ${member.lastName}`;
    for (const collName of ["teamMembers", "team_members"]) {
      const snap = await db.collection(collName)
        .where("firstName", "==", member.firstName)
        .where("lastName", "==", member.lastName)
        .get();
      if (snap.empty) continue;
      for (const docSnap of snap.docs) {
        await docSnap.ref.delete();
        console.log(`  🗑️  Deleted ${fullName} from '${collName}' (${docSnap.id})`);
      }
    }
  }
  console.log("\n✅ Done.");
  process.exit(0);
}

remove().catch(e => { console.error("💥", e); process.exit(1); });
