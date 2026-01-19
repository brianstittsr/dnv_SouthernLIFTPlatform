"use client";

import {
  CrawledPage,
  CrawlProgress,
  ImageAsset,
  VideoAsset,
  DocumentAsset,
  PageMetadata,
  PageContent,
  ContentSection,
} from "@/lib/types/content-migration";

export interface CrawlCallbacks {
  onProgress: (progress: CrawlProgress) => void;
  onPageCrawled: (page: CrawledPage) => void;
  onImageFound: (image: ImageAsset) => void;
  onVideoFound: (video: VideoAsset) => void;
  onDocumentFound: (doc: DocumentAsset) => void;
  onError: (url: string, error: string) => void;
  onComplete: (pages: CrawledPage[], images: ImageAsset[], videos: VideoAsset[], documents: DocumentAsset[]) => void;
}

export interface CrawlOptions {
  targetUrl: string;
  maxPages: number;
  crawlDelay: number;
  downloadImages: boolean;
  downloadDocuments: boolean;
  authToken: string;
}

export class ClientCrawler {
  private options: CrawlOptions;
  private callbacks: CrawlCallbacks;
  private visitedUrls: Set<string> = new Set();
  private urlQueue: string[] = [];
  private crawledPages: CrawledPage[] = [];
  private allImages: ImageAsset[] = [];
  private allVideos: VideoAsset[] = [];
  private allDocuments: DocumentAsset[] = [];
  private isPaused: boolean = false;
  private isStopped: boolean = false;
  private progress: CrawlProgress;

  constructor(options: CrawlOptions, callbacks: CrawlCallbacks) {
    this.options = options;
    this.callbacks = callbacks;
    this.progress = {
      totalPagesDiscovered: 0,
      pagesCrawled: 0,
      pagesRemaining: 0,
      imagesFound: 0,
      imagesDownloaded: 0,
      videosFound: 0,
      documentsFound: 0,
      documentsDownloaded: 0,
      errors: [],
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      status: "idle",
    };
  }

  async start(): Promise<void> {
    this.progress.status = "running";
    this.progress.startedAt = new Date().toISOString();
    this.urlQueue.push(this.options.targetUrl);
    this.progress.totalPagesDiscovered = 1;
    this.callbacks.onProgress(this.progress);

    while (this.urlQueue.length > 0 && this.crawledPages.length < this.options.maxPages && !this.isStopped) {
      if (this.isPaused) {
        await this.delay(500);
        continue;
      }

      const url = this.urlQueue.shift()!;
      
      if (this.visitedUrls.has(url)) {
        continue;
      }

      try {
        await this.crawlPage(url);
        this.visitedUrls.add(url);
        this.progress.pagesCrawled++;
        this.progress.pagesRemaining = this.urlQueue.length;
        this.progress.lastUpdatedAt = new Date().toISOString();
        this.callbacks.onProgress(this.progress);

        // Respect crawl delay
        await this.delay(this.options.crawlDelay);
      } catch (error: any) {
        this.logError(url, error.message);
      }
    }

    this.progress.status = this.isStopped ? "failed" : "completed";
    this.progress.lastUpdatedAt = new Date().toISOString();
    this.callbacks.onProgress(this.progress);
    this.callbacks.onComplete(this.crawledPages, this.allImages, this.allVideos, this.allDocuments);
  }

  pause(): void {
    this.isPaused = true;
    this.progress.status = "paused";
    this.callbacks.onProgress(this.progress);
  }

  resume(): void {
    this.isPaused = false;
    this.progress.status = "running";
    this.callbacks.onProgress(this.progress);
  }

  stop(): void {
    this.isStopped = true;
  }

