import { NextRequest, NextResponse } from 'next/server';
import FormData from 'form-data';

/**
 * Transcribe YouTube video using OpenAI Whisper API
 * Downloads audio from YouTube and transcribes using Whisper
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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 503 }
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

    // Download audio from YouTube
    console.log(`[Transcribe] Downloading audio from YouTube video: ${videoId}`);
    const audioBuffer = await downloadYouTubeAudio(videoId);

    if (!audioBuffer) {
      return NextResponse.json(
        { error: 'Could not download audio from YouTube video' },
        { status: 400 }
      );
    }

    // Transcribe using OpenAI Whisper API
    console.log(`[Transcribe] Sending audio to OpenAI Whisper API`);
    const transcript = await transcribeWithWhisper(audioBuffer);

    if (!transcript) {
      return NextResponse.json(
        { error: 'Failed to transcribe audio with OpenAI Whisper' },
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
 * Download audio from YouTube video using yt-dlp
 * Returns audio buffer for transcription
 */
async function downloadYouTubeAudio(videoId: string): Promise<Buffer | null> {
  try {
    // Use yt-dlp to download audio in MP3 format
    // This requires yt-dlp to be installed on the server
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      
      const process = spawn('yt-dlp', [
        '-f', 'bestaudio[ext=m4a]/bestaudio',
        '-x',
        '--audio-format', 'mp3',
        '--audio-quality', '192',
        '-o', '-',
        `https://www.youtube.com/watch?v=${videoId}`,
      ]);

      process.stdout.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      process.on('close', (code) => {
        if (code === 0 && chunks.length > 0) {
          const audioBuffer = Buffer.concat(chunks);
          console.log(`[Transcribe] Downloaded ${audioBuffer.length} bytes of audio`);
          resolve(audioBuffer);
        } else {
          console.error(`[Transcribe] yt-dlp failed with code ${code}`);
          resolve(null);
        }
      });

      process.on('error', (error) => {
        console.error('[Transcribe] Error spawning yt-dlp:', error);
        resolve(null);
      });
    });
  } catch (error) {
    console.error('[Transcribe] Error downloading audio:', error);
    return null;
  }
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
async function transcribeWithWhisper(audioBuffer: Buffer): Promise<string | null> {
  try {
    const form = new FormData();
    form.append('file', audioBuffer, 'audio.mp3');
    form.append('model', 'whisper-1');
    form.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: form as any,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Transcribe] OpenAI API error:', error);
      return null;
    }

    const data = await response.json() as { text: string };
    console.log('[Transcribe] Transcription successful');
    return data.text;
  } catch (error) {
    console.error('[Transcribe] Error transcribing with Whisper:', error);
    return null;
  }
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
