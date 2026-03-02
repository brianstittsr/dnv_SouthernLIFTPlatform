import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * GET /api/content-migration/report
 * Get migration report for a job
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

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Get job data
    const jobDoc = await db.collection("contentMigrationJobs").doc(jobId).get();

    if (!jobDoc.exists) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const jobData = jobDoc.data();

    // Get pages count by type
    const pagesSnapshot = await db
      .collection("contentMigrationJobs")
      .doc(jobId)
      .collection("pages")
      .get();

    const pagesByType: Record<string, number> = {};
    let totalWordCount = 0;

    pagesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const pageType = data.pageType || "other";
      pagesByType[pageType] = (pagesByType[pageType] || 0) + 1;
      totalWordCount += data.wordCount || 0;
    });

    // Get media counts
    const imagesSnapshot = await db
      .collection("contentMigrationJobs")
      .doc(jobId)
      .collection("images")
      .get();

    const videosSnapshot = await db
      .collection("contentMigrationJobs")
      .doc(jobId)
      .collection("videos")
      .get();

    const documentsSnapshot = await db
      .collection("contentMigrationJobs")
      .doc(jobId)
      .collection("documents")
      .get();

    // Build report
    const report: {
      siteUrl: string;
      crawlDate: string;
      summary: {
        totalPages: number;
        pagesByType: Record<string, number>;
        totalImages: number;
        totalVideos: number;
        totalDocuments: number;
        totalWordCount: number;
      };
      contentAudit: {
        highValuePages: string[];
        outdatedContent: string[];
        duplicateContent: string[];
        missingMetadata: string[];
      };
      migrationPriority: {
        priority1: string[];
        priority2: string[];
        priority3: string[];
        archive: string[];
      };
      urlMapping: { oldUrl: string; newUrl: string; redirectType: string; notes: string }[];
      mediaOptimization: {
        imagesNeedingCompression: string[];
        imagesNeedingAltText: string[];
        brokenMediaLinks: string[];
      };
      contentGaps: string[];
      recommendations: string[];
    } = {
      siteUrl: jobData?.targetUrl,
      crawlDate: jobData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      summary: {
        totalPages: pagesSnapshot.size,
        pagesByType,
        totalImages: imagesSnapshot.size,
        totalVideos: videosSnapshot.size,
        totalDocuments: documentsSnapshot.size,
        totalWordCount,
      },
      contentAudit: {
        highValuePages: [],
        outdatedContent: [],
        duplicateContent: [],
        missingMetadata: [],
      },
      migrationPriority: {
        priority1: [],
        priority2: [],
        priority3: [],
        archive: [],
      },
      urlMapping: [],
      mediaOptimization: {
        imagesNeedingCompression: [],
        imagesNeedingAltText: [],
        brokenMediaLinks: [],
      },
      contentGaps: [],
      recommendations: [],
    };

    // Analyze pages for audit
    const pages = pagesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort by word count for high-value pages
    const sortedByContent = [...pages].sort((a: any, b: any) => (b.wordCount || 0) - (a.wordCount || 0));
    report.contentAudit.highValuePages = sortedByContent.slice(0, 10).map((p: any) => p.url);

    // Find pages missing metadata
    report.contentAudit.missingMetadata = pages
      .filter((p: any) => !p.metadata?.metaDescription)
      .map((p: any) => p.url);

    // Categorize by priority
    pages.forEach((page: any) => {
      const url = page.url;
      const type = page.pageType;

      if (["home", "contact", "services"].includes(type)) {
        report.migrationPriority.priority1.push(url);
      } else if (["about", "team", "case-study"].includes(type)) {
        report.migrationPriority.priority2.push(url);
      } else if (["blog", "resources"].includes(type)) {
        report.migrationPriority.priority3.push(url);
      } else {
        report.migrationPriority.archive.push(url);
      }

      // URL mapping
      report.urlMapping.push({
        oldUrl: url,
        newUrl: `/${page.slug}`,
        redirectType: "301",
        notes: "Auto-generated",
      });
    });

    // Analyze images
    const images = imagesSnapshot.docs.map((doc) => doc.data());
    report.mediaOptimization.imagesNeedingAltText = images
      .filter((img: any) => !img.alt)
      .map((img: any) => img.sourceUrl);

    report.mediaOptimization.brokenMediaLinks = images
      .filter((img: any) => !img.downloaded)
      .map((img: any) => img.sourceUrl);

    // Generate recommendations
    if (report.contentAudit.missingMetadata.length > 0) {
      report.recommendations.push(
        `Add meta descriptions to ${report.contentAudit.missingMetadata.length} pages`
      );
    }
    if (report.mediaOptimization.imagesNeedingAltText.length > 0) {
      report.recommendations.push(
        `Add alt text to ${report.mediaOptimization.imagesNeedingAltText.length} images`
      );
    }
    if (report.mediaOptimization.brokenMediaLinks.length > 0) {
      report.recommendations.push(
        `Fix ${report.mediaOptimization.brokenMediaLinks.length} broken media links`
      );
    }
    report.recommendations.push("Review all pages before publishing");
    report.recommendations.push("Configure URL redirects from old to new URLs");
    report.recommendations.push("Test all pages and media after migration");

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