  private async crawlPage(url: string): Promise<void> {
    try {
      // Use our API to fetch the page (avoids CORS issues)
      const response = await fetch(`/api/content-migration/fetch-page?url=${encodeURIComponent(url)}`, {
        headers: {
          Authorization: `Bearer ${this.options.authToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const { html, finalUrl } = await response.json();
      
      if (!html) {
        throw new Error("Empty response");
      }

      const page = this.parsePage(finalUrl || url, html);
      this.crawledPages.push(page);
      this.callbacks.onPageCrawled(page);

      // Extract and queue new URLs
      const links = this.extractLinks(html, finalUrl || url);
      console.log(`[Crawler] Processing ${links.length} links from ${url}`);
      
      let newLinksAdded = 0;
      links.forEach(link => {
        // Normalize the link for comparison
        const normalizedLink = link.replace(/\/$/, "");
        const isVisited = this.visitedUrls.has(link) || this.visitedUrls.has(normalizedLink);
        const isQueued = this.urlQueue.includes(link) || this.urlQueue.includes(normalizedLink);
        
        if (!isVisited && !isQueued) {
          if (this.shouldCrawl(link)) {
            this.urlQueue.push(link);
            this.progress.totalPagesDiscovered++;
            newLinksAdded++;
          }
        }
      });
      
      console.log(`[Crawler] Added ${newLinksAdded} new links to queue. Queue size: ${this.urlQueue.length}`);

      // Extract media assets
      const images = this.extractImages(html, url);
      images.forEach(img => {
        this.allImages.push(img);
        this.callbacks.onImageFound(img);
      });
      this.progress.imagesFound = this.allImages.length;

      const videos = this.extractVideos(html, url);
      videos.forEach(vid => {
        this.allVideos.push(vid);
        this.callbacks.onVideoFound(vid);
      });
      this.progress.videosFound = this.allVideos.length;

      const documents = this.extractDocuments(html, url);
      documents.forEach(doc => {
        this.allDocuments.push(doc);
        this.callbacks.onDocumentFound(doc);
      });
      this.progress.documentsFound = this.allDocuments.length;

    } catch (error: any) {
      this.logError(url, error.message);
    }
  }

  private parsePage(url: string, html: string): CrawledPage {
    const urlObj = new URL(url);
    const slug = urlObj.pathname === "/" ? "home" : urlObj.pathname.replace(/^\/|\/$/g, "").replace(/\//g, "-");

    const metadata = this.extractMetadata(html, url);
    const content = this.extractContent(html);
    const wordCount = this.countWords(html);

    return {
      url,
      slug,
      title: metadata.title,
      pageType: this.determinePageType(url, metadata.title),
      publishedDate: null,
      lastModified: metadata.lastModified,
      metadata,
      content,
      seo: {
        keywords: metadata.metaKeywords,
        ogImage: metadata.ogImage,
        structuredData: this.extractStructuredData(html),
      },
      navigation: {
        breadcrumb: metadata.breadcrumb,
        relatedPages: [],
      },
      media: {
        images: this.extractImages(html, url),
        videos: this.extractVideos(html, url),
        documents: this.extractDocuments(html, url),
      },
      forms: [],
      wordCount,
      httpStatus: 200,
      crawledAt: new Date().toISOString(),
    };
  }

  private extractMetadata(html: string, url: string): PageMetadata {
    const urlObj = new URL(url);
    const slug = urlObj.pathname === "/" ? "home" : urlObj.pathname.replace(/^\/|\/$/g, "");

    return {
      url,
      slug,
      title: this.extractTagContent(html, "title") || "Untitled",
      metaDescription: this.extractMetaContent(html, "description"),
      metaKeywords: (this.extractMetaContent(html, "keywords") || "").split(",").map(k => k.trim()).filter(Boolean),
      ogTitle: this.extractMetaProperty(html, "og:title"),
      ogDescription: this.extractMetaProperty(html, "og:description"),
      ogImage: this.extractMetaProperty(html, "og:image"),
      canonicalUrl: this.extractCanonical(html),
      lastModified: null,
      breadcrumb: [],
    };
  }

  private extractContent(html: string): PageContent {
    const sections: ContentSection[] = [];
    let order = 0;

    // Extract hero section
    const heroMatch = html.match(/<(?:section|div)[^>]*class="[^"]*hero[^"]*"[^>]*>([\s\S]*?)<\/(?:section|div)>/i);
    const hero = heroMatch ? {
      heading: this.extractFirstHeading(heroMatch[1]),
      subheading: this.extractFirstParagraph(heroMatch[1]),
      image: this.extractFirstImage(heroMatch[1]),
      cta: undefined,
    } : undefined;

    // Extract main content sections
    const sectionMatches = html.matchAll(/<(?:section|article)[^>]*>([\s\S]*?)<\/(?:section|article)>/gi);
    for (const match of sectionMatches) {
      const sectionHtml = match[1];
      sections.push({
        type: "text",
        heading: this.extractFirstHeading(sectionHtml),
        content: this.stripHtml(sectionHtml),
        images: this.extractImageUrls(sectionHtml),
        videos: [],
        order: order++,
      });
    }

    return { hero, sections };
  }

  private extractImages(html: string, parentUrl: string): ImageAsset[] {
    const images: ImageAsset[] = [];
    const imgRegex = /<img[^>]+>/gi;
    const matches = html.matchAll(imgRegex);

    for (const match of matches) {
      const imgTag = match[0];
      const src = this.extractAttribute(imgTag, "src");
      if (!src) continue;

      const fullUrl = this.resolveUrl(src, parentUrl);
      const id = this.generateId("img");

      images.push({
        id,
        sourceUrl: fullUrl,
        localPath: null,
        alt: this.extractAttribute(imgTag, "alt"),
        title: this.extractAttribute(imgTag, "title"),
        width: parseInt(this.extractAttribute(imgTag, "width") || "0") || null,
        height: parseInt(this.extractAttribute(imgTag, "height") || "0") || null,
        format: this.getFileExtension(fullUrl),
        context: "content",
        caption: null,
        parentPageUrl: parentUrl,
        fileSize: null,
        downloaded: false,
      });
    }

    return images;
  }

  private extractVideos(html: string, parentUrl: string): VideoAsset[] {
    const videos: VideoAsset[] = [];

    // YouTube embeds
    const youtubeRegex = /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;
    const youtubeMatches = html.matchAll(youtubeRegex);
    for (const match of youtubeMatches) {
      videos.push({
        id: this.generateId("vid"),
        platform: "youtube",
        url: `https://www.youtube.com/watch?v=${match[1]}`,
        embedCode: `<iframe src="https://www.youtube.com/embed/${match[1]}" frameborder="0" allowfullscreen></iframe>`,
        videoId: match[1],
        thumbnailUrl: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`,
        title: null,
        description: null,
        duration: null,
        parentPageUrl: parentUrl,
        context: "embedded",
      });
    }

    // Vimeo embeds
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/gi;
    const vimeoMatches = html.matchAll(vimeoRegex);
    for (const match of vimeoMatches) {
      videos.push({
        id: this.generateId("vid"),
        platform: "vimeo",
        url: `https://vimeo.com/${match[1]}`,
        embedCode: `<iframe src="https://player.vimeo.com/video/${match[1]}" frameborder="0" allowfullscreen></iframe>`,
        videoId: match[1],
        thumbnailUrl: null,
        title: null,
        description: null,
        duration: null,
        parentPageUrl: parentUrl,
        context: "embedded",
      });
    }

    return videos;
  }

  private extractDocuments(html: string, parentUrl: string): DocumentAsset[] {
    const documents: DocumentAsset[] = [];
    const linkRegex = /<a[^>]+href="([^"]+\.(pdf|doc|docx|xls|xlsx|ppt|pptx))"[^>]*>([^<]*)<\/a>/gi;
    const matches = html.matchAll(linkRegex);

