import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function exportWebinars() {
  const { db } = await import("../lib/firebase-admin");
  const { COLLECTIONS } = await import("../lib/schema");

  if (!db) throw new Error("Database not initialized");

  console.log("📤 Exporting webinars from Firestore...");

  const webinarsRef = db.collection(COLLECTIONS.WEBINARS);
  const snapshot = await webinarsRef.get();

  const webinars = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamps to ISO strings for JSON export
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      publishedAt: data.publishedAt?.toDate().toISOString(),
      scheduledPublishAt: data.scheduledPublishAt?.toDate().toISOString(),
    };
  });

  const exportData = {
    exportDate: new Date().toISOString(),
    totalWebinars: webinars.length,
    webinars,
  };

  const outputPath = path.join(process.cwd(), "webinars-export.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(exportData, null, 2)
  );

  console.log(`✅ Successfully exported ${webinars.length} webinars to ${outputPath}`);
}

exportWebinars().catch(console.error);
