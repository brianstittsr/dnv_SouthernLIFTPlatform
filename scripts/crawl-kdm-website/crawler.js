import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import PQueue from 'p-queue';
import { config } from './config.js';
import * as utils from './utils.js';

class KDMWebsiteCrawler {
  constructor() {
    this.visitedUrls = new Set();
    this.urlQueue = [];
    this.pages = [];
    this.images = [];
    this.videos = [];
    this.documents = [];
    this.errors = [];
    this.browser = null;
    this.context = null;
    this.queue = new PQueue({ concurrency: config.concurrency });
    this.startTime = Date.now();
  }

  /**
   * Initialize the crawler
   */
  async initialize() {
    console.log('🚀 Initializing KDM Website Crawler...\n');
    console.log(`Target: ${config.startUrl}`);
    console.log(`Output: ${config.outputDir}\n`);

    // Create output directories
    const dirs = [
      config.outputDir,
      path.join(config.outputDir, config.pagesDir),
      path.join(config.outputDir, config.imagesDir, 'heroes'),
      path.join(config.outputDir, config.imagesDir, 'content'),
      path.join(config.outputDir, config.imagesDir, 'logos'),
      path.join(config.outputDir, config.imagesDir, 'team'),
      path.join(config.outputDir, config.videosDir),
      path.join(config.outputDir, config.documentsDir)
    ];

    for (const dir of dirs) {
      await fs.ensureDir(dir);
    }

    // Launch browser
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.context = await this.browser.newContext({
      userAgent: config.userAgent,
      viewport: config.viewport
    });

    console.log('✅ Browser initialized\n');
  }

  /**
   * Start crawling
   */
  async crawl() {
    await this.initialize();

    // Add start URL to queue
    this.urlQueue.push({
      url: config.startUrl,
      depth: 0,
      parentUrl: null
    });

    console.log('🕷️  Starting crawl...\n');

    // Process queue
    while (this.urlQueue.length > 0 && this.visitedUrls.size < config.maxPages) {
      const batch = this.urlQueue.splice(0, config.concurrency);
      
      await Promise.all(
        batch.map(item => this.queue.add(() => this.crawlPage(item)))
      );

      // Progress update
      console.log(`Progress: ${utils.createProgressBar(this.visitedUrls.size, Math.min(config.maxPages, this.visitedUrls.size + this.urlQueue.length))}`);
    }

    await this.finalize();
  }

  /**
   * Crawl a single page
   */
  async crawlPage({ url, depth, parentUrl }) {
    // Skip if already visited
    if (this.visitedUrls.has(url)) return;
    
    // Skip if max depth exceeded
    if (depth > config.maxDepth) return;

    // Skip if should be excluded
    if (utils.shouldExcludeUrl(url)) return;

    this.visitedUrls.add(url);

    try {
      console.log(`📄 Crawling [${this.visitedUrls.size}]: ${url}`);

      const page = await this.context.newPage();
      
      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: config.timeout
      });

      // Wait a bit for dynamic content
      await page.waitForTimeout(1000);

      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract page data
      const pageData = await this.extractPageData(page, $, url);
      this.pages.push(pageData);

      // Extract links for further crawling
      const links = await this.extractLinks($, url);
      
      // Add new links to queue
      for (const link of links) {
        if (!this.visitedUrls.has(link) && !this.urlQueue.some(item => item.url === link)) {
          this.urlQueue.push({
            url: link,
            depth: depth + 1,
            parentUrl: url
          });
        }
      }

