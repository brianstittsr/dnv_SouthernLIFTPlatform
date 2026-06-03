/**
 * Script to clean up ghost slides from Firestore
 * This removes all slides from the hero_slides collection
 * Run with: node scripts/clean-ghost-slides.js
 * 
 * Requires: FIREBASE_ADMIN_SDK_JSON environment variable path to service account JSON
 */

const admin = require('firebase-admin');

// Check for service account
if (!process.env.FIREBASE_ADMIN_SDK_JSON) {
  console.error('Error: FIREBASE_ADMIN_SDK_JSON environment variable is not set.');
  console.error('\nTo run this script, set your Firebase service account JSON path:');
  console.error('  Windows PowerShell: $env:FIREBASE_ADMIN_SDK_JSON="path/to/service-account.json"');
  console.error('  Windows CMD: set FIREBASE_ADMIN_SDK_JSON=path/to/service-account.json');
  console.error('  Linux/Mac: export FIREBASE_ADMIN_SDK_JSON=path/to/service-account.json');
  console.error('\nOr run inline:');
  console.error('  FIREBASE_ADMIN_SDK_JSON=path/to/service-account.json node scripts/clean-ghost-slides.js');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = require(process.env.FIREBASE_ADMIN_SDK_JSON);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function cleanGhostSlides() {
  console.log('=== Cleaning Ghost Slides from Firestore ===\n');
  
  try {
    // Get all hero slides
    console.log('Fetching all hero slides from Firestore...');
    const slidesSnapshot = await db.collection('hero_slides').get();
    
    if (slidesSnapshot.empty) {
      console.log('✓ No slides found in Firestore. Collection is already clean.');
      return;
    }
    
    console.log(`Found ${slidesSnapshot.size} slides in Firestore:\n`);
    
    // List all slides
    slidesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}`);
      console.log(`    Headline: ${data.headline || 'N/A'}`);
      console.log(`    Published: ${data.isPublished ? 'Yes' : 'No'}`);
      console.log(`    Order: ${data.order || 'N/A'}`);
      console.log('');
    });
    
    // Ask for confirmation
    console.log('⚠️  This will DELETE ALL slides from the hero_slides collection.');
    console.log('⚠️  Make sure you have a backup or can re-add the slides you need.');
    console.log('');
    
    // Since this is a script, we'll proceed with deletion
    // In production, you might want to add a confirmation prompt
    console.log('Proceeding with deletion...\n');
    
    // Delete all slides
    const batch = db.batch();
    slidesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`✓ Successfully deleted ${slidesSnapshot.size} slides from Firestore.`);
    console.log('\n=== Cleanup Complete ===');
    console.log('\nNext steps:');
    console.log('1. Go to the admin panel at /portal/admin/hero');
    console.log('2. Click "Reset to Defaults" to re-seed with clean default slides');
    console.log('3. Or manually add only the slides you want');
    
  } catch (error) {
    console.error('\n✗ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanGhostSlides().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
