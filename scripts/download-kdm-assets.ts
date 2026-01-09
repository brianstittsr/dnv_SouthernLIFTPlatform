/**
 * KDM Website Asset Downloader
 * 
 * Script to download images and other assets from the KDM Associates website
 * Run with: npx ts-node scripts/download-kdm-assets.ts
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const ASSETS_OUTPUT_DIR = path.join(process.cwd(), 'public', 'kdm-assets');
const BASE_URL = 'https://kdm-assoc.com';

// Known asset URLs from the website (these would need to be discovered via actual scraping)
const ASSET_URLS = [
  // Logo and branding
  '/images/logo.png',
  '/images/logo-white.png',
  '/images/favicon.ico',
  
  // Hero images
  '/images/hero-bg.jpg',
  '/images/about-hero.jpg',
  
  // Team member photos (placeholder paths - actual paths need to be discovered)
  '/uploads/team/keith-moore.jpg',
  '/uploads/team/charles-sills.jpg',
  '/uploads/team/oscar-frazier.jpg',
  '/uploads/team/pamela-ramos-brown.jpg',
  '/uploads/team/calvin-minor.jpg',
  '/uploads/team/manpreet-hundal.jpg',
  '/uploads/team/timothy-webster.jpg',
  '/uploads/team/walter-cotton.jpg',
  '/uploads/team/jose-nino.jpg',
  '/uploads/team/gaylord-neal.jpg',
  '/uploads/team/bentley-charlemagne.jpg',
  
  // Service icons
  '/images/icons/digital-solutions.svg',
  '/images/icons/technology-solutions.svg',
  '/images/icons/grants-rfps.svg',
  '/images/icons/marketing-solutions.svg',
  '/images/icons/operations.svg',
  '/images/icons/contracting-vehicles.svg',
];

interface DownloadResult {
  url: string;
  success: boolean;
  localPath?: string;
  error?: string;
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const file = fs.createWriteStream(outputPath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

async function downloadAsset(assetPath: string): Promise<DownloadResult> {
  const fullUrl = assetPath.startsWith('http') ? assetPath : `${BASE_URL}${assetPath}`;
  const localPath = path.join(ASSETS_OUTPUT_DIR, assetPath.replace(/^\//, ''));
  
  try {
    await downloadFile(fullUrl, localPath);
    console.log(`✓ Downloaded: ${assetPath}`);
    return { url: fullUrl, success: true, localPath };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`✗ Failed: ${assetPath} - ${errorMessage}`);
    return { url: fullUrl, success: false, error: errorMessage };
  }
}

async function main() {
  console.log('KDM Website Asset Downloader');
  console.log('============================\n');
  console.log(`Output directory: ${ASSETS_OUTPUT_DIR}\n`);
  
  // Create output directory
  if (!fs.existsSync(ASSETS_OUTPUT_DIR)) {
    fs.mkdirSync(ASSETS_OUTPUT_DIR, { recursive: true });
  }
  
  const results: DownloadResult[] = [];
  
  for (const assetUrl of ASSET_URLS) {
    const result = await downloadAsset(assetUrl);
    results.push(result);
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n============================');
  console.log(`Summary: ${successful} successful, ${failed} failed`);
  
  // Save manifest
  const manifest = {
    downloadedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    outputDir: ASSETS_OUTPUT_DIR,
    results: results
  };
  
  const manifestPath = path.join(ASSETS_OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest saved to: ${manifestPath}`);
}

// Export for programmatic use
export { downloadFile, downloadAsset, ASSET_URLS };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
