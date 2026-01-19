#!/usr/bin/env ts-node
/**
 * KDM Website Content Crawler
 * 
 * This script crawls the KDM Associates website and extracts all content,
 * images, videos, and structural information for migration to the SVP Platform.
 * 
 * Usage: npx ts-node scripts/content-crawler.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import {
  CrawledPage,
  CrawlConfig,
  CrawlProgress,
  CrawlError,
  ImageAsset,
  VideoAsset,
  DocumentAsset,
  FormData,
  FormField,
  NavigationItem,
  SiteStructure,
  MigrationReport,
  UrlMapping,
  DEFAULT_CRAWL_CONFIG,
  PageMetadata,
  PageContent,
  ContentSection,
} from '../lib/types/content-migration';

// Simple HTML parser utilities (no external dependencies)
class ContentCrawler {
  private config: CrawlConfig;
  private visitedUrls: Set<string> = new Set();
  private urlQueue: string[] = [];
  private crawledPages: CrawledPage[] = [];
  private allImages: ImageAsset[] = [];
  private allVideos: VideoAsset[] = [];
  private allDocuments: DocumentAsset[] = [];
  private siteStructure: SiteStructure | null = null;
  private progress: CrawlProgress;
  private errors: CrawlError[] = [];

  constructor(config: Partial<CrawlConfig> = {}) {
    this.config = { ...DEFAULT_CRAWL_CONFIG, ...config };
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
      status: 'idle',
    };
  }

  async crawl(): Promise<void> {
    console.log('🕷️  Starting KDM Website Content Crawler...');
    console.log(`📍 Target: ${this.config.startUrl}`);
    console.log(`📁 Output: ${this.config.outputDirectory}`);
    
    this.progress.status = 'running';
    this.progress.startedAt = new Date().toISOString();

    // Create output directories
    this.createOutputDirectories();

    // Add start URL to queue
    this.urlQueue.push(this.config.startUrl);
    this.progress.totalPagesDiscovered = 1;

    // Process URL queue
    while (this.urlQueue.length > 0 && this.crawledPages.length < this.config.maxPages) {
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

        // Respect crawl delay
        await this.delay(this.config.crawlDelay);
      } catch (error: any) {
        this.logError(url, 'network', error.message);
      }

      // Save progress periodically
      if (this.crawledPages.length % 10 === 0) {
        this.saveProgress();
      }
    }

    // Generate final outputs
    await this.generateOutputs();

    this.progress.status = 'completed';
    this.progress.lastUpdatedAt = new Date().toISOString();
    this.saveProgress();

    console.log('\n✅ Crawl completed!');
    console.log(`📄 Pages crawled: ${this.crawledPages.length}`);
    console.log(`🖼️  Images found: ${this.allImages.length}`);
    console.log(`🎬 Videos found: ${this.allVideos.length}`);
    console.log(`📎 Documents found: ${this.allDocuments.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
  }

  private createOutputDirectories(): void {
    const dirs = [
      this.config.outputDirectory,
      path.join(this.config.outputDirectory, 'pages'),
      path.join(this.config.outputDirectory, 'pages', 'about'),
      path.join(this.config.outputDirectory, 'pages', 'services'),
      path.join(this.config.outputDirectory, 'pages', 'blog'),
      path.join(this.config.outputDirectory, 'pages', 'resources'),
      path.join(this.config.outputDirectory, 'media'),
      path.join(this.config.outputDirectory, 'media', 'images'),
      path.join(this.config.outputDirectory, 'media', 'images', 'heroes'),
      path.join(this.config.outputDirectory, 'media', 'images', 'content'),
      path.join(this.config.outputDirectory, 'media', 'images', 'team'),
      path.join(this.config.outputDirectory, 'media', 'images', 'logos'),
      path.join(this.config.outputDirectory, 'media', 'videos'),
      path.join(this.config.outputDirectory, 'media', 'documents'),
      path.join(this.config.outputDirectory, 'media', 'documents', 'pdfs'),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    console.log('📁 Output directories created');
  }

  private async crawlPage(url: string): Promise<void> {
    console.log(`\n🔍 Crawling: ${url}`);

    try {
      const html = await this.fetchPage(url);
      if (!html) {
        this.logError(url, 'network', 'Empty response');
        return;
      }

      const page = this.parsePage(url, html);
      this.crawledPages.push(page);

      // Extract and queue new URLs
      const links = this.extractLinks(html, url);
      links.forEach(link => {
        if (!this.visitedUrls.has(link) && !this.urlQueue.includes(link)) {
          if (this.shouldCrawl(link)) {
            this.urlQueue.push(link);
            this.progress.totalPagesDiscovered++;
          }
        }
      });

      // Extract media assets
      const images = this.extractImages(html, url);
      this.allImages.push(...images);
      this.progress.imagesFound = this.allImages.length;

      const videos = this.extractVideos(html, url);
      this.allVideos.push(...videos);
      this.progress.videosFound = this.allVideos.length;

      const documents = this.extractDocuments(html, url);
      this.allDocuments.push(...documents);
      this.progress.documentsFound = this.allDocuments.length;

      // Download images if configured
      if (this.config.downloadImages) {
        await this.downloadImages(images);
      }

      // Download documents if configured
      if (this.config.downloadDocuments) {
        await this.downloadDocuments(documents);
      }

      // Save page JSON
      this.savePageJson(page);

      console.log(`  ✓ Title: ${page.title}`);
      console.log(`  ✓ Type: ${page.pageType}`);
      console.log(`  ✓ Images: ${images.length}, Videos: ${videos.length}`);

    } catch (error: any) {
      this.logError(url, 'parse', error.message);
    }
  }

  private async fetchPage(url: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      const options = {
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 30000,
      };

      const request = protocol.get(url, options, (response) => {
        // Handle redirects
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          const redirectUrl = new URL(response.headers.location, url).href;
          this.fetchPage(redirectUrl).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(data));
        response.on('error', reject);
      });

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  private parsePage(url: string, html: string): CrawledPage {
    const urlObj = new URL(url);
    const slug = urlObj.pathname === '/' ? 'home' : urlObj.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-');

    const metadata = this.extractMetadata(html, url);
    const content = this.extractContent(html);
    const forms = this.extractForms(html, url);
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
      forms,
      wordCount,
      httpStatus: 200,
      crawledAt: new Date().toISOString(),
    };
  }

  private extractMetadata(html: string, url: string): PageMetadata {
    const urlObj = new URL(url);
    const slug = urlObj.pathname === '/' ? 'home' : urlObj.pathname.replace(/^\/|\/$/g, '');

    return {
      url,
      slug,
      title: this.extractTagContent(html, 'title') || 'Untitled',
      metaDescription: this.extractMetaContent(html, 'description'),
      metaKeywords: (this.extractMetaContent(html, 'keywords') || '').split(',').map(k => k.trim()).filter(Boolean),
      ogTitle: this.extractMetaProperty(html, 'og:title'),
      ogDescription: this.extractMetaProperty(html, 'og:description'),
      ogImage: this.extractMetaProperty(html, 'og:image'),
      canonicalUrl: this.extractCanonical(html),
      lastModified: null,
      breadcrumb: this.extractBreadcrumb(html),
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
      cta: this.extractFirstCTA(heroMatch[1]),
    } : undefined;

    // Extract main content sections
    const sectionMatches = html.matchAll(/<(?:section|article)[^>]*>([\s\S]*?)<\/(?:section|article)>/gi);
    for (const match of sectionMatches) {
      const sectionHtml = match[1];
      sections.push({
        type: this.determineSectionType(sectionHtml),
        heading: this.extractFirstHeading(sectionHtml),
        content: this.stripHtml(sectionHtml),
        images: this.extractImageUrls(sectionHtml),
        videos: this.extractVideoUrls(sectionHtml),
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
      const src = this.extractAttribute(imgTag, 'src');
      if (!src) continue;

      const fullUrl = this.resolveUrl(src, parentUrl);
      const id = this.generateId('img');

      images.push({
        id,
        sourceUrl: fullUrl,
        localPath: null,
        alt: this.extractAttribute(imgTag, 'alt'),
        title: this.extractAttribute(imgTag, 'title'),
        width: parseInt(this.extractAttribute(imgTag, 'width') || '0') || null,
        height: parseInt(this.extractAttribute(imgTag, 'height') || '0') || null,
        format: this.getFileExtension(fullUrl),
        context: this.determineImageContext(imgTag, html),
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
        id: this.generateId('vid'),
        platform: 'youtube',
        url: `https://www.youtube.com/watch?v=${match[1]}`,
        embedCode: `<iframe src="https://www.youtube.com/embed/${match[1]}" frameborder="0" allowfullscreen></iframe>`,
        videoId: match[1],
        thumbnailUrl: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`,
        title: null,
        description: null,
        duration: null,
        parentPageUrl: parentUrl,
        context: 'embedded',
      });
    }

    // Vimeo embeds
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/gi;
    const vimeoMatches = html.matchAll(vimeoRegex);
    for (const match of vimeoMatches) {
      videos.push({
        id: this.generateId('vid'),
        platform: 'vimeo',
        url: `https://vimeo.com/${match[1]}`,
        embedCode: `<iframe src="https://player.vimeo.com/video/${match[1]}" frameborder="0" allowfullscreen></iframe>`,
        videoId: match[1],
        thumbnailUrl: null,
        title: null,
        description: null,
        duration: null,
        parentPageUrl: parentUrl,
        context: 'embedded',
      });
    }

    // Self-hosted videos
    const videoRegex = /<video[^>]*>[\s\S]*?<\/video>|<source[^>]+src="([^"]+\.(mp4|webm|mov))"[^>]*>/gi;
    const videoMatches = html.matchAll(videoRegex);
    for (const match of videoMatches) {
      if (match[1]) {
        videos.push({
          id: this.generateId('vid'),
          platform: 'self-hosted',
          url: this.resolveUrl(match[1], parentUrl),
          embedCode: null,
          videoId: null,
          thumbnailUrl: null,
          title: null,
          description: null,
          duration: null,
          parentPageUrl: parentUrl,
          context: 'embedded',
        });
      }
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
        id: this.generateId('doc'),
        url,
        localPath: null,
        fileName: path.basename(url),
        fileType: extension as any,
        fileSize: null,
        linkText: match[3].trim() || path.basename(url),
        parentPageUrl: parentUrl,
        downloaded: false,
      });
    }

    return documents;
  }

  private extractForms(html: string, parentUrl: string): FormData[] {
    const forms: FormData[] = [];
    const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;
    const matches = html.matchAll(formRegex);

    for (const match of matches) {
      const formHtml = match[0];
      const formContent = match[1];
      
      const fields: FormField[] = [];
      const inputRegex = /<(?:input|textarea|select)[^>]*>/gi;
      const inputMatches = formContent.matchAll(inputRegex);

      for (const inputMatch of inputMatches) {
        const inputTag = inputMatch[0];
        const name = this.extractAttribute(inputTag, 'name');
        if (!name || name.startsWith('_')) continue;

        fields.push({
          name,
          type: this.extractAttribute(inputTag, 'type') || 'text',
          label: null,
          placeholder: this.extractAttribute(inputTag, 'placeholder'),
          required: inputTag.includes('required'),
        });
      }

      if (fields.length > 0) {
        forms.push({
          id: this.generateId('form'),
          purpose: this.determineFormPurpose(formHtml, fields),
          action: this.extractAttribute(formHtml, 'action'),
          method: this.extractAttribute(formHtml, 'method') || 'POST',
          fields,
          submitButtonText: this.extractSubmitButtonText(formContent),
          parentPageUrl: parentUrl,
        });
      }
    }

    return forms;
  }

  private extractLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    const linkRegex = /<a[^>]+href="([^"#]+)"[^>]*>/gi;
    const matches = html.matchAll(linkRegex);

    for (const match of matches) {
      try {
        const href = match[1];
        if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
          continue;
        }

        const fullUrl = this.resolveUrl(href, baseUrl);
        const urlObj = new URL(fullUrl);
        const baseUrlObj = new URL(this.config.startUrl);

        // Only include internal links
        if (urlObj.hostname === baseUrlObj.hostname) {
          links.push(fullUrl);
        }
      } catch {
        // Invalid URL, skip
      }
    }

    return [...new Set(links)];
  }

  private shouldCrawl(url: string): boolean {
    // Check include patterns
    const matchesInclude = this.config.includePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(url);
    });

    if (!matchesInclude) return false;

    // Check exclude patterns
    const matchesExclude = this.config.excludePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(url);
    });

    return !matchesExclude;
  }

  private async downloadImages(images: ImageAsset[]): Promise<void> {
    for (const image of images) {
      try {
        const fileName = `${image.id}-${path.basename(new URL(image.sourceUrl).pathname)}`;
        const contextDir = image.context || 'content';
        const localPath = path.join(
          this.config.outputDirectory,
          'media',
          'images',
          contextDir,
          fileName
        );

        await this.downloadFile(image.sourceUrl, localPath);
        image.localPath = localPath;
        image.downloaded = true;
        this.progress.imagesDownloaded++;
      } catch (error: any) {
        this.logError(image.sourceUrl, 'network', `Failed to download image: ${error.message}`);
      }
    }
  }

  private async downloadDocuments(documents: DocumentAsset[]): Promise<void> {
    for (const doc of documents) {
      try {
        const fileName = `${doc.id}-${doc.fileName}`;
        const localPath = path.join(
          this.config.outputDirectory,
          'media',
          'documents',
          doc.fileType === 'pdf' ? 'pdfs' : '',
          fileName
        );

        await this.downloadFile(doc.url, localPath);
        doc.localPath = localPath;
        doc.downloaded = true;
        this.progress.documentsDownloaded++;
      } catch (error: any) {
        this.logError(doc.url, 'network', `Failed to download document: ${error.message}`);
      }
    }
  }

  private async downloadFile(url: string, localPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const file = fs.createWriteStream(localPath);

      protocol.get(url, { headers: { 'User-Agent': this.config.userAgent } }, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        } else if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          file.close();
          fs.unlinkSync(localPath);
          this.downloadFile(response.headers.location, localPath).then(resolve).catch(reject);
        } else {
          file.close();
          fs.unlinkSync(localPath);
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
        reject(err);
      });
    });
  }

  private savePageJson(page: CrawledPage): void {
    const pageDir = this.getPageDirectory(page.pageType);
    const fileName = `${page.slug}.json`;
    const filePath = path.join(this.config.outputDirectory, 'pages', pageDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(page, null, 2));
  }

  private getPageDirectory(pageType: string): string {
    const typeMap: Record<string, string> = {
      'home': '',
      'about': 'about',
      'services': 'services',
      'blog': 'blog',
      'resources': 'resources',
      'contact': '',
      'case-study': 'services',
      'team': 'about',
      'legal': '',
      'other': '',
    };
    return typeMap[pageType] || '';
  }

  private async generateOutputs(): Promise<void> {
    console.log('\n📝 Generating output files...');

    // Site structure
    this.siteStructure = this.extractSiteStructure();
    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'site-structure.json'),
      JSON.stringify(this.siteStructure, null, 2)
    );

    // Navigation map
    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'navigation-map.json'),
      JSON.stringify(this.siteStructure?.primaryNavigation || [], null, 2)
    );

    // URL mapping CSV
    const urlMappingCsv = this.generateUrlMappingCsv();
    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'url-mapping.csv'),
      urlMappingCsv
    );

    // Video inventory
    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'media', 'videos', 'video-inventory.json'),
      JSON.stringify(this.allVideos, null, 2)
    );

    // Migration report
    const report = this.generateMigrationReport();
    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'migration-report.md'),
      this.formatMigrationReport(report)
    );
    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'migration-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('✅ Output files generated');
  }

  private extractSiteStructure(): SiteStructure {
    // This would need the actual HTML from the homepage to extract navigation
    // For now, return a basic structure based on crawled pages
    const navItems: NavigationItem[] = [];
    const pagesByType: Record<string, CrawledPage[]> = {};

    this.crawledPages.forEach(page => {
      if (!pagesByType[page.pageType]) {
        pagesByType[page.pageType] = [];
      }
      pagesByType[page.pageType].push(page);
    });

    Object.entries(pagesByType).forEach(([type, pages], index) => {
      if (type !== 'home' && type !== 'other') {
        navItems.push({
          label: type.charAt(0).toUpperCase() + type.slice(1),
          url: `/${type}`,
          children: pages.map((p, i) => ({
            label: p.title,
            url: p.url,
            children: [],
            order: i,
          })),
          order: index,
        });
      }
    });

    return {
      primaryNavigation: navItems,
      secondaryNavigation: [],
      footerNavigation: [],
      sitemapUrls: this.crawledPages.map(p => p.url),
    };
  }

  private generateUrlMappingCsv(): string {
    const rows = ['Old URL,New URL,Redirect Type,Notes'];
    
    this.crawledPages.forEach(page => {
      const oldUrl = page.url;
      const newUrl = `/${page.slug}`;
      rows.push(`"${oldUrl}","${newUrl}","301","Auto-generated"`);
    });

    return rows.join('\n');
  }

  private generateMigrationReport(): MigrationReport {
    const pagesByType: Record<string, number> = {};
    this.crawledPages.forEach(page => {
      pagesByType[page.pageType] = (pagesByType[page.pageType] || 0) + 1;
    });

    const totalWordCount = this.crawledPages.reduce((sum, p) => sum + p.wordCount, 0);

    // Identify high-value pages (most content)
    const sortedByContent = [...this.crawledPages].sort((a, b) => b.wordCount - a.wordCount);
    const highValuePages = sortedByContent.slice(0, 10).map(p => p.url);

    // Pages missing metadata
    const missingMetadata = this.crawledPages
      .filter(p => !p.metadata.metaDescription)
      .map(p => p.url);

    // Images needing alt text
    const imagesNeedingAltText = this.allImages
      .filter(img => !img.alt)
      .map(img => img.sourceUrl);

    // Broken media links (images that failed to download)
    const brokenMediaLinks = this.allImages
      .filter(img => !img.downloaded && img.sourceUrl)
      .map(img => img.sourceUrl);

    // Priority classification
    const priority1 = this.crawledPages
      .filter(p => ['home', 'contact', 'services'].includes(p.pageType))
      .map(p => p.url);
    const priority2 = this.crawledPages
      .filter(p => ['about', 'team', 'case-study'].includes(p.pageType))
      .map(p => p.url);
    const priority3 = this.crawledPages
      .filter(p => ['blog', 'resources'].includes(p.pageType))
      .map(p => p.url);
    const archive = this.crawledPages
      .filter(p => p.pageType === 'other')
      .map(p => p.url);

    return {
      siteUrl: this.config.startUrl,
      crawlDate: new Date().toISOString(),
      summary: {
        totalPages: this.crawledPages.length,
        pagesByType,
        totalImages: this.allImages.length,
        totalVideos: this.allVideos.length,
        totalDocuments: this.allDocuments.length,
        totalWordCount,
      },
      contentAudit: {
        highValuePages,
        outdatedContent: [],
        duplicateContent: [],
        missingMetadata,
      },
      migrationPriority: {
        priority1,
        priority2,
        priority3,
        archive,
      },
      urlMapping: this.crawledPages.map(p => ({
        oldUrl: p.url,
        newUrl: `/${p.slug}`,
        redirectType: '301' as const,
        notes: 'Auto-generated',
      })),
      mediaOptimization: {
        imagesNeedingCompression: [],
        imagesNeedingAltText,
        brokenMediaLinks,
      },
      contentGaps: [],
      recommendations: [
        'Review all pages with missing meta descriptions',
        'Add alt text to images that are missing it',
        'Consider consolidating similar service pages',
        'Update outdated content before migration',
        'Verify all redirects are properly configured',
      ],
    };
  }

  private formatMigrationReport(report: MigrationReport): string {
    return `# KDM Website Migration Report

## Summary

- **Site URL**: ${report.siteUrl}
- **Crawl Date**: ${report.crawlDate}
- **Total Pages**: ${report.summary.totalPages}
- **Total Images**: ${report.summary.totalImages}
- **Total Videos**: ${report.summary.totalVideos}
- **Total Documents**: ${report.summary.totalDocuments}
- **Total Word Count**: ${report.summary.totalWordCount.toLocaleString()}

## Pages by Type

${Object.entries(report.summary.pagesByType).map(([type, count]) => `- **${type}**: ${count}`).join('\n')}

## Migration Priority

### Priority 1 (Critical)
${report.migrationPriority.priority1.map(url => `- ${url}`).join('\n') || 'None'}

### Priority 2 (Important)
${report.migrationPriority.priority2.map(url => `- ${url}`).join('\n') || 'None'}

### Priority 3 (Supporting)
${report.migrationPriority.priority3.map(url => `- ${url}`).join('\n') || 'None'}

### Archive
${report.migrationPriority.archive.map(url => `- ${url}`).join('\n') || 'None'}

## Content Audit

### High-Value Pages (by content volume)
${report.contentAudit.highValuePages.map(url => `- ${url}`).join('\n')}

### Pages Missing Meta Description
${report.contentAudit.missingMetadata.length > 0 ? report.contentAudit.missingMetadata.map(url => `- ${url}`).join('\n') : 'None'}

## Media Optimization

### Images Needing Alt Text
${report.mediaOptimization.imagesNeedingAltText.length > 0 ? `${report.mediaOptimization.imagesNeedingAltText.length} images need alt text` : 'All images have alt text'}

### Broken Media Links
${report.mediaOptimization.brokenMediaLinks.length > 0 ? report.mediaOptimization.brokenMediaLinks.map(url => `- ${url}`).join('\n') : 'No broken media links'}

## Recommendations

${report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## Next Steps

1. Review this report and the extracted content
2. Clean up and enhance content as needed
3. Import content into the SVP Platform
4. Configure URL redirects
5. Test all pages and media
6. Verify SEO metadata is preserved

---

*Generated by KDM Content Crawler*
`;
  }

  private saveProgress(): void {
    this.progress.errors = this.errors;
    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'crawl-progress.json'),
      JSON.stringify(this.progress, null, 2)
    );
  }

  // Helper methods
  private extractTagContent(html: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
    const match = html.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractMetaContent(html: string, name: string): string | null {
    const regex = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i');
    const match = html.match(regex);
    if (match) return match[1];

    const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i');
    const match2 = html.match(regex2);
    return match2 ? match2[1] : null;
  }

  private extractMetaProperty(html: string, property: string): string | null {
    const regex = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
    const match = html.match(regex);
    if (match) return match[1];

    const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i');
    const match2 = html.match(regex2);
    return match2 ? match2[1] : null;
  }

  private extractCanonical(html: string): string | null {
    const regex = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i;
    const match = html.match(regex);
    return match ? match[1] : null;
  }

  private extractBreadcrumb(html: string): string[] {
    const breadcrumb: string[] = [];
    const regex = /<(?:nav|ol|ul)[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>([\s\S]*?)<\/(?:nav|ol|ul)>/i;
    const match = html.match(regex);
    
    if (match) {
      const linkRegex = /<a[^>]*>([^<]+)<\/a>/gi;
      const links = match[1].matchAll(linkRegex);
      for (const link of links) {
        breadcrumb.push(link[1].trim());
      }
    }

    return breadcrumb;
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

  private extractFirstCTA(html: string): { text: string; link: string } | undefined {
    const regex = /<a[^>]+href=["']([^"']+)["'][^>]*class="[^"]*(?:btn|button|cta)[^"]*"[^>]*>([^<]+)<\/a>/i;
    const match = html.match(regex);
    if (match) {
      return { link: match[1], text: match[2].trim() };
    }
    return undefined;
  }

  private extractAttribute(html: string, attr: string): string | null {
    const regex = new RegExp(`${attr}=["']([^"']+)["']`, 'i');
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

  private extractVideoUrls(html: string): string[] {
    const urls: string[] = [];
    const youtubeRegex = /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;
    const matches = html.matchAll(youtubeRegex);
    for (const match of matches) {
      urls.push(`https://www.youtube.com/watch?v=${match[1]}`);
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

  private extractSubmitButtonText(html: string): string {
    const regex = /<(?:button|input)[^>]+type=["']submit["'][^>]*>([^<]*)/i;
    const match = html.match(regex);
    if (match && match[1]) return match[1].trim();

    const valueRegex = /<input[^>]+type=["']submit["'][^>]+value=["']([^"']+)["']/i;
    const valueMatch = html.match(valueRegex);
    return valueMatch ? valueMatch[1] : 'Submit';
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
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
      const ext = path.extname(pathname).toLowerCase().replace('.', '');
      return ext || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private determinePageType(url: string, title: string): CrawledPage['pageType'] {
    const urlLower = url.toLowerCase();
    const titleLower = title.toLowerCase();

    if (urlLower.endsWith('/') && urlLower.split('/').length <= 4) return 'home';
    if (urlLower.includes('/about') || titleLower.includes('about')) return 'about';
    if (urlLower.includes('/team') || titleLower.includes('team')) return 'team';
    if (urlLower.includes('/service') || titleLower.includes('service')) return 'services';
    if (urlLower.includes('/blog') || urlLower.includes('/news') || urlLower.includes('/article')) return 'blog';
    if (urlLower.includes('/contact') || titleLower.includes('contact')) return 'contact';
    if (urlLower.includes('/case-stud') || titleLower.includes('case study')) return 'case-study';
    if (urlLower.includes('/resource') || urlLower.includes('/download')) return 'resources';
    if (urlLower.includes('/privacy') || urlLower.includes('/terms') || urlLower.includes('/legal')) return 'legal';

    return 'other';
  }

  private determineSectionType(html: string): ContentSection['type'] {
    if (html.includes('<form')) return 'form';
    if (html.includes('youtube') || html.includes('vimeo') || html.includes('<video')) return 'video';
    if (html.includes('gallery') || (html.match(/<img/gi) || []).length > 3) return 'gallery';
    if (html.includes('testimonial') || html.includes('quote')) return 'testimonial';
    if (html.includes('<img') && html.includes('<p')) return 'image-text';
    if (html.includes('<table')) return 'table';
    if (html.includes('<ul') || html.includes('<ol')) return 'list';
    return 'text';
  }

  private determineImageContext(imgTag: string, html: string): ImageAsset['context'] {
    const classes = this.extractAttribute(imgTag, 'class') || '';
    const src = this.extractAttribute(imgTag, 'src') || '';

    if (classes.includes('hero') || classes.includes('banner')) return 'hero';
    if (classes.includes('logo')) return 'logo';
    if (classes.includes('team') || classes.includes('avatar') || classes.includes('profile')) return 'team';
    if (classes.includes('thumb') || classes.includes('thumbnail')) return 'thumbnail';
    if (classes.includes('icon')) return 'icon';
    if (src.includes('logo')) return 'logo';
    if (src.includes('team') || src.includes('staff')) return 'team';
    if (src.includes('hero') || src.includes('banner')) return 'hero';

    return 'content';
  }

  private determineFormPurpose(formHtml: string, fields: FormField[]): string {
    const formLower = formHtml.toLowerCase();
    const fieldNames = fields.map(f => f.name.toLowerCase());

    if (formLower.includes('contact') || fieldNames.includes('message')) return 'contact';
    if (formLower.includes('newsletter') || formLower.includes('subscribe')) return 'newsletter';
    if (formLower.includes('quote') || formLower.includes('request')) return 'quote-request';
    if (formLower.includes('search')) return 'search';
    if (formLower.includes('login') || formLower.includes('sign')) return 'login';

    return 'general';
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(url: string, type: CrawlError['errorType'], message: string): void {
    const error: CrawlError = {
      url,
      errorType: type,
      message,
      timestamp: new Date().toISOString(),
    };
    this.errors.push(error);
    console.error(`  ❌ Error: ${message}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const config: Partial<CrawlConfig> = {
    startUrl: 'https://www.kdm-assoc.com',
    maxPages: 100,
    crawlDelay: 1500,
    downloadImages: true,
    downloadDocuments: true,
    outputDirectory: './kdm-content-migration',
  };

  const crawler = new ContentCrawler(config);
  await crawler.crawl();
}

main().catch(console.error);
