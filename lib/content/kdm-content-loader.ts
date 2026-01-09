/**
 * KDM Website Content Loader
 * 
 * Utility functions to load and use scraped content from the KDM Associates website
 * for reuse in the SVP Platform.
 */

import fs from 'fs';
import path from 'path';

const CONTENT_BASE_PATH = path.join(process.cwd(), 'content', 'kdm-website');

export interface SiteMetadata {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  sourceUrl: string;
  scrapedDate: string;
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  socialMedia: {
    instagram: string;
    twitter: string;
    facebook: string;
    linkedin: string;
  };
  navigation: {
    main: NavItem[];
    footer: {
      quickLinks: NavItem[];
      aboutUs: NavItem[];
      legal: NavItem[];
    };
  };
  branding: {
    tagline: string;
    subTagline: string;
    copyright: string;
  };
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface PageContent {
  pageId: string;
  title: string;
  slug: string;
  sections: PageSection[];
  effectiveDate?: string;
}

export interface PageSection {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: Record<string, unknown>;
  services?: ServiceItem[];
  stats?: StatItem[];
}

export interface ServiceItem {
  id: string;
  title: string;
  icon: string;
  description?: string;
  items?: string[];
  offerings?: {
    name: string;
    description: string;
  }[];
  cta?: {
    label: string;
    href: string;
  };
}

export interface StatItem {
  value: string;
  label: string;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  profileUrl: string | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  sourceUrl: string;
  category: string;
}

export interface ArticlesIndex {
  category: string;
  title: string;
  description: string;
  articles: NewsArticle[];
}

/**
 * Load site metadata from the scraped content
 */
export async function getSiteMetadata(): Promise<SiteMetadata> {
  const filePath = path.join(CONTENT_BASE_PATH, 'site-metadata.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as SiteMetadata;
}

/**
 * Load a specific page content by page ID
 */
export async function getPageContent(pageId: string): Promise<PageContent | null> {
  const filePath = path.join(CONTENT_BASE_PATH, 'pages', `${pageId}.json`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as PageContent;
}

/**
 * Get all available page IDs
 */
export async function getAvailablePages(): Promise<string[]> {
  const pagesDir = path.join(CONTENT_BASE_PATH, 'pages');
  const files = fs.readdirSync(pagesDir);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
}

/**
 * Load news articles index
 */
export async function getNewsArticles(): Promise<ArticlesIndex> {
  const filePath = path.join(CONTENT_BASE_PATH, 'news', 'articles-index.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as ArticlesIndex;
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(category: string): Promise<NewsArticle[]> {
  const index = await getNewsArticles();
  return index.articles.filter(article => article.category === category);
}

/**
 * Get team members from the about page
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const aboutPage = await getPageContent('about');
  if (!aboutPage) return [];
  
  const teamSection = aboutPage.sections.find(s => s.type === 'team-grid');
  if (!teamSection || !teamSection.content) return [];
  
  return (teamSection.content as { members: TeamMember[] }).members || [];
}

/**
 * Get services from the services page
 */
export async function getServices(): Promise<ServiceItem[]> {
  const servicesPage = await getPageContent('services');
  if (!servicesPage) return [];
  
  const servicesSection = servicesPage.sections.find(s => s.type === 'services-detail');
  return servicesSection?.services || [];
}

/**
 * Get contact information
 */
export async function getContactInfo(): Promise<SiteMetadata['contact'] | null> {
  const metadata = await getSiteMetadata();
  return metadata.contact;
}

/**
 * Get social media links
 */
export async function getSocialMediaLinks(): Promise<SiteMetadata['socialMedia'] | null> {
  const metadata = await getSiteMetadata();
  return metadata.socialMedia;
}

/**
 * Get navigation structure
 */
export async function getNavigation(): Promise<SiteMetadata['navigation'] | null> {
  const metadata = await getSiteMetadata();
  return metadata.navigation;
}

/**
 * Get branding information
 */
export async function getBranding(): Promise<SiteMetadata['branding'] | null> {
  const metadata = await getSiteMetadata();
  return metadata.branding;
}

/**
 * Get FAQ items
 */
export async function getFAQs(): Promise<{ question: string; answer: string }[]> {
  const faqPage = await getPageContent('faq');
  if (!faqPage) return [];
  
  const faqSection = faqPage.sections.find(s => s.type === 'faq-section');
  if (!faqSection || !faqSection.content) return [];
  
  return (faqSection.content as { faqs: { question: string; answer: string }[] }).faqs || [];
}

/**
 * Get stats/performance metrics
 */
export async function getPerformanceStats(): Promise<StatItem[]> {
  const homePage = await getPageContent('home');
  if (!homePage) return [];
  
  const statsSection = homePage.sections.find(s => s.type === 'stats');
  return statsSection?.stats || [];
}
