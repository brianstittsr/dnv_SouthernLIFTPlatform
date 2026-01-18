/**
 * Initialize SVP Platform Collections
 * 
 * This script creates all required Firestore collections with initial placeholder documents.
 * Run this once to set up the database structure.
 * 
 * Usage: npx tsx scripts/init-svp-collections.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin
if (getApps().length === 0) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

async function initializeCollections() {
  console.log('🚀 Initializing SVP Platform Collections...\n');

  try {
    // 1. Platform Settings
    console.log('📝 Creating platformSettings...');
    await db.collection('platformSettings').doc('global').set({
      navigationSettings: {
        hiddenItems: [],
        roleVisibility: {},
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ platformSettings created\n');

    // 2. Team Members (empty collection marker)
    console.log('📝 Creating teamMembers collection...');
    await db.collection('teamMembers').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'This is a placeholder document to create the collection. Delete after adding real team members.',
    });
    console.log('✅ teamMembers collection created\n');

    // 3. Memberships (empty collection marker)
    console.log('📝 Creating memberships collection...');
    await db.collection('memberships').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'This is a placeholder document to create the collection. Delete after adding real memberships.',
    });
    console.log('✅ memberships collection created\n');

    // 4. SVP Collections - Proof Packs
    console.log('📝 Creating proofPacks collection...');
    await db.collection('proofPacks').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Proof Packs collection',
    });
    console.log('✅ proofPacks collection created\n');

    // 5. SME Subscriptions
    console.log('📝 Creating smeSubscriptions collection...');
    await db.collection('smeSubscriptions').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for SME Subscriptions collection',
    });
    console.log('✅ smeSubscriptions collection created\n');

    // 6. Partner Leads
    console.log('📝 Creating partnerLeads collection...');
    await db.collection('partnerLeads').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Partner Leads collection',
    });
    console.log('✅ partnerLeads collection created\n');

    // 7. Partner Introductions
    console.log('📝 Creating partnerIntroductions collection...');
    await db.collection('partnerIntroductions').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Partner Introductions collection',
    });
    console.log('✅ partnerIntroductions collection created\n');

    // 8. Partner Revenue
    console.log('📝 Creating partnerRevenue collection...');
    await db.collection('partnerRevenue').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Partner Revenue collection',
    });
    console.log('✅ partnerRevenue collection created\n');

    // 9. Buyer Requests
    console.log('📝 Creating buyerRequests collection...');
    await db.collection('buyerRequests').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Buyer Requests collection',
    });
    console.log('✅ buyerRequests collection created\n');

    // 10. QA Reviews
    console.log('📝 Creating qaReviews collection...');
    await db.collection('qaReviews').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for QA Reviews collection',
    });
    console.log('✅ qaReviews collection created\n');

    // 11. CMMC Cohorts
    console.log('📝 Creating cmmcCohorts collection...');
    await db.collection('cmmcCohorts').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for CMMC Cohorts collection',
    });
    console.log('✅ cmmcCohorts collection created\n');

    // 12. Cohort Enrollments
    console.log('📝 Creating cohortEnrollments collection...');
    await db.collection('cohortEnrollments').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Cohort Enrollments collection',
    });
    console.log('✅ cohortEnrollments collection created\n');

    // 13. Curriculum Materials
    console.log('📝 Creating curriculumMaterials collection...');
    await db.collection('curriculumMaterials').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Curriculum Materials collection',
    });
    console.log('✅ curriculumMaterials collection created\n');

    // 14. Page Designer Collections
    console.log('📝 Creating page_designs collection...');
    await db.collection('page_designs').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Page Designs collection',
    });
    console.log('✅ page_designs collection created\n');

    console.log('📝 Creating page_design_history collection...');
    await db.collection('page_design_history').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Page Design History collection',
    });
    console.log('✅ page_design_history collection created\n');

    console.log('📝 Creating page_layout_templates collection...');
    await db.collection('page_layout_templates').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Page Layout Templates collection',
    });
    console.log('✅ page_layout_templates collection created\n');

    console.log('📝 Creating page_ai_conversations collection...');
    await db.collection('page_ai_conversations').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Page AI Conversations collection',
    });
    console.log('✅ page_ai_conversations collection created\n');

    console.log('📝 Creating page_ux_reviews collection...');
    await db.collection('page_ux_reviews').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Page UX Reviews collection',
    });
    console.log('✅ page_ux_reviews collection created\n');

    // 15. Platform Audit Logs
    console.log('📝 Creating platformAuditLogs collection...');
    await db.collection('platformAuditLogs').doc('_placeholder').set({
      _placeholder: true,
      createdAt: Timestamp.now(),
      note: 'Placeholder for Platform Audit Logs collection',
    });
    console.log('✅ platformAuditLogs collection created\n');

    console.log('✨ All SVP Platform collections initialized successfully!\n');
    console.log('📋 Collections created:');
    console.log('   - platformSettings (with global config)');
    console.log('   - teamMembers');
    console.log('   - memberships');
    console.log('   - proofPacks');
    console.log('   - smeSubscriptions');
    console.log('   - partnerLeads');
    console.log('   - partnerIntroductions');
    console.log('   - partnerRevenue');
    console.log('   - buyerRequests');
    console.log('   - qaReviews');
    console.log('   - cmmcCohorts');
    console.log('   - cohortEnrollments');
    console.log('   - curriculumMaterials');
    console.log('   - page_designs');
    console.log('   - page_design_history');
    console.log('   - page_layout_templates');
    console.log('   - page_ai_conversations');
    console.log('   - page_ux_reviews');
    console.log('   - platformAuditLogs');
    console.log('\n✅ You can now delete placeholder documents from Firebase Console if desired.');
    console.log('✅ Refresh your browser to see the changes!');

  } catch (error) {
    console.error('❌ Error initializing collections:', error);
    throw error;
  }
}

// Run the initialization
initializeCollections()
  .then(() => {
    console.log('\n🎉 Initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Initialization failed:', error);
    process.exit(1);
  });
