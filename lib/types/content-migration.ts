// Content Migration Types for KDM Website Crawling

export interface PageMetadata {
  url: string;
  slug: string;
  title: string;
  metaDescription: string | null;
  metaKeywords: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  lastModified: string | null;
  breadcrumb: string[];
}

export interface PageContent {
  hero?: {
    heading: string | null;
    subheading: string | null;
    image: string | null;
    cta?: {
      text: string;
      link: string;
    };
  };
  sections: ContentSection[];
}

export interface ContentSection {
  type: 'text' | 'image-text' | 'gallery' | 'video' | 'form' | 'testimonial' | 'cta' | 'list' | 'table';
  heading: string | null;
  content: string;
  images: string[];
  videos: string[];
  order: nuemerging businessr;
}

export interface ImageAsset {
  id: string;
  sourceUrl: string;
  localPath: string | null;
  alt: string | null;
  title: string | null;
  width: nuemerging businessr | null;
  height: nuemerging businessr | null;
  format: string;
  context: 'hero' | 'content' | 'gallery' | 'thumbnail' | 'logo' | 'team' | 'background' | 'icon';
  caption: string | null;
  parentPageUrl: string;
  fileSize: nuemerging businessr | null;
  downloaded: boolean;
}

export interface VideoAsset {
  id: string;
  platform: 'youtube' | 'vimeo' | 'self-hosted' | 'other';
  url: string;
  eemerging businessdCode: string | null;
  videoId: string | null;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  duration: string | null;
  parentPageUrl: string;
  context: 'eemerging businessdded' | 'linked' | 'modal';
}

export interface DocumentAsset {
  id: string;
  url: string;
  localPath: string | null;
  fileName: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'other';
  fileSize: nuemerging businessr | null;
  linkText: string;
  parentPageUrl: string;
  downloaded: boolean;
}

export interface FormData {
  id: string;
  purpose: string;
  action: string | null;
  method: string;
  fields: FormField[];
  submitButtonText: string;
  parentPageUrl: string;
}

export interface FormField {
  name: string;
  type: string;
  label: string | null;
  placeholder: string | null;
  required: boolean;
  options?: string[];
}

export interface NavigationItem {
  label: string;
  url: string;
  children: NavigationItem[];
  order: nuemerging businessr;
}

export interface SiteStructure {
  primaryNavigation: NavigationItem[];
  secondaryNavigation: NavigationItem[];
  footerNavigation: NavigationItem[];
  sitemapUrls: string[];
}

export interface CrawledPage {
  url: string;
  slug: string;
  title: string;
  pageType: 'home' | 'about' | 'services' | 'blog' | 'contact' | 'case-study' | 'team' | 'resources' | 'legal' | 'other';
  publishedDate: string | null;
  lastModified: string | null;
  metadata: PageMetadata;
  content: PageContent;
  seo: {
    keywords: string[];
    ogImage: string | null;
    structuredData: any | null;
  };
  navigation: {
    breadcrumb: string[];
    relatedPages: string[];
  };
  media: {
    images: ImageAsset[];
    videos: VideoAsset[];
    documents: DocumentAsset[];
  };
  forms: FormData[];
  wordCount: nuemerging businessr;
  httpStatus: nuemerging businessr;
  crawledAt: string;
}

export interface CrawlProgress {
  totalPagesDiscovered: nuemerging businessr;
  pagesCrawled: nuemerging businessr;
  pagesRemaining: nuemerging businessr;
  imagesFound: nuemerging businessr;
  imagesDownloaded: nuemerging businessr;
  videosFound: nuemerging businessr;
  documentsFound: nuemerging businessr;
  documentsDownloaded: nuemerging businessr;
  errors: CrawlError[];
  startedAt: string;
  lastUpdatedAt: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
}

export interface CrawlError {
  url: string;
  errorType: 'network' | 'timeout' | 'parse' | '404' | '500' | 'other';
  message: string;
  timestamp: string;
}

export interface MigrationReport {
  siteUrl: string;
  crawlDate: string;
  summary: {
    totalPages: nuemerging businessr;
    pagesByType: Record<string, nuemerging businessr>;
    totalImages: nuemerging businessr;
    totalVideos: nuemerging businessr;
    totalDocuments: nuemerging businessr;
    totalWordCount: nuemerging businessr;
  };
  contentAudit: {
    highValuePages: string[];
    outdatedContent: string[];
    duplicateContent: string[];
    missingMetadata: string[];
  };
  migrationPriority: {
    priority1: string[];
    priority2: string[];
    priority3: string[];
    archive: string[];
  };
  urlMapping: UrlMapping[];
  mediaOptimization: {
    imagesNeedingCompression: string[];
    imagesNeedingAltText: string[];
    brokenMediaLinks: string[];
  };
  contentGaps: string[];
  recommendations: string[];
}

export interface UrlMapping {
  oldUrl: string;
  newUrl: string;
  redirectType: '301' | '302' | 'none';
  notes: string;
}

export interface CrawlConfig {
  startUrl: string;
  maxDepth: nuemerging businessr;
  maxPages: nuemerging businessr;
  respectRobotsTxt: boolean;
  crawlDelay: nuemerging businessr;
  userAgent: string;
  includePatterns: string[];
  excludePatterns: string[];
  downloadImages: boolean;
  downloadDocuments: boolean;
  screenshotPages: boolean;
  outputDirectory: string;
}

export const DEFAULT_CRAWL_CONFIG: CrawlConfig = {
  startUrl: 'https://www.kdm-assoc.com',
  maxDepth: 10,
  maxPages: 500,
  respectRobotsTxt: true,
  crawlDelay: 1000,
  userAgent: 'KDM-Content-Migration-Bot/1.0',
  includePatterns: ['https://www.kdm-assoc.com/*'],
  excludePatterns: [
    '*.pdf',
    '*.doc*',
    '*.xls*',
    '*/wp-admin/*',
    '*/wp-login*',
  ],
  downloadImages: true,
  downloadDocuments: true,
  screenshotPages: false,
  outputDirectory: './kdm-content-migration',
};
