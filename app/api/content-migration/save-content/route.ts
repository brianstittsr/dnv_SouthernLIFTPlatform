import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const OUTPUT_DIR = "docs/content-migration/crawled_site_content";

// Category mapping for content organization
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  home: ["home", "index", "main", "landing"],
  products: ["product", "solutions", "offerings", "catalog"],
  services: ["service", "consulting", "support", "training"],
  news: ["news", "blog", "article", "press", "announcement"],
  about: ["about", "company", "team", "leadership", "mission", "vision"],
  media: ["media", "press-release", "coverage"],
  events: ["event", "webinar", "conference", "workshop", "seminar"],
  opportunities: ["opportunity", "career", "job", "opening", "partner"],
};

function categorizePages(pages: any[]) {
  const categorized: Record<string, any[]> = {
    home: [],
    products: [],
    services: [],
    news: [],
    about: [],
    media: [],
    events: [],
    opportunities: [],
    other: [],
  };

  pages.forEach(page => {
    const url = page.url.toLowerCase();
    const title = (page.metadata?.title || "").toLowerCase();
    const pageType = (page.pageType || "").toLowerCase();
    
    let categorized_flag = false;
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => url.includes(kw) || title.includes(kw) || pageType.includes(kw))) {
        categorized[category].push(page);
        categorized_flag = true;
        break;
      }
    }
    
    if (!categorized_flag) {
      categorized.other.push(page);
    }
  });

  return categorized;
}

