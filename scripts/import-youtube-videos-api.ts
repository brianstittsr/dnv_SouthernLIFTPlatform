/**
 * YouTube Channel Video Importer (YouTube Data API v3)
 * 
 * This script uses the official YouTube Data API to fetch video metadata
 * and import them into Firebase.
 * 
 * Setup:
 * 1. Get a free API key from https://console.cloud.google.com/
 * 2. Enable YouTube Data API v3
 * 3. Set YOUTUBE_API_KEY environment variable or pass as argument
 * 
 * Usage:
 *   npx tsx scripts/import-youtube-videos-api.ts --api-key=YOUR_KEY
 *   npx tsx scripts/import-youtube-videos-api.ts --dry-run --api-key=YOUR_KEY
 */

import { addVideo, getVideoByYouTubeId, type VideoCategory } from '../lib/firebase-videos';

const CHANNEL_ID = 'UCViWHajhxfqcPOUmNsRxpcQ';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
}

interface YouTubeAPIResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium?: { url: string };
        high?: { url: string };
        default?: { url: string };
      };
      publishedAt: string;
    };
  }>;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

interface VideoDetailsResponse {
  items: Array<{
    contentDetails: {
      duration: string;
    };
  }>;
}

/**
 * Fetch videos from YouTube Data API
 */
async function fetchChannelVideos(apiKey: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
  console.log(`\n🔍 Fetching videos from YouTube Data API...`);
  
  const videos: YouTubeVideo[] = [];
  let pageToken: string | undefined;
  
  try {
    do {
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('key', apiKey);
      url.searchParams.set('channelId', CHANNEL_ID);
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('order', 'date');
      url.searchParams.set('type', 'video');
      url.searchParams.set('maxResults', '50');
      
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }
      
      console.log(`📡 Fetching page ${pageToken ? `(token: ${pageToken.substring(0, 10)}...)` : '1'}...`);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`YouTube API error: ${error.error?.message || response.statusText}`);
      }
      
      const data: YouTubeAPIResponse = await response.json();
      
      console.log(`   Found ${data.items.length} videos on this page`);
      
      // Get video IDs for duration lookup
      const videoIds = data.items.map(item => item.id.videoId);
      
      // Fetch video details (including duration)
      const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      detailsUrl.searchParams.set('key', apiKey);
      detailsUrl.searchParams.set('id', videoIds.join(','));
      detailsUrl.searchParams.set('part', 'contentDetails');
      
      const detailsResponse = await fetch(detailsUrl.toString());
      const detailsData: VideoDetailsResponse = await detailsResponse.json();
      
      // Map duration to videos
      const durationMap = new Map<string, string>();
      detailsData.items.forEach((item, index) => {
        durationMap.set(videoIds[index], parseDuration(item.contentDetails.duration));
      });
      
      // Process videos
      for (const item of data.items) {
        const videoId = item.id.videoId;
        const snippet = item.snippet;
        
        videos.push({
          id: videoId,
          title: snippet.title,
          description: snippet.description,
          thumbnailUrl: snippet.thumbnails.medium?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default?.url || '',
          publishedAt: snippet.publishedAt,
          duration: durationMap.get(videoId) || '',
        });
      }
      
      pageToken = data.nextPageToken;
      
      // Stop if we've reached maxResults
      if (videos.length >= maxResults) {
        break;
      }
      
    } while (pageToken);
    
    console.log(`✅ Total videos fetched: ${videos.length}`);
    return videos.slice(0, maxResults);
    
  } catch (error) {
    console.error('Error fetching videos from YouTube API:', error);
    throw error;
  }
}

/**
 * Parse ISO 8601 duration to human-readable format
 * Example: PT1H2M10S -> 1:02:10
 */
function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return '';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
async function importVideos(videos: YouTubeVideo[], dryRun: boolean = false): Promise<void> {
  console.log(`\n📥 Importing ${videos.length} videos to Firebase...`);
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No videos will be added to Firebase\n');
  }
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const video of videos) {
    try {
      const existing = await getVideoByYouTubeId(video.id);
      
      if (existing) {
        console.log(`⏭️  Skipped: "${video.title}" (already exists)`);
        skipped++;
        continue;
      }
      
      const category = categorizeVideo(video.title, video.description);
      const publishedAt = video.publishedAt.split('T')[0];
      
      if (dryRun) {
        console.log(`✓ Would import: "${video.title}"`);
        console.log(`  Category: ${category}`);
        console.log(`  Duration: ${video.duration || 'N/A'}`);
        console.log(`  Published: ${publishedAt}`);
        console.log(`  URL: https://youtube.com/watch?v=${video.id}\n`);
        imported++;
      } else {
        const videoId = await addVideo({
          title: video.title,
          description: video.description,
          youtubeUrl: `https://youtube.com/watch?v=${video.id}`,
          category,
          duration: video.duration,
          publishedAt,
          featured: false,
          tags: [category],
          createdBy: 'youtube-api-importer',
        });
        
        if (videoId) {
          console.log(`✅ Imported: "${video.title}" (${category})`);
          imported++;
        } else {
          console.log(`❌ Failed: "${video.title}"`);
          errors++;
        }
      }
      
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
  console.log('🎬 YouTube Channel Video Importer (API v3)');
  console.log('==========================================\n');
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 50;
  
  const apiKeyArg = args.find(arg => arg.startsWith('--api-key='));
  const apiKey = apiKeyArg?.split('=')[1] || process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Error: YouTube API key is required');
    console.error('\nUsage:');
    console.error('  npx tsx scripts/import-youtube-videos-api.ts --api-key=YOUR_KEY');
    console.error('  OR set YOUTUBE_API_KEY environment variable');
    console.error('\nGet a free API key:');
    console.error('  1. Go to https://console.cloud.google.com/');
    console.error('  2. Create a project or select existing');
    console.error('  3. Enable YouTube Data API v3');
    console.error('  4. Create credentials (API key)');
    process.exit(1);
  }
  
  try {
    const videos = await fetchChannelVideos(apiKey, limit);
    
    if (!videos || videos.length === 0) {
      console.log('⚠️  No videos found for this channel.');
      return;
    }
    
    await importVideos(videos, dryRun);
    
    console.log('\n✨ Done!');
    
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message || error);
    
    if (error.message?.includes('quotaExceeded')) {
      console.error('\n💡 Tip: YouTube API has daily quota limits. Try again tomorrow or request quota increase.');
    } else if (error.message?.includes('API key')) {
      console.error('\n💡 Tip: Check that your API key is valid and YouTube Data API v3 is enabled.');
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { fetchChannelVideos, importVideos, categorizeVideo };
