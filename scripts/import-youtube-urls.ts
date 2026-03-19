/**
 * Manual YouTube Video URL Importer
 * 
 * This script imports YouTube videos from a list of URLs.
 * Simply paste the video URLs below and run the script.
 * 
 * Usage:
 *   1. Add video URLs to the VIDEO_URLS array below
 *   2. Run: npx tsx scripts/import-youtube-urls.ts --dry-run (to preview)
 *   3. Run: npx tsx scripts/import-youtube-urls.ts (to import)
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Firebase before importing
import '../lib/firebase';
import { addVideo, getVideoByYouTubeId, extractYouTubeId, type VideoCategory } from '../lib/firebase-videos';

// 📝 ADD YOUR VIDEO URLS HERE (one per line)
const VIDEO_URLS: string[] = [ 'https://youtu.be/ruw-k90aoyY'
  // Example: 'https://www.youtube.com/watch?v=VIDEO_ID',
  // Paste your video URLs below:
  
];

interface VideoData {
  videoId: string;
  url: string;
}

/**
 * Extract video IDs from URLs
 */
function parseVideoUrls(urls: string[]): VideoData[] {
  const videos: VideoData[] = [];
  const seen = new Set<string>();
  
  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed || trimmed.startsWith('//')) continue; // Skip empty lines and comments
    
    const videoId = extractYouTubeId(trimmed);
    if (!videoId) {
      console.warn(`⚠️  Invalid URL: ${trimmed}`);
      continue;
    }
    
    if (seen.has(videoId)) {
      console.warn(`⚠️  Duplicate video ID: ${videoId}`);
      continue;
    }
    
    seen.add(videoId);
    videos.push({ videoId, url: trimmed });
  }
  
  return videos;
}

/**
 * Fetch video metadata from YouTube
 */
async function fetchVideoMetadata(videoId: string): Promise<{ title: string; description: string } | null> {
  try {
    // Fetch the video page
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Extract title from meta tags
    const titleMatch = html.match(/<meta name="title" content="([^"]+)"/);
    const title = titleMatch ? titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : `Video ${videoId}`;
    
    // Extract description from meta tags
    const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
    const description = descMatch ? descMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '';
    
    return { title, description };
    
  } catch (error) {
    console.error(`Error fetching metadata for ${videoId}:`, error);
    return null;
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
 * Import videos into Firebase
 */
async function importVideos(videos: VideoData[], dryRun: boolean = false): Promise<void> {
  console.log(`\n📥 Processing ${videos.length} videos...`);
  
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
        console.log(`⏭️  Skipped: ${video.videoId} (already exists)`);
        skipped++;
        continue;
      }
      
      // Fetch metadata
      console.log(`📡 Fetching metadata for: ${video.videoId}...`);
      const metadata = await fetchVideoMetadata(video.videoId);
      
      if (!metadata) {
        console.log(`⚠️  Could not fetch metadata for: ${video.videoId}`);
        errors++;
        continue;
      }
      
      const category = categorizeVideo(metadata.title, metadata.description);
      
      if (dryRun) {
        console.log(`✓ Would import: "${metadata.title}"`);
        console.log(`  Category: ${category}`);
        console.log(`  URL: https://youtube.com/watch?v=${video.videoId}\n`);
        imported++;
      } else {
        const videoId = await addVideo({
          title: metadata.title,
          description: metadata.description,
          youtubeUrl: `https://youtube.com/watch?v=${video.videoId}`,
          category,
          duration: '',
          publishedAt: '',
          featured: false,
          tags: [category],
          createdBy: 'manual-importer',
        });
        
        if (videoId) {
          console.log(`✅ Imported: "${metadata.title}" (${category})`);
          imported++;
        } else {
          console.log(`❌ Failed: "${metadata.title}"`);
          errors++;
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error processing ${video.videoId}:`, error);
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
  console.log('🎬 Manual YouTube Video URL Importer');
  console.log('====================================\n');
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  
  if (VIDEO_URLS.length === 0) {
    console.log('⚠️  No video URLs found!');
    console.log('\n📝 Instructions:');
    console.log('1. Open this file: scripts/import-youtube-urls.ts');
    console.log('2. Add your video URLs to the VIDEO_URLS array (around line 17)');
    console.log('3. Run the script again');
    console.log('\nExample:');
    console.log('const VIDEO_URLS = [');
    console.log('  "https://www.youtube.com/watch?v=VIDEO_ID_1",');
    console.log('  "https://www.youtube.com/watch?v=VIDEO_ID_2",');
    console.log('];');
    return;
  }
  
  const videos = parseVideoUrls(VIDEO_URLS);
  
  if (videos.length === 0) {
    console.log('⚠️  No valid video URLs found!');
    return;
  }
  
  console.log(`✅ Found ${videos.length} valid video URL(s)\n`);
  
  await importVideos(videos, dryRun);
  
  console.log('\n✨ Done!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { parseVideoUrls, importVideos, categorizeVideo };
