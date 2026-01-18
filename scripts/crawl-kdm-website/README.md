# KDM Website Crawler

A Node.js web crawler using Playwright to extract all content, images, videos, and documents from https://www.kdm-assoc.com for migration to the SVP Platform.

## Features

- 🕷️ **Complete Site Crawling** - Discovers and crawls all accessible pages
- 📄 **Content Extraction** - Extracts metadata, headings, text, forms, and structured data
- 🖼️ **Image Collection** - Downloads and catalogs all images with context
- 🎥 **Video Detection** - Identifies YouTube, Vimeo, and self-hosted videos
- 📎 **Document Harvesting** - Finds and downloads PDFs, docs, and other files
- 🗺️ **Navigation Mapping** - Captures site structure and menu relationships
- 📊 **Detailed Reporting** - Generates comprehensive migration reports
- ⚡ **Concurrent Processing** - Efficient parallel page crawling
- 🎯 **Smart Filtering** - Excludes admin pages, feeds, and duplicate content

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

1. Navigate to the crawler directory:
```bash
cd scripts/crawl-kdm-website
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browser:
```bash
npm run install-browser
```

## Configuration

Edit `config.js` to customize crawler behavior:

```javascript
{
  startUrl: 'https://www.kdm-assoc.com',
  maxPages: 500,              // Maximum pages to crawl
  maxDepth: 10,               // Maximum depth from start URL
  concurrency: 3,             // Concurrent page requests
  delayBetweenRequests: 1000, // Delay in milliseconds
  downloadMedia: true,        // Download images and documents
  // ... more options
}
```

### Key Configuration Options

- **`maxPages`** - Limit total pages crawled (default: 500)
- **`maxDepth`** - Maximum link depth from start URL (default: 10)
- **`concurrency`** - Number of simultaneous page requests (default: 3)
- **`delayBetweenRequests`** - Milliseconds between requests (default: 1000)
- **`downloadMedia`** - Whether to download images/docs (default: true)
- **`excludePatterns`** - URL patterns to skip (admin, feeds, etc.)

## Usage

Run the crawler:

```bash
npm run crawl
```

Or directly:

```bash
node crawler.js
```

## Output Structure

The crawler generates the following output in `../../docs/content-migration/`:

```
content-migration/
├── pages/                          # Individual page JSON files
│   ├── home.json
│   ├── about-company.json
│   ├── services-consulting.json
│   └── ...
├── media/
│   ├── images/
│   │   ├── heroes/                 # Hero/banner images
│   │   ├── content/                # Content images
│   │   ├── logos/                  # Logo images
│   │   └── team/                   # Team photos
│   ├── videos/
│   │   └── video-inventory.json    # All videos found
│   └── documents/                  # Downloaded PDFs, docs, etc.
├── site-structure.json             # Complete site map
├── navigation-map.json             # Navigation structure
├── url-mapping.csv                 # Old URL → New URL mapping
└── migration-report.md             # Detailed crawl report
```

## Page Data Schema

Each page is saved as a JSON file with the following structure:

```json
{
  "url": "https://www.kdm-assoc.com/services",
  "slug": "services",
  "pageType": "services",
  "crawledAt": "2024-01-18T12:00:00.000Z",
  
  "metadata": {
    "title": "Page Title",
    "description": "Meta description",
    "keywords": "keyword1, keyword2",
    "ogTitle": "Open Graph title",
    "ogDescription": "OG description",
    "ogImage": "https://...",
    "canonical": "https://..."
  },
  
  "content": {
    "hero": {
      "heading": "Main heading",
      "subheading": "Subheading text",
      "image": "image-url",
      "cta": { "text": "Button text", "link": "/link" }
    },
    "sections": [
      {
        "type": "text|image-text|gallery|video|form",
        "heading": "Section heading",
        "content": "Section text content",
        "html": "<div>...</div>",
        "images": ["image-url-1"],
        "links": [{ "text": "Link text", "href": "/link" }]
      }
    ],
    "forms": [
      {
        "action": "/submit",
        "method": "POST",
        "fields": [
          {
            "name": "email",
            "type": "email",
            "label": "Email Address",
            "required": true
          }
        ],
        "submitText": "Submit"
      }
    ]
  },
  
  "navigation": {
    "primary": [
      { "text": "Home", "href": "/", "isActive": false }
    ],
    "footer": [...],
    "breadcrumb": [
      { "text": "Home", "href": "/" },
      { "text": "Services", "href": "/services" }
    ]
  },
  
  "media": {
    "images": [
      {
        "url": "https://...",
        "alt": "Alt text",
        "title": "Image title",
        "width": "1200",
        "height": "800",
        "context": "hero|content|logos|team",
        "parentPage": "https://...",
        "localPath": "../../docs/content-migration/media/images/..."
      }
    ],
    "videos": [
      {
        "platform": "youtube|vimeo|self-hosted",
        "id": "video-id",
        "url": "https://...",
        "embedUrl": "https://...",
        "thumbnailUrl": "https://...",
        "title": "Video title",
        "parentPage": "https://..."
      }
    ],
    "documents": [
      {
        "url": "https://...",
        "linkText": "Download PDF",
        "filename": "document.pdf",
        "parentPage": "https://..."
      }
    ]
  },
  
  "seo": {
    "h1": ["Main heading"],
    "h2": ["Subheading 1", "Subheading 2"],
    "structuredData": [{ "@type": "Organization", ... }]
  }
}
```

## Migration Report

The crawler generates a comprehensive `migration-report.md` with:

- **Crawl Summary** - Total pages, images, videos, documents
- **Page Type Breakdown** - Distribution by page type
- **Content Statistics** - Sections, forms, average content per page
- **Media Assets** - Images by context, videos by platform
- **Errors** - Any crawl errors encountered
- **Next Steps** - Recommended migration workflow

## Troubleshooting

### Browser Installation Issues

If Playwright browser fails to install:
```bash
npx playwright install chromium --force
```

### Memory Issues

If crawling large sites causes memory issues, reduce concurrency:
```javascript
// config.js
concurrency: 1  // Reduce from 3 to 1
```

### Timeout Errors

Increase timeout for slow pages:
```javascript
// config.js
timeout: 60000  // Increase from 30000 to 60000
```

### Rate Limiting

If the target site rate limits requests, increase delay:
```javascript
// config.js
delayBetweenRequests: 3000  // Increase from 1000 to 3000
```

## Advanced Usage

### Crawl Specific Sections Only

Modify `excludePatterns` in `config.js` to skip certain sections:

```javascript
excludePatterns: [
  /\/blog\//,      // Skip blog
  /\/news\//,      // Skip news
  /\/tag\//        // Skip tags
]
```

### Custom Page Type Detection

Add custom page type patterns in `config.js`:

```javascript
pageTypes: {
  home: /^\/$|^\/index/,
  about: /\/about/,
  services: /\/services|\/solutions/,
  customType: /\/custom-pattern/  // Add your pattern
}
```

### Download Only Specific Media

Disable media download and manually download later:

```javascript
// config.js
downloadMedia: false
```

Then use the generated JSON files to selectively download media.

## Performance Tips

1. **Adjust Concurrency** - Higher concurrency = faster crawl, but may trigger rate limits
2. **Increase Delay** - Longer delays = slower crawl, but more respectful to server
3. **Limit Max Pages** - Set reasonable `maxPages` limit for large sites
4. **Disable Media Download** - Skip downloading during initial crawl for speed
5. **Use Headless Mode** - Already enabled by default for better performance

## Output Files Reference

| File | Description |
|------|-------------|
| `site-structure.json` | Complete site inventory with all pages |
| `navigation-map.json` | Navigation menus and page relationships |
| `url-mapping.csv` | CSV mapping old URLs to new slugs |
| `migration-report.md` | Detailed markdown report |
| `pages/*.json` | Individual page data files |
| `media/images/` | Downloaded images organized by context |
| `media/videos/video-inventory.json` | All videos with embed codes |
| `media/documents/` | Downloaded PDFs and documents |

## Next Steps After Crawling

1. **Review Content** - Check `pages/` directory for extracted content
2. **Verify Media** - Ensure all images downloaded to `media/images/`
3. **Check Videos** - Review `video-inventory.json` for video links
4. **Plan URLs** - Use `url-mapping.csv` to plan new URL structure
5. **Content Cleanup** - Remove outdated or irrelevant content
6. **Optimize Images** - Compress and optimize downloaded images
7. **Import to Platform** - Begin importing content to SVP Platform
8. **Setup Redirects** - Configure 301 redirects from old to new URLs
9. **Test Migration** - Verify all content displays correctly
10. **SEO Check** - Ensure metadata and structure preserved

## License

MIT

## Support

For issues or questions, contact the development team.
