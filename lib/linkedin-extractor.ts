/**
 * LinkedIn Article Extractor - Types and Utilities
 *
 * Extracts articles from LinkedIn profile/company pages.
 * Supports URL-based extraction and manual paste fallback.
 */

export interface LinkedInArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  authorUrl?: string;
  publishedDate: string;
  url: string;
  tags: string[];
  likes?: number;
  comments?: number;
  imageUrl?: string;
  source: "url-extract" | "manual-paste" | "html-parse";
  extractedAt: string;
}

export interface ExtractionResult {
  success: boolean;
  articles: LinkedInArticle[];
  profileName?: string;
  profileUrl?: string;
  totalFound: number;
  error?: string;
  method: "puppeteer" | "fetch" | "manual";
}

export interface ExtractionRequest {
  url?: string;
  html?: string;
  text?: string;
  method: "url" | "paste-html" | "paste-text";
}

/**
 * Validate a LinkedIn URL
 */
export function isValidLinkedInUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "www.linkedin.com" ||
      parsed.hostname === "linkedin.com"
    );
  } catch {
    return false;
  }
}

/**
 * Determine the type of LinkedIn URL
 */
export function getLinkedInUrlType(
  url: string
): "profile" | "company" | "article" | "post" | "unknown" {
  if (!isValidLinkedInUrl(url)) return "unknown";
  const path = new URL(url).pathname;

  if (path.startsWith("/pulse/") || path.startsWith("/article/")) return "article";
  if (path.startsWith("/posts/") || path.includes("/posts/")) return "post";
  if (path.startsWith("/company/")) return "company";
  if (path.startsWith("/in/")) return "profile";
  return "unknown";
}

/**
 * Generate a unique ID for an extracted article
 */
export function generateArticleId(): string {
  return `li-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Extract article data from raw HTML content
 */
export function parseArticlesFromHtml(html: string): Partial<LinkedInArticle>[] {
  const articles: Partial<LinkedInArticle>[] = [];

  // Pattern 1: LinkedIn Pulse/Article pages
  const articleTitleMatch = html.match(
    /<h1[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/h1>/i
  );
  const articleContentMatch = html.match(
    /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i
  );

  if (articleTitleMatch && articleContentMatch) {
    articles.push({
      title: stripHtml(articleTitleMatch[1]),
      content: stripHtml(articleContentMatch[1]),
      source: "html-parse",
    });
  }

  // Pattern 2: LinkedIn post feed items
  const postPattern =
    /<div[^>]*class="[^"]*feed-shared-update[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
  let match;
  while ((match = postPattern.exec(html)) !== null) {
    const postHtml = match[1];
    const textMatch = postHtml.match(
      /<span[^>]*class="[^"]*break-words[^"]*"[^>]*>([\s\S]*?)<\/span>/i
    );
    if (textMatch) {
      const text = stripHtml(textMatch[1]);
      if (text.length > 100) {
        articles.push({
          content: text,
          title: text.substring(0, 80) + "...",
          excerpt: text.substring(0, 200) + "...",
          source: "html-parse",
        });
      }
    }
  }

  return articles;
}

/**
 * Parse articles from plain text (manual paste)
 */
export function parseArticlesFromText(text: string): Partial<LinkedInArticle>[] {
  const articles: Partial<LinkedInArticle>[] = [];

  // Split by common article separators
  const separators = [
    /\n---+\n/g, // Horizontal rules
    /\n={3,}\n/g, // Equals separators
    /\n\*{3,}\n/g, // Asterisk separators
  ];

  let sections = [text];
  for (const sep of separators) {
    const newSections: string[] = [];
    for (const section of sections) {
      newSections.push(...section.split(sep));
    }
    if (newSections.length > 1) {
      sections = newSections;
      break;
    }
  }

  // If no separators found, treat the whole text as one article
  for (const section of sections) {
    const trimmed = section.trim();
    if (trimmed.length < 50) continue;

    const lines = trimmed.split("\n").filter((l) => l.trim());
    const title = lines[0]?.trim() || "Untitled Article";
    const content = lines.slice(1).join("\n").trim() || trimmed;
    const excerpt = content.substring(0, 200) + (content.length > 200 ? "..." : "");

    // Extract hashtags
    const hashtagPattern = /#(\w+)/g;
    const tags: string[] = [];
    let tagMatch;
    while ((tagMatch = hashtagPattern.exec(content)) !== null) {
      tags.push(tagMatch[1]);
    }

    articles.push({
      id: generateArticleId(),
      title,
      content,
      excerpt,
      tags,
      source: "manual-paste",
      extractedAt: new Date().toISOString(),
    });
  }

  return articles;
}

/**
 * Strip HTML tags from a string
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Clean and normalize extracted article content
 */
export function cleanArticleContent(content: string): string {
  return content
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
}

/**
 * Extract author name from LinkedIn profile URL
 */
export function extractAuthorFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const profileMatch = path.match(/\/in\/([^/]+)/);
    if (profileMatch) {
      return profileMatch[1]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    const companyMatch = path.match(/\/company\/([^/]+)/);
    if (companyMatch) {
      return companyMatch[1]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  } catch {
    // ignore
  }
  return "Unknown Author";
}
