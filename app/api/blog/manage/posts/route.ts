import { NextResponse } from "next/server";
import { getAllBlogPostsUnfiltered } from "@/lib/blog";

/**
 * GET - Retrieve all blog posts (including hidden) for the management page.
 * Returns posts with a source field indicating if they were imported.
 */
export async function GET() {
  try {
    const posts = await getAllBlogPostsUnfiltered();

    // Check which posts are imported from Firestore
    let importedSlugs = new Set<string>();
    try {
      const { db } = await import("@/lib/firebase-admin");
      if (db) {
        const snapshot = await db.collection("blogImports").get();
        importedSlugs = new Set(snapshot.docs.map((doc) => doc.id));
      }
    } catch {
      // Firestore not available, all posts are static
    }

    const data = posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      date: post.date,
      category: post.category,
      tags: post.tags,
      readTime: post.readTime,
      source: importedSlugs.has(post.slug) ? "imported" : "static",
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching blog posts for management:", error);
    return NextResponse.json({ data: [] });
  }
}
