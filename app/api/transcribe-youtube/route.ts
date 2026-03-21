import { NextRequest, NextResponse } from 'next/server';

/**
 * Transcribe YouTube video using youtube-transcript-api
 * Extracts captions/transcripts from YouTube videos
 */
export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json();

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format' },
        { status: 400 }
      );
    }

    // Use youtube-transcript-api to get transcripts
    const transcript = await getYouTubeTranscript(videoId);

    if (!transcript) {
      return NextResponse.json(
        { error: 'Could not retrieve transcript. Video may not have captions.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      videoId,
      transcript,
      summary: generateSummary(transcript),
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe YouTube video' },
      { status: 500 }
    );
  }
}

/**
 * Extract video ID from various YouTube URL formats
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
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
 * Get YouTube transcript using the youtube-transcript-api
 * This uses a server-side approach to fetch transcripts
 */
async function getYouTubeTranscript(videoId: string): Promise<string | null> {
  try {
    // Use the YouTube Transcript API endpoint
    const response = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch transcript:', response.status);
      return null;
    }

    const text = await response.text();
    
    // Parse XML response and extract text
    const transcript = parseTranscriptXml(text);
    return transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

/**
 * Parse YouTube transcript XML format
 */
function parseTranscriptXml(xml: string): string {
  try {
    // Extract text from XML tags like <text>...</text>
    const textRegex = /<text[^>]*>([^<]+)<\/text>/g;
    const matches = Array.from(xml.matchAll(textRegex));
    
    if (matches.length === 0) {
      return '';
    }

    // Decode HTML entities and join text
    const transcript = matches
      .map(match => decodeHTMLEntities(match[1]))
      .join(' ');

    return transcript;
  } catch (error) {
    console.error('Error parsing transcript XML:', error);
    return '';
  }
}

/**
 * Decode HTML entities
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  return decoded;
}

/**
 * Generate a summary from the transcript
 * Takes the first 500 characters as a preview
 */
function generateSummary(transcript: string): string {
  if (!transcript) return '';
  
  // Clean up whitespace
  const cleaned = transcript.replace(/\s+/g, ' ').trim();
  
  // Return first 500 characters as preview
  return cleaned.length > 500 
    ? cleaned.substring(0, 500) + '...'
    : cleaned;
}
