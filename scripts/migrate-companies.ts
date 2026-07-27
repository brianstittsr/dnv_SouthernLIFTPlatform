/**
 * Migration Script: Populate companies collection from existing user profiles
 *
 * This script:
 * 1. Scans all users in Firestore for a `companyName` (or `company`) field.
 * 2. Groups users by normalized company name.
 * 3. Creates a `companies` document for each unique company.
 * 4. Links each user to the company via `companyId` field on the user doc.
 *
 * Run with: npx tsx scripts/migrate-companies.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

function normalizeCompanyName(name: string): string {
  return name.trim().toLowerCase().replace(/[.,&]/g, "").replace(/\s+/g, " ").trim();
}

async function migrateCompanies() {
  console.log("🔍 Fetching all users...\n");

  const usersSnapshot = await db.collection("users").get();
  console.log(`Found ${usersSnapshot.size} users\n`);

  // Group users by normalized company name
  const companiesMap = new Map<
    string,
    {
      normalizedName: string;
      displayName: string;
      userIds: string[];
      firstUser: any;
    }
  >();

  usersSnapshot.forEach((docSnap) => {
    const userData = docSnap.data();
    const companyName = (userData.companyName || userData.company || "").trim();

    if (!companyName) return;

    const normalized = normalizeCompanyName(companyName);

    if (!companiesMap.has(normalized)) {
      companiesMap.set(normalized, {
        normalizedName: normalized,
        displayName: companyName,
        userIds: [],
        firstUser: userData,
      });
    }

    const entry = companiesMap.get(normalized)!;
    entry.userIds.push(docSnap.id);
  });

  console.log(`Found ${companiesMap.size} unique companies\n`);

  let created = 0;
  let linked = 0;

  for (const [normalized, entry] of companiesMap) {
    // Check if a company with this normalized name already exists
    const existingQuery = await db
      .collection("companies")
      .where("normalizedName", "==", normalized)
      .limit(1)
      .get();

    let companyId: string;

    if (!existingQuery.empty) {
      companyId = existingQuery.docs[0].id;
      console.log(`  ♻️  Company already exists: ${entry.displayName} (${companyId})`);
    } else {
      // Create the company document
      const companyData: Record<string, any> = {
        legalCompanyName: entry.displayName,
        displayName: entry.displayName,
        companyDescription: entry.firstUser.companyDescription || "",
        companyLogo: entry.firstUser.companyLogo || entry.firstUser.logo || "",
        website: entry.firstUser.website || "",
        industry: entry.firstUser.industry || "",
        address: {
          street: entry.firstUser.streetAddress || entry.firstUser.address?.street || "",
          city: entry.firstUser.city || entry.firstUser.address?.city || "",
          state: entry.firstUser.state || entry.firstUser.address?.state || "",
          zip: entry.firstUser.zip || entry.firstUser.address?.zip || "",
        },
        dunsNumber: entry.firstUser.dunsNumber || "",
        cageCode: entry.firstUser.cageCode || "",
        uei: entry.firstUser.uei || "",
        yearsInBusiness: entry.firstUser.yearsInBusiness || 0,
        annualRevenueRange: entry.firstUser.annualRevenueRange || "",
        employeeCountRange: entry.firstUser.employeeCountRange || "",
        naicsCodes: entry.firstUser.naicsCodes || [],
        certifications: entry.firstUser.certifications || [],
        capabilities: entry.firstUser.capabilities || [],
        memberUserIds: entry.userIds,
        ownerUserId: entry.userIds[0],
        tenantId: entry.firstUser.tenantId || "kdm-svp-platform",
        normalizedName: normalized,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const companyRef = await db.collection("companies").add(companyData);
      companyId = companyRef.id;
      created++;
      console.log(`  ✅ Created company: ${entry.displayName} (${companyId})`);
    }

    // Link all users to this company
    for (const userId of entry.userIds) {
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data()!;
        // Skip if already linked to this company
        if (userData.companyId === companyId) continue;

        await userRef.update({
          companyId,
          companyName: entry.displayName,
          updatedAt: Timestamp.now(),
        });
        linked++;
        console.log(`    🔗 Linked user ${userId} → ${entry.displayName}`);
      }
    }
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`  Companies created: ${created}`);
  console.log(`  Users linked: ${linked}`);

  process.exit(0);
}

migrateCompanies().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
