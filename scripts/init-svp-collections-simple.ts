/**
 * Initialize SVP Platform Collections - Simple Version
 * 
 * This script uses the Firebase client SDK instead of Admin SDK
 * to avoid credential issues. Run this while logged into the app.
 * 
 * Usage: npx tsx scripts/init-svp-collections-simple.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

// Firebase config from your .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeCollections() {
  console.log('🚀 Initializing SVP Platform Collections...\n');
  console.log('⚠️  Note: You must be authenticated as an admin for this to work.\n');

  try {
    const now = Timestamp.now();

    // 1. Platform Settings
    console.log('📝 Creating platformSettings...');
    await setDoc(doc(db, 'platformSettings', 'global'), {
      navigationSettings: {
        hiddenItems: [],
        roleVisibility: {},
      },
      createdAt: now,
      updatedAt: now,
    });
    console.log('✅ platformSettings created\n');

    // 2. Team members
    console.log('📝 Creating teammembers collection...');
    await setDoc(doc(db, 'teammembers', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder document. Delete after adding real team members.',
    });
    console.log('✅ teammembers collection created\n');

    // 3. memberships
    console.log('📝 Creating memberships collection...');
    await setDoc(doc(db, 'memberships', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder document. Delete after adding real memberships.',
    });
    console.log('✅ memberships collection created\n');

    // 4. Proof Packs
    console.log('📝 Creating proofPacks collection...');
    await setDoc(doc(db, 'proofPacks', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Proof Packs collection',
    });
    console.log('✅ proofPacks collection created\n');

    // 5. SME Subscriptions
    console.log('📝 Creating smeSubscriptions collection...');
    await setDoc(doc(db, 'smeSubscriptions', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for SME Subscriptions collection',
    });
    console.log('✅ smeSubscriptions collection created\n');

    // 6. Partner Leads
    console.log('📝 Creating partnerLeads collection...');
    await setDoc(doc(db, 'partnerLeads', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Partner Leads collection',
    });
    console.log('✅ partnerLeads collection created\n');

    // 7. Partner Introductions
    console.log('📝 Creating partnerIntroductions collection...');
    await setDoc(doc(db, 'partnerIntroductions', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Partner Introductions collection',
    });
    console.log('✅ partnerIntroductions collection created\n');

    // 8. Partner Revenue
    console.log('📝 Creating partnerRevenue collection...');
    await setDoc(doc(db, 'partnerRevenue', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Partner Revenue collection',
    });
    console.log('✅ partnerRevenue collection created\n');

    // 9. Buyer Requests
    console.log('📝 Creating buyerRequests collection...');
    await setDoc(doc(db, 'buyerRequests', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Buyer Requests collection',
    });
    console.log('✅ buyerRequests collection created\n');

    // 10. QA Reviews
    console.log('📝 Creating qaReviews collection...');
    await setDoc(doc(db, 'qaReviews', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for QA Reviews collection',
    });
    console.log('✅ qaReviews collection created\n');

    // 11. CMMC Cohorts
    console.log('📝 Creating cmmcCohorts collection...');
    await setDoc(doc(db, 'cmmcCohorts', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for CMMC Cohorts collection',
    });
    console.log('✅ cmmcCohorts collection created\n');

    // 12. Cohort Enrollments
    console.log('📝 Creating cohortEnrollments collection...');
    await setDoc(doc(db, 'cohortEnrollments', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Cohort Enrollments collection',
    });
    console.log('✅ cohortEnrollments collection created\n');

    // 13. Curriculum Materials
    console.log('📝 Creating curriculumMaterials collection...');
    await setDoc(doc(db, 'curriculumMaterials', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Curriculum Materials collection',
    });
    console.log('✅ curriculumMaterials collection created\n');

    // 14. Page Designer Collections
    console.log('📝 Creating page_designs collection...');
    await setDoc(doc(db, 'page_designs', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Page Designs collection',
    });
    console.log('✅ page_designs collection created\n');

    console.log('📝 Creating page_design_history collection...');
    await setDoc(doc(db, 'page_design_history', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Page Design History collection',
    });
    console.log('✅ page_design_history collection created\n');

    console.log('📝 Creating page_layout_templates collection...');
    await setDoc(doc(db, 'page_layout_templates', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Page Layout Templates collection',
    });
    console.log('✅ page_layout_templates collection created\n');

    console.log('📝 Creating page_ai_conversations collection...');
    await setDoc(doc(db, 'page_ai_conversations', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Page AI Conversations collection',
    });
    console.log('✅ page_ai_conversations collection created\n');

    console.log('📝 Creating page_ux_reviews collection...');
    await setDoc(doc(db, 'page_ux_reviews', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Page UX Reviews collection',
    });
    console.log('✅ page_ux_reviews collection created\n');

    // 15. Platform Audit Logs
    console.log('📝 Creating platformAuditLogs collection...');
    await setDoc(doc(db, 'platformAuditLogs', '_placeholder'), {
      _placeholder: true,
      createdAt: now,
      note: 'Placeholder for Platform Audit Logs collection',
    });
    console.log('✅ platformAuditLogs collection created\n');

    console.log('✨ All SVP Platform collections initialized successfully!\n');
    console.log('📋 Collections created:');
    console.log('   ✅ platformSettings (with global config)');
    console.log('   ✅ teammembers');
    console.log('   ✅ memberships');
    console.log('   ✅ proofPacks');
    console.log('   ✅ smeSubscriptions');
    console.log('   ✅ partnerLeads');
    console.log('   ✅ partnerIntroductions');
    console.log('   ✅ partnerRevenue');
    console.log('   ✅ buyerRequests');
    console.log('   ✅ qaReviews');
    console.log('   ✅ cmmcCohorts');
    console.log('   ✅ cohortEnrollments');
    console.log('   ✅ curriculumMaterials');
    console.log('   ✅ page_designs');
    console.log('   ✅ page_design_history');
    console.log('   ✅ page_layout_templates');
    console.log('   ✅ page_ai_conversations');
    console.log('   ✅ page_ux_reviews');
    console.log('   ✅ platformAuditLogs');
    console.log('\n💡 You can delete placeholder documents from Firebase Console if desired.');
    console.log('🔄 Refresh your browser to see the changes!');

  } catch (error: any) {
    console.error('❌ Error initializing collections:', error.message);
    if (error.code === 'permission-denied') {
      console.error('\n⚠️  Permission denied! Make sure:');
      console.error('   1. You are logged in as an admin');
      console.error('   2. Firestore rules have been deployed');
      console.error('   3. Your user has admin role in Firestore');
    }
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
    console.error('\n💥 Initialization failed:', error.message);
    process.exit(1);
  });
