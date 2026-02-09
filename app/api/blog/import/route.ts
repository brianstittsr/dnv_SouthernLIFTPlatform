import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import type { BlogCategory } from "@/lib/blog/types";

const COLLECTION = "blogImports";

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
    imageUrl?: string;
  }[];
}

/**
 * GET - Retrieve all imported blog posts
 */
export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ data: [] });
    }

    const snapshot = await db
      .collection(COLLECTION)
      .orderBy("importedAt", "desc")
      .get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const body: ImportRequest = await request.json();
    const { articles } = body;

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { error: "No articles provided" },
        { status: 400 }
      );
    }

    // Check for existing slugs to avoid duplicates
    const existingSnapshot = await db.collection(COLLECTION).get();
    const existingSlugs = new Set(
      existingSnapshot.docs.map((doc) => doc.data().slug as string)
    );

    const batch = db.batch();
    const newPosts: Record<string, unknown>[] = [];

    for (const article of articles) {
      const slug = generateSlug(article.title);

      if (existingSlugs.has(slug)) {
        continue;
      }

      const wordCount = article.content
        .split(/\s+/)
        .filter((w) => w).length;

      const postData = {
        slug,
        title: article.title,
        excerpt:
          article.excerpt ||
          article.content.substring(0, 200) +
            (article.content.length > 200 ? "..." : ""),
        content: article.content.trim(),
        author: article.author || "KDM & Associates",
        date: formatDate(article.publishedDate),
        category: article.category,
        tags:
          article.tags.length > 0 ? article.tags : ["LinkedIn", "Import"],
        readTime: Math.max(3, Math.ceil(wordCount / 200)),
        linkedinUrl: article.url || null,
        imageUrl: article.imageUrl || null,
        importedAt: Timestamp.now(),
      };

      const docRef = db.collection(COLLECTION).doc(slug);
      batch.set(docRef, postData);
      newPosts.push(postData);
      existingSlugs.add(slug);
    }

    if (newPosts.length === 0) {
      return NextResponse.json(
        {
          error:
            "All articles already exist as blog posts (duplicate slugs).",
          imported: 0,
        },
        { status: 409 }
      );
    }

    await batch.commit();

    return NextResponse.json({
      data: newPosts,
      imported: newPosts.length,
      total: existingSlugs.size,
    });
  } catch (error) {
    console.error("Error importing blog posts:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to import articles",
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
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter required" },
        { status: 400 }
      );
    }

    const docRef = db.collection(COLLECTION).doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting imported post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

// --- Helpers ---

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
