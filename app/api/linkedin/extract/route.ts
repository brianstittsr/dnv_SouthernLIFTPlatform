import { NextRequest, NextResponse } from "next/server";
import {
  type LinkedInArticle,
  type ExtractionResult,
  isValidLinkedInUrl,
  getLinkedInUrlType,
  generateArticleId,
  parseArticlesFromHtml,
  parseArticlesFromText,
  stripHtml,
  extractAuthorFromUrl,
} from "@/lib/linkedin-extractor";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, html, text, method } = body;

    if (method === "paste-html" && html) {
      return handleHtmlPaste(html);
    }

    if (method === "paste-text" && text) {
      return handleTextPaste(text);
    }

    if (method === "url" && url) {
      return handleUrlExtraction(url);
    }

    return NextResponse.json(
      { error: "Invalid request. Provide a URL, HTML, or text to extract." },
      { status: 400 }
    );
  } catch (error) {
    console.error("LinkedIn extraction error:", error);
    return NextResponse.json(
      {
        success: false,
        articles: [],
        totalFound: 0,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        method: "manual",
      } satisfies ExtractionResult,
      { status: 500 }
    );
  }
}

/**
 * Extract articles from a LinkedIn URL using server-side fetch
 */
async function handleUrlExtraction(url: string): Promise<NextResponse> {
  if (!isValidLinkedInUrl(url)) {
    return NextResponse.json(
      { error: "Invalid LinkedIn URL. Please provide a valid linkedin.com URL." },
      { status: 400 }
    );
  }

  const urlType = getLinkedInUrlType(url);
  const author = extractAuthorFromUrl(url);

  try {
    // Attempt server-side fetch with browser-like headers
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        articles: [],
        totalFound: 0,
        error: `LinkedIn returned status ${response.status}. LinkedIn blocks most automated access. Please use the "Paste Content" method instead.`,
        method: "fetch",
        profileName: author,
        profileUrl: url,
      } satisfies ExtractionResult);
    }

    const htmlContent = await response.text();

    // Try to extract articles from the HTML
    if (urlType === "article") {
      const article = extractSingleArticle(htmlContent, url, author);
      if (article) {
        return NextResponse.json({
          success: true,
          articles: [article],
          totalFound: 1,
          profileName: author,
          profileUrl: url,
          method: "fetch",
        } satisfies ExtractionResult);
      }
    }

    // Try to extract multiple articles/posts from profile or company page
    const articles = extractArticlesFromPage(htmlContent, url, author);

    if (articles.length > 0) {
      return NextResponse.json({
        success: true,
        articles,
        totalFound: articles.length,
        profileName: author,
        profileUrl: url,
        method: "fetch",
      } satisfies ExtractionResult);
    }

    // If no articles found via parsing, return guidance
    return NextResponse.json({
      success: false,
      articles: [],
      totalFound: 0,
      error:
        "Could not extract articles automatically. LinkedIn requires authentication for most content. Please use the \"Paste Content\" tab to manually paste article text or HTML from the page.",
      method: "fetch",
      profileName: author,
      profileUrl: url,
    } satisfies ExtractionResult);
  } catch (fetchError) {
    console.error("Fetch error:", fetchError);
    return NextResponse.json({
      success: false,
      articles: [],
      totalFound: 0,
      error:
        "Could not access LinkedIn URL. LinkedIn blocks most automated access. Please use the \"Paste Content\" method instead.",
      method: "fetch",
      profileName: author,
      profileUrl: url,
    } satisfies ExtractionResult);
  }
}

/**
 * Extract a single article from a LinkedIn Pulse/Article page
 */
