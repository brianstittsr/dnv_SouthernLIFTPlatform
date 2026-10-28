import { MetadataRoute } from "next";
import { allBlogPosts } from "@/lib/blog";
import { blogCategorySlug, getBlogCategories } from "@/lib/blog/lift";
import { getProgramBranding } from "@/lib/branding";

const branding = getProgramBranding();

const KDM_PAGES: MetadataRoute.Sitemap = [
  // Tier 1 — highest priority, primary conversion / discovery pages
  { url: "", lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: "/pricing", lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
  { url: "/services", lastModified: new Date(), changeFrequency: "monthly", priority: 0.95 },
  { url: "/consortium", lastModified: new Date(), changeFrequency: "monthly", priority: 0.95 },
  { url: "/cmmc", lastModified: new Date(), changeFrequency: "monthly", priority: 0.95 },
  { url: "/cmmc-training", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  { url: "/marketplace", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },

  // Tier 2 — authority / trust pages
  { url: "/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
  { url: "/leadership", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: "/our-work", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: "/partners", lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
  { url: "/contact", lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
  { url: "/register", lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
  { url: "/faq", lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },

  // Tier 3 — 5 Pillars (high-value topical authority cluster)
  { url: "/5-pillars", lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
  { url: "/5-pillars/us-manufacturing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: "/5-pillars/defense-cmmc", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: "/5-pillars/critical-minerals", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: "/5-pillars/opportunity-zones", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: "/5-pillars/access-to-capital", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },

  // Tier 4 — Industries (topical cluster)
  { url: "/industries", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: "/industries/advanced-manufacturing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
  { url: "/industries/aerospace-defense", lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
  { url: "/industries/critical-minerals", lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
  { url: "/industries/economic-development", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: "/industries/capital-financial-services", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },

  // Tier 5 — Supporting / content pages
  { url: "/products", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: "/news", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: "/media", lastModified: new Date(), changeFrequency: "weekly", priority: 0.65 },
  { url: "/opportunities", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: "/oem", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: "/v-edge", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: "/antifragile", lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
  { url: "/affiliates", lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
  { url: "/consortium/members", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: "/core-competencies", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: "/values-mission-vision", lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
  { url: "/company", lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },

  // Tier 6 — Legal / low priority
  { url: "/privacy-policy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: "/terms-of-service", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: "/accessibility", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
];

// LIFT public site: no paid/commercial or KDM program pages.
const LIFT_PAGES: MetadataRoute.Sitemap = [
  { url: "", lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: "/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  { url: "/events", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: "/forms/lift-intake", lastModified: new Date(), changeFrequency: "monthly", priority: 0.95 },
  { url: "/contact", lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
  { url: "/register", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: "/faq", lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
  { url: "/resources", lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
  { url: "/partners", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: "/news", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: "/opportunities", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: "/privacy-policy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: "/terms-of-service", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: "/accessibility", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = branding.siteUrl;
  const pages = (branding.isLift ? LIFT_PAGES : KDM_PAGES).map((p) => ({
    ...p,
    url: `${baseUrl}${p.url}`,
  }));

  // Blog listing page
  const blogIndex: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Blog category pages (LIFT topics in LIFT mode)
  const blogCategories: MetadataRoute.Sitemap = getBlogCategories().map(
    (category) => ({
      url: `${baseUrl}/blog/category/${encodeURIComponent(blogCategorySlug(category))}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  // Individual blog posts
  const blogPosts: MetadataRoute.Sitemap = allBlogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...pages, ...blogIndex, ...blogCategories, ...blogPosts];
}
