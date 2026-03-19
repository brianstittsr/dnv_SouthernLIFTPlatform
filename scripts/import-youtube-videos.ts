/**
 * YouTube Channel Video Importer (Web Scraping)
 * 
 * This script scrapes public YouTube channel videos and imports them into Firebase.
 * Channel ID: UCViWHajhxfqcPOUmNsRxpcQ
 * 
 * Usage:
 *   npx tsx scripts/import-youtube-videos.ts
 *   npx tsx scripts/import-youtube-videos.ts --dry-run
 * 
 * Note: This uses Puppeteer to render JavaScript and scrape YouTube pages.
 * For more reliable results, consider using the YouTube Data API v3.
 */

import puppeteer from 'puppeteer';
import { addVideo, getVideoByYouTubeId, type VideoCategory } from '../lib/firebase-videos';

const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLCeX8hblMSQ_VOZHT5LtPE7Lz9VN-YfG8';

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
 * Extract video data from YouTube playlist using Puppeteer
 */
async function scrapePlaylistVideos(playlistUrl: string): Promise<ScrapedVideo[]> {
  console.log(`\n🔍 Scraping videos from playlist: ${playlistUrl}`);
  
  let browser;
  
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`📡 Loading playlist: ${playlistUrl}`);
    
    await page.goto(playlistUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait a bit for initial content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Try multiple selectors for different YouTube layouts
    console.log('⏳ Waiting for playlist videos to load...');
    const selectors = [
      'ytd-playlist-video-renderer',
      'ytd-playlist-video-list-renderer',
      '#contents ytd-playlist-video-renderer',
      'ytd-browse[page-subtype="playlist"]'
    ];
    
    let selectorFound = false;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`✓ Found content with selector: ${selector}`);
        selectorFound = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!selectorFound) {
      console.log('⚠️ Could not find playlist content with standard selectors. Trying alternative extraction...');
    }
    
    // Scroll to load more videos
    console.log('📜 Scrolling to load all playlist videos...');
    await autoScroll(page);
    
    // Extract video data from the page
    console.log('📊 Extracting video data...');
    const videos = await page.evaluate(() => {
      const extractedVideos: any[] = [];
      
      // Try multiple extraction strategies
      const strategies = [
        // Strategy 1: Standard playlist renderer
        () => {
          const elements = document.querySelectorAll('ytd-playlist-video-renderer');
          elements.forEach((element) => {
            const linkElement = element.querySelector('a#video-title');
            if (!linkElement) return;
            
            const href = linkElement.getAttribute('href');
            const videoIdMatch = href?.match(/\/watch\?v=([^&]+)/);
            if (!videoIdMatch) return;
            
            const title = linkElement.textContent?.trim() || '';
            if (!title) return;
            
            const thumbnailElement = element.querySelector('img');
            const thumbnailUrl = thumbnailElement?.src || thumbnailElement?.getAttribute('src') || '';
            
            const durationElement = element.querySelector('ytd-thumbnail-overlay-time-status-renderer span, #text');
            const duration = durationElement?.textContent?.trim() || '';
            
            extractedVideos.push({
              videoId: videoIdMatch[1],
              title,
              description: '',
              thumbnailUrl: thumbnailUrl.split('?')[0],
              duration,
              publishedAt: '',
            });
          });
        },
        
        // Strategy 2: Any video link on the page
        () => {
          if (extractedVideos.length > 0) return; // Skip if already found
          
          const links = document.querySelectorAll('a[href*="/watch?v="]');
          const seen = new Set<string>();
          
          links.forEach((link) => {
            const href = link.getAttribute('href');
            const videoIdMatch = href?.match(/\/watch\?v=([^&]+)/);
            if (!videoIdMatch) return;
            
            const videoId = videoIdMatch[1];
            if (seen.has(videoId)) return;
            seen.add(videoId);
            
            const title = link.getAttribute('title') || link.textContent?.trim() || '';
            if (!title || title.length < 3) return;
            
            extractedVideos.push({
              videoId,
              title,
              description: '',
              thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
              duration: '',
              publishedAt: '',
            });
          });
        }
      ];
      
      // Try each strategy
      for (const strategy of strategies) {
        try {
          strategy();
          if (extractedVideos.length > 0) break;
        } catch (e) {
          console.error('Strategy failed:', e);
        }
      }
      
      return extractedVideos;
    });
    
    console.log(`✅ Found ${videos.length} videos in playlist`);
    
    return videos;
    
  } catch (error) {
    console.error('Error scraping playlist:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Auto-scroll the page to load more videos
 */
async function autoScroll(page: any): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const maxScrolls = 30; // Limit scrolling
      let scrolls = 0;
      
      const timer = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrolls++;
        
        if (totalHeight >= scrollHeight || scrolls >= maxScrolls) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  
  // Wait a bit for any lazy-loaded content
  await new Promise(resolve => setTimeout(resolve, 2000));
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
    // Scrape videos from playlist
    let videos = await scrapePlaylistVideos(PLAYLIST_URL);
    
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

export { scrapePlaylistVideos, importVideos, categorizeVideo };
