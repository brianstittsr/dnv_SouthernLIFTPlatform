#!/usr/bin/env node

/**
 * Script to check and verify Firestore team member data
 * 
 * Usage:
 *   node scripts/check-team-members.js
 * 
 * This script will:
 * 1. Connect to your Firestore database
 * 2. Check all team members for required fields
 * 3. Report any missing or incorrect data
 * 4. Provide instructions for fixing issues
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
  path.join(__dirname, '../firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account file not found');
  console.error(`Expected at: ${serviceAccountPath}`);
  console.error('\nTo fix:');
  console.error('1. Download your Firebase service account key from Firebase Console');
  console.error('2. Save it as firebase-service-account.json in the project root');
  console.error('3. Or set FIREBASE_SERVICE_ACCOUNT_PATH environment variable');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error('❌ Error loading Firebase credentials:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function checkTeamMembers() {
  console.log('🔍 Checking Firestore team members...\n');

  try {
    const snapshot = await db.collection('team_members').get();
    
    if (snapshot.empty) {
      console.log('⚠️  No team members found in Firestore');
      console.log('\nTo add team members:');
      console.log('1. Go to Firebase Console > Firestore Database');
      console.log('2. Create a new collection called "team_members"');
      console.log('3. Add documents with these required fields:');
      console.log('   - firstName (string)');
      console.log('   - lastName (string)');
      console.log('   - status (string: "active")');
      console.log('   - title (string)');
      console.log('   - bio (string)');
      return;
    }

    console.log(`Found ${snapshot.size} team member(s)\n`);

    const issues = [];
    const members = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      members.push({ ...data, id: doc.id });

      const name = `${data.firstName || '?'} ${data.lastName || '?'}`;
      console.log(`\n📋 ${name}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Status: ${data.status ? '✓ ' + data.status : '❌ MISSING'}`);
      console.log(`   Team Tag: ${data.teamTag || 'affiliate'}`);
      console.log(`   Title: ${data.title || data.expertise ? '✓' : '❌ MISSING'}`);
      console.log(`   Bio: ${data.bio ? '✓ (' + data.bio.substring(0, 30) + '...)' : '❌ MISSING'}`);
      console.log(`   Avatar: ${data.avatar ? '✓' : '❌ MISSING'}`);

      // Check for issues
      if (!data.status || data.status !== 'active') {
        issues.push(`${name}: status is not 'active' (current: ${data.status || 'undefined'})`);
      }
      if (!data.title && !data.expertise) {
        issues.push(`${name}: missing title or expertise`);
      }
      if (!data.bio) {
        issues.push(`${name}: missing bio`);
      }
    });

    if (issues.length > 0) {
      console.log('\n\n⚠️  Issues Found:');
      issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
      
      console.log('\n\n📝 To fix these issues:');
      console.log('   1. Go to Firebase Console > Firestore Database');
      console.log('   2. Open the "team_members" collection');
      console.log('   3. For each member with issues, click to edit and update:');
      console.log('      - Set status field to "active"');
      console.log('      - Add/update title field');
      console.log('      - Add/update bio field with their biography');
      console.log('      - Optionally add avatar URL and linkedIn URL');
      console.log('\n   After updating, team members will appear on /team page');
    } else {
      console.log('\n\n✅ All team members are properly configured!');
    }

    console.log('\n\n📊 Summary:');
    console.log(`   Total members: ${members.length}`);
    console.log(`   Active members: ${members.filter(m => m.status === 'active').length}`);
    console.log(`   Members with bio: ${members.filter(m => m.bio).length}`);
    console.log(`   Members with avatar: ${members.filter(m => m.avatar).length}`);

  } catch (error) {
    console.error('❌ Error checking team members:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkTeamMembers();
