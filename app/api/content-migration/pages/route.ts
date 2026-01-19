import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * GET /api/content-migration/pages
 * Get crawled pages from a migration job
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
    const pageType = searchParams.get("pageType");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    let query = db
      .collection("contentMigrationJobs")
      .doc(jobId)
      .collection("pages")
      .orderBy("crawledAt", "desc")
      .limit(limit);

    if (pageType && pageType !== "all") {
      query = query.where("pageType", "==", pageType);
    }

    const pagesSnapshot = await query.get();

    const pages = pagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ pages });
  } catch (error: any) {
    console.error("Error fetching crawled pages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch crawled pages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content-migration/pages
 * Import a crawled page into the CMS
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
    const { jobId, pageId, targetSlug, publish = false } = body;

    if (!jobId || !pageId) {
      return NextResponse.json(
        { error: "Job ID and Page ID are required" },
        { status: 400 }
      );
    }

    // Get the crawled page
    const pageDoc = await db
      .collection("contentMigrationJobs")
      .doc(jobId)
      .collection("pages")
      .doc(pageId)
      .get();

    if (!pageDoc.exists) {
      return NextResponse.json(
        { error: "Crawled page not found" },
        { status: 404 }
      );
    }

    const pageData = pageDoc.data();

    // Create CMS page from crawled data
    const cmsPage = {
      slug: targetSlug || pageData?.slug,
      title: pageData?.title,
      metaDescription: pageData?.metadata?.metaDescription,
      metaKeywords: pageData?.metadata?.metaKeywords || [],
      ogImage: pageData?.seo?.ogImage,
      content: pageData?.content,
      pageType: pageData?.pageType,
      status: publish ? "published" : "draft",
      sourceUrl: pageData?.url,
      migratedFrom: {
        jobId,
        pageId,
        crawledAt: pageData?.crawledAt,
      },
      createdBy: decodedToken.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to public pages collection
    const cmsPageRef = await db.collection("publicPages").add(cmsPage);

    // Mark crawled page as imported
    await pageDoc.ref.update({
      imported: true,
      importedTo: cmsPageRef.id,
      importedAt: new Date().toISOString(),
      importedBy: decodedToken.uid,
    });

    return NextResponse.json({
      success: true,
      cmsPageId: cmsPageRef.id,
      message: `Page imported successfully as ${publish ? "published" : "draft"}`,
    });
  } catch (error: any) {
    console.error("Error importing page:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import page" },
      { status: 500 }
    );
  }
}
