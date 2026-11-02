/**
 * Firebase Collections Initialization Script
 * 
 * This script creates initial documents in Firebase collections so they appear in the Firebase Console.
 * Run this once after deploying Firestore rules.
 * 
 * Usage:
 * npx ts-node scripts/init-firebase-collections.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function initializeCollections() {
  console.log('🚀 Initializing Firebase collections...\n');

  try {
    // 1. Create platform settings
    console.log('📝 Creating platform settings...');
    await db.collection('platformSettings').doc('global').set({
      navigationSettings: {
        hiddenItems: [],
        roleVisibility: {},
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Platform settings created\n');

    // 2. Create system metrics placeholder
    console.log('📊 Creating system metrics...');
    await db.collection('systemMetrics').doc('init').set({
      type: 'initialization',
      timestamp: Timestamp.now(),
      message: 'System initialized',
    });
    console.log('✅ System metrics created\n');

    // 3. Create alert configurations placeholder
    console.log('🔔 Creating alert configurations...');
    await db.collection('alertConfigurations').doc('init').set({
      type: 'initialization',
      enabled: false,
      createdAt: Timestamp.now(),
    });
    console.log('✅ Alert configurations created\n');

    // 4. Create email queue placeholder
    console.log('📧 Creating email queue...');
    await db.collection('emailQueue').doc('init').set({
      to: ['system@example.com'],
      subject: 'System Initialization',
      body: 'Firebase collections initialized',
      status: 'pending',
      createdAt: Timestamp.now(),
    });
    console.log('✅ Email queue created\n');

    // 5. Create audit logs placeholder
    console.log('📋 Creating audit logs...');
    await db.collection('auditLogs').doc('init').set({
      userId: 'system',
      action: 'system_initialization',
      resource: 'firebase',
      resourceId: 'collections',
      details: {
        message: 'Firebase collections initialized',
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
    console.log('✅ Audit logs created\n');

    // 6. Create routing rules placeholder
    console.log('🔀 Creating routing rules...');
    await db.collection('routingRules').doc('init').set({
      partnerId: 'placeholder',
      industries: [],
      serviceTypes: [],
      verticalExpertise: [],
      maxCapacity: 0,
      isActive: false,
      priority: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Routing rules created\n');

    console.log('🎉 All collections initialized successfully!');
    console.log('\n📍 You should now see the following collections in Firebase Console:');
    console.log('   - platformSettings');
    console.log('   - systemMetrics');
    console.log('   - alertConfigurations');
    console.log('   - emailQueue');
    console.log('   - auditLogs');
    console.log('   - routingRules');
    console.log('\n💡 Note: Other collections will be created automatically when:');
    console.log('   - Users sign up (users collection)');
    console.log('   - SMEs create Proof Packs (proofPacks collection)');
    console.log('   - Partners capture leads (leads collection)');
    console.log('   - Buyers request introductions (introductions collection)');
    console.log('   - Instructors create courses (courses collection)');
    console.log('   - etc.\n');

  } catch (error) {
    console.error('❌ Error initializing collections:', error);
    throw error;
  }
}

// Run the initialization
initializeCollections()
  .then(() => {
    console.log('✨ Initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Initialization failed:', error);
    process.exit(1);
  });
