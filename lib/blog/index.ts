import { BlogPost, BlogCategory, BLOG_CATEGORIES } from "./types";
import { usManufacturingPosts } from "./us-manufacturing";
import { criticalMineralsPosts } from "./critical-minerals";
import { defenseContractingCmmcPosts } from "./defense-contracting-cmmc";
import { accessToCapitalPosts } from "./access-to-capital";
import { opportunityZonesPosts } from "./opportunity-zones";
import { crossCuttingTopicsPosts } from "./cross-cutting-topics";
import { thoughtLeadershipPosts } from "./thought-leadership";

export type { BlogPost, BlogCategory };
export { BLOG_CATEGORIES };

export const allBlogPosts: BlogPost[] = [
  ...usManufacturingPosts,
  ...criticalMineralsPosts,
  ...defenseContractingCmmcPosts,
  ...accessToCapitalPosts,
  ...opportunityZonesPosts,
  ...crossCuttingTopicsPosts,
  ...thoughtLeadershipPosts,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return allBlogPosts.find((post) => post.slug === slug);
}

export function getBlogPostsByCategory(category: BlogCategory): BlogPost[] {
  return allBlogPosts.filter((post) => post.category === category);
}

export function getFeaturedBlogPosts(count: number = 3): BlogPost[] {
  return allBlogPosts.slice(0, count);
}

export function getAllBlogTags(): string[] {
  const tags = new Set<string>();
  allBlogPosts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return allBlogPosts.filter((post) => post.tags.includes(tag));
}