    for (const match of matches) {
      const url = this.resolveUrl(match[1], parentUrl);
      const extension = match[2].toLowerCase();
      
      documents.push({
        id: this.generateId("doc"),
        url,
        localPath: null,
        fileName: url.split("/").pop() || "document",
        fileType: extension as any,
        fileSize: null,
        linkText: match[3].trim() || url.split("/").pop() || "Download",
        parentPageUrl: parentUrl,
        downloaded: false,
      });
    }

    return documents;
  }

  private normalizeHostname(hostname: string): string {
    // Remove www. prefix for comparison
    return hostname.replace(/^www\./i, "").toLowerCase();
  }

  private extractLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    
    // Match href with double quotes, single quotes, or no quotes
    const linkPatterns = [
      /<a[^>]+href="([^"#]+)"/gi,
      /<a[^>]+href='([^'#]+)'/gi,
      /<a[^>]+href=([^\s>#]+)/gi,
    ];

    const baseUrlObj = new URL(this.options.targetUrl);
    const baseHostname = this.normalizeHostname(baseUrlObj.hostname);

    for (const linkRegex of linkPatterns) {
      const matches = html.matchAll(linkRegex);
      for (const match of matches) {
        try {
          let href = match[1].trim();
          
          // Skip non-http links
          if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:") || href.startsWith("data:")) {
            continue;
          }

          // Skip empty or hash-only links
          if (!href || href === "#" || href.startsWith("#")) {
            continue;
          }

          // Skip malformed URLs containing quotes (common in broken HTML)
          if (href.includes('"') || href.includes("'") || href.includes("%22") || href.includes("%27")) {
            continue;
          }

          // Skip URLs that look like they contain another URL (malformed nested hrefs)
          if (href.includes("http://") && href.indexOf("http://") > 0) {
            continue;
          }
          if (href.includes("https://") && href.indexOf("https://") > 0) {
            continue;
          }

          const fullUrl = this.resolveUrl(href, baseUrl);
          const urlObj = new URL(fullUrl);
          const linkHostname = this.normalizeHostname(urlObj.hostname);

          // Only include internal links (same hostname, ignoring www)
          if (linkHostname === baseHostname) {
            // Normalize URL (remove trailing slash, query params for dedup)
            const normalizedUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname.replace(/\/$/, "") || "/"}`;
            if (!links.includes(normalizedUrl)) {
              links.push(normalizedUrl);
            }
          }
        } catch {
          // Invalid URL, skip
        }
      }
    }

    console.log(`[Crawler] Found ${links.length} internal links on ${baseUrl} (base hostname: ${baseHostname})`);
    return [...new Set(links)];
  }

  private shouldCrawl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const baseUrlObj = new URL(this.options.targetUrl);
      
      // Only crawl same domain (normalize www vs non-www)
      const urlHostname = this.normalizeHostname(urlObj.hostname);
      const baseHostname = this.normalizeHostname(baseUrlObj.hostname);
      
      if (urlHostname !== baseHostname) {
        return false;
      }

      // Skip common non-content paths
      const skipPatterns = [
        /\/wp-admin/i,
        /\/wp-login/i,
        /\/wp-content\/uploads/i,
        /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|exe|dmg)$/i,
        /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i,
        /\.(css|js|json|xml)$/i,
      ];

      for (const pattern of skipPatterns) {
        if (pattern.test(url)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  // Helper methods
  private extractTagContent(html: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
    const match = html.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractMetaContent(html: string, name: string): string | null {
    const regex = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i");
    const match = html.match(regex);
    if (match) return match[1];

    const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i");
    const match2 = html.match(regex2);
    return match2 ? match2[1] : null;
  }

  private extractMetaProperty(html: string, property: string): string | null {
    const regex = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i");
    const match = html.match(regex);
    if (match) return match[1];

    const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i");
    const match2 = html.match(regex2);
    return match2 ? match2[1] : null;
  }

  private extractCanonical(html: string): string | null {
    const regex = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i;
    const match = html.match(regex);
    return match ? match[1] : null;
  }

  private extractFirstHeading(html: string): string | null {
    const regex = /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i;
    const match = html.match(regex);
    return match ? this.stripHtml(match[1]).trim() : null;
  }

  private extractFirstParagraph(html: string): string | null {
    const regex = /<p[^>]*>([^<]+)<\/p>/i;
    const match = html.match(regex);
    return match ? this.stripHtml(match[1]).trim() : null;
  }

  private extractFirstImage(html: string): string | null {
    const regex = /<img[^>]+src=["']([^"']+)["']/i;
    const match = html.match(regex);
    return match ? match[1] : null;
  }

  private extractAttribute(html: string, attr: string): string | null {
    const regex = new RegExp(`${attr}=["']([^"']+)["']`, "i");
    const match = html.match(regex);
    return match ? match[1] : null;
  }

  private extractImageUrls(html: string): string[] {
    const urls: string[] = [];
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    const matches = html.matchAll(regex);
    for (const match of matches) {
      urls.push(match[1]);
    }
    return urls;
  }

  private extractStructuredData(html: string): any | null {
    const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const matches = html.matchAll(regex);
    const data: any[] = [];

    for (const match of matches) {
      try {
        data.push(JSON.parse(match[1]));
      } catch {
        // Invalid JSON, skip
      }
    }

    return data.length > 0 ? data : null;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private countWords(html: string): number {
    const text = this.stripHtml(html);
    return text.split(/\s+/).filter(Boolean).length;
  }

  private resolveUrl(href: string, baseUrl: string): string {
    try {
      return new URL(href, baseUrl).href;
    } catch {
      return href;
    }
  }

  private getFileExtension(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const ext = pathname.split(".").pop()?.toLowerCase() || "";
      return ext || "unknown";
    } catch {
      return "unknown";
    }
  }

  private determinePageType(url: string, title: string): CrawledPage["pageType"] {
    const urlLower = url.toLowerCase();
    const titleLower = title.toLowerCase();

    if (urlLower.endsWith("/") && urlLower.split("/").length <= 4) return "home";
    if (urlLower.includes("/about") || titleLower.includes("about")) return "about";
    if (urlLower.includes("/team") || titleLower.includes("team")) return "team";
    if (urlLower.includes("/service") || titleLower.includes("service")) return "services";
    if (urlLower.includes("/blog") || urlLower.includes("/news") || urlLower.includes("/article")) return "blog";
    if (urlLower.includes("/contact") || titleLower.includes("contact")) return "contact";
    if (urlLower.includes("/case-stud") || titleLower.includes("case study")) return "case-study";
    if (urlLower.includes("/resource") || urlLower.includes("/download")) return "resources";
    if (urlLower.includes("/privacy") || urlLower.includes("/terms") || urlLower.includes("/legal")) return "legal";

    return "other";
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(url: string, message: string): void {
    this.progress.errors.push({
      url,
      errorType: "network",
      message,
      timestamp: new Date().toISOString(),
    });
    this.callbacks.onError(url, message);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
