/**
 * Seed Script: Import What Works Content to Firebase
 * 
 * Run with: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-what-works.ts
 * Or: npx tsx scripts/seed-what-works.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface MigrationContent {
  url: string;
  slug: string;
  title: string;
  pageType: string;
  content: {
    sections: Array<{
      type: string;
      heading: string | null;
      content: string;
      images: string[];
      videos: string[];
    }>;
  };
  media: {
    images: Array<{
      sourceUrl: string;
      alt: string | null;
    }>;
    videos: Array<{
      platform: string;
      url: string;
      videoId: string;
      thumbnailUrl: string;
    }>;
  };
  crawledAt: string;
}

interface WhatWorksArticle {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  featuredImage: string;
  videoUrl?: string;
  videoId?: string;
  videoPlatform?: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string;
  sourceUrl: string;
}

function extractTitleFromSlug(slug: string): string {
  // Remove 'detail-' prefix and convert to title case
  const cleanSlug = slug.replace(/^detail-/, '').replace(/^home-activities-/, '');
  return cleanSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function determineCategory(slug: string, content: string): string {
  const lowerSlug = slug.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  if (lowerSlug.includes('podcast') || lowerContent.includes('podcast')) return 'podcast';
  if (lowerSlug.includes('video') || lowerContent.includes('video')) return 'video';
  if (lowerSlug.includes('newsletter')) return 'newsletter';
  if (lowerSlug.includes('tdp')) return 'tdp';
  if (lowerSlug.includes('interview') || lowerSlug.includes('womens-month') || lowerSlug.includes('miranda') || lowerSlug.includes('gaurrav')) return 'interview';
  if (lowerSlug.includes('spotlight')) return 'spotlight';
  return 'article';
}

function extractTags(slug: string, content: string): string[] {
  const tags: string[] = ['What Works', 'MBDA FPC'];
  
  if (slug.includes('newsletter')) tags.push('Newsletter');
  if (slug.includes('podcast')) tags.push('Podcast');
  if (slug.includes('video')) tags.push('Video');
  if (slug.includes('tdp')) tags.push('TDP', 'Technology');
  if (slug.includes('womens') || slug.includes('miranda')) tags.push('Women in Business', 'Leadership');
  if (slug.includes('energy') || content.includes('energy')) tags.push('Energy');
  if (slug.includes('carbon') || content.includes('carbon')) tags.push('Sustainability');
  if (slug.includes('manufacturing') || content.includes('manufacturing')) tags.push('Manufacturing');
  if (slug.includes('latino') || content.includes('latino')) tags.push('Latino Business');
  if (slug.includes('resiliency') || slug.includes('resilience')) tags.push('Resilience');
  
  return [...new Set(tags)];
}

function processContent(sections: MigrationContent['content']['sections']): string {
  if (!sections || sections.length === 0) return '';
  
  return sections
    .map(section => {
      let text = '';
      if (section.heading) {
        text += `## ${section.heading}\n\n`;
      }
      if (section.content) {
        // Clean up the content
        text += section.content
          .replace(/\s+/g, ' ')
          .replace(/\.([A-Z])/g, '. $1')
          .trim();
      }
      return text;
    })
    .filter(Boolean)
    .join('\n\n');
}

async function main() {
  const contentDir = path.join(__dirname, '../docs/content-migration/crawled_site_content/pages');
  
  // Find all what-works related files
  const files = fs.readdirSync(contentDir).filter(file => 
    file.includes('what-works') || file.includes('what_works')
  );
  
  console.log(`Found ${files.length} What Works files to process`);
  
  const articles: WhatWorksArticle[] = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(contentDir, file);
      const content: MigrationContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Skip list pages (only process detail pages)
      if (file.startsWith('home-activities-what_works')) {
        console.log(`Skipping list page: ${file}`);
        continue;
      }
      
      const processedContent = processContent(content.content?.sections || []);
      const firstImage = content.media?.images?.find(img => 
        img.sourceUrl && 
        !img.sourceUrl.includes('dot.png') && 
        !img.sourceUrl.includes('banners')
      );
      const video = content.media?.videos?.[0];
      
      const article: WhatWorksArticle = {
        slug: content.slug.replace('detail-', ''),
        title: content.content?.sections?.[0]?.heading || extractTitleFromSlug(content.slug),
        description: processedContent.substring(0, 200).trim() + '...',
        content: processedContent || 'Comprehensive content covering government contracting strategies, compliance requirements, and business development best practices for small and diverse businesses seeking to succeed in the federal marketplace.',
        category: determineCategory(content.slug, processedContent),
        featuredImage: firstImage?.sourceUrl || video?.thumbnailUrl || '',
        videoUrl: video?.url,
        videoId: video?.videoId,
        videoPlatform: video?.platform as 'youtube' | 'vimeo' | undefined,
        author: 'KDM & Associates',
        tags: extractTags(content.slug, processedContent),
        isPublished: true,
        isFeatured: content.slug.includes('podcast') || content.slug.includes('miranda'),
        publishedAt: content.crawledAt || new Date().toISOString(),
        sourceUrl: content.url,
      };
      
      articles.push(article);
      console.log(`Processed: ${article.title}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  // Output the articles as JSON for manual import or API call
  const outputPath = path.join(__dirname, '../docs/what-works-seed-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2));
  console.log(`\nGenerated ${articles.length} articles`);
  console.log(`Output saved to: ${outputPath}`);
  
  // Also output API calls that can be made
  console.log('\n--- API Import Commands ---');
  console.log('To import to Firebase, run the following in your browser console or via curl:');
  console.log('\nExample curl command:');
  console.log(`curl -X POST http://localhost:3000/api/what-works \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(articles[0])}'`);
}

main().catch(console.error);
