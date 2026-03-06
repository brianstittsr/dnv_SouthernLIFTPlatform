const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

/**
 * Script to set CORS configuration for Firebase Storage using firebase-admin.
 */

async function setCors() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

  console.log(`Setting CORS for bucket: ${bucketName}...`);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  const bucket = admin.storage().bucket(bucketName);

  const corsConfiguration = [
    {
      origin: ['*'],
      method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
      responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'x-goog-resumable'],
      maxAgeSeconds: 3600,
    },
  ];

  try {
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log('✅ CORS configuration set successfully.');
  } catch (error) {
    console.error('❌ Error setting CORS configuration:', error);
    process.exit(1);
  }
}

setCors();
