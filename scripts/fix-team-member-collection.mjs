/**
 * Fix Team Member Collection
 * 
 * Copies the team member from team_members (wrong) to teamMembers (correct)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { config } from 'dotenv';

config({ path: '.env.local' });

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

async function fixCollection() {
  console.log('🔧 Fixing Team Member collection...\n');

  const teamMemberData = {
    firebaseUid: 'FXTwwFSKJGerShxWa4WppneGkxU2',
    firstName: 'Brian',
    lastName: 'Stitt',
    emailPrimary: 'bstitt@strategicvalueplus.com',
    expertise: 'Platform Administration & Technology',
    title: 'Platform Administrator',
    company: 'Strategic Value Plus',
    location: '',
    bio: 'Platform administrator and technical lead for Strategic Value Plus.',
    role: 'admin',
    status: 'active',
    isCEO: false,
    isCOO: false,
    isCTO: true,
    isCRO: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Check if already exists in correct collection (teamMembers)
  const existing = await db.collection('teamMembers')
    .where('firebaseUid', '==', teamMemberData.firebaseUid)
    .get();

  if (!existing.empty) {
    console.log('✅ Team Member already exists in teamMembers collection');
    console.log('📄 Document ID:', existing.docs[0].id);
    return;
  }

  // Create in correct collection
  const docRef = await db.collection('teamMembers').add(teamMemberData);
  console.log('✅ Created Team Member in teamMembers collection');
  console.log('📄 Document ID:', docRef.id);

  // Optionally delete from wrong collection
  const wrongCollection = await db.collection('team_members')
    .where('firebaseUid', '==', teamMemberData.firebaseUid)
    .get();

  if (!wrongCollection.empty) {
    for (const doc of wrongCollection.docs) {
      await doc.ref.delete();
      console.log('🗑️  Deleted from team_members (wrong collection):', doc.id);
    }
  }

  console.log('\n✨ Done!');
}

fixCollection().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
