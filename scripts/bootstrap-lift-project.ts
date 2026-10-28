// Bootstrap the `southernliftplatform` Firebase project:
//   1. Creates/updates a platform admin (Auth user, custom claims, users doc, userPermissions)
//   2. Seeds the Year-1 liftKpiTargets doc with source-document conflicts flagged
//   3. Seeds and publishes the 14 LIFT lifecycle form definitions (B1-B10)
//
// Run with:
//   npx tsx scripts/bootstrap-lift-project.ts <email> <firstName> <lastName>
//   npx tsx scripts/bootstrap-lift-project.ts <email> <firstName> <lastName> --overwrite-forms
//
// Requires FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env.local
// pointing at the southernliftplatform service account.

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import type { UserRecord } from "firebase-admin/auth";

const args = process.argv.slice(2);
const [email, firstName, lastName] = args;
const overwriteForms = args.includes("--overwrite-forms");

if (!email || !firstName || !lastName) {
  console.error(
    "Usage: npx tsx scripts/bootstrap-lift-project.ts <email> <firstName> <lastName> [--overwrite-forms]"
  );
  process.exit(1);
}

if (
  !process.env.FIREBASE_PRIVATE_KEY &&
  (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL)
) {
  console.warn(
    "Service-account env vars incomplete — falling back to application-default " +
      "credentials (gcloud auth application-default login)."
  );
}

if (process.env.FIREBASE_PROJECT_ID !== "southernliftplatform") {
  console.warn(
    `WARNING: FIREBASE_PROJECT_ID is "${process.env.FIREBASE_PROJECT_ID}", expected "southernliftplatform". Continuing anyway.`
  );
}

