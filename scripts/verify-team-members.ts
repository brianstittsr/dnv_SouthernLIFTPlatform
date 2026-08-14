import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Load Firebase Admin credentials from environment
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Firebase service account file not found at: ${serviceAccountPath}`);
  console.error('Please set FIREBASE_SERVICE_ACCOUNT_PATH environment variable');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

interface TeamMemberDoc {
  id?: string;
  firstName: string;
  lastName: string;
  title?: string;
  expertise?: string;
  bio?: string;
  fullBio?: string;
  status?: string;
  avatar?: string;
  linkedIn?: string;
  tags?: string[];
}

async function verifyTeamMembers() {
  console.log('🔍 Verifying Firestore team members...\n');

  try {
    const snapshot = await db.collection('team_members').get();
    
    if (snapshot.empty) {
      console.log('⚠️  No team members found in Firestore');
      return;
    }

    console.log(`Found ${snapshot.size} team member(s)\n`);

    const issues: string[] = [];
    const members: (TeamMemberDoc & { id: string })[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as TeamMemberDoc;
      const member = { ...data, id: doc.id };
      members.push(member);

      console.log(`\n📋 ${member.firstName} ${member.lastName}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Status: ${data.status || '❌ MISSING'}`);
      console.log(`   Tags: ${data.tags?.join(', ') || 'none'}`);
      console.log(`   Title: ${data.title || data.expertise || '❌ MISSING'}`);
      console.log(`   Bio: ${data.bio ? '✓' : '❌ MISSING'}`);
      console.log(`   Avatar: ${data.avatar ? '✓' : '❌ MISSING'}`);

      // Check for issues
      if (!data.status || data.status !== 'active') {
        issues.push(`${member.firstName} ${member.lastName}: status is not 'active' (current: ${data.status || 'undefined'})`);
      }
      if (!data.title && !data.expertise) {
        issues.push(`${member.firstName} ${member.lastName}: missing title or expertise`);
      }
      if (!data.bio) {
        issues.push(`${member.firstName} ${member.lastName}: missing bio`);
      }
    });

    if (issues.length > 0) {
      console.log('\n\n⚠️  Issues Found:');
      issues.forEach((issue) => console.log(`   - ${issue}`));
      
      console.log('\n\n📝 To fix these issues:');
      console.log('   1. Go to Firebase Console > Firestore Database');
      console.log('   2. Open the "team_members" collection');
      console.log('   3. For each member with issues, update their document:');
      console.log('      - Set status to "active"');
      console.log('      - Add a title field');
      console.log('      - Add a bio field with their biography');
      console.log('      - Optionally add avatar URL and linkedIn URL');
    } else {
      console.log('\n\n✅ All team members are properly configured!');
    }

    console.log('\n\n📊 Summary:');
    console.log(`   Total members: ${members.length}`);
    console.log(`   Active members: ${members.filter(m => m.status === 'active').length}`);
    console.log(`   Members with bio: ${members.filter(m => m.bio).length}`);
    console.log(`   Members with avatar: ${members.filter(m => m.avatar).length}`);

  } catch (error) {
    console.error('❌ Error verifying team members:', error);
    process.exit(1);
  }
}

async function fixTeamMembers() {
  console.log('🔧 Fixing team member data...\n');

  try {
    const snapshot = await db.collection('team_members').get();
    let fixed = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data() as TeamMemberDoc;
      const updates: Partial<TeamMemberDoc> = {};

      // Fix status
      if (!data.status || data.status !== 'active') {
        updates.status = 'active';
        console.log(`✓ Fixed status for ${data.firstName} ${data.lastName}`);
      }

      // Update if there are changes
      if (Object.keys(updates).length > 0) {
        await db.collection('team_members').doc(doc.id).update(updates);
        fixed++;
      }
    }

    console.log(`\n✅ Fixed ${fixed} team member record(s)`);
  } catch (error) {
    console.error('❌ Error fixing team members:', error);
    process.exit(1);
  }
}

async function main() {
  const command = process.argv[2];

  if (command === 'fix') {
    await fixTeamMembers();
  } else {
    await verifyTeamMembers();
  }

  process.exit(0);
}

main().catch(console.error);
