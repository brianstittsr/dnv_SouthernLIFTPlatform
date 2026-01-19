import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const OUTPUT_DIR = "docs/content-migration/crawled_site_content";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(token);
      
      // Verify admin role
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();
      if (userData?.role !== "admin" && userData?.svpRole !== "platform_admin") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { pages, images, videos, documents, report } = await request.json();

    // Create output directories
    const baseDir = path.join(process.cwd(), OUTPUT_DIR);
    const pagesDir = path.join(baseDir, "pages");
    const imagesDir = path.join(baseDir, "media", "images");
    const videosDir = path.join(baseDir, "media", "videos");
    const documentsDir = path.join(baseDir, "media", "documents");

    await mkdir(pagesDir, { recursive: true });
    await mkdir(imagesDir, { recursive: true });
    await mkdir(videosDir, { recursive: true });
    await mkdir(documentsDir, { recursive: true });

    const savedFiles: string[] = [];

    // Save pages as JSON files
    if (pages && Array.isArray(pages)) {
      for (const page of pages) {
        const slug = page.slug || page.url.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 50);
        const filename = `${slug}.json`;
        const filepath = path.join(pagesDir, filename);
        await writeFile(filepath, JSON.stringify(page, null, 2));
        savedFiles.push(`pages/${filename}`);
      }
    }

    // Save images inventory
    if (images && Array.isArray(images)) {
      const imagesInventory = {
        totalImages: images.length,
        exportedAt: new Date().toISOString(),
        images: images.map((img: any) => ({
          id: img.id,
          sourceUrl: img.sourceUrl,
          alt: img.alt,
          title: img.title,
          dimensions: img.dimensions,
          format: img.format,
          context: img.context,
          parentPage: img.parentPage,
        })),
      };
      const filepath = path.join(imagesDir, "images-inventory.json");
      await writeFile(filepath, JSON.stringify(imagesInventory, null, 2));
      savedFiles.push("media/images/images-inventory.json");
    }

    // Save videos inventory
    if (videos && Array.isArray(videos)) {
      const videosInventory = {
        totalVideos: videos.length,
        exportedAt: new Date().toISOString(),
        videos: videos.map((vid: any) => ({
          id: vid.id,
          platform: vid.platform,
          videoUrl: vid.videoUrl,
          embedCode: vid.embedCode,
          title: vid.title,
          description: vid.description,
          thumbnail: vid.thumbnail,
          parentPage: vid.parentPage,
        })),
      };
      const filepath = path.join(videosDir, "videos-inventory.json");
      await writeFile(filepath, JSON.stringify(videosInventory, null, 2));
      savedFiles.push("media/videos/videos-inventory.json");
    }

    // Save documents inventory
    if (documents && Array.isArray(documents)) {
      const documentsInventory = {
        totalDocuments: documents.length,
        exportedAt: new Date().toISOString(),
        documents: documents.map((doc: any) => ({
          id: doc.id,
          fileUrl: doc.fileUrl,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          linkText: doc.linkText,
          parentPage: doc.parentPage,
        })),
      };
      const filepath = path.join(documentsDir, "documents-inventory.json");
      await writeFile(filepath, JSON.stringify(documentsInventory, null, 2));
      savedFiles.push("media/documents/documents-inventory.json");
    }

    // Save migration report
    if (report) {
      const filepath = path.join(baseDir, "migration-report.json");
      await writeFile(filepath, JSON.stringify(report, null, 2));
      savedFiles.push("migration-report.json");
    }

    // Save site structure
    const siteStructure = {
      exportedAt: new Date().toISOString(),
      totalPages: pages?.length || 0,
      totalImages: images?.length || 0,
      totalVideos: videos?.length || 0,
      totalDocuments: documents?.length || 0,
      pages: pages?.map((p: any) => ({
        url: p.url,
        title: p.metadata?.title,
        pageType: p.pageType,
      })) || [],
    };
    const structureFilepath = path.join(baseDir, "site-structure.json");
    await writeFile(structureFilepath, JSON.stringify(siteStructure, null, 2));
    savedFiles.push("site-structure.json");

    // Save URL mapping CSV
    const urlMappings = pages?.map((p: any) => `"${p.url}","${p.slug || ""}","${p.metadata?.title || ""}"`) || [];
    const csvContent = `"Original URL","Slug","Title"\n${urlMappings.join("\n")}`;
    const csvFilepath = path.join(baseDir, "url-mapping.csv");
    await writeFile(csvFilepath, csvContent);
    savedFiles.push("url-mapping.csv");

    return NextResponse.json({
      success: true,
      outputDir: OUTPUT_DIR,
      savedFiles,
      summary: {
        pages: pages?.length || 0,
        images: images?.length || 0,
        videos: videos?.length || 0,
        documents: documents?.length || 0,
      },
    });
  } catch (error: any) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save content" },
      { status: 500 }
    );
  }
}
