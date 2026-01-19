import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/content-migration/crawl
 * Start a new content crawl job
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
    const {
      targetUrl,
      maxPages = 100,
      crawlDelay = 1500,
      downloadImages = true,
      downloadDocuments = true,
    } = body;

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Target URL is required" },
        { status: 400 }
      );
    }

    // Create crawl job document
    const crawlJob = {
      targetUrl,
      maxPages,
      crawlDelay,
      downloadImages,
      downloadDocuments,
      status: "pending",
      progress: {
        totalPagesDiscovered: 0,
        pagesCrawled: 0,
        pagesRemaining: 0,
        imagesFound: 0,
        imagesDownloaded: 0,
        videosFound: 0,
        documentsFound: 0,
        documentsDownloaded: 0,
        errors: [],
      },
      createdBy: decodedToken.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const jobRef = await db.collection("contentMigrationJobs").add(crawlJob);

    // In a production environment, this would trigger a background job
    // For now, we return the job ID for polling
    return NextResponse.json({
      success: true,
      jobId: jobRef.id,
      message: "Crawl job created. Use the job ID to check status.",
    });
  } catch (error: any) {
    console.error("Error creating crawl job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create crawl job" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/content-migration/crawl
 * Get crawl job status
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

    if (jobId) {
      // Get specific job
      const jobDoc = await db.collection("contentMigrationJobs").doc(jobId).get();
      
      if (!jobDoc.exists) {
        return NextResponse.json(
          { error: "Job not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: jobDoc.id,
        ...jobDoc.data(),
      });
    } else {
      // Get all jobs
      const jobsSnapshot = await db
        .collection("contentMigrationJobs")
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();

      const jobs = jobsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({ jobs });
    }
  } catch (error: any) {
    console.error("Error fetching crawl jobs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch crawl jobs" },
      { status: 500 }
    );
  }
}
