import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

async function updateBanner() {
  const ref = db.collection("homePageSettings").doc("default");

  await ref.set(
    {
      discountBannerEnabled: true,
      discountBannerText:
        "Limited Time Offer: Join the KDM Consortium for just $625/month \u2014 Save $600 off the regular price! Offer ends at the close of the HubZone Conference.",
      discountBannerCtaText: "Join Now",
      discountBannerCtaLink: "/pricing",
      discountBannerBackgroundColor: "#f5a800",
      discountBannerTextColor: "#ffffff",
      updatedAt: admin.firestore.Timestamp.now(),
    },
    { merge: true }
  );

  console.log("✅ Banner updated in Firestore");
  console.log("   Text: Limited Time Offer: Join the KDM Consortium for just $625/month — Save $600 off the regular price! Offer ends at the close of the HubZone Conference.");
  console.log("   Background: #f5a800 (amber)");
}

updateBanner()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
