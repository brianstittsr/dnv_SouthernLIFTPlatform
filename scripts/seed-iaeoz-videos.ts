/**
 * Seed IAEOZ Summit videos from iaeoz_summit_videos.json into Firestore
 *
 * Usage:
 *   npx ts-node scripts/seed-iaeoz-videos.ts
 *
 * Set GOOGLE_APPLICATION_CREDENTIALS to your service account key before running.
 */

import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

interface JsonVideo {
  id: string;
  title: string;
  url: string;
  description: string;
  year: number;
  type: string;
  speaker: string | null;
  organization: string | null;
  duration_seconds: number;
  view_count: number;
  thumbnail_url: string;
}

interface JsonData {
  channel: {
    name: string;
    handle: string;
    url: string;
    description: string;
  };
  videos_by_year: Record<string, JsonVideo[]>;
  speakers: Array<{
    name: string;
    organization: string | null;
    videos: string[];
  }>;
  statistics: {
    total_videos: number;
    years_covered: number[];
    videos_by_year_count: Record<string, number>;
    unique_speakers: number;
  };
}

const ALLOWED_TYPES = new Set([
  "presentation",
  "keynote",
  "panel",
  "workshop",
  "interview",
  "promo",
  "other",
]);

function normalizeType(type: string): string {
  const lower = type.toLowerCase().trim();
  if (ALLOWED_TYPES.has(lower)) return lower;
  return "other";
}

async function main() {
  // Initialize Firebase Admin if not already initialized
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }

  const db = admin.firestore();
  const collection = db.collection("iaeoz_videos");

  const jsonPath = path.resolve(process.cwd(), "iaeoz_summit_videos.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw) as JsonData;

  const allVideos = Object.entries(data.videos_by_year).flatMap(([year, videos]) =>
    videos.map((video) => ({ ...video, year: parseInt(year) }))
  );

  console.log(`Found ${allVideos.length} videos in JSON file`);

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const video of allVideos) {
    try {
      // Check if video already exists by YouTube ID
      const existing = await collection
        .where("youtubeId", "==", video.id)
        .limit(1)
        .get();

      if (!existing.empty) {
        console.log(`⏭️  Skipped (already exists): ${video.title}`);
        skipped++;
        continue;
      }

      await collection.add({
        youtubeId: video.id,
        title: video.title,
        description: video.description || "",
        url: video.url,
        year: video.year,
        type: normalizeType(video.type),
        speaker: video.speaker,
        organization: video.organization,
        durationSeconds: Math.round(video.duration_seconds || 0),
        viewCount: video.view_count || 0,
        thumbnailUrl: video.thumbnail_url || `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: "seed-script",
      });

      console.log(`✅ Added: ${video.title}`);
      added++;
    } catch (error) {
      console.error(`❌ Error adding video ${video.id}:`, error);
      errors++;
    }
  }

  console.log("\n📊 Seed Summary:");
  console.log(`   ✅ Added: ${added}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total: ${allVideos.length}`);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
