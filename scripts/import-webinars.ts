import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function importWebinars() {
  const { db } = await import("../lib/firebase-admin");
  const admin = await import("firebase-admin");
  const { COLLECTIONS } = await import("../lib/schema");

  if (!db) throw new Error("Database not initialized");

  const exportPath = path.join(process.cwd(), "webinars-export.json");
  if (!fs.existsSync(exportPath)) {
    console.error(`❌ Export file not found at ${exportPath}`);
    return;
  }

  const exportData = JSON.parse(
    fs.readFileSync(exportPath, "utf-8")
  );

  console.log(`📦 Importing ${exportData.totalWebinars} webinars...`);

  const webinarsRef = db.collection(COLLECTIONS.WEBINARS);
  let imported = 0;

  for (const webinar of exportData.webinars) {
    const { id, ...data } = webinar;

    // Convert ISO strings back to Firestore Timestamps
    const docData = {
      ...data,
      createdAt: data.createdAt ? admin.firestore.Timestamp.fromDate(new Date(data.createdAt)) : admin.firestore.Timestamp.now(),
      updatedAt: data.updatedAt ? admin.firestore.Timestamp.fromDate(new Date(data.updatedAt)) : admin.firestore.Timestamp.now(),
      publishedAt: data.publishedAt ? admin.firestore.Timestamp.fromDate(new Date(data.publishedAt)) : null,
      scheduledPublishAt: data.scheduledPublishAt ? admin.firestore.Timestamp.fromDate(new Date(data.scheduledPublishAt)) : null,
    };

    // Use same ID
    const docRef = webinarsRef.doc(id);
    await docRef.set(docData);
    imported++;
    console.log(`✓ Imported: ${data.title} (${id})`);
  }

  console.log(`✅ Successfully imported ${imported} webinars`);
}

importWebinars().catch(console.error);
