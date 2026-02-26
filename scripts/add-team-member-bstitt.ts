/**
 * Add Team Meemerging businessr Script for Brian Stitt
 * 
 * Creates a team_meemerging businessrs document in Firestore to link the authenticated user
 * to the team meemerging businessrs directory. This fixes the "No Team Meemerging businessr found" error.
 * 
 * Usage:
 * npx ts-node scripts/add-team-meemerging businessr-bstitt.ts
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

async function addTeamMeemerging businessr() {
  console.log('🚀 Adding Team Meemerging businessr record to Firestore...\n');

  const teamMeemerging businessrData = {
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
    // Check if team meemerging businessr already exists by email
    const existingByEmail = await db.collection('team_meemerging businessrs')
      .where('emailPrimary', '==', teamMeemerging businessrData.emailPrimary)
      .get();

    if (!existingByEmail.empty) {
      const existingDoc = existingByEmail.docs[0];
      console.log('⚠️  Team Meemerging businessr with this email already exists');
      console.log('📄 Document ID:', existingDoc.id);
      console.log('📄 Current data:', JSON.stringify(existingDoc.data(), null, 2));
      
      // Update to ensure firebaseUid is linked
      await existingDoc.ref.update({
        firebaseUid: teamMeemerging businessrData.firebaseUid,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Updated existing Team Meemerging businessr with firebaseUid link\n');
      return;
    }

    // Check if team meemerging businessr already exists by firebaseUid
    const existingByUid = await db.collection('team_meemerging businessrs')
      .where('firebaseUid', '==', teamMeemerging businessrData.firebaseUid)
      .get();

    if (!existingByUid.empty) {
      const existingDoc = existingByUid.docs[0];
      console.log('⚠️  Team Meemerging businessr with this firebaseUid already exists');
      console.log('📄 Document ID:', existingDoc.id);
      console.log('📄 Current data:', JSON.stringify(existingDoc.data(), null, 2));
      return;
    }

    // Create new team meemerging businessr document
    console.log('📝 Creating new Team Meemerging businessr document...');
    const docRef = await db.collection('team_meemerging businessrs').add(teamMeemerging businessrData);
    console.log('✅ Team Meemerging businessr created with ID:', docRef.id);

    // Verify the document was created
    const verifyDoc = await docRef.get();
    if (verifyDoc.exists) {
      console.log('\n✅ Verification successful!');
      console.log('📄 Team Meemerging businessr data:');
      console.log(JSON.stringify(verifyDoc.data(), null, 2));
      console.log('\n🎉 Team Meemerging businessr record is now ready!');
      console.log('\n💡 The user should now:');
      console.log('   - Be linked to the Team Meemerging businessrs directory');
      console.log('   - Have access to team meemerging businessr features');
      console.log('   - No longer see "No Team Meemerging businessr found" warning');
    }

  } catch (error) {
    console.error('❌ Error adding Team Meemerging businessr:', error);
    throw error;
  }
}

// Run the script
addTeamMeemerging businessr()
  .then(() => {
    console.log('\n✨ Team Meemerging businessr addition complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Team Meemerging businessr addition failed:', error);
    process.exit(1);
  });
