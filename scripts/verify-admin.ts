import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = require("../serviceAccountKey.json");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const auth = getAuth();
const db = getFirestore();

async function verifyAndSetAdmin(email: string) {
  try {
    console.log(`\n🔍 Checking admin status for: ${email}\n`);

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ User found: ${userRecord.uid}`);

    // Check current custom claims
    console.log("\n📋 Current custom claims:");
    console.log(JSON.stringify(userRecord.customClaims, null, 2));

    // Check Firestore user document
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    if (userDoc.exists) {
      console.log("\n📄 Firestore user document:");
      console.log(JSON.stringify(userDoc.data(), null, 2));
    }

    // Set platform_admin role if not already set
    if (userRecord.customClaims?.role !== "platform_admin") {
      console.log("\n🔧 Setting platform_admin role...");
      await auth.setCustomUserClaims(userRecord.uid, {
        role: "platform_admin",
      });
      console.log("✅ platform_admin role set successfully!");
      console.log("\n⚠️  User must sign out and sign back in (or refresh token) for changes to take effect.");
    } else {
      console.log("\n✅ User already has platform_admin role");
      console.log("⚠️  If you're still getting 403 errors, refresh your token at:");
      console.log("   http://localhost:3000/portal/admin/refresh-token");
    }

    // Update Firestore document if needed
    if (!userDoc.exists || userDoc.data()?.svpRole !== "platform_admin") {
      console.log("\n🔧 Updating Firestore user document...");
      await db.collection("users").doc(userRecord.uid).set(
        {
          svpRole: "platform_admin",
          role: "platform_admin",
          email: userRecord.email,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      console.log("✅ Firestore document updated!");
    }

    console.log("\n✨ All done! Remember to refresh your token.\n");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Get email from command line or use default
const email = process.argv[2] || "bstitt@strategicvalueplus.com";
verifyAndSetAdmin(email).then(() => process.exit(0));