async function main(): Promise<void> {
  // Import after dotenv so lib/firebase-admin initializes with the env vars.
  const { auth, db } = await import("../lib/firebase-admin");
  if (!auth || !db) {
    throw new Error("Firebase Admin failed to initialize — check the service-account env vars.");
  }

  const { COLLECTIONS } = await import("../lib/schema");
  const { formDefinitionSchema } = await import("../lib/form-builder/form-schema");
  const { LIFT_FORM_TEMPLATES } = await import("../lib/form-builder/lift-templates");
  const { writeAudit } = await import("../lib/form-builder/server/context");
  const { getFormBySlug, publishForm, saveFormDefinition } = await import(
    "../lib/form-builder/server/forms-repo"
  );

  // ------------------------------------------------------------------
  // 1. Platform admin user
  // ------------------------------------------------------------------
  const displayName = `${firstName} ${lastName}`;
  let userRecord: UserRecord;
  let tempPassword: string | undefined;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`Found existing auth user: ${userRecord.uid}`);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "auth/user-not-found") {
      tempPassword = `${randomUUID().replace(/-/g, "")}A1!`;
      userRecord = await auth.createUser({
        email,
        displayName,
        password: tempPassword,
        emailVerified: true,
      });
      console.log(`Created auth user: ${userRecord.uid}`);
    } else {
      throw error;
    }
  }

  await auth.setCustomUserClaims(userRecord.uid, {
    role: "platform_admin",
    svpRole: "platform_admin",
    tenantId: "southernliftplatform",
  });
  console.log("Set custom claims: role=platform_admin, tenantId=southernliftplatform");

  const userDocRef = db.collection("users").doc(userRecord.uid);
  const userDoc = await userDocRef.get();
  const baseUserFields = {
    firstName,
    lastName,
    displayName: userRecord.displayName || displayName,
    role: "platform_admin",
    svpRole: "platform_admin",
    tenantId: "southernliftplatform",
    isActive: true,
    updatedAt: Timestamp.now(),
  };
  if (userDoc.exists) {
    await userDocRef.update(baseUserFields);
  } else {
    await userDocRef.set({
      id: userRecord.uid,
      email: userRecord.email,
      emailVerified: true,
      createdAt: Timestamp.now(),
      ...baseUserFields,
    });
  }
  console.log(`Upserted users/${userRecord.uid}`);

  await db.collection("userPermissions").doc(userRecord.uid).set(
    {
      userId: userRecord.uid,
      role: "platform_admin",
      tenantId: "southernliftplatform",
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
  console.log("Upserted userPermissions");

  const requester = {
    uid: userRecord.uid,
    email: userRecord.email ?? email,
    name: displayName,
    isStaff: true,
    isAdmin: true,
  };

  // ------------------------------------------------------------------
  // 2. Year-1 KPI targets with flagged source conflicts
  //    (LIFT_Gap_Analysis.md: worksheet 08/31 vs Project Narrative)
  // ------------------------------------------------------------------
  const kpiRef = db.collection(COLLECTIONS.LIFT_KPI_TARGETS).doc("year-1-draft");
  await kpiRef.set({
    id: "year-1-draft",
    year: 1,
    targets: [
      { measure: "clientsServed", targetCount: 150, unit: "count" },
      { measure: "newBusinessStarts", targetCount: 20, unit: "count" },
      { measure: "contractsSecured", targetCount: 10, unit: "count" },
      { measure: "trainingActivities", targetCount: 40, unit: "count" },
      { measure: "capitalPackages", targetCount: 30, unit: "count" },
      { measure: "partnerAgreementsExecuted", targetCount: 8, unit: "count" },
      { measure: "clientsEnrolledQ2", targetCount: 50, unit: "count" },
      { measure: "workshopsDeliveredQ2", targetCount: 10, unit: "count" },
    ],
    flagConflicts: [
      {
        measure: "clientsServed",
        sources: [
          { document: "Performance Worksheet 08/31", value: 150 },
          { document: "Project Narrative", value: 100 },
        ],
        resolved: false,
      },
      {
        measure: "newBusinessStarts",
        sources: [
          { document: "Performance Worksheet 08/31", value: 20 },
          { document: "Project Narrative", value: 10 },
        ],
        resolved: false,
      },
      {
        measure: "contractsSecured",
        sources: [
          { document: "Performance Worksheet 08/31", value: 10 },
          { document: "Project Narrative", value: 5 },
        ],
        resolved: false,
      },
      {
        measure: "trainingActivities",
        sources: [
          { document: "Performance Worksheet 08/31", value: 40 },
          { document: "Project Narrative", value: 20 },
        ],
        resolved: false,
      },
      {
        measure: "capitalPackages",
        sources: [
          { document: "Performance Worksheet 08/31", value: 30 },
          { document: "Project Narrative", value: 15 },
        ],
        resolved: false,
      },
    ],
    effectiveFrom: "2026-09-01",
    effectiveTo: "2027-08-31",
    status: "draft",
    createdAt: Timestamp.now(),
  });
  console.log(`Seeded ${COLLECTIONS.LIFT_KPI_TARGETS}/year-1-draft (5 unresolved conflicts flagged)`);

  // ------------------------------------------------------------------
  // 3. LIFT lifecycle form definitions (B1-B10)
  // ------------------------------------------------------------------
  const results: { slug: string; action: "created" | "updated" | "skipped" }[] = [];
  for (const template of LIFT_FORM_TEMPLATES) {
    const definition = formDefinitionSchema.parse(template);
    const existing = await getFormBySlug(definition.slug, true);
    if (existing && !overwriteForms) {
      results.push({ slug: definition.slug, action: "skipped" });
      continue;
    }
    const saved = await saveFormDefinition(definition, requester, existing?.id);
    await publishForm(saved.id, requester);
    results.push({ slug: definition.slug, action: existing ? "updated" : "created" });
  }
  console.log("Form seed results:", results);
  await writeAudit("project.bootstrapped", "lift-bootstrap", requester, { results });

  if (tempPassword) {
    console.log(`\nTemporary password for ${email}: ${tempPassword}`);
    console.log("Share securely; the user should change it on first login.");
  }
  console.log("\nBootstrap complete. Have the admin sign out and back in to pick up new claims.");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("Bootstrap failed:", error);
  process.exit(1);
});
