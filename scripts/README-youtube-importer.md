# YouTube Video Importer

This script extracts video metadata from a YouTube channel and imports it into the Firebase Image Manager's video section.

## Channel Information

- **Channel ID:** UCViWHajhxfqcPOUmNsRxpcQ
- **Channel URL:** https://www.youtube.com/channel/UCViWHajhxfqcPOUmNsRxpcQ/videos

## Installation

First, install the required dependency:

```bash
npm install cheerio
# or
yarn add cheerio
```

## Usage

### Dry Run (Preview Only)

Preview what videos would be imported without actually adding them to Firebase:

```bash
npx tsx scripts/import-youtube-videos.ts --dry-run
```

### Import All Videos

Import all videos from the channel:

```bash
npx tsx scripts/import-youtube-videos.ts
```

### Import Limited Number of Videos

Import only the first N videos (useful for testing):

```bash
npx tsx scripts/import-youtube-videos.ts --limit=10
```

### Combine Options

```bash
npx tsx scripts/import-youtube-videos.ts --dry-run --limit=5
```

## How It Works

1. **Scrapes Public Channel Page:** The script fetches the public YouTube channel videos page
2. **Extracts Video Data:** Parses the embedded JSON data to extract:
   - Video ID
   - Title
   - Description (if available)
   - Thumbnail URL
   - Duration
   - Published date (relative time)
3. **Auto-Categorizes:** Automatically assigns categories based on title/description keywords:
   - `training` - Training, courses, learning content
   - `testimonials` - Testimonials, reviews, success stories
   - `webinar` - Webinars, workshops
   - `demo` - Demos, demonstrations
   - `case-study` - Case studies
   - `event` - Events, conferences
   - `tutorial` - Tutorials, how-to guides
   - `explainer` - Explainer videos, "what is" content
   - `other` - Everything else
4. **Checks for Duplicates:** Skips videos that already exist in Firebase
5. **Imports to Firebase:** Adds video metadata to the `videos` collection

## Output

The script provides detailed console output:

```
🎬 YouTube Channel Video Importer
==================================

🔍 Scraping videos from channel: UCViWHajhxfqcPOUmNsRxpcQ
📡 Fetching: https://www.youtube.com/channel/UCViWHajhxfqcPOUmNsRxpcQ/videos
✅ Found 25 videos

📥 Importing 25 videos to Firebase...
✅ Imported: "Video Title 1" (training)
⏭️  Skipped: "Video Title 2" (already exists)
✅ Imported: "Video Title 3" (webinar)
...

📊 Import Summary:
   ✅ Imported: 20
   ⏭️  Skipped: 3
   ❌ Errors: 2
   📝 Total: 25

✨ Done!
```

## Important Notes

### Web Scraping Limitations

⚠️ **This script uses web scraping** of YouTube's public pages, which has limitations:

- **Fragile:** YouTube can change their page structure at any time, breaking the script
- **Limited Data:** May not get all metadata (descriptions are often truncated)
- **Rate Limiting:** YouTube may block requests if you run the script too frequently
- **No Pagination:** Only gets videos visible on the first page load (~30-50 videos)

### Recommended Alternative: YouTube Data API v3

For production use, consider using the **YouTube Data API v3**:

**Advantages:**
- ✅ Reliable and officially supported
- ✅ Complete metadata (full descriptions, tags, statistics)
- ✅ Pagination support (get all videos)
- ✅ Better rate limits
- ✅ Won't break when YouTube updates their site

**Setup:**
1. Get a free API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Update the script to use the API instead of scraping

**Example API Call:**
```
GET https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCViWHajhxfqcPOUmNsRxpcQ&maxResults=50&key=YOUR_API_KEY
```

## Troubleshooting

### "No videos found"

If the script returns no videos:

1. **Check the channel URL** - Make sure the channel ID is correct
2. **YouTube changed their structure** - The scraping logic may need updating
3. **Network issues** - Check your internet connection
4. **Consider using YouTube Data API** - More reliable solution

### "Error fetching page"

- Check your internet connection
- YouTube may be blocking automated requests
- Try adding a delay between requests
- Consider using a YouTube Data API key

### Videos not categorized correctly

Edit the `categorizeVideo()` function in the script to adjust keyword matching for your specific video titles.

## Firebase Structure

Videos are stored in the `videos` collection with this structure:

```typescript
{
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  category: VideoCategory;
  duration: string;
  publishedAt: string;
  featured: boolean;
  tags: string[];
  createdAt: Timestamp;
  createdBy: string;
  isActive: boolean;
}
```

## Accessing Videos

After import, videos can be accessed through:

1. **Admin Portal:** `/portal/admin/images` → Videos tab
2. **Firebase Console:** Firestore → `videos` collection
3. **Code:** Using functions from `lib/firebase-videos.ts`

```typescript
import { listVideos, getVideosByCategory } from '@/lib/firebase-videos';

// Get all videos
const allVideos = await listVideos();

// Get videos by category
const trainingVideos = await getVideosByCategory('training');
```

## Future Enhancements

Consider these improvements:

- [ ] Add YouTube Data API v3 support
- [ ] Support for playlists
- [ ] Batch processing with progress bar
- [ ] Update existing videos (sync metadata)
- [ ] Extract video tags from YouTube
- [ ] Download and store thumbnails in Firebase Storage
- [ ] Support for video statistics (views, likes)
- [ ] Scheduled automatic imports (cron job)
