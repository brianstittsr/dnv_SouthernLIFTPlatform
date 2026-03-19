/**
 * Manual YouTube Video URL Importer (Firebase Admin SDK)
 * 
 * This script imports YouTube videos from a list of URLs using Firebase Admin SDK.
 * Simply paste the video URLs below and run the script.
 * 
 * Usage:
 *   1. Add video URLs to the VIDEO_URLS array below
 *   2. Run: npx tsx scripts/import-youtube-urls-admin.ts --dry-run (to preview)
 *   3. Run: npx tsx scripts/import-youtube-urls-admin.ts (to import)
 */

// Load environment variables FIRST (before any imports)
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin SDK
import admin from '../lib/firebase-admin';
const db = admin.firestore();

// 📝 ADD YOUR VIDEO URLS HERE (one per line)
const VIDEO_URLS: string[] = [
  'https://youtu.be/ruw-k90aoyY',
  // Example: 'https://www.youtube.com/watch?v=VIDEO_ID',
  // Paste your video URLs below:
  
];

type VideoCategory =
  | "training"
  | "testimonials"
  | "explainer"
  | "webinar"
  | "demo"
  | "case-study"
  | "event"
  | "tutorial"
  | "other";

interface VideoData {
  videoId: string;
  url: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
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
 * Check if video already exists in Firestore
 */
async function videoExists(videoId: string): Promise<boolean> {
  try {
    const videosRef = db.collection('videos');
    const snapshot = await videosRef
      .where('youtubeId', '==', videoId)
      .where('isActive', '==', true)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error checking if video exists:`, error);
    return false;
  }
}

interface VideoMetadata {
  title: string;
  description: string;
  duration: string;
  publishedAt: string;
  tags: string[];
}

/**
 * Format duration from seconds to HH:MM:SS or MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse ISO 8601 duration (e.g., PT1H2M10S) to seconds
 */
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetch video metadata from YouTube
 */
async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  try {
    // Fetch the video page
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Initialize default values
    let title = `Video ${videoId}`;
    let description = '';
    let duration = '';
    let publishedAt = '';
    let tags: string[] = [];
    
    // Try to extract from ytInitialPlayerResponse
    const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/s);
    if (playerResponseMatch && playerResponseMatch[1]) {
      try {
        const playerData = JSON.parse(playerResponseMatch[1]);
        
        // Extract title
        title = playerData?.videoDetails?.title || title;
        
        // Extract description
        description = playerData?.videoDetails?.shortDescription || '';
        
        // Extract duration
        const lengthSeconds = playerData?.videoDetails?.lengthSeconds;
        if (lengthSeconds) {
          duration = formatDuration(parseInt(lengthSeconds));
        }
        
        // Extract tags/keywords
        tags = playerData?.videoDetails?.keywords || [];
        
        // Extract publish date from microformat
        const publishDate = playerData?.microformat?.playerMicroformatRenderer?.publishDate;
        if (publishDate) {
          publishedAt = publishDate;
        }
      } catch (parseError) {
        console.warn(`Could not parse ytInitialPlayerResponse for ${videoId}`);
      }
    }
    
    // Fallback: Extract from meta tags if not found in player response
    if (!title || title === `Video ${videoId}`) {
      const titleMatch = html.match(/<meta name="title" content="([^"]+)"/);
      title = titleMatch ? titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : title;
    }
    
    if (!description) {
      const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
      description = descMatch ? descMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '';
    }
    
    // Try to get duration from meta tag if not found
    if (!duration) {
      const durationMatch = html.match(/<meta itemprop="duration" content="([^"]+)"/);
      if (durationMatch && durationMatch[1]) {
        const seconds = parseISO8601Duration(durationMatch[1]);
        duration = formatDuration(seconds);
      }
    }
    
    // Try to get publish date from meta tag if not found
    if (!publishedAt) {
      const dateMatch = html.match(/<meta itemprop="datePublished" content="([^"]+)"/);
      publishedAt = dateMatch ? dateMatch[1] : '';
    }
    
    return { title, description, duration, publishedAt, tags };
    
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
 * Get YouTube thumbnail URL
 */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * Add video to Firestore
 */
async function addVideoToFirestore(
  videoId: string, 
  title: string, 
  description: string, 
  category: VideoCategory,
  duration: string,
  publishedAt: string,
  tags: string[]
): Promise<boolean> {
  try {
    const videosRef = db.collection('videos');
    
    // Combine category with existing tags, remove duplicates
    const allTags = Array.from(new Set([category, ...tags]));
    
    await videosRef.add({
      title,
      description,
      youtubeId: videoId,
      youtubeUrl: `https://youtube.com/watch?v=${videoId}`,
      thumbnailUrl: getYouTubeThumbnail(videoId),
      category,
      duration,
      publishedAt,
      featured: false,
      tags: allTags,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'admin-importer',
      isActive: true,
    });
    
