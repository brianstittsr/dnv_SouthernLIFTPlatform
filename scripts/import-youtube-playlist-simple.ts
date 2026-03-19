/**
 * Simple YouTube Playlist Video Importer
 * 
 * This script fetches a YouTube playlist page and extracts video IDs
 * from the HTML source, then imports them into Firebase.
 * 
 * Usage:
 *   npx tsx scripts/import-youtube-playlist-simple.ts
 *   npx tsx scripts/import-youtube-playlist-simple.ts --dry-run
 */

import { addVideo, getVideoByYouTubeId, type VideoCategory } from '../lib/firebase-videos';

const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLCeX8hblMSQ_VOZHT5LtPE7Lz9VN-YfG8';

interface VideoData {
  videoId: string;
  title: string;
  thumbnailUrl: string;
}

/**
 * Fetch and parse playlist page
 */
async function fetchPlaylistVideos(playlistUrl: string): Promise<VideoData[]> {
  console.log(`\n🔍 Fetching playlist: ${playlistUrl}`);
  
  try {
    const response = await fetch(playlistUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`📄 Fetched ${html.length} bytes of HTML`);
    
    // Extract video IDs and titles from the HTML
    const videos: VideoData[] = [];
    const seen = new Set<string>();
    
    // Try to find ytInitialData in the page
    const ytInitialDataMatch = html.match(/var ytInitialData = ({.+?});/s);
    
    if (ytInitialDataMatch && ytInitialDataMatch[1]) {
      console.log('📊 Found ytInitialData, parsing...');
      try {
        const data = JSON.parse(ytInitialDataMatch[1]);
        
        // Navigate through YouTube's data structure for playlists
        const contents = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents;
        
        if (contents) {
          for (const section of contents) {
            const playlistItems = section?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents;
            
            if (playlistItems) {
              for (const item of playlistItems) {
                const videoRenderer = item?.playlistVideoRenderer;
                if (!videoRenderer) continue;
                
                const videoId = videoRenderer.videoId;
                if (!videoId || seen.has(videoId)) continue;
                seen.add(videoId);
                
                const title = videoRenderer.title?.runs?.[0]?.text || videoRenderer.title?.simpleText || `Video ${videoId}`;
                
                videos.push({
                  videoId,
                  title: title.replace(/\\u0026/g, '&').replace(/\\"/g, '"'),
                  thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                });
              }
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing ytInitialData:', parseError);
      }
    }
    
    // Fallback: Extract from watch URLs in the HTML
    if (videos.length === 0) {
      console.log('📊 Trying fallback extraction from URLs...');
      const urlPattern = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
      let match;
      
      while ((match = urlPattern.exec(html)) !== null) {
        const videoId = match[1];
        if (seen.has(videoId)) continue;
        seen.add(videoId);
        
        videos.push({
          videoId,
          title: `Video ${videoId}`,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        });
      }
    }
    
    console.log(`✅ Found ${videos.length} unique videos`);
    return videos;
    
  } catch (error) {
    console.error('Error fetching playlist:', error);
    throw error;
  }
}

/**
 * Categorize video based on title
 */
function categorizeVideo(title: string): VideoCategory {
  const text = title.toLowerCase();
  
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
  console.log(`\n📥 Importing ${videos.length} videos to Firebase...`);
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No videos will be added to Firebase\n');
  }
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const video of videos) {
    try {
      const existing = await getVideoByYouTubeId(video.videoId);
      
      if (existing) {
        console.log(`⏭️  Skipped: "${video.title}" (already exists)`);
        skipped++;
        continue;
      }
      
      const category = categorizeVideo(video.title);
      
      if (dryRun) {
        console.log(`✓ Would import: "${video.title}"`);
        console.log(`  Category: ${category}`);
        console.log(`  URL: https://youtube.com/watch?v=${video.videoId}\n`);
        imported++;
      } else {
        const videoId = await addVideo({
          title: video.title,
          description: '',
          youtubeUrl: `https://youtube.com/watch?v=${video.videoId}`,
          category,
          duration: '',
          publishedAt: '',
          featured: false,
          tags: [category],
          createdBy: 'playlist-importer',
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
  console.log('🎬 YouTube Playlist Video Importer');
  console.log('==================================\n');
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;
  
  try {
    let videos = await fetchPlaylistVideos(PLAYLIST_URL);
    
    if (!videos || videos.length === 0) {
      console.log('⚠️  No videos found in the playlist.');
      return;
    }
    
    if (limit) {
      videos = videos.slice(0, limit);
      console.log(`\n🔢 Limiting to ${limit} videos`);
    }
    
    await importVideos(videos, dryRun);
    
    console.log('\n✨ Done!');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { fetchPlaylistVideos, importVideos, categorizeVideo };
