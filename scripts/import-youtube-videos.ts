/**
 * YouTube Channel Video Importer
 * 
 * This script scrapes public YouTube channel videos and imports them into Firebase.
 * Channel ID: UCViWHajhxfqcPOUmNsRxpcQ
 * 
 * Usage:
 *   npx tsx scripts/import-youtube-videos.ts
 * 
 * Note: This uses web scraping of public YouTube pages. For production use,
 * consider using the YouTube Data API v3 for more reliable data extraction.
 */

import * as cheerio from 'cheerio';
import { addVideo, getVideoByYouTubeId, type VideoCategory } from '../lib/firebase-videos';

const CHANNEL_ID = 'UCViWHajhxfqcPOUmNsRxpcQ';
const CHANNEL_URL = `https://www.youtube.com/@${CHANNEL_ID}/videos`;

interface ScrapedVideo {
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  duration?: string;
  publishedAt?: string;
  viewCount?: string;
}

/**
 * Fetch HTML content from a URL
 */
async function fetchPage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
}

/**
 * Extract video data from YouTube channel page
 * Note: YouTube uses dynamic loading, so this may need to be updated
 */
async function scrapeChannelVideos(channelId: string): Promise<ScrapedVideo[]> {
  console.log(`\n🔍 Scraping videos from channel: ${channelId}`);
  
  try {
    // Try the channel videos page
    const url = `https://www.youtube.com/channel/${channelId}/videos`;
    console.log(`📡 Fetching: ${url}`);
    
    const html = await fetchPage(url);
    
    // YouTube embeds data in script tags as JSON
    const videos: ScrapedVideo[] = [];
    
    // Look for ytInitialData in the page
    const ytInitialDataMatch = html.match(/var ytInitialData = ({.+?});/);
    
    if (ytInitialDataMatch && ytInitialDataMatch[1]) {
      try {
        const data = JSON.parse(ytInitialDataMatch[1]);
        
        // Navigate through the YouTube data structure
        const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
        
        for (const tab of tabs) {
          const tabRenderer = tab.tabRenderer;
          if (!tabRenderer || !tabRenderer.content) continue;
          
          const richGrid = tabRenderer.content?.richGridRenderer;
          if (!richGrid || !richGrid.contents) continue;
          
          for (const item of richGrid.contents) {
            const videoRenderer = item.richItemRenderer?.content?.videoRenderer;
            if (!videoRenderer) continue;
            
            const videoId = videoRenderer.videoId;
            const title = videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.simpleText || '';
            const thumbnailUrl = videoRenderer.thumbnail?.thumbnails?.[0]?.url || '';
            
            // Extract duration
            let duration = '';
            const lengthText = videoRenderer.lengthText?.simpleText;
            if (lengthText) {
              duration = lengthText;
            }
            
            // Extract published date
            let publishedAt = '';
            const publishedTimeText = videoRenderer.publishedTimeText?.simpleText;
            if (publishedTimeText) {
              publishedAt = publishedTimeText;
            }
            
            // Extract description from accessibility label or snippet
            let description = '';
            const descriptionSnippet = videoRenderer.descriptionSnippet?.runs?.[0]?.text;
            if (descriptionSnippet) {
              description = descriptionSnippet;
            }
            
            if (videoId && title) {
              videos.push({
                videoId,
                title,
                description,
                thumbnailUrl: thumbnailUrl.split('?')[0], // Remove query params
                duration,
                publishedAt,
              });
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing YouTube data:', parseError);
      }
    }
    
    console.log(`✅ Found ${videos.length} videos`);
    return videos;
    
  } catch (error) {
    console.error('Error scraping channel:', error);
    throw error;
  }
}

/**
 * Categorize video based on title and description
 */
function categorizeVideo(title: string, description?: string): VideoCategory {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  if (text.includes('training') || text.includes('course') || text.includes('learn')) {
    return 'training';
  }
  if (text.includes('testimonial') || text.includes('review') || text.includes('success story')) {
    return 'testimonials';
  }
  if (text.includes('webinar') || text.includes('workshop')) {
    return 'webinar';
  }
  if (text.includes('demo') || text.includes('demonstration')) {
    return 'demo';
  }
  if (text.includes('case study') || text.includes('case-study')) {
    return 'case-study';
  }
  if (text.includes('event') || text.includes('conference')) {
    return 'event';
  }
  if (text.includes('tutorial') || text.includes('how to') || text.includes('how-to')) {
    return 'tutorial';
  }
  if (text.includes('explainer') || text.includes('explained') || text.includes('what is')) {
    return 'explainer';
  }
  
  return 'other';
}

/**
 * Convert relative time to approximate ISO date
 */
function parseRelativeTime(relativeTime: string): string {
  const now = new Date();
  const text = relativeTime.toLowerCase();
  
  if (text.includes('hour')) {
    const hours = parseInt(text) || 1;
    now.setHours(now.getHours() - hours);
  } else if (text.includes('day')) {
    const days = parseInt(text) || 1;
    now.setDate(now.getDate() - days);
  } else if (text.includes('week')) {
    const weeks = parseInt(text) || 1;
    now.setDate(now.getDate() - (weeks * 7));
  } else if (text.includes('month')) {
    const months = parseInt(text) || 1;
    now.setMonth(now.getMonth() - months);
  } else if (text.includes('year')) {
    const years = parseInt(text) || 1;
    now.setFullYear(now.getFullYear() - years);
  }
  
  return now.toISOString().split('T')[0]; // Return YYYY-MM-DD
}

/**
 * Import videos into Firebase
 */
async function importVideos(videos: ScrapedVideo[], dryRun: boolean = false): Promise<void> {
  console.log(`\n📥 Importing ${videos.length} videos to Firebase...`);
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No videos will be added to Firebase\n');
  }
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const video of videos) {
    try {
      // Check if video already exists
      const existing = await getVideoByYouTubeId(video.videoId);
      
      if (existing) {
        console.log(`⏭️  Skipped: "${video.title}" (already exists)`);
        skipped++;
        continue;
      }
      
      const category = categorizeVideo(video.title, video.description);
      const publishedAt = video.publishedAt ? parseRelativeTime(video.publishedAt) : undefined;
      
      if (dryRun) {
        console.log(`✓ Would import: "${video.title}"`);
        console.log(`  Category: ${category}`);
        console.log(`  Duration: ${video.duration || 'N/A'}`);
        console.log(`  Published: ${publishedAt || 'N/A'}`);
        console.log(`  URL: https://youtube.com/watch?v=${video.videoId}\n`);
        imported++;
      } else {
        const videoId = await addVideo({
          title: video.title,
          description: video.description || '',
          youtubeUrl: `https://youtube.com/watch?v=${video.videoId}`,
          category,
          duration: video.duration,
          publishedAt,
          featured: false,
          tags: [category],
          createdBy: 'youtube-importer',
        });
        
        if (videoId) {
          console.log(`✅ Imported: "${video.title}" (${category})`);
          imported++;
        } else {
          console.log(`❌ Failed: "${video.title}"`);
          errors++;
        }
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error importing "${video.title}":`, error);
      errors++;
    }
  }
  
  console.log('\n📊 Import Summary:');
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total: ${videos.length}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🎬 YouTube Channel Video Importer');
  console.log('==================================\n');
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const limit = args.find(arg => arg.startsWith('--limit='))?.split('=')[1];
  
  try {
    // Scrape videos from channel
    let videos = await scrapeChannelVideos(CHANNEL_ID);
    
    if (!videos || videos.length === 0) {
      console.log('⚠️  No videos found. YouTube may have changed their page structure.');
      console.log('💡 Consider using the YouTube Data API v3 for more reliable results.');
      return;
    }
    
    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit);
      videos = videos.slice(0, limitNum);
      console.log(`\n🔢 Limiting to ${limitNum} videos`);
    }
    
    // Import videos
    await importVideos(videos, dryRun);
    
    console.log('\n✨ Done!');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { scrapeChannelVideos, importVideos, categorizeVideo };
