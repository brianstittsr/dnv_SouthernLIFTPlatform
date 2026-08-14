// One-off data fix: corrects a bug from a previous run of
// scripts/assign-platform-admin.ts, which had "Manpreet Hundal" hardcoded
// as the name and was run with Brian Stitt's email as the default argument.
// This overwrote Brian's Firestore user document with Manpreet's name.
//
// This script:
//   1. Restores Brian Stitt's correct name on his own account and makes him
//      the (primary) platform_admin.
//   2. Ensures Manpreet Hundal's own account (by her own email) is set up
//      as a secondary platform_admin, with her correct name intact.
//
// Run with: npx tsx scripts/fix-brian-manpreet-admin-roles.ts

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth, type UserRecord } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

interface FixOptions {
  email: string;
  firstName: string;
  lastName: string;
  isPrimaryAdmin: boolean;
}

async function fixUserRole({ email, firstName, lastName, isPrimaryAdmin }: FixOptions) {
  console.log(`\n🔍 Looking up user: ${email}`);

  let userRecord: UserRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Found auth user: ${userRecord.uid}`);
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      console.log(`⚠️  No Firebase Auth account exists yet for ${email}. Skipping — this user must sign up first.`);
      return;
    }
    throw error;
  }

  const displayName = `${firstName} ${lastName}`;

  // Set custom claims
  await auth.setCustomUserClaims(userRecord.uid, {
    role: "platform_admin",
    svpRole: "platform_admin",
    tenantId: "kdm-svp-platform",
  });
  console.log(`✅ Set custom claims: role=platform_admin`);

  // Correct the Firestore user document
  const userDocRef = db.collection("users").doc(userRecord.uid);
  const userDoc = await userDocRef.get();

  const payload = {
    firstName,
    lastName,
    displayName,
    role: "platform_admin",
    svpRole: "platform_admin",
    svpRoles: ["platform_admin"],
    tenantId: "kdm-svp-platform",
    isActive: true,
    updatedAt: Timestamp.now(),
  };

  if (userDoc.exists) {
    await userDocRef.update(payload);
    console.log(`✅ Corrected Firestore user document for ${displayName} (${email})`);
  } else {
    await userDocRef.set({
      id: userRecord.uid,
      email: userRecord.email,
      ...payload,
      emailVerified: true,
      createdAt: Timestamp.now(),
    });
    console.log(`✅ Created Firestore user document for ${displayName} (${email})`);
  }

  // Permissions document
  await db.collection("userPermissions").doc(userRecord.uid).set(
    {
      userId: userRecord.uid,
      role: "platform_admin",
      isPrimaryAdmin,
      tenantId: "kdm-svp-platform",
      permissions: [
        "admin:read",
        "admin:write",
        "admin:delete",
        "users:manage",
        "roles:manage",
        "settings:manage",
        "analytics:view",
        "audit:view",
      ],
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
  console.log(`✅ Updated permissions document (isPrimaryAdmin=${isPrimaryAdmin})`);
}

async function main() {
  // 1. Brian Stitt — primary Platform Admin (restores his correct name)
  await fixUserRole({
    email: "bstitt@strategicvalueplus.com",
    firstName: "Brian",
    lastName: "Stitt",
    isPrimaryAdmin: true,
  });

  // 2. Manpreet Hundal — secondary Platform Admin (her own account)
  await fixUserRole({
    email: "mhundal@kdmassociates.com",
    firstName: "Manpreet",
    lastName: "Hundal",
    isPrimaryAdmin: false,
  });

  console.log(`\n🎉 Done. Both users must sign out and sign back in for changes to take effect.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});
