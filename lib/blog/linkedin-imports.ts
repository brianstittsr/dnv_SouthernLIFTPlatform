import { BlogPost, BLOG_CTA } from "./types";
import importedData from "@/data/linkedin-blog-imports.json";

interface ImportedPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  readTime: number;
  linkedinUrl?: string;
  importedAt: string;
}

/**
 * LinkedIn-imported blog posts loaded from the JSON data file.
 * Posts are added via the LinkedIn Extractor portal tool and
 * the /api/blog/import endpoint.
 */
export const linkedinImportedPosts: BlogPost[] = (
  importedData as ImportedPost[]
).map((post) => ({
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  content: post.content.includes("## Ready to Take the Next Step?")
    ? post.content
    : post.content + "\n\n" + BLOG_CTA,
  author: post.author,
  date: post.date,
  category: post.category as BlogPost["category"],
  tags: post.tags,
  readTime: post.readTime,
}));
