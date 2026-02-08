import { BlogPost, BLOG_CTA } from "./types";

/**
 * LinkedIn-imported blog posts fetched from Firestore.
 * Posts are added via the LinkedIn Extractor portal tool and
 * the /api/blog/import endpoint.
 *
 * This function is called at build time and at runtime for
 * server components. It uses the Firebase Admin SDK.
 */
export async function getLinkedinImportedPosts(): Promise<BlogPost[]> {
  try {
    const { db } = await import("@/lib/firebase-admin");
    if (!db) return [];

    const snapshot = await db
      .collection("blogImports")
      .orderBy("date", "desc")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const content = data.content || "";
      return {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt || content.substring(0, 200),
        content: content.includes("## Ready to Take the Next Step?")
          ? content
          : content + "\n\n" + BLOG_CTA,
        author: data.author || "KDM & Associates",
        date: data.date,
        category: data.category as BlogPost["category"],
        tags: data.tags || [],
        readTime: data.readTime || 5,
      };
    });
  } catch (error) {
    console.error("Error fetching LinkedIn imported posts:", error);
    return [];
  }
}

/**
 * Static empty array for synchronous imports.
 * Use getLinkedinImportedPosts() for async server-side fetching.
 */
export const linkedinImportedPosts: BlogPost[] = [];
