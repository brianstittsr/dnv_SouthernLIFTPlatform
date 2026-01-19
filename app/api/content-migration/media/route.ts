import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * GET /api/content-migration/media
 * Get media assets from a migration job
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Verify admin role
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const mediaType = searchParams.get("type") || "images"; // images, videos, documents
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const mediaSnapshot = await db
      .collection("contentMigrationJobs")
      .doc(jobId)
      .collection(mediaType)
      .orderBy("id")
      .limit(limit)
      .get();

    const media = mediaSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ [mediaType]: media });
  } catch (error: any) {
    console.error("Error fetching media assets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch media assets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content-migration/media
 * Import media asset to storage
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Verify admin role
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (userData?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { jobId, mediaId, mediaType, targetPath } = body;

    if (!jobId || !mediaId || !mediaType) {
      return NextResponse.json(
        { error: "Job ID, Media ID, and Media Type are required" },
        { status: 400 }
      );
    }

    // Get the media asset
    const mediaDoc = await db
      .collection("contentMigrationJobs")
      .doc(jobId)
      .collection(mediaType)
      .doc(mediaId)
      .get();

    if (!mediaDoc.exists) {
      return NextResponse.json(
        { error: "Media asset not found" },
        { status: 404 }
      );
    }

    const mediaData = mediaDoc.data();

    // In production, this would:
    // 1. Download the file from sourceUrl
    // 2. Upload to Firebase Storage
    // 3. Update the media record with the new storage URL

    // For now, we just mark it as imported
    await mediaDoc.ref.update({
      imported: true,
      importedPath: targetPath || mediaData?.localPath,
      importedAt: new Date().toISOString(),
      importedBy: decodedToken.uid,
    });

    return NextResponse.json({
      success: true,
      message: "Media asset marked for import",
    });
  } catch (error: any) {
    console.error("Error importing media:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import media" },
      { status: 500 }
    );
  }
}
