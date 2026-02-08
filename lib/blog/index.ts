import { BlogPost, BlogCategory, BLOG_CATEGORIES } from "./types";
import { usManufacturingPosts } from "./us-manufacturing";
import { criticalMineralsPosts } from "./critical-minerals";
import { defenseContractingCmmcPosts } from "./defense-contracting-cmmc";
import { accessToCapitalPosts } from "./access-to-capital";
import { opportunityZonesPosts } from "./opportunity-zones";
import { crossCuttingTopicsPosts } from "./cross-cutting-topics";
import { thoughtLeadershipPosts } from "./thought-leadership";
import { getLinkedinImportedPosts } from "./linkedin-imports";

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
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

/** All blog posts including static ones (kept for backward compat) */
export const allBlogPosts: BlogPost[] = staticBlogPosts;

/**
 * Fetch all blog posts including LinkedIn imports from Firestore.
 * Use this in server components and pages for the complete list.
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const imported = await getLinkedinImportedPosts();
  return [...staticBlogPosts, ...imported].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
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
