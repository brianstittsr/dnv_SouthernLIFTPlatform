// Script to set instructor role for a user
// Run with: npx tsx scripts/set-instructor-role.ts <email>

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

async function setInstructorRole(email: string) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid}`);
    
    // Set custom claims for instructor role
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'cmmc_instructor',
      tenantId: 'kdm-svp-platform',
    });
    console.log(`✅ Set custom claims: role=cmmc_instructor, tenantId=kdm-svp-platform`);
    
    // Update user document in Firestore
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      await userDocRef.update({
        role: 'cmmc_instructor',
        svpRole: 'cmmc_instructor',
        tenantId: 'kdm-svp-platform',
        updatedAt: Timestamp.now(),
      });
      console.log(`✅ Updated user document in Firestore`);
    } else {
      await userDocRef.set({
        id: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || email.split('@')[0],
        role: 'cmmc_instructor',
        svpRole: 'cmmc_instructor',
        tenantId: 'kdm-svp-platform',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`✅ Created user document in Firestore`);
    }
    
    // Update permissions document
    const permissionsRef = db.collection('userPermissions').doc(userRecord.uid);
    await permissionsRef.set({
      userId: userRecord.uid,
      role: 'cmmc_instructor',
      tenantId: 'kdm-svp-platform',
      permissions: [
        'instructor:read',
        'instructor:write',
        'courses:manage',
        'assessments:manage',
        'certificates:issue',
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }, { merge: true });
    console.log(`✅ Updated permissions document`);
    
    console.log(`\n🎉 Success! ${email} is now a CMMC Instructor`);
    console.log(`\n⚠️  Important: User must sign out and sign back in for changes to take effect`);
    
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ Error:`, error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx tsx scripts/set-instructor-role.ts <email>');
  process.exit(1);
}

console.log(`\n🚀 Setting CMMC Instructor role for: ${email}\n`);
setInstructorRole(email);
