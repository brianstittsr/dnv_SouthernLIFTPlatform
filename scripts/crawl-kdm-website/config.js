export const config = {
  // Target website
  startUrl: 'https://www.kdm-assoc.com',
  baseUrl: 'https://www.kdm-assoc.com',
  
  // Output directories
  outputDir: '../../docs/content-migration',
  pagesDir: 'pages',
  mediaDir: 'media',
  imagesDir: 'media/images',
  videosDir: 'media/videos',
  documentsDir: 'media/documents',
  
  // Crawl settings
  maxPages: 500, // Maximum pages to crawl
  maxDepth: 10, // Maximum depth from start URL
  concurrency: 3, // Number of concurrent page requests
  delayBetweenRequests: 1000, // Milliseconds between requests
  timeout: 30000, // Page load timeout in milliseconds
  
  // Content extraction
  extractImages: true,
  extractVideos: true,
  extractDocuments: true,
  downloadMedia: true,
  
  // Image settings
  imageFormats: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.ico'],
  minImageSize: 1000, // Minimum file size in bytes to download
  
  // Video platforms
  videoPlatforms: {
    youtube: /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    vimeo: /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/,
  },
  
  // Document formats
  documentFormats: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
  
  // Selectors to ignore (ads, tracking, etc.)
  ignoreSelectors: [
    'script',
    'style',
    'noscript',
    '.advertisement',
    '.ad-container',
    '#cookie-banner',
    '.social-share-buttons'
  ],
  
  // URL patterns to exclude
  excludePatterns: [
    /\/wp-admin\//,
    /\/wp-login\//,
    /\/feed\//,
    /\.(xml|json|rss)$/,
    /\/tag\//,
    /\/author\//,
    /\?replytocom=/,
    /\/page\/\d+\//  // Pagination pages
  ],
  
  // User agent
  userAgent: 'KDM-Content-Migration-Bot/1.0 (Content Migration Tool)',
  
  // Viewport settings
  viewport: {
    width: 1920,
    height: 1080
  },
  
  // Page types classification
  pageTypes: {
    home: /^\/$|^\/index/,
    about: /\/about/,
    services: /\/services|\/solutions/,
    blog: /\/blog|\/news|\/articles/,
    contact: /\/contact/,
    team: /\/team|\/people|\/staff/,
    caseStudy: /\/case-study|\/portfolio|\/work/,
    resource: /\/resources|\/downloads/
  }
};