      await page.close();

      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));

    } catch (error) {
      console.error(`❌ Error crawling ${url}:`, error.message);
      this.errors.push({
        url,
        error: error.message,
        timestamp: utils.formatTimestamp()
      });
    }
  }

  /**
   * Extract all data from a page
   */
  async extractPageData(page, $, url) {
    const pageData = {
      url,
      slug: utils.generateSlug(url),
      pageType: utils.getPageType(url),
      crawledAt: utils.formatTimestamp(),
      
      // Metadata
      metadata: {
        title: await page.title(),
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        ogTitle: $('meta[property="og:title"]').attr('content') || '',
        ogDescription: $('meta[property="og:description"]').attr('content') || '',
        ogImage: $('meta[property="og:image"]').attr('content') || '',
        canonical: $('link[rel="canonical"]').attr('href') || url
      },

      // Content
      content: this.extractContent($),

      // Navigation
      navigation: this.extractNavigation($),

      // Media
      media: {
        images: await this.extractImages($, url),
        videos: this.extractVideos($, url),
        documents: this.extractDocuments($, url)
      },

      // SEO
      seo: {
        h1: $('h1').map((i, el) => $(el).text().trim()).get(),
        h2: $('h2').map((i, el) => $(el).text().trim()).get(),
        structuredData: this.extractStructuredData($)
      }
    };

    return pageData;
  }

  /**
   * Extract main content from page
   */
  extractContent($) {
    // Remove ignored elements
    config.ignoreSelectors.forEach(selector => {
      $(selector).remove();
    });

    const content = {
      hero: this.extractHero($),
      sections: this.extractSections($),
      forms: this.extractForms($)
    };

    return content;
  }

  /**
   * Extract hero section
   */
  extractHero($) {
    const hero = $('header, .hero, .banner, [class*="hero"], [class*="banner"]').first();
    
    if (hero.length === 0) return null;

    return {
      heading: hero.find('h1, h2').first().text().trim(),
      subheading: hero.find('p').first().text().trim(),
      image: hero.find('img').first().attr('src') || null,
      cta: {
        text: hero.find('a, button').first().text().trim(),
        link: hero.find('a').first().attr('href') || null
      }
    };
  }

  /**
   * Extract content sections
   */
  extractSections($) {
    const sections = [];
    
    $('section, article, .content-section, [class*="section"]').each((i, el) => {
      const $section = $(el);
      
      sections.push({
        type: this.determineSectionType($section),
        heading: $section.find('h1, h2, h3').first().text().trim(),
        content: utils.cleanText($section.text()),
        html: $section.html(),
        images: $section.find('img').map((i, img) => $(img).attr('src')).get(),
        links: $section.find('a').map((i, a) => ({
          text: $(a).text().trim(),
          href: $(a).attr('href')
        })).get()
      });
    });

    return sections;
  }

  /**
   * Determine section type
   */
  determineSectionType($section) {
    const classes = $section.attr('class') || '';
    const html = $section.html() || '';

    if (classes.includes('gallery') || $section.find('img').length > 3) return 'gallery';
    if (classes.includes('video') || html.includes('iframe')) return 'video';
    if (classes.includes('form') || $section.find('form').length > 0) return 'form';
    if (classes.includes('testimonial') || classes.includes('quote')) return 'testimonial';
    if ($section.find('img').length > 0) return 'image-text';
    return 'text';
  }

  /**
   * Extract forms
   */
  extractForms($) {
    const forms = [];

    $('form').each((i, el) => {
      const $form = $(el);
      
      forms.push({
        action: $form.attr('action'),
        method: $form.attr('method') || 'POST',
        fields: $form.find('input, textarea, select').map((i, field) => ({
          name: $(field).attr('name'),
          type: $(field).attr('type') || 'text',
          label: $(field).prev('label').text().trim(),
          required: $(field).attr('required') !== undefined
        })).get(),
        submitText: $form.find('button[type="submit"], input[type="submit"]').val() || 'Submit'
      });
    });

    return forms;
  }

  /**
   * Extract navigation
   */
  extractNavigation($) {
    return {
      primary: this.extractMenu($('nav, .nav, .navigation, [class*="menu"]').first()),
      footer: this.extractMenu($('footer nav, footer .menu').first()),
      breadcrumb: $('.breadcrumb, [class*="breadcrumb"]').find('a').map((i, a) => ({
        text: $(a).text().trim(),
        href: $(a).attr('href')
      })).get()
    };
  }

  /**
   * Extract menu items
   */
  extractMenu($menu) {
    if ($menu.length === 0) return [];

    return $menu.find('a').map((i, a) => ({
      text: $(a).text().trim(),
      href: $(a).attr('href'),
      isActive: $(a).hasClass('active') || $(a).hasClass('current')
    })).get();
  }

  /**
   * Extract images
   */
  async extractImages($, pageUrl) {
    const images = [];
    const imageElements = $('img').toArray();

    for (let i = 0; i < imageElements.length; i++) {
      const $img = $(imageElements[i]);
      const src = $img.attr('src') || $img.attr('data-src');
      
      if (!src) continue;

      const absoluteUrl = utils.normalizeUrl(src, pageUrl);
      if (!absoluteUrl || !utils.isImage(absoluteUrl)) continue;

      const imageData = {
        url: absoluteUrl,
        alt: $img.attr('alt') || '',
        title: $img.attr('title') || '',
        width: $img.attr('width') || null,
        height: $img.attr('height') || null,
        context: this.determineImageContext($img),
        parentPage: pageUrl
      };

      images.push(imageData);
      this.images.push(imageData);

      // Download image if enabled
      if (config.downloadMedia) {
        const filename = utils.generateMediaFilename(absoluteUrl, this.images.length);
        const outputPath = path.join(
          config.outputDir,
          config.imagesDir,
          imageData.context,
          filename
        );
        
        await utils.downloadFile(absoluteUrl, outputPath);
        imageData.localPath = outputPath;
      }
    }

    return images;
  }

  /**
   * Determine image context
   */
  determineImageContext($img) {
    const classes = $img.attr('class') || '';
    const parent = $img.parent().attr('class') || '';
    
    if (classes.includes('logo') || parent.includes('logo')) return 'logos';
    if (classes.includes('hero') || parent.includes('hero')) return 'heroes';
    if (classes.includes('team') || parent.includes('team')) return 'team';
    return 'content';
  }

  /**
   * Extract videos
   */
  extractVideos($, pageUrl) {
    const videos = [];

    // Find iframes (YouTube, Vimeo embeds)
    $('iframe').each((i, el) => {
      const src = $(el).attr('src');
      if (!src) return;

      const videoInfo = utils.extractVideoInfo(src);
      if (videoInfo) {
        videos.push({
          ...videoInfo,
          title: $(el).attr('title') || '',
          parentPage: pageUrl
        });
        this.videos.push(videoInfo);
      }
    });

    // Find video links
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      const videoInfo = utils.extractVideoInfo(href);
      if (videoInfo) {
        videos.push({
          ...videoInfo,
          linkText: $(el).text().trim(),
          parentPage: pageUrl
        });
        this.videos.push(videoInfo);
      }
    });

    // Find video elements
    $('video').each((i, el) => {
      const src = $(el).attr('src') || $(el).find('source').first().attr('src');
      if (src) {
        const absoluteUrl = utils.normalizeUrl(src, pageUrl);
        const videoInfo = {
          platform: 'self-hosted',
          url: absoluteUrl,
          poster: $(el).attr('poster') || null,
          parentPage: pageUrl
        };
        videos.push(videoInfo);
        this.videos.push(videoInfo);
      }
    });

    return videos;
  }

  /**
   * Extract documents
   */
  extractDocuments($, pageUrl) {
    const documents = [];

    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (!href || !utils.isDocument(href)) return;

      const absoluteUrl = utils.normalizeUrl(href, pageUrl);
      if (!absoluteUrl) return;

      const docData = {
        url: absoluteUrl,
        linkText: $(el).text().trim(),
        filename: path.basename(new URL(absoluteUrl).pathname),
        parentPage: pageUrl
      };

      documents.push(docData);
      this.documents.push(docData);

      // Download document if enabled
      if (config.downloadMedia) {
        const filename = utils.sanitizeFilename(docData.filename);
        const outputPath = path.join(config.outputDir, config.documentsDir, filename);
        utils.downloadFile(absoluteUrl, outputPath);
      }
    });

    return documents;
  }

  /**
   * Extract structured data
   */
  extractStructuredData($) {
    const structuredData = [];

    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const data = JSON.parse($(el).html());
        structuredData.push(data);
      } catch (e) {
        // Invalid JSON
      }
    });

    return structuredData;
  }

  /**
   * Extract links from page
   */
  async extractLinks($, currentUrl) {
    const links = [];

    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      const absoluteUrl = utils.normalizeUrl(href, currentUrl);
      if (!absoluteUrl) return;

      // Only internal links
      if (!utils.isInternalUrl(absoluteUrl, config.baseUrl)) return;

      // Skip documents and images
      if (utils.isDocument(absoluteUrl) || utils.isImage(absoluteUrl)) return;

      links.push(absoluteUrl);
    });

    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Finalize crawl and save results
   */
  async finalize() {
    console.log('\n\n📊 Finalizing crawl...\n');

    const duration = Math.round((Date.now() - this.startTime) / 1000);

    // Save individual page data
    for (const page of this.pages) {
      const filename = `${page.slug}.json`;
      const filepath = path.join(config.outputDir, config.pagesDir, filename);
      await utils.saveJson(page, filepath);
    }

    // Save site structure
    const siteStructure = {
      crawledAt: utils.formatTimestamp(),
      duration: `${duration} seconds`,
      startUrl: config.startUrl,
      totalPages: this.pages.length,
      totalImages: this.images.length,
      totalVideos: this.videos.length,
      totalDocuments: this.documents.length,
      pages: this.pages.map(p => ({
        url: p.url,
        slug: p.slug,
        pageType: p.pageType,
        title: p.metadata.title
      }))
    };
    await utils.saveJson(siteStructure, path.join(config.outputDir, 'site-structure.json'));

    // Save navigation map
    const navigationMap = {
      pages: this.pages.map(p => ({
        url: p.url,
        title: p.metadata.title,
        navigation: p.navigation
      }))
    };
    await utils.saveJson(navigationMap, path.join(config.outputDir, 'navigation-map.json'));

    // Save video inventory
    await utils.saveJson(
      { videos: this.videos },
      path.join(config.outputDir, config.videosDir, 'video-inventory.json')
    );

    // Save URL mapping CSV
    const urlMapping = this.pages.map(p => 
      `"${p.url}","${p.slug}","${p.pageType}","${p.metadata.title}"`
    ).join('\n');
    await fs.writeFile(
      path.join(config.outputDir, 'url-mapping.csv'),
      'Old URL,Slug,Page Type,Title\n' + urlMapping
    );

    // Generate migration report
    await this.generateReport(duration);

    // Close browser
    await this.browser.close();

    console.log('\n✅ Crawl complete!\n');
    console.log(`📁 Output directory: ${config.outputDir}`);
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📄 Pages crawled: ${this.pages.length}`);
    console.log(`🖼️  Images found: ${this.images.length}`);
    console.log(`🎥 Videos found: ${this.videos.length}`);
    console.log(`📎 Documents found: ${this.documents.length}`);
    console.log(`❌ Errors: ${this.errors.length}\n`);
  }

  /**
   * Generate migration report
   */
  async generateReport(duration) {
    const report = `# KDM Website Content Migration Report

## Crawl Summary

- **Start URL**: ${config.startUrl}
- **Crawled At**: ${utils.formatTimestamp()}
- **Duration**: ${duration} seconds
- **Pages Crawled**: ${this.pages.length}
- **Images Found**: ${this.images.length}
- **Videos Found**: ${this.videos.length}
- **Documents Found**: ${this.documents.length}
- **Errors**: ${this.errors.length}

## Page Type Breakdown

${this.generatePageTypeBreakdown()}

## Content Statistics

${this.generateContentStats()}

## Media Assets

### Images by Context
${this.generateImageBreakdown()}

### Videos by Platform
${this.generateVideoBreakdown()}

### Documents
- Total documents found: ${this.documents.length}
- Document types: ${this.getDocumentTypes().join(', ')}

## Errors

${this.errors.length > 0 ? this.errors.map(e => `- ${e.url}: ${e.error}`).join('\n') : 'No errors encountered'}

## Next Steps

1. Review extracted content in \`${config.pagesDir}/\` directory
2. Review and optimize images in \`${config.imagesDir}/\` directory
3. Verify video links in \`${config.videosDir}/video-inventory.json\`
4. Check URL mapping in \`url-mapping.csv\`
5. Begin content migration to SVP Platform

## Files Generated

- \`site-structure.json\` - Complete site structure and page inventory
- \`navigation-map.json\` - Navigation structure and relationships
- \`url-mapping.csv\` - Old URL to new URL mapping
- \`pages/*.json\` - Individual page data files
- \`media/images/\` - Downloaded images organized by context
- \`media/videos/video-inventory.json\` - Video inventory
- \`media/documents/\` - Downloaded documents
`;

    await fs.writeFile(path.join(config.outputDir, 'migration-report.md'), report);
  }

  /**
   * Generate page type breakdown
   */
  generatePageTypeBreakdown() {
    const breakdown = {};
    this.pages.forEach(p => {
      breakdown[p.pageType] = (breakdown[p.pageType] || 0) + 1;
    });

    return Object.entries(breakdown)
      .map(([type, count]) => `- **${type}**: ${count} pages`)
      .join('\n');
  }

  /**
   * Generate content statistics
   */
  generateContentStats() {
    const totalSections = this.pages.reduce((sum, p) => sum + (p.content.sections?.length || 0), 0);
    const totalForms = this.pages.reduce((sum, p) => sum + (p.content.forms?.length || 0), 0);
    
    return `- Total content sections: ${totalSections}
- Total forms: ${totalForms}
- Average sections per page: ${Math.round(totalSections / this.pages.length)}`;
  }

  /**
   * Generate image breakdown
   */
  generateImageBreakdown() {
    const breakdown = {};
    this.images.forEach(img => {
      breakdown[img.context] = (breakdown[img.context] || 0) + 1;
    });

    return Object.entries(breakdown)
      .map(([context, count]) => `- **${context}**: ${count} images`)
      .join('\n');
  }

  /**
   * Generate video breakdown
   */
  generateVideoBreakdown() {
    const breakdown = {};
    this.videos.forEach(video => {
      breakdown[video.platform] = (breakdown[video.platform] || 0) + 1;
    });

    return Object.entries(breakdown)
      .map(([platform, count]) => `- **${platform}**: ${count} videos`)
      .join('\n');
  }

  /**
   * Get document types
   */
  getDocumentTypes() {
    const types = new Set();
    this.documents.forEach(doc => {
      const ext = path.extname(doc.filename);
      if (ext) types.add(ext);
    });
    return Array.from(types);
  }
}

// Run crawler
const crawler = new KDMWebsiteCrawler();
crawler.crawl().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
