import { BlogPost, BlogCategory, BLOG_CATEGORIES } from "./types";
import { usManufacturingPosts } from "./us-manufacturing";
import { criticalMineralsPosts } from "./critical-minerals";
import { defenseContractingCmmcPosts } from "./defense-contracting-cmmc";
import { accessToCapitalPosts } from "./access-to-capital";
import { opportunityZonesPosts } from "./opportunity-zones";
import { crossCuttingTopicsPosts } from "./cross-cutting-topics";
import { thoughtLeadershipPosts } from "./thought-leadership";
import { getLinkedinImportedPosts } from "./linkedin-imports";
import { contractOpportunityPosts } from "./contract-opportunities";

export type { BlogPost, BlogCategory };
export { BLOG_CATEGORIES };

/** Static blog posts (hardcoded in source) */
const staticBlogPosts: BlogPost[] = [
  ...usManufacturingPosts,
  ...criticalMineralsPosts,
  ...defenseContractingCmmcPosts,
  ...accessToCapitalPosts,
  ...opportunityZonesPosts,
  ...crossCuttingTopicsPosts,
  ...thoughtLeadershipPosts,
  ...contractOpportunityPosts,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

/** All blog posts including static ones (kept for backward compat / sitemap) */
export const allBlogPosts: BlogPost[] = staticBlogPosts;

/**
 * Fetch hidden slugs from Firestore blogVisibility collection.
 */
async function getHiddenSlugs(): Promise<Set<string>> {
  try {
    const { db } = await import("@/lib/firebase-admin");
    if (!db) return new Set();

    const snapshot = await db
      .collection("blogVisibility")
      .where("hidden", "==", true)
      .get();

    return new Set(snapshot.docs.map((doc) => doc.id));
  } catch {
    return new Set();
  }
}

/**
 * Fetch ALL blog posts (including hidden) for the management page.
 */
export async function getAllBlogPostsUnfiltered(): Promise<BlogPost[]> {
  const imported = await getLinkedinImportedPosts();
  return [...staticBlogPosts, ...imported].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Fetch all VISIBLE blog posts (filters out hidden ones).
 * Use this in server components and public-facing pages.
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const [all, hiddenSlugs] = await Promise.all([
    getAllBlogPostsUnfiltered(),
    getHiddenSlugs(),
  ]);
  return all.filter((post) => !hiddenSlugs.has(post.slug));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const all = await getAllBlogPosts();
  return all.find((post) => post.slug === slug);
}

export async function getBlogPostsByCategory(category: BlogCategory): Promise<BlogPost[]> {
  const all = await getAllBlogPosts();
  return all.filter((post) => post.category === category);
}

export async function getFeaturedBlogPosts(count: number = 3): Promise<BlogPost[]> {
  const all = await getAllBlogPosts();
  return all.slice(0, count);
}

export async function getAllBlogTags(): Promise<string[]> {
  const all = await getAllBlogPosts();
  const tags = new Set<string>();
  all.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const all = await getAllBlogPosts();
  return all.filter((post) => post.tags.includes(tag));
}
