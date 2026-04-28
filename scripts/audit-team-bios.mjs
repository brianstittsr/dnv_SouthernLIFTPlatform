/**
 * Audit all team members in Firestore - check who has/lacks a full bio.
 * Run: node scripts/audit-team-bios.mjs
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
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
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") }) });
}

const db = getFirestore();

async function audit() {
  const snap = await db.collection("teamMembers").get();
  console.log(`\n📋 Found ${snap.size} team members in Firestore:\n`);
  const missing = [];
  for (const docSnap of snap.docs) {
    const d = docSnap.data();
    const name = `${d.firstName} ${d.lastName}`;
    const hasBio = d.bio && d.bio.trim().length > 80;
    if (hasBio) {
      console.log(`  ✅ ${name} — bio OK (${d.bio.length} chars)`);
    } else {
      console.log(`  ❌ ${name} — bio MISSING or too short`);
      missing.push({ id: docSnap.id, name, current: d.bio || "" });
    }
  }
  if (missing.length === 0) {
    console.log("\n🎉 All bios are present!");
  } else {
    console.log(`\n⚠️  ${missing.length} member(s) need bios:`);
    missing.forEach(m => console.log(`     - ${m.name} (${m.id}): "${m.current.substring(0, 60)}"`));
  }
  process.exit(0);
}
audit().catch(e => { console.error("💥", e); process.exit(1); });
