const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/kdm-assets');
const outputDir = path.join(__dirname, '../public/carousel');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Images to convert for carousel
const carouselImages = [
  'pexels-antonio-jamal-roberson-261338-3678057.jpg',
  'pexels-dlxmedia-hu-215591835-11904593.jpg',
  'pexels-jibarofoto-2774556.jpg',
  'pexels-ramazphotos-7016974.jpg',
  'simon-kadula-8gr6bObQLOI-unsplash.jpg'
];

async function convertToWebP() {
  console.log('Converting carousel images to WebP...\n');
  
  for (const filename of carouselImages) {
    const inputPath = path.join(inputDir, filename);
    const outputFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = path.join(outputDir, outputFilename);
    
    try {
      await sharp(inputPath)
        .resize(1920, 1080, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      const inputStats = fs.statSync(inputPath);
      const outputStats = fs.statSync(outputPath);
      const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
      
      console.log(`✓ ${filename}`);
      console.log(`  Original: ${(inputStats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  WebP: ${(outputStats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Reduction: ${reduction}%\n`);
    } catch (error) {
      console.error(`✗ Error converting ${filename}:`, error.message);
    }
  }
  
  console.log('Conversion complete!');
}

convertToWebP();