function generateMarkdownContent(category: string, pages: any[], images: any[], videos: any[]) {
  let markdown = `# ${category.charAt(0).toUpperCase() + category.slice(1)} Content\n\n`;
  markdown += `> **Migration Guide**: This document contains crawled content from the original site.\n`;
  markdown += `> Review, edit, and merge this content into the existing ${category} section.\n\n`;
  markdown += `**Last Updated**: ${new Date().toISOString()}\n`;
  markdown += `**Total Pages**: ${pages.length}\n\n`;
  markdown += `---\n\n`;

  if (pages.length === 0) {
    markdown += `## No Content Found\n\n`;
    markdown += `No pages were found for the ${category} category during the crawl.\n`;
    markdown += `Consider creating new content for this section.\n\n`;
    return markdown;
  }

  pages.forEach((page, index) => {
    markdown += `## ${index + 1}. ${page.metadata?.title || "Untitled Page"}\n\n`;
    markdown += `**Source URL**: ${page.url}\n`;
    markdown += `**Word Count**: ${page.wordCount || 0}\n\n`;
    
    if (page.metadata?.metaDescription) {
      markdown += `**Meta Description**: ${page.metadata.metaDescription}\n\n`;
    }

    // Add main content
    if (page.content?.mainContent) {
      markdown += `### Content\n\n${page.content.mainContent}\n\n`;
    }

    // Add headings structure
    if (page.content?.headings && page.content.headings.length > 0) {
      markdown += `### Key Sections\n\n`;
      page.content.headings.forEach((heading: any) => {
        const level = "#".repeat(Math.min(heading.level + 2, 6));
        markdown += `${level} ${heading.text}\n\n`;
      });
    }

    // Add CTAs if present
    if (page.content?.ctaButtons && page.content.ctaButtons.length > 0) {
      markdown += `### Calls to Action\n\n`;
      page.content.ctaButtons.forEach((cta: any) => {
        markdown += `- **${cta.text}**: [${cta.href}](${cta.href})\n`;
      });
      markdown += `\n`;
    }

    // Add related images
    const pageImages = images.filter((img: any) => img.parentPage === page.url);
    if (pageImages.length > 0) {
      markdown += `### Images (${pageImages.length})\n\n`;
      pageImages.slice(0, 5).forEach((img: any) => {
        markdown += `- ![${img.alt || "Image"}](${img.sourceUrl})\n`;
        if (img.alt) markdown += `  - Alt: ${img.alt}\n`;
      });
      markdown += `\n`;
    }

    // Add related videos
    const pageVideos = videos.filter((vid: any) => vid.parentPage === page.url);
    if (pageVideos.length > 0) {
      markdown += `### Videos (${pageVideos.length})\n\n`;
      pageVideos.forEach((vid: any) => {
        markdown += `- **${vid.title || "Video"}**: [${vid.videoUrl}](${vid.videoUrl})\n`;
      });
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  });

  // Add content recommendations
  markdown += `## Content Recommendations\n\n`;
  markdown += `### Content Standards\n`;
  markdown += `- Ensure all content is clear, concise, and professional\n`;
  markdown += `- Use active voice and persuasive language\n`;
  markdown += `- Include relevant keywords for SEO\n`;
  markdown += `- Maintain consistent brand voice and tone\n\n`;
  
  markdown += `### Calls to Action\n`;
  markdown += `- Add clear CTAs on every page\n`;
  markdown += `- Use action-oriented language ("Get Started", "Learn More", "Contact Us")\n`;
  markdown += `- Make CTAs visually prominent\n`;
  markdown += `- Link CTAs to relevant conversion pages\n\n`;
  
  markdown += `### Missing Elements\n`;
  const pagesWithoutMeta = pages.filter(p => !p.metadata?.metaDescription);
  if (pagesWithoutMeta.length > 0) {
    markdown += `- ${pagesWithoutMeta.length} pages missing meta descriptions\n`;
  }
  const pagesWithoutCTA = pages.filter(p => !p.content?.ctaButtons || p.content.ctaButtons.length === 0);
  if (pagesWithoutCTA.length > 0) {
    markdown += `- ${pagesWithoutCTA.length} pages missing CTAs\n`;
  }
  markdown += `\n`;

  return markdown;
}

function generateEventCarouselContent(eventPages: any[], images: any[]) {
  let markdown = `# Home Page Hero Carousel - Events\n\n`;
  markdown += `> **Instructions**: Add these event slides to the home page hero rotating carousel.\n\n`;
  
  if (eventPages.length === 0) {
    markdown += `No events with dates found.\n`;
    return markdown;
  }

  markdown += `## Carousel Slides\n\n`;
  
  eventPages.forEach((event, index) => {
    markdown += `### Slide ${index + 1}: ${event.metadata?.title || "Event"}\n\n`;
    
    // Find hero image for this event
    const eventImages = images.filter((img: any) => img.parentPage === event.url);
    const heroImage = eventImages[0];
    
    if (heroImage) {
      markdown += `**Background Image**: ${heroImage.sourceUrl}\n`;
    }
    
    markdown += `**Headline**: ${event.metadata?.title || "Upcoming Event"}\n`;
    markdown += `**Description**: ${event.metadata?.metaDescription || event.content?.mainContent?.substring(0, 150) || ""}\n`;
    markdown += `**CTA Button**: "Learn More" or "Register Now"\n`;
    markdown += `**CTA Link**: ${event.url}\n`;
    markdown += `**Event Date**: [Extract from content]\n\n`;
    
    markdown += `\`\`\`json\n`;
    markdown += JSON.stringify({
      title: event.metadata?.title,
      description: event.metadata?.metaDescription,
      image: heroImage?.sourceUrl || "",
      ctaText: "Register Now",
      ctaLink: event.url,
      eventDate: "TBD",
    }, null, 2);
    markdown += `\n\`\`\`\n\n`;
    markdown += `---\n\n`;
  });

  return markdown;
}

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

    // Generate category-specific markdown files for content merging
    if (pages && Array.isArray(pages)) {
      const categorized = categorizePages(pages);
      const mergeDir = path.join(baseDir, "content-merge");
      await mkdir(mergeDir, { recursive: true });

      // Generate markdown for each category
      for (const [category, categoryPages] of Object.entries(categorized)) {
        if (category === "other") continue; // Skip "other" category
        
        const markdown = generateMarkdownContent(
          category,
          categoryPages,
          images || [],
          videos || []
        );
        
        const mdFilepath = path.join(mergeDir, `${category}-content.md`);
        await writeFile(mdFilepath, markdown);
        savedFiles.push(`content-merge/${category}-content.md`);
      }

      // Generate event carousel content for home page
      const eventPages = categorized.events || [];
      if (eventPages.length > 0) {
        const carouselMarkdown = generateEventCarouselContent(eventPages, images || []);
        const carouselFilepath = path.join(mergeDir, "home-carousel-events.md");
        await writeFile(carouselFilepath, carouselMarkdown);
        savedFiles.push("content-merge/home-carousel-events.md");
      }

      // Generate master merge guide
      let masterGuide = `# Content Migration & Merge Guide\n\n`;
      masterGuide += `**Generated**: ${new Date().toISOString()}\n\n`;
      masterGuide += `## Overview\n\n`;
      masterGuide += `This guide provides instructions for merging crawled content into the existing site.\n\n`;
      masterGuide += `## Content Categories\n\n`;
      
      for (const [category, categoryPages] of Object.entries(categorized)) {
        if (category === "other") continue;
        masterGuide += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
        masterGuide += `- **Pages Found**: ${categoryPages.length}\n`;
        masterGuide += `- **Merge File**: \`content-merge/${category}-content.md\`\n`;
        masterGuide += `- **Action**: ${categoryPages.length > 0 ? "Review and merge content" : "Create new content"}\n\n`;
      }

      masterGuide += `## Merge Instructions\n\n`;
      masterGuide += `1. **Review** each category markdown file\n`;
      masterGuide += `2. **Edit** content to match brand voice and standards\n`;
      masterGuide += `3. **Add** persuasive copy and clear CTAs\n`;
      masterGuide += `4. **Merge** into existing site sections\n`;
      masterGuide += `5. **Test** all links and functionality\n\n`;
      
      masterGuide += `## Content Standards Checklist\n\n`;
      masterGuide += `- [ ] Clear, concise, professional language\n`;
      masterGuide += `- [ ] Active voice and persuasive tone\n`;
      masterGuide += `- [ ] SEO-optimized with relevant keywords\n`;
      masterGuide += `- [ ] Consistent brand voice\n`;
      masterGuide += `- [ ] Clear CTAs on every page\n`;
      masterGuide += `- [ ] All images have alt text\n`;
      masterGuide += `- [ ] Meta descriptions for all pages\n`;
      masterGuide += `- [ ] Mobile-responsive formatting\n\n`;

      const masterFilepath = path.join(mergeDir, "MERGE-GUIDE.md");
      await writeFile(masterFilepath, masterGuide);
      savedFiles.push("content-merge/MERGE-GUIDE.md");
    }

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