function extractSingleArticle(
  html: string,
  url: string,
  author: string
): LinkedInArticle | null {
  // Try multiple patterns for article title
  const titlePatterns = [
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
    /<title>([\s\S]*?)<\/title>/i,
    /<meta\s+property="og:title"\s+content="([^"]+)"/i,
    /<meta\s+content="([^"]+)"\s+property="og:title"/i,
  ];

  let title = "";
  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match) {
      title = stripHtml(match[1]).replace(/ \| LinkedIn$/, "").trim();
      if (title.length > 5) break;
    }
  }

  if (!title) return null;

  // Try to extract article body
  const contentPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*feed-shared-text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*data-test-id="[^"]*main-feed[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  let content = "";
  for (const pattern of contentPatterns) {
    const match = html.match(pattern);
    if (match) {
      content = stripHtml(match[1]).trim();
      if (content.length > 50) break;
    }
  }

  // Try og:description as fallback
  if (!content || content.length < 50) {
    const descMatch = html.match(
      /<meta\s+(?:property="og:description"|name="description")\s+content="([^"]+)"/i
    );
    if (descMatch) {
      content = descMatch[1];
    }
  }

  // Extract published date
  const datePatterns = [
    /<time[^>]*datetime="([^"]+)"/i,
    /<meta\s+property="article:published_time"\s+content="([^"]+)"/i,
    /<meta\s+content="([^"]+)"\s+property="article:published_time"/i,
  ];

  let publishedDate = new Date().toISOString();
  for (const pattern of datePatterns) {
    const match = html.match(pattern);
    if (match) {
      publishedDate = match[1];
      break;
    }
  }

  // Extract image
  const imageMatch = html.match(
    /<meta\s+(?:property="og:image"|content="([^"]+)"\s+property="og:image")/i
  );
  const imageUrl = imageMatch ? imageMatch[1] : undefined;

  // Extract hashtags from content
  const tags: string[] = [];
  const hashtagPattern = /#(\w+)/g;
  let tagMatch;
  while ((tagMatch = hashtagPattern.exec(content)) !== null) {
    tags.push(tagMatch[1]);
  }

  return {
    id: generateArticleId(),
    title,
    content: content || "Content could not be fully extracted. Please paste the full article text.",
    excerpt: content.substring(0, 200) + (content.length > 200 ? "..." : ""),
    author,
    authorUrl: url,
    publishedDate,
    url,
    tags,
    imageUrl,
    source: "url-extract",
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Extract multiple articles from a profile or company page
 */
function extractArticlesFromPage(
  html: string,
  pageUrl: string,
  author: string
): LinkedInArticle[] {
  const articles: LinkedInArticle[] = [];

  // Try to find article links on the page
  const articleLinkPattern =
    /<a[^>]*href="(https?:\/\/(?:www\.)?linkedin\.com\/(?:pulse|article)\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let linkMatch;
  const seenUrls = new Set<string>();

  while ((linkMatch = articleLinkPattern.exec(html)) !== null) {
    const articleUrl = linkMatch[1];
    const linkText = stripHtml(linkMatch[2]).trim();

    if (seenUrls.has(articleUrl) || linkText.length < 10) continue;
    seenUrls.add(articleUrl);

    articles.push({
      id: generateArticleId(),
      title: linkText,
      content: "",
      excerpt: linkText,
      author,
      authorUrl: pageUrl,
      publishedDate: new Date().toISOString(),
      url: articleUrl,
      tags: [],
      source: "url-extract",
      extractedAt: new Date().toISOString(),
    });
  }

  // Also try parsing embedded post content
  const parsedArticles = parseArticlesFromHtml(html);
  for (const parsed of parsedArticles) {
    if (parsed.title && parsed.content) {
      articles.push({
        id: generateArticleId(),
        title: parsed.title,
        content: parsed.content,
        excerpt: parsed.excerpt || parsed.content.substring(0, 200),
        author,
        authorUrl: pageUrl,
        publishedDate: new Date().toISOString(),
        url: pageUrl,
        tags: parsed.tags || [],
        source: parsed.source || "html-parse",
        extractedAt: new Date().toISOString(),
      });
    }
  }

  return articles;
}

/**
 * Handle pasted HTML content
 */
function handleHtmlPaste(html: string): NextResponse {
  const parsedArticles = parseArticlesFromHtml(html);

  // Also try to extract from general HTML structure
  const additionalArticles = extractArticlesFromGeneralHtml(html);

  const allParsed = [...parsedArticles, ...additionalArticles];

  const articles: LinkedInArticle[] = allParsed
    .filter((a) => a.title || a.content)
    .map((a) => ({
      id: a.id || generateArticleId(),
      title: a.title || "Untitled Article",
      content: a.content || "",
      excerpt: a.excerpt || (a.content || "").substring(0, 200),
      author: a.author || "Unknown Author",
      authorUrl: a.authorUrl,
      publishedDate: a.publishedDate || new Date().toISOString(),
      url: a.url || "",
      tags: a.tags || [],
      source: "html-parse" as const,
      extractedAt: new Date().toISOString(),
    }));

  return NextResponse.json({
    success: articles.length > 0,
    articles,
    totalFound: articles.length,
    error: articles.length === 0 ? "No articles could be extracted from the pasted HTML." : undefined,
    method: "manual",
  } satisfies ExtractionResult);
}

/**
 * Handle pasted plain text content
 */
function handleTextPaste(text: string): NextResponse {
  const parsedArticles = parseArticlesFromText(text);

  const articles: LinkedInArticle[] = parsedArticles
    .filter((a) => a.content && a.content.length > 30)
    .map((a) => ({
      id: a.id || generateArticleId(),
      title: a.title || "Untitled Article",
      content: a.content || "",
      excerpt: a.excerpt || (a.content || "").substring(0, 200),
      author: a.author || "Unknown Author",
      authorUrl: a.authorUrl,
      publishedDate: a.publishedDate || new Date().toISOString(),
      url: a.url || "",
      tags: a.tags || [],
      source: "manual-paste" as const,
      extractedAt: new Date().toISOString(),
    }));

  return NextResponse.json({
    success: articles.length > 0,
    articles,
    totalFound: articles.length,
    error: articles.length === 0 ? "No articles could be extracted from the pasted text." : undefined,
    method: "manual",
  } satisfies ExtractionResult);
}

/**
 * Extract articles from general HTML (not LinkedIn-specific patterns)
 */
function extractArticlesFromGeneralHtml(html: string): Partial<LinkedInArticle>[] {
  const articles: Partial<LinkedInArticle>[] = [];

  // Look for article-like structures
  const articlePattern = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  let match;
  while ((match = articlePattern.exec(html)) !== null) {
    const articleHtml = match[1];
    const titleMatch = articleHtml.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
    const contentMatch = articleHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

    if (titleMatch || contentMatch) {
      articles.push({
        title: titleMatch ? stripHtml(titleMatch[1]) : "Untitled",
        content: contentMatch ? stripHtml(contentMatch[1]) : stripHtml(articleHtml),
        source: "html-parse",
      });
    }
  }

  // Look for og:title and og:description as a single article
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);

  if (ogTitle && ogDesc && articles.length === 0) {
    articles.push({
      title: ogTitle[1].replace(/ \| LinkedIn$/, ""),
      content: ogDesc[1],
      excerpt: ogDesc[1],
      source: "html-parse",
    });
  }

  return articles;
}
