import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { readdirSync, readFileSync } from "fs";
import path from "path";

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

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const adminDoc = await db.collection("users").doc(decodedToken.uid).get();
    const adminData = adminDoc.data();
    const isAdmin =
      decodedToken.role === "platform_admin" ||
      adminData?.role === "platform_admin" ||
      adminData?.svpRole === "platform_admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Read JSON file
    let jsonPath = path.join(process.cwd(), "iaeoz_summit_videos.json");
    let raw: string;

    try {
      raw = readFileSync(jsonPath, "utf-8");
    } catch (err) {
      return NextResponse.json(
        { error: "Could not find iaeoz_summit_videos.json" },
        { status: 500 }
      );
    }

    const data = JSON.parse(raw) as JsonData;
    const allVideos = Object.entries(data.videos_by_year).flatMap(([year, videos]) =>
      videos.map((video) => ({ ...video, year: parseInt(year) }))
    );

    const collection = db.collection("iaeoz_videos");

    let added = 0;
    let skipped = 0;
    let errors = 0;

    for (const video of allVideos) {
      try {
        const existing = await collection
          .where("youtubeId", "==", video.id)
          .limit(1)
          .get();

        if (!existing.empty) {
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
          thumbnailUrl:
            video.thumbnail_url || `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
          isActive: true,
          createdAt: FieldValue.serverTimestamp(),
          createdBy: decodedToken.uid,
        });

        added++;
      } catch (error) {
        console.error(`Error seeding video ${video.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: allVideos.length,
        added,
        skipped,
        errors,
      },
    });
  } catch (error: any) {
    console.error("Error seeding IAEOZ videos:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed videos" },
      { status: 500 }
    );
  }
}
