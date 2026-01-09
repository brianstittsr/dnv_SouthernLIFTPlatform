import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kdm-assoc.com";

  // Static pages
  const staticPages = [
    "",
    "/about",
    "/services",
    "/team",
    "/partners",
    "/our-work",
    "/contact",
    "/faq",
    "/events",
    "/privacy",
    "/terms",
    "/membership",
  ];

  const staticSitemap: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route.startsWith("/services") ? 0.9 : 0.8,
  }));

  return staticSitemap;
}
