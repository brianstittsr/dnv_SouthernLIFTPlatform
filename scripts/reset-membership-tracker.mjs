/**
 * Reset the membership tracker to 44 total slots and May 31 2026 deadline.
 * Run: node scripts/reset-membership-tracker.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
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
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    console.error("❌ Firebase env vars not set."); process.exit(1);
  }
}

const db = getFirestore();
const DEADLINE = new Date("2026-05-31T23:59:59Z");
const TOTAL_SLOTS = 50;
const CLAIMED_SLOTS = 4;
const REMAINING_SLOTS = 46;

async function reset() {
  const ref = db.collection("settings").doc("consortium-membership-tracker");
  const snap = await ref.get();

  const data = {
    totalSlots: TOTAL_SLOTS,
    remainingSlots: REMAINING_SLOTS,
    claimedSlots: CLAIMED_SLOTS,
    discountDeadline: Timestamp.fromDate(DEADLINE),
    updatedAt: Timestamp.now(),
  };

  if (!snap.exists) {
    await ref.set({ ...data, createdAt: Timestamp.now() });
  } else {
    await ref.update(data);
  }
  console.log(`✅ Tracker set — totalSlots: ${TOTAL_SLOTS}, claimed: ${CLAIMED_SLOTS}, remaining: ${REMAINING_SLOTS}, deadline: May 31 2026`);
  process.exit(0);
}

reset().catch(e => { console.error("💥", e); process.exit(1); });
