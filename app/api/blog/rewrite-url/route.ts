import { NextRequest, NextResponse } from "next/server";
import { load } from "cheerio";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { BLOG_CATEGORIES } from "@/lib/blog/types";
import { rewriteContent } from "@/lib/rewrite-content";
import {
  searchStockImage,
  downloadImageAsBase64,
  type StockImageResult,
} from "@/lib/stock-images";

const BLOG_IMPORTS_COLLECTION = "blogImports";
const VISIBILITY_COLLECTION = "blogVisibility";
const IMAGES_COLLECTION = "images";
const HERO_SLIDES_COLLECTION = "hero_slides";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

async function getNextHeroOrder(): Promise<number> {
  if (!db) return 0;

  const snapshot = await db
    .collection(HERO_SLIDES_COLLECTION)
    .orderBy("order", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return 0;
  const data = snapshot.docs[0].data();
  return (data.order || 0) + 1;
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(targetUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html",
        },
        signal: controller.signal,
        redirect: "follow",
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const $ = load(html);

    const getMeta = (name: string): string | undefined =>
      $(`meta[property="${name}"]`).attr("content") ||
      $(`meta[name="${name}"]`).attr("content") ||
      undefined;

    const title =
      getMeta("og:title") ||
      getMeta("twitter:title") ||
      $("title").first().text().trim() ||
      "Untitled Article";

    const description =
      getMeta("og:description") ||
      getMeta("twitter:description") ||
      getMeta("description") ||
      "";

    const imageUrl =
      getMeta("og:image") ||
      getMeta("twitter:image") ||
      undefined;

    // Extract keywords for tags
    const keywords = getMeta("keywords") || getMeta("article:tag");
    const tags = keywords
      ? keywords
          .split(/[,;]/)
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .slice(0, 8)
      : ["AI Rewrite", "Import"];

    // Strip non-content elements
    $(
      "script, style, nav, footer, header, aside, noscript, iframe, svg, form, " +
      "[class*='nav'], [class*='header'], [class*='footer'], [class*='sidebar'], " +
      "[id*='comment'], [class*='comment'], [class*='ad'], [class*='cookie']"
    ).remove();

    const contentRoot =
      $("article").length > 0 ? $("article") : $("main").length > 0 ? $("main") : $("body");

    const elements = contentRoot.find("h1, h2, h3, h4, h5, h6, p, li, blockquote");
    const paragraphs: string[] = [];

    elements.each((_, el) => {
      const tagName = el.tagName.toLowerCase();
      const text = $(el).text().trim().replace(/\s+/g, " ");
      if (!text || text.length < 3) return;

      if (tagName.startsWith("h")) {
        const level = parseInt(tagName.slice(1), 10);
        paragraphs.push(`${"#".repeat(Math.min(level, 6))} ${text}`);
      } else if (tagName === "li") {
        paragraphs.push(`- ${text}`);
      } else if (tagName === "blockquote") {
        paragraphs.push(`> ${text}`);
      } else {
        paragraphs.push(text);
      }
    });

    let rawContent = paragraphs
      .join("\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!rawContent) {
      return NextResponse.json(
        { error: "Could not extract article content from the provided URL" },
        { status: 422 }
      );
    }

    // Keep a reasonable size for the mock AI rewrite
    const contentToRewrite = rawContent.substring(0, 6000);
    const rewriteContext = `Title: ${title}\n\n${contentToRewrite}`;

    const rewritten = await rewriteContent({
      content: rewriteContext,
      purpose: "educate",
      audience: ["sme-owners", "government-contractors"],
      tone: "professional",
      uxPrinciples: ["clarity", "brevity"],
      contentType: "full",
    });

    // Use the rewritten text if it produced useful output, otherwise keep extracted raw content
    const articleContent =
      rewritten && rewritten.length >= 200 ? rewritten : rawContent;

    const slug = generateSlug(title);

    const existingDoc = await db
      .collection(BLOG_IMPORTS_COLLECTION)
      .doc(slug)
      .get();

    if (existingDoc.exists) {
      return NextResponse.json(
        { error: "A blog post with this title already exists" },
        { status: 409 }
      );
    }

    const wordCount = articleContent.split(/\s+/).filter((w) => w).length;
    const readTime = Math.max(3, Math.ceil(wordCount / 200));
    const excerpt =
      description ||
      (articleContent.length > 280
        ? articleContent.substring(0, 280).trim() + "..."
        : articleContent);

    // Find a matching stock image for the article
    const imageKeyword = `${title} ${tags.slice(0, 3).join(" ")}`.trim();
    const stockImage: StockImageResult = await searchStockImage(imageKeyword);

    // Download the stock image for the image manager
    let imageManagerId: string | null = null;
    let imageManagerUrl = stockImage.url;
    try {
      const { base64, mimeType, size } = await downloadImageAsBase64(
        stockImage.url
      );
      if (size <= 950 * 1024) {
        const imageDocRef = await db.collection(IMAGES_COLLECTION).add({
          name: `${title} - Stock Image`,
          description:
            stockImage.description || `Stock image for ${title}`,
          category: "marketing",
          mimeType,
          base64Data: base64,
          size,
          createdAt: Timestamp.now(),
          tags: [...tags.slice(0, 5), "stock", "ai-rewrite"],
          isActive: true,
          createdBy: "AI Rewrite",
          sourceUrl: imageManagerUrl,
          source: stockImage.source,
        });
        imageManagerId = imageDocRef.id;
      } else {
        console.warn("Stock image too large for image manager:", size);
      }
    } catch (imageError) {
      console.warn("Could not save stock image to image manager:", imageError);
    }

    const postData = {
      slug,
      title,
      excerpt,
      content: articleContent,
      author: "KDM & Associates",
      date: formatDate(new Date()),
      category: BLOG_CATEGORIES[0],
      tags,
      readTime,
      imageUrl: imageManagerUrl,
      linkedinUrl: targetUrl.toString(),
      importedAt: Timestamp.now(),
    };

    await db.collection(BLOG_IMPORTS_COLLECTION).doc(slug).set(postData);

    // Newly-rewritten articles start as hidden drafts
    await db.collection(VISIBILITY_COLLECTION).doc(slug).set(
      {
        slug,
        hidden: true,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    // Add a hero slide entry for the new article
    const heroId = `blog-hero-${slug}`;
    const nextOrder = await getNextHeroOrder();
    const heroSlide = {
      id: heroId,
      badge: "New Article",
      headline: title,
      middleLine: "",
      highlightedText: "Read",
      subheadline: excerpt,
      benefits: tags.slice(0, 3),
      primaryCta: {
        text: "Read Article",
        href: `/blog/${slug}`,
        action: "link",
      },
      secondaryCta: {
        text: "All Blogs",
        href: "/blog",
      },
      isPublished: false,
      order: nextOrder,
      backgroundType: "image",
      backgroundImage: imageManagerUrl,
      backgroundOverlay: true,
      backgroundOverlayOpacity: 60,
      fullScreenBg: true,
      showRibbon: true,
      ribbonColor: "dark",
      showWaves: false,
      highlightOnSecondLine: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await db.collection(HERO_SLIDES_COLLECTION).doc(heroId).set(heroSlide);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...postData,
          heroId,
          imageManagerId,
          imageUrl: imageManagerUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error rewriting article from URL:", error);
    const message =
      error instanceof Error ? error.message : "Failed to rewrite article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
