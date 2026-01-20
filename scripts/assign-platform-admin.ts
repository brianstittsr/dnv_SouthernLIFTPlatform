// Script to assign platform_admin role to a user
// Run with: npx tsx scripts/assign-platform-admin.ts

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

async function assignPlatformAdmin(email: string) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid}`);
    
    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'platform_admin',
      tenantId: 'kdm-svp-platform',
    });
    console.log(`✅ Set custom claims: role=platform_admin, tenantId=kdm-svp-platform`);
    
    // Update or create user document in Firestore
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      await userDocRef.update({
        role: 'platform_admin',
        tenantId: 'kdm-svp-platform',
        updatedAt: Timestamp.now(),
      });
      console.log(`✅ Updated user document in Firestore`);
    } else {
      await userDocRef.set({
        id: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || email.split('@')[0],
        role: 'platform_admin',
        tenantId: 'kdm-svp-platform',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`✅ Created user document in Firestore`);
    }
    
    // Create or update permissions document
    const permissionsRef = db.collection('userPermissions').doc(userRecord.uid);
    await permissionsRef.set({
      userId: userRecord.uid,
      role: 'platform_admin',
      tenantId: 'kdm-svp-platform',
      permissions: [
        'admin:read',
        'admin:write',
        'admin:delete',
        'users:manage',
        'roles:manage',
        'settings:manage',
        'analytics:view',
        'audit:view',
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }, { merge: true });
    console.log(`✅ Updated permissions document`);
    
    console.log(`\n🎉 Success! ${email} is now a platform admin`);
    console.log(`\n⚠️  Important: User must sign out and sign back in for changes to take effect`);
    
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ Error:`, error.message);
    process.exit(1);
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'bstitt@strategicvalueplus.com';

console.log(`\n🚀 Assigning platform_admin role to: ${email}\n`);
assignPlatformAdmin(email);
