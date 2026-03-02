/**
 * What Works Content Schema
 * Firebase collection schema for What Works articles/resources
 */

import { Timestamp } from "firebase/firestore";

export const WHAT_WORKS_COLLECTION = "whatWorks";

export interface WhatWorksDoc {
  id?: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: WhatWorksCategory;
  featuredImage: string;
  thumbnailImage?: string;
  videoUrl?: string;
  videoId?: string;
  videoPlatform?: "youtube" | "vimeo" | "other";
  author: string;
  authorImage?: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewCount: number;
  sourceUrl?: string;
  relatedArticles?: string[];
}

export type WhatWorksCategory = 
  | "newsletter"
  | "podcast"
  | "video"
  | "case-study"
  | "article"
  | "tdp"
  | "interview"
  | "spotlight";

export const WHAT_WORKS_CATEGORIES: { value: WhatWorksCategory; label: string }[] = [
  { value: "newsletter", label: "Newsletter" },
  { value: "podcast", label: "Podcast" },
  { value: "video", label: "Video" },
  { value: "case-study", label: "Case Study" },
  { value: "article", label: "Article" },
  { value: "tdp", label: "TDP Series" },
  { value: "interview", label: "Interview" },
  { value: "spotlight", label: "Spotlight" },
];

export function getCategoryLabel(category: WhatWorksCategory): string {
  const found = WHAT_WORKS_CATEGORIES.find((c) => c.value === category);
  return found?.label || category;
}

export function getCategoryColor(category: WhatWorksCategory): string {
  const colors: Record<WhatWorksCategory, string> = {
    newsletter: "bg-blue-100 text-blue-800",
    podcast: "bg-purple-100 text-purple-800",
    video: "bg-red-100 text-red-800",
    "case-study": "bg-green-100 text-green-800",
    article: "bg-gray-100 text-gray-800",
    tdp: "bg-orange-100 text-orange-800",
    interview: "bg-pink-100 text-pink-800",
    spotlight: "bg-yellow-100 text-yellow-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
}
