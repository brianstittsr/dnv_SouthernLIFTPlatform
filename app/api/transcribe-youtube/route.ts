import { NextRequest, NextResponse } from 'next/server';

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
 * Requires yt-dlp to be installed on the server
 */
async function downloadYouTubeAudio(videoId: string): Promise<Buffer | null> {
  try {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      let hasError = false;
      
      const process = spawn('yt-dlp', [
        '-f', 'bestaudio[ext=m4a]/bestaudio',
        '-x',
        '--audio-format', 'mp3',
        '--audio-quality', '192',
        '-o', '-',
        `https://www.youtube.com/watch?v=${videoId}`,
      ], {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 300000, // 5 minute timeout
      });

      process.stdout?.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      process.stderr?.on('data', (chunk: Buffer) => {
        const error = chunk.toString();
        console.error('[Transcribe] yt-dlp stderr:', error);
        if (error.includes('ERROR') || error.includes('error')) {
          hasError = true;
        }
      });

      process.on('close', (code) => {
        if (code === 0 && chunks.length > 0 && !hasError) {
          const audioBuffer = Buffer.concat(chunks);
          console.log(`[Transcribe] Downloaded ${audioBuffer.length} bytes of audio`);
          resolve(audioBuffer);
        } else {
          console.error(`[Transcribe] yt-dlp failed with code ${code}, hasError: ${hasError}`);
          resolve(null);
        }
      });

      process.on('error', (error: any) => {
        console.error('[Transcribe] Error spawning yt-dlp:', error.message);
        if (error.code === 'ENOENT') {
          console.error('[Transcribe] yt-dlp not found. Install with: pip install yt-dlp');
        }
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
    // Convert Buffer to Uint8Array then Blob for FormData
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/mpeg' });
    
    const form = new FormData();
    form.append('file', audioBlob, 'audio.mp3');
    form.append('model', 'whisper-1');
    form.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: form,
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
