/**
 * KDM Website Content Index
 * 
 * Central export for all KDM content and utilities
 */

// Re-export all content loader functions
export {
  getSiteMetadata,
  getPageContent,
  getAvailablePages,
  getNewsArticles,
  getArticlesByCategory,
  getTeamMembers,
  getServices,
  getContactInfo,
  getSocialMediaLinks,
  getNavigation,
  getBranding,
  getFAQs,
  getPerformanceStats,
} from '../../lib/content/kdm-content-loader';

// Re-export types
export type {
  SiteMetadata,
  NavItem,
  PageContent,
  PageSection,
  ServiceItem,
  StatItem,
  TeamMember,
  NewsArticle,
  ArticlesIndex,
} from '../../lib/content/kdm-content-loader';

// Content file paths for direct imports if needed
export const CONTENT_PATHS = {
  siteMetadata: 'content/kdm-website/site-metadata.json',
  pages: {
    home: 'content/kdm-website/pages/home.json',
    about: 'content/kdm-website/pages/about.json',
    contact: 'content/kdm-website/pages/contact.json',
    services: 'content/kdm-website/pages/services.json',
    privacyPolicy: 'content/kdm-website/pages/privacy-policy.json',
    termsOfService: 'content/kdm-website/pages/terms-of-service.json',
    faq: 'content/kdm-website/pages/faq.json',
  },
  news: {
    articlesIndex: 'content/kdm-website/news/articles-index.json',
  },
} as const;

// Available page slugs
export const PAGE_SLUGS = [
  'home',
  'about', 
  'contact',
  'services',
  'privacy-policy',
  'terms-of-service',
  'faq',
] as const;

export type PageSlug = typeof PAGE_SLUGS[number];
