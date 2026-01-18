# KDM Associates Website Content Crawling & Migration Prompt

## Objective
Crawl and analyze the entire https://www.kdm-assoc.com website to extract all content, images, videos, and structural information for migration to the new SVP Platform.

## Crawling Instructions

### 1. Site Structure Analysis
- **Start URL**: https://www.kdm-assoc.com
- **Crawl Depth**: Complete site (all accessible pages)
- **Follow**: All internal links, navigation menus, footer links, sitemap
- **Respect**: robots.txt and crawl-delay directives
- **User Agent**: Identify as content migration tool

### 2. Page Content Extraction

For each page discovered, extract:

#### A. Metadata
- Page URL (full path)
- Page title (from `<title>` tag)
- Meta description
- Meta keywords
- Open Graph tags (og:title, og:description, og:image)
- Canonical URL
- Last modified date (if available)
- Page hierarchy/breadcrumb structure

#### B. Main Content
- **Headings**: All H1-H6 tags with hierarchy preserved
- **Body Text**: All paragraph content, maintaining formatting
- **Lists**: Ordered and unordered lists with structure
- **Tables**: Table data with headers and cell content
- **Blockquotes**: Quote content and attribution
- **Code Blocks**: Any technical content or code snippets
- **Callouts/Alerts**: Special formatted sections (warnings, tips, notes)

#### C. Navigation & Structure
- Primary navigation menu items and structure
- Secondary/utility navigation
- Footer navigation and links
- Sidebar content and widgets
- Breadcrumb trails
- Internal link relationships (page-to-page connections)

### 3. Media Asset Collection

#### A. Images
For each image found, capture:
- **Source URL**: Full image URL
- **Alt Text**: Alternative text description
- **Title Attribute**: Image title if present
- **Dimensions**: Width and height (if specified)
- **File Format**: jpg, png, svg, gif, webp, etc.
- **Context**: Where image appears (hero, content, gallery, thumbnail)
- **Caption**: Associated caption text if present
- **Parent Page**: Which page contains this image
- **Download**: Save actual image file with organized naming

Image Types to Capture:
- Hero/banner images
- Content images (inline)
- Logos and branding
- Icons and graphics
- Team member photos
- Case study images
- Product/service images
- Infographics
- Background images (from CSS if possible)
- Thumbnails

#### B. Videos
For each video found, capture:
- **Video URL**: Full video link (YouTube, Vimeo, self-hosted)
- **Embed Code**: Complete iframe or embed code
- **Video ID**: Platform-specific identifier
- **Thumbnail**: Video preview image URL
- **Title**: Video title
- **Description**: Video description if available
- **Duration**: Video length if available
- **Parent Page**: Which page contains this video
- **Context**: How video is presented (embedded, linked, modal)

Video Sources to Check:
- YouTube embeds
- Vimeo embeds
- Self-hosted video files (.mp4, .webm, .mov)
- Video links in text
- Video galleries or playlists

### 4. Document & File Assets

Capture all downloadable files:
- **PDFs**: Whitepapers, case studies, guides
- **Documents**: Word docs, presentations, spreadsheets
- **File URL**: Full download link
- **File Name**: Original filename
- **File Size**: If available
- **Link Text**: Text of the download link
- **Parent Page**: Where file is linked from

### 5. Forms & Interactive Elements

Document all forms:
- Form purpose (contact, newsletter, quote request)
- Form fields (name, type, required/optional)
- Submit button text
- Form action URL
- Success/error messages
- Associated CTAs (calls-to-action)

### 6. SEO & Technical Data

Extract:
- **Structured Data**: JSON-LD, Schema.org markup
- **Redirects**: Any redirect chains discovered
- **404 Pages**: Broken links or missing pages
- **Response Codes**: HTTP status for each page
- **Load Times**: Page performance metrics
- **Mobile Responsiveness**: Viewport settings

### 7. Content Categorization

Organize extracted content by:
- **Page Type**: Home, About, Services, Blog, Contact, etc.
- **Content Type**: Article, Landing Page, Service Page, Case Study
- **Topic/Category**: Business areas, service categories
- **Priority**: Critical pages vs. supporting content
- **Date**: Publication or last update date

## Output Format

### Deliverable Structure

```
kdm-content-migration/
├── pages/
│   ├── home.json
│   ├── about/
│   │   ├── company.json
│   │   └── team.json
│   ├── services/
│   │   ├── service-1.json
│   │   └── service-2.json
│   └── blog/
│       ├── post-1.json
│       └── post-2.json
├── media/
│   ├── images/
│   │   ├── heroes/
│   │   ├── content/
│   │   ├── team/
│   │   └── logos/
│   ├── videos/
│   │   └── video-inventory.json
│   └── documents/
│       └── pdfs/
├── site-structure.json
├── navigation-map.json
├── url-mapping.csv
└── migration-report.md
```

