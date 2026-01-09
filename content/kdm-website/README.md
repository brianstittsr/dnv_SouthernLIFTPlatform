# KDM Associates Website Content

This directory contains scraped content from the [KDM Associates website](https://kdm-assoc.com) organized for reuse in the SVP Platform.

## Directory Structure

```
content/kdm-website/
├── site-metadata.json      # Global site configuration, navigation, contact info
├── pages/                  # Individual page content
│   ├── home.json          # Homepage content and sections
│   ├── about.json         # About page with team members
│   ├── contact.json       # Contact page and form configuration
│   ├── services.json      # Services detail page
│   ├── privacy-policy.json # Privacy policy content
│   ├── terms-of-service.json # Terms of service content
│   └── faq.json           # FAQ content
├── news/                   # News and articles
│   └── articles-index.json # Index of all news articles
└── README.md              # This file
```

## Usage

### Loading Content in TypeScript/JavaScript

```typescript
import {
  getSiteMetadata,
  getPageContent,
  getTeamMembers,
  getServices,
  getContactInfo,
  getNewsArticles,
  getFAQs,
  getPerformanceStats
} from '@/lib/content/kdm-content-loader';

// Get site metadata
const metadata = await getSiteMetadata();
console.log(metadata.siteName); // "KDM & Associates"

// Get page content
const homePage = await getPageContent('home');
const aboutPage = await getPageContent('about');

// Get team members
const team = await getTeamMembers();

// Get services
const services = await getServices();

// Get contact info
const contact = await getContactInfo();

// Get news articles
const news = await getNewsArticles();

// Get FAQs
const faqs = await getFAQs();

// Get performance stats
const stats = await getPerformanceStats();
```

## Content Structure

### Site Metadata (`site-metadata.json`)

Contains:
- **siteName**: "KDM & Associates"
- **siteDescription**: Company description for SEO
- **contact**: Address, phone, email
- **socialMedia**: Instagram, Twitter, Facebook, LinkedIn links
- **navigation**: Main nav and footer nav structure
- **branding**: Taglines and copyright

### Page Content

Each page JSON file contains:
- **pageId**: Unique identifier
- **title**: Page title for SEO
- **slug**: URL path
- **sections**: Array of content sections with type-specific data

### Section Types

- `hero` - Hero banner with headline, description, CTA
- `page-header` - Page title with breadcrumb
- `content-block` - Rich text content
- `services-grid` - Grid of service cards
- `services-detail` - Detailed service descriptions
- `stats` - Performance metrics display
- `team-grid` - Team member cards
- `contact-details` - Contact information
- `form` - Form configuration
- `faq-section` - FAQ accordion
- `cta-banner` - Call-to-action banner
- `legal-section` - Legal document sections

## Key Information

### Contact Details
- **Address**: 300 New Jersey Avenue Northwest, Washington, DC 20001
- **Phone**: 202-469-3423
- **Email**: info@kdm-assoc.com

### Social Media
- Instagram: @mbdafpcenter
- Twitter: @mbdafpcenter
- Facebook: /mbdafpcenter
- LinkedIn: /company/mbdafpcenter

### Performance Stats
- 300+ Minority Business Clients
- 14+ Shared Outcome Agreements
- $50B+ Contract Awarded Transactions
- 100+ Services/Resource Partners

### Services Offered
1. **Digital Solutions** - Websites, Digital Ecosystems, E-commerce
2. **Technology Solutions** - Blockchain, CRM & AI Integration, Cybersecurity
3. **Grants-NOFO-RFPs** - Quick Bid/No Bid, Proposal Management, Grant Writing
4. **Marketing Solutions** - Import & Export, Content Creation, PR/News Distribution
5. **Operations/Performance** - Business Assessments, Capital Readiness, Strategic Plans
6. **Contracting Vehicles** - Certifications, Mentor-Protégé & JVs, SBA Programs

## Downloading Assets

To download images and other assets from the KDM website:

```bash
npx ts-node scripts/download-kdm-assets.ts
```

Assets will be saved to `public/kdm-assets/`.

## Source

Content scraped from https://kdm-assoc.com on 2026-01-09.

## Notes

- Some content may reference "QmeLocal" which appears to be a related platform
- Team member profile images need to be downloaded separately
- News article full content can be fetched from the source URLs in `articles-index.json`
