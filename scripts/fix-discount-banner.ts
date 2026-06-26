/**
 * Fix the discount banner settings in Firestore:
 * - Set background to gold/yellow
 * - Set text to dark navy
 * - Ensure enabled and text are correct
 *
 * Usage:
 * pnpm tsx scripts/fix-discount-banner.ts
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

async function fixBanner(): Promise<void> {
  const ref = db.collection("homePageSettings").doc("default");

  await ref.set({
    discountBannerEnabled: true,
    discountBannerText: "🎉 Limited Time Offer: Join the KDM Consortium for just $650/month — Save $600 off the regular price!",
    discountBannerCtaText: "Join Now",
    discountBannerCtaLink: "/pricing",
    discountBannerBackgroundColor: "#c9a227", // KDM gold/yellow
    discountBannerTextColor: "#1e3a5f",       // KDM navy
    updatedAt: Timestamp.now(),
  }, { merge: true });

  const snap = await ref.get();
  const data = snap.data();
  console.log("✓ Banner settings updated:");
  console.log("  enabled:    ", data?.discountBannerEnabled);
  console.log("  background: ", data?.discountBannerBackgroundColor);
  console.log("  text color: ", data?.discountBannerTextColor);
  console.log("  text:       ", data?.discountBannerText);
}

fixBanner().catch(console.error);