### JSON Schema for Page Data

```json
{
  "url": "https://www.kdm-assoc.com/page-path",
  "slug": "page-path",
  "title": "Page Title",
  "metaDescription": "Meta description text",
  "pageType": "service|about|blog|home|contact",
  "publishedDate": "2024-01-01",
  "lastModified": "2024-12-01",
  "content": {
    "hero": {
      "heading": "Main heading",
      "subheading": "Subheading text",
      "image": "/media/images/heroes/hero-1.jpg",
      "cta": {
        "text": "Get Started",
        "link": "/contact"
      }
    },
    "sections": [
      {
        "type": "text|image-text|gallery|video|form",
        "heading": "Section heading",
        "content": "HTML content",
        "images": ["image-url-1", "image-url-2"],
        "videos": ["video-url-1"]
      }
    ]
  },
  "seo": {
    "keywords": ["keyword1", "keyword2"],
    "ogImage": "og-image-url",
    "structuredData": {}
  },
  "navigation": {
    "breadcrumb": ["Home", "Services", "Current Page"],
    "relatedPages": ["url-1", "url-2"]
  },
  "media": {
    "images": [
      {
        "url": "image-url",
        "alt": "alt text",
        "context": "hero|content|thumbnail"
      }
    ],
    "videos": [
      {
        "platform": "youtube|vimeo|self-hosted",
        "url": "video-url",
        "embedCode": "iframe code"
      }
    ]
  }
}
```

## Analysis Requirements

After crawling, provide:

### 1. Site Inventory Report
- Total pages discovered
- Page type breakdown
- Content volume (word count per page)
- Media asset counts (images, videos, documents)

### 2. Content Audit
- High-value pages (most linked, most content)
- Outdated content (by date)
- Duplicate content detection
- Missing metadata (pages without descriptions)

### 3. Migration Recommendations
- **Priority 1**: Critical pages (home, main services, contact)
- **Priority 2**: Important content (about, team, case studies)
- **Priority 3**: Supporting content (blog, resources)
- **Archive**: Outdated or low-value content

### 4. URL Mapping Strategy
- Old URL → New URL mapping
- Redirect requirements (301 redirects)
- URL structure improvements
- SEO preservation plan

### 5. Media Optimization Needs
- Images requiring compression
- Images needing alt text
- Videos needing captions
- Broken media links

### 6. Content Gaps & Opportunities
- Missing service descriptions
- Incomplete team bios
- Outdated case studies
- SEO improvement opportunities

## Special Considerations

### Brand Consistency
- Capture brand colors, fonts, styling
- Logo variations and usage
- Brand voice and messaging patterns
- Design patterns and components

### Legal & Compliance
- Privacy policy content
- Terms of service
- Cookie notices
- Compliance statements

### Contact Information
- All phone numbers
- Email addresses
- Physical addresses
- Social media links
- Business hours

### Testimonials & Social Proof
- Client testimonials
- Case study quotes
- Awards and certifications
- Client logos
- Review snippets

## Tools & Methods

Recommended crawling tools:
- **Screaming Frog SEO Spider**: Comprehensive site crawl
- **HTTrack**: Website copier for offline browsing
- **wget/curl**: Command-line downloading
- **Beautiful Soup/Scrapy**: Python-based scraping
- **Puppeteer/Playwright**: JavaScript rendering for dynamic content

## Quality Assurance

Verify:
- ✅ All pages discovered and crawled
- ✅ All images downloaded and cataloged
- ✅ All videos identified with working links
- ✅ Content extracted with formatting preserved
- ✅ Navigation structure mapped completely
- ✅ No broken links in extracted content
- ✅ Metadata complete for all pages
- ✅ Media assets properly organized

## Next Steps After Crawling

1. **Content Review**: Review extracted content for accuracy
2. **Content Cleanup**: Remove outdated or irrelevant content
3. **Content Enhancement**: Update and improve content as needed
4. **Media Processing**: Optimize images, add missing alt text
5. **Page Creation**: Import content into new SVP Platform
6. **URL Setup**: Configure redirects from old to new URLs
7. **Testing**: Verify all content displays correctly
8. **SEO Verification**: Ensure metadata and structure preserved

## Success Criteria

The crawl is complete when:
- ✅ 100% of accessible pages have been crawled
- ✅ All media assets are downloaded and cataloged
- ✅ Site structure is fully documented
- ✅ Content is organized by page type and priority
- ✅ URL mapping is complete
- ✅ Migration recommendations are provided
- ✅ All data is in the specified output format

---

**Note**: This prompt should be used with appropriate web crawling tools and scripts. Always respect the website's robots.txt file and implement rate limiting to avoid overloading the server. Ensure you have proper authorization to crawl and migrate the content.
