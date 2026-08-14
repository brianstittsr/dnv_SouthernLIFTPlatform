// Script to assign platform_admin role to a user
// Run with: npx tsx scripts/assign-platform-admin.ts <email> <firstName> <lastName>
//
// IMPORTANT: firstName/lastName are REQUIRED and are only used if a new
// Firebase Auth user must be created, or to correct the name on the
// Firestore user document. Previously this script had a hardcoded name
// ("Manpreet Hundal") which caused it to silently overwrite a different
// user's name when run with someone else's email — always pass the
// correct name explicitly to avoid this class of bug.

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth, type UserRecord } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

async function assignPlatformAdmin(email: string, firstName: string, lastName: string) {
  const displayName = `${firstName} ${lastName}`;
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Get or create user by email
    let userRecord: UserRecord;
    let tempPassword: string | undefined;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`✅ Found user: ${userRecord.uid}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        tempPassword = `${randomUUID().replace(/-/g, '')}A1!`;
        console.log(`🔧 User not found; creating new account for ${email}`);
        userRecord = await auth.createUser({
          email,
          displayName,
          password: tempPassword,
          emailVerified: true,
        });
        console.log(`✅ Created user: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'platform_admin',
      svpRole: 'platform_admin',
      tenantId: 'kdm-svp-platform',
    });
    console.log(`✅ Set custom claims: role=platform_admin, tenantId=kdm-svp-platform`);
    
    // Update or create user document in Firestore
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      await userDocRef.update({
        firstName,
        lastName,
        displayName: userRecord.displayName || displayName,
        role: 'platform_admin',
        svpRole: 'platform_admin',
        tenantId: 'kdm-svp-platform',
        isActive: true,
        updatedAt: Timestamp.now(),
      });
      console.log(`✅ Updated user document in Firestore`);
    } else {
      await userDocRef.set({
        id: userRecord.uid,
        email: userRecord.email,
        firstName,
        lastName,
        displayName: userRecord.displayName || displayName,
        role: 'platform_admin',
        svpRole: 'platform_admin',
        tenantId: 'kdm-svp-platform',
        isActive: true,
        emailVerified: true,
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
    
    if (tempPassword) {
      console.log(`\n🔑 Temporary password: ${tempPassword}`);
      console.log(`⚠️  Share this securely; the user should change it on first login.`);
    }
    console.log(`\n🎉 Success! ${email} is now a platform admin`);
    console.log(`\n⚠️  Important: User must sign out and sign back in for changes to take effect`);
    
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ Error:`, error.message);
    process.exit(1);
  }
}

// Get email/name from command line arguments — all three are required
const [email, firstName, lastName] = process.argv.slice(2);

if (!email || !firstName || !lastName) {
  console.error('Usage: npx tsx scripts/assign-platform-admin.ts <email> <firstName> <lastName>');
  process.exit(1);
}

console.log(`\n🚀 Assigning platform_admin role to: ${firstName} ${lastName} (${email})\n`);
assignPlatformAdmin(email, firstName, lastName);
