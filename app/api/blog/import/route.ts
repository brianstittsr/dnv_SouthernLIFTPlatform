import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { BlogCategory } from "@/lib/blog/types";

interface ImportedBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: BlogCategory;
  tags: string[];
  readTime: number;
  linkedinUrl?: string;
  importedAt: string;
}

interface ImportRequest {
  articles: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    author: string;
    publishedDate: string;
    url: string;
    tags: string[];
    category: BlogCategory;
  }[];
}

const IMPORTS_FILE = path.join(
  process.cwd(),
  "data",
  "linkedin-blog-imports.json"
);

/**
 * GET - Retrieve all imported blog posts
 */
export async function GET() {
  try {
    const posts = await loadImportedPosts();
    return NextResponse.json({ data: posts });
  } catch (error) {
    console.error("Error loading imported posts:", error);
    return NextResponse.json({ data: [] });
  }
}

/**
 * POST - Import LinkedIn articles as blog posts
 */
export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json();
    const { articles } = body;

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { error: "No articles provided" },
        { status: 400 }
      );
    }

    // Load existing imports
    const existingPosts = await loadImportedPosts();
    const existingSlugs = new Set(existingPosts.map((p) => p.slug));

    // Convert articles to blog posts
    const newPosts: ImportedBlogPost[] = [];

    for (const article of articles) {
      const slug = generateSlug(article.title);

      // Skip duplicates
      if (existingSlugs.has(slug)) {
        continue;
      }

      const wordCount = article.content.split(/\s+/).filter((w) => w).length;

      newPosts.push({
        slug,
        title: article.title,
        excerpt:
          article.excerpt ||
          article.content.substring(0, 200) +
            (article.content.length > 200 ? "..." : ""),
        content: formatContentForBlog(article.content),
        author: article.author || "KDM & Associates",
        date: formatDate(article.publishedDate),
        category: article.category,
        tags: article.tags.length > 0 ? article.tags : ["LinkedIn", "Import"],
        readTime: Math.max(3, Math.ceil(wordCount / 200)),
        linkedinUrl: article.url || undefined,
        importedAt: new Date().toISOString(),
      });

      existingSlugs.add(slug);
    }

    if (newPosts.length === 0) {
      return NextResponse.json(
        {
          error: "All articles already exist as blog posts (duplicate slugs).",
          imported: 0,
        },
        { status: 409 }
      );
    }

    // Merge and save
    const allPosts = [...existingPosts, ...newPosts];
    await saveImportedPosts(allPosts);

    return NextResponse.json({
      data: newPosts,
      imported: newPosts.length,
      total: allPosts.length,
    });
  } catch (error) {
    console.error("Error importing blog posts:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to import articles",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove an imported blog post by slug
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter required" },
        { status: 400 }
      );
    }

    const posts = await loadImportedPosts();
    const filtered = posts.filter((p) => p.slug !== slug);

    if (filtered.length === posts.length) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    await saveImportedPosts(filtered);
    return NextResponse.json({ success: true, remaining: filtered.length });
  } catch (error) {
    console.error("Error deleting imported post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

// --- Helpers ---

async function loadImportedPosts(): Promise<ImportedBlogPost[]> {
  try {
    const data = await fs.readFile(IMPORTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveImportedPosts(posts: ImportedBlogPost[]): Promise<void> {
  const dir = path.dirname(IMPORTS_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(IMPORTS_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return new Date().toISOString().split("T")[0];
    }
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function formatContentForBlog(content: string): string {
  // Clean up the content; CTA is appended at read-time by linkedin-imports.ts
  return content.trim();
}
