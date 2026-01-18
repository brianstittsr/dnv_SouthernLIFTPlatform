import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import sanitize from 'sanitize-filename';
import { config } from './config.js';

/**
 * Normalize URL to absolute URL
 */
export function normalizeUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).href;
  } catch (e) {
    return null;
  }
}

/**
 * Check if URL is internal (same domain)
 */
export function isInternalUrl(url, baseUrl) {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    return urlObj.hostname === baseObj.hostname;
  } catch (e) {
    return false;
  }
}

/**
 * Check if URL should be excluded
 */
export function shouldExcludeUrl(url) {
  return config.excludePatterns.some(pattern => pattern.test(url));
}

/**
 * Get page type based on URL
 */
export function getPageType(url) {
  for (const [type, pattern] of Object.entries(config.pageTypes)) {
    if (pattern.test(url)) {
      return type;
    }
  }
  return 'general';
}

/**
 * Generate slug from URL
 */
export function generateSlug(url) {
  try {
    const urlObj = new URL(url);
    let slug = urlObj.pathname.replace(/^\/|\/$/g, '');
    if (!slug) slug = 'home';
    return slug.replace(/\//g, '-');
  } catch (e) {
    return 'unknown';
  }
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename) {
  return sanitize(filename).replace(/\s+/g, '-').toLowerCase();
}

/**
 * Download file from URL
 */
export async function downloadFile(url, outputPath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': config.userAgent
      }
    });

    await fs.ensureDir(path.dirname(outputPath));
    
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return null;
  }
}

/**
 * Extract video information from URL
 */
export function extractVideoInfo(url) {
  // YouTube
  const youtubeMatch = url.match(config.videoPlatforms.youtube);
  if (youtubeMatch) {
    return {
      platform: 'youtube',
      id: youtubeMatch[1],
      url: url,
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
    };
  }

  // Vimeo
  const vimeoMatch = url.match(config.videoPlatforms.vimeo);
  if (vimeoMatch) {
    const videoId = vimeoMatch[3];
    return {
      platform: 'vimeo',
      id: videoId,
      url: url,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      thumbnailUrl: null // Vimeo thumbnails require API call
    };
  }

  // Self-hosted video
  if (/\.(mp4|webm|ogg|mov)$/i.test(url)) {
    return {
      platform: 'self-hosted',
      id: null,
      url: url,
      embedUrl: url,
      thumbnailUrl: null
    };
  }

  return null;
}

/**
 * Check if URL is a document
 */
export function isDocument(url) {
  return config.documentFormats.some(ext => url.toLowerCase().endsWith(ext));
}

/**
 * Check if URL is an image
 */
export function isImage(url) {
  return config.imageFormats.some(ext => url.toLowerCase().endsWith(ext));
}

/**
 * Save JSON data to file
 */
export async function saveJson(data, filePath) {
  try {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(filePath, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error(`Failed to save JSON to ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Format timestamp
 */
export function formatTimestamp(date = new Date()) {
  return date.toISOString();
}

/**
 * Calculate depth from start URL
 */
export function calculateDepth(url, startUrl) {
  try {
    const urlPath = new URL(url).pathname;
    const startPath = new URL(startUrl).pathname;
    
    const urlSegments = urlPath.split('/').filter(s => s);
    const startSegments = startPath.split('/').filter(s => s);
    
    return Math.max(0, urlSegments.length - startSegments.length);
  } catch (e) {
    return 0;
  }
}

/**
 * Clean text content
 */
export function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Extract domain from URL
 */
export function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
}

/**
 * Generate unique filename for media
 */
export function generateMediaFilename(url, index) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname) || '.jpg';
    const basename = path.basename(pathname, ext) || `image-${index}`;
    return sanitizeFilename(`${basename}-${index}${ext}`);
  } catch (e) {
    return `media-${index}.jpg`;
  }
}

/**
 * Create progress bar string
 */
export function createProgressBar(current, total, width = 40) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((width * current) / total);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${' '.repeat(empty)}] ${percentage}% (${current}/${total})`;
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
