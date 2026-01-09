/**
 * KDM Website Asset Downloader
 * 
 * Script to download images and other assets from the KDM Associates website
 * Run with: node scripts/download-kdm-assets.mjs
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'kdm-assets');
const BASE_URL = 'https://kdm-assoc.com';

// Known asset URLs from the website
const ASSET_URLS = [
  // These are placeholder paths - actual image paths would need to be discovered
  // by inspecting the website's HTML source
  '/images/logo.png',
  '/images/logo-white.png',
  '/images/favicon.ico',
];

async function downloadFile(url, outputPath) {
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
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(outputPath, () => {});
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function downloadAsset(assetPath) {
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
  
  const results = [];
  
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
  
  console.log('\nNote: The actual image URLs from the KDM website need to be');
  console.log('discovered by inspecting the website HTML. The content JSON');
  console.log('files in content/kdm-website/ contain all the text content.');
}

main().catch(console.error);
