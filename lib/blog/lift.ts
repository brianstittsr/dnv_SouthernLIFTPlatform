/**
 * LIFT blog remapping — applies only when NEXT_PUBLIC_BRANDING_MODE=lift.
 *
 * Existing KDM article data is preserved; in LIFT mode the ten KDM categories
 * are presented as LIFT service-area topics. KDM mode is unaffected.
 */
import type { BlogCategory, BlogPost } from "./types";
import { BLOG_CATEGORIES } from "./types";
import { getProgramBranding } from "@/lib/branding";

/** Display categories for the LIFT blog (LIFT service areas + news). */
export const LIFT_BLOG_CATEGORIES = [
  "Business Formation & Entrepreneurship",
  "Capital Readiness",
  "Procurement Readiness",
  "Advanced Manufacturing (AM Lab)",
  "Digital & AI Adoption",
  "Agriculture & Rural Enterprise",
  "LIFT News & Success Stories",
] as const;

export type LiftBlogCategory = (typeof LIFT_BLOG_CATEGORIES)[number];

/** Maps each stored KDM category to the LIFT topic shown in LIFT mode. */
export const KDM_TO_LIFT_CATEGORY: Record<BlogCategory, LiftBlogCategory> = {
  "U.S. Manufacturing": "Advanced Manufacturing (AM Lab)",
  "Critical Minerals": "Procurement Readiness",
  "Defense Contracting & CMMC": "Procurement Readiness",
  "Opportunity Zones": "Procurement Readiness",
  "Contract Opportunities": "Procurement Readiness",
  "Supply Chain Resilience": "Procurement Readiness",
  "Access to Capital": "Capital Readiness",
  "AI & Cybersecurity": "Digital & AI Adoption",
  "Cross-Cutting Strategic Topics": "Business Formation & Entrepreneurship",
  "Thought Leadership & Case Studies": "LIFT News & Success Stories",
};

/** URL-safe slug for a display category (works for both modes). */
export function blogCategorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The category label to display for a post in the active branding mode. */
export function displayBlogCategory(post: BlogPost): string {
  const { isLift } = getProgramBranding();
  return isLift ? KDM_TO_LIFT_CATEGORY[post.category] : post.category;
}

/** Display categories in nav order for the active branding mode. */
export function getBlogCategories(): readonly string[] {
  const { isLift } = getProgramBranding();
  return isLift ? LIFT_BLOG_CATEGORIES : BLOG_CATEGORIES;
}

/** Resolve a URL slug back to a display category, or undefined. */
export function blogCategoryFromSlug(slug: string): string | undefined {
  return getBlogCategories().find((cat) => blogCategorySlug(cat) === slug);
}

/** True when the post belongs to the given display category in the active mode. */
export function postMatchesCategory(post: BlogPost, category: string): boolean {
  return displayBlogCategory(post) === category;
}

/** Fallback card image per display category in LIFT mode. */
const LIFT_FALLBACK_IMAGES: Record<LiftBlogCategory, string> = {
  "Business Formation & Entrepreneurship": "/images/blog/lift/entrepreneurship.jpg",
  "Capital Readiness": "/images/blog/lift/capital-readiness.jpg",
  "Procurement Readiness": "/images/blog/lift/procurement-readiness.jpg",
  "Advanced Manufacturing (AM Lab)": "/images/blog/lift/advanced-manufacturing.jpg",
  "Digital & AI Adoption": "/images/blog/lift/digital-ai.jpg",
  "Agriculture & Rural Enterprise": "/images/blog/lift/rural-enterprise.jpg",
  "LIFT News & Success Stories": "/images/blog/lift/success-stories.jpg",
};

/** Card/hero image for a post: its own image, else the mode-appropriate fallback. */
export function blogPostImage(post: BlogPost): string | undefined {
  if (post.imageUrl) return post.imageUrl;
  const { isLift } = getProgramBranding();
  if (isLift) return LIFT_FALLBACK_IMAGES[KDM_TO_LIFT_CATEGORY[post.category]];
  return undefined;
}
