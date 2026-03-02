/**
 * Add Team member Script for Brian Stitt
 * 
 * Creates a team_members document in Firestore to link the authenticated user
 * to the team members directory. This fixes the "No Team member found" error.
 * 
 * Usage:
 * npx ts-node scripts/add-team-member-bstitt.ts
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

async function addTeammember() {
  console.log('🚀 Adding Team member record to Firestore...\n');

  const teammemberData = {
    firebaseUid: 'FXTwwFSKJGerShxWa4WppneGkxU2',
    firstName: 'Brian',
    lastName: 'Stitt',
    emailPrimary: 'bstitt@strategicvalueplus.com',
    expertise: 'Platform Administration & Technology',
    title: 'Platform Administrator',
    company: 'Strategic Value Plus',
    location: '',
    bio: 'Platform administrator and technical lead for Strategic Value Plus.',
    role: 'admin' as const,
    status: 'active' as const,
    isCEO: false,
    isCOO: false,
    isCTO: true,
    isCRO: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  try {
    // Check if team member already exists by email
    const existingByEmail = await db.collection('team_members')
      .where('emailPrimary', '==', teammemberData.emailPrimary)
      .get();

    if (!existingByEmail.empty) {
      const existingDoc = existingByEmail.docs[0];
      console.log('⚠️  Team member with this email already exists');
      console.log('📄 Document ID:', existingDoc.id);
      console.log('📄 Current data:', JSON.stringify(existingDoc.data(), null, 2));
      
      // Update to ensure firebaseUid is linked
      await existingDoc.ref.update({
        firebaseUid: teammemberData.firebaseUid,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Updated existing Team member with firebaseUid link\n');
      return;
    }

    // Check if team member already exists by firebaseUid
    const existingByUid = await db.collection('team_members')
      .where('firebaseUid', '==', teammemberData.firebaseUid)
      .get();

    if (!existingByUid.empty) {
      const existingDoc = existingByUid.docs[0];
      console.log('⚠️  Team member with this firebaseUid already exists');
      console.log('📄 Document ID:', existingDoc.id);
      console.log('📄 Current data:', JSON.stringify(existingDoc.data(), null, 2));
      return;
    }

    // Create new team member document
    console.log('📝 Creating new Team member document...');
    const docRef = await db.collection('team_members').add(teammemberData);
    console.log('✅ Team member created with ID:', docRef.id);

    // Verify the document was created
    const verifyDoc = await docRef.get();
    if (verifyDoc.exists) {
      console.log('\n✅ Verification successful!');
      console.log('📄 Team member data:');
      console.log(JSON.stringify(verifyDoc.data(), null, 2));
      console.log('\n🎉 Team member record is now ready!');
      console.log('\n💡 The user should now:');
      console.log('   - Be linked to the Team members directory');
      console.log('   - Have access to team member features');
      console.log('   - No longer see "No Team member found" warning');
    }

  } catch (error) {
    console.error('❌ Error adding Team member:', error);
    throw error;
  }
}

// Run the script
addTeammember()
  .then(() => {
    console.log('\n✨ Team member addition complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Team member addition failed:', error);
    process.exit(1);
  });
