/**
 * Enable the discount banner on the home page by setting
 * discountBannerEnabled: true in homePageSettings/default.
 *
 * Usage:
 * pnpm tsx scripts/enable-discount-banner.ts
 */

import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!SERVICE_ACCOUNT_PATH) {
  console.error("ERROR: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
const app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApp();
const db = getFirestore(app);

async function enableBanner(): Promise<void> {
  const ref = db.collection("homePageSettings").doc("default");
  await ref.set({ discountBannerEnabled: true, updatedAt: Timestamp.now() }, { merge: true });
  const snap = await ref.get();
  console.log("✓ discountBannerEnabled:", snap.data()?.discountBannerEnabled);
  console.log("✓ Discount banner is now enabled on the home page.");
}

enableBanner().catch(console.error);
