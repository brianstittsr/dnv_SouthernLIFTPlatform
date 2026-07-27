import * as dotenv from "dotenv";
import * as path from "path";

// Load production environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

import admin from "firebase-admin";

const COLLECTION_NAME = "consortiumPricing";

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  const db = admin.firestore();

  const existing = await db
    .collection(COLLECTION_NAME)
    .where("specialTag", "==", "HubZone Conference Special")
    .where("active", "==", true)
    .limit(1)
    .get();

  if (!existing.empty) {
    console.log("An active HubZone Conference Special offer already exists.");
    const doc = existing.docs[0];
    console.log(`  ID: ${doc.id}`);
    console.log(`  Name: ${doc.data().name}`);
    console.log(`  Price: $${doc.data().price}`);
    console.log("Skipping creation to avoid duplicates.");
    return;
  }

  const offer = {
    name: "HubZone Conference Special",
    priceType: "one-time" as const,
    price: 625,
    isPromotional: false,
    description:
      "Exclusive to 2026 National HubZone Conference attendees. Lifetime founding member status for a one-time payment.",
    specialTag: "HubZone Conference Special",
    features: [
      "Roundtables and Events — Opportunities to participate in strategic masterminds and discussions.",
      "Legacy Recognition — Inclusion in KDM Consortium's founding history.",
      "Strategic Input — Opportunities to shape priorities and programs.",
      "Charter Input — Opportunities to help develop initial standards.",
      "Leader Engagement — Opportunities to connect with key leaders.",
      "Thought Leadership — Visibility through events and communications.",
      "Pilot Consideration — Early consideration for selected initiatives.",
      "Leadership Consideration — Eligibility for inaugural leadership roles.",
    ],
    productType: "founders" as const,
    cta: "Claim Founders Spot",
    active: true,
    validUntil: admin.firestore.Timestamp.fromDate(new Date("2026-07-31T23:59:59-04:00")),
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  };

  const docRef = await db.collection(COLLECTION_NAME).add(offer);
  console.log(`Created HubZone Conference Special offer: ${docRef.id}`);
  console.log(`  Name: ${offer.name}`);
  console.log(`  Price: $${offer.price} one-time`);
  console.log(`  Active: ${offer.active}`);
}

main().catch((error) => {
  console.error("Failed to seed HubZone offer:", error instanceof Error ? error.message : error);
  process.exit(1);
});
