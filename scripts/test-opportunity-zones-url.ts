/**
 * Test the Opportunity Zones video URL
 */

const videoUrl = 'https://youtu.be/U9c0j7p73Ccq8SWwYpMOsVmeNyvDLBE';

// Extract video ID
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

const videoId = extractVideoId(videoUrl);
console.log('Video URL:', videoUrl);
console.log('Extracted ID:', videoId);
console.log('ID length:', videoId?.length);
console.log('Valid YouTube ID length should be 11 characters');

// Test thumbnail URLs
if (videoId) {
  console.log('\nThumbnail URLs to test:');
  console.log(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
}