    return true;
  } catch (error) {
    console.error(`Error adding video to Firestore:`, error);
    return false;
  }
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
      const exists = await videoExists(video.videoId);
      
      if (exists) {
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
        console.log(`  Duration: ${metadata.duration || 'N/A'}`);
        console.log(`  Published: ${metadata.publishedAt || 'N/A'}`);
        console.log(`  Tags: ${metadata.tags.length > 0 ? metadata.tags.slice(0, 5).join(', ') : 'N/A'}`);
        console.log(`  URL: https://youtube.com/watch?v=${video.videoId}\n`);
        imported++;
      } else {
        const success = await addVideoToFirestore(
          video.videoId, 
          metadata.title, 
          metadata.description, 
          category,
          metadata.duration,
          metadata.publishedAt,
          metadata.tags
        );
        
        if (success) {
          console.log(`✅ Imported: "${metadata.title}" (${category})`);
          console.log(`   Duration: ${metadata.duration || 'N/A'} | Published: ${metadata.publishedAt || 'N/A'}`);
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
 * Interactive mode - prompt user for video URLs
 */
async function interactiveMode(dryRun: boolean = false): Promise<void> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  console.log('\n📺 Interactive Video Import Mode');
  console.log('================================\n');
  console.log('Enter YouTube video URLs one at a time.');
  console.log('Type "done" when finished, or "exit" to quit.\n');

  const videoUrls: string[] = [];
  let continueAdding = true;

  while (continueAdding) {
    const input = await question('Enter video URL (or "done"/"exit"): ');
    const trimmed = input.trim().toLowerCase();

    if (trimmed === 'done' || trimmed === 'exit' || trimmed === 'quit') {
      continueAdding = false;
      break;
    }

    if (!trimmed) {
      console.log('⚠️  Empty input, please enter a valid URL or "done" to finish.\n');
      continue;
    }

    const videoId = extractYouTubeId(input);
    if (!videoId) {
      console.log('❌ Invalid YouTube URL. Please try again.\n');
      continue;
    }

    videoUrls.push(input.trim());
    console.log(`✅ Added: ${videoId}\n`);
  }

  rl.close();

  if (videoUrls.length === 0) {
    console.log('\n⚠️  No videos added. Exiting...');
    return;
  }

  console.log(`\n📋 Total videos to import: ${videoUrls.length}`);
  
  const videos = parseVideoUrls(videoUrls);
  
  if (videos.length === 0) {
    console.log('⚠️  No valid video URLs found!');
    return;
  }

  await importVideos(videos, dryRun);
}

/**
 * Batch mode - import from VIDEO_URLS array
 */
async function batchMode(dryRun: boolean = false): Promise<void> {
  if (VIDEO_URLS.length === 0) {
    console.log('⚠️  No video URLs found in VIDEO_URLS array!');
    console.log('\n📝 Instructions:');
    console.log('1. Open this file: scripts/import-youtube-urls-admin.ts');
    console.log('2. Add your video URLs to the VIDEO_URLS array (around line 21)');
    console.log('3. Run the script again');
    console.log('\nExample:');
    console.log('const VIDEO_URLS: string[] = [');
    console.log('  "https://www.youtube.com/watch?v=VIDEO_ID_1",');
    console.log('  "https://www.youtube.com/watch?v=VIDEO_ID_2",');
    console.log('];');
    console.log('\nOr use --interactive mode to add videos one at a time.');
    return;
  }
  
  const videos = parseVideoUrls(VIDEO_URLS);
  
  if (videos.length === 0) {
    console.log('⚠️  No valid video URLs found!');
    return;
  }
  
  console.log(`✅ Found ${videos.length} valid video URL(s)\n`);
  
  await importVideos(videos, dryRun);
}

/**
 * Main execution
 */
async function main() {
  console.log('🎬 YouTube Video URL Importer (Admin SDK)');
  console.log('==========================================\n');
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const interactive = args.includes('--interactive') || args.includes('-i');

  if (interactive) {
    await interactiveMode(dryRun);
  } else {
    await batchMode(dryRun);
  }
  
  console.log('\n✨ Done!');
  process.exit(0);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

export { parseVideoUrls, importVideos, categorizeVideo };
