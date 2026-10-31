import { MetadataRoute } from "next";
import { allBlogPosts } from "@/lib/blog";
import { blogCategorySlug, getBlogCategories } from "@/lib/blog/lift";
import { getProgramBranding } from "@/lib/branding";

const branding = getProgramBranding();

// LIFT public site — no paid/commercial pages.
const PAGES: MetadataRoute.Sitemap = [
  { url: "", lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: "/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  { url: "/events", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: "/sign-up", lastModified: new Date(), changeFrequency: "monthly", priority: 0.95 },
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
  const pages = PAGES.map((p) => ({
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

  // Blog category pages
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
