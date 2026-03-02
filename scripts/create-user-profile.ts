/**
 * Create User Profile Script
 * 
 * Creates a user profile document in Firestore for the authenticated user.
 * This fixes the "No Team member found" error by creating the necessary user document.
 * 
 * Usage:
 * npx ts-node scripts/create-user-profile.ts
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

async function createUserProfile() {
  console.log('🚀 Creating user profile in Firestore...\n');

  try {
    const userId = 'FXTwwFSKJGerShxWa4WppneGkxU2';
    const email = 'bstitt@strategicvalueplus.com';

    // Check if user already exists
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      console.log('✅ User document already exists');
      console.log('📄 Current data:', JSON.stringify(userDoc.data(), null, 2));
      
      // Update to ensure all required fields are present
      await db.collection('users').doc(userId).update({
        svpRole: 'platform_admin',
        subscriptionTier: 'diy',
        updatedAt: Timestamp.now(),
      });
      console.log('✅ User document updated with svpRole and subscriptionTier\n');
    } else {
      // Create new user document
      console.log('📝 Creating new user document...');
      await db.collection('users').doc(userId).set({
        email: email,
        firstName: 'Brian',
        lastName: 'Stitt',
        displayName: 'Brian Stitt',
        svpRole: 'platform_admin',
        role: 'admin',
        subscriptionTier: 'diy',
        isActive: true,
        emailVerified: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        metadata: {
          source: 'admin_script',
          createdBy: 'system',
        },
      });
      console.log('✅ User document created successfully\n');
    }

    // Verify the document was created/updated
    const verifyDoc = await db.collection('users').doc(userId).get();
    if (verifyDoc.exists) {
      console.log('✅ Verification successful!');
      console.log('📄 User profile data:');
      console.log(JSON.stringify(verifyDoc.data(), null, 2));
      console.log('\n🎉 User profile is now ready!');
      console.log('\n💡 The user should now be able to:');
      console.log('   - Access the subscription page');
      console.log('   - View their profile');
      console.log('   - Use all platform features');
    } else {
      throw new Error('Failed to verify user document creation');
    }

  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    throw error;
  }
}

// Run the script
createUserProfile()
  .then(() => {
    console.log('\n✨ User profile creation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 User profile creation failed:', error);
    process.exit(1);
  });
