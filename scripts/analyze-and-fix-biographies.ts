/**
 * Analyze and Fix Team Member Biographies
 * 
 * This script:
 * 1. Analyzes the Firebase database for team member biographical data
 * 2. Checks multiple collections for existing bios (team_members, teamMembers, affiliateBiographies)
 * 3. Identifies missing biographies
 * 4. Optionally fixes/relinks biographical data
 * 
 * Usage:
 * npx ts-node scripts/analyze-and-fix-biographies.ts [analyze|fix|import-mock]
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ Firebase service account file not found at: ${serviceAccountPath}`);
    console.error('Please set FIREBASE_SERVICE_ACCOUNT_PATH environment variable');
    process.exit(1);
  }
  
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
  
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

interface TeamMemberData {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  emailPrimary?: string;
  email?: string;
  title?: string;
  expertise?: string;
  bio?: string;
  fullBio?: string;
  avatar?: string;
  linkedIn?: string;
  status?: string;
  isCEO?: boolean;
  isCOO?: boolean;
  isCTO?: boolean;
  isCRO?: boolean;
  firebaseUid?: string;
}

interface BiographySource {
  collection: string;
  docId: string;
  name: string;
  bio: string;
  bioLength: number;
}

async function analyzeBiographies() {
  console.log('🔍 Analyzing Firebase database for team member biographical data...\n');
  
  const sources: BiographySource[] = [];
  const missingBios: TeamMemberData[] = [];
  
  // Check 1: team_members collection (used by scripts)
  console.log('📁 Checking "team_members" collection (script collection)...');
  try {
    const teamMembersSnapshot = await db.collection('team_members').get();
    console.log(`   Found ${teamMembersSnapshot.size} documents`);
    
    teamMembersSnapshot.forEach((doc) => {
      const data = doc.data() as TeamMemberData;
      const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || 'Unknown';
      const bio = data.bio || data.fullBio || '';
      
      if (bio && bio.length > 10) {
        sources.push({
          collection: 'team_members',
          docId: doc.id,
          name,
          bio: bio.substring(0, 100) + '...',
          bioLength: bio.length,
        });
      } else {
        missingBios.push({ ...data, id: doc.id, name });
      }
    });
  } catch (error) {
    console.log(`   ⚠️  Error accessing team_members: ${error}`);
  }
  
  // Check 2: teamMembers collection (used by app - COLLECTIONS.TEAM_MEMBERS)
  console.log('\n📁 Checking "teamMembers" collection (app collection)...');
  try {
    const teamMembersSnapshot = await db.collection('teamMembers').get();
    console.log(`   Found ${teamMembersSnapshot.size} documents`);
    
    teamMembersSnapshot.forEach((doc) => {
      const data = doc.data() as TeamMemberData;
      const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || 'Unknown';
      const bio = data.bio || data.fullBio || '';
      
      if (bio && bio.length > 10) {
        sources.push({
          collection: 'teamMembers',
          docId: doc.id,
          name,
          bio: bio.substring(0, 100) + '...',
          bioLength: bio.length,
        });
      } else {
        missingBios.push({ ...data, id: doc.id, name });
      }
    });
  } catch (error) {
    console.log(`   ⚠️  Error accessing teamMembers: ${error}`);
  }
  
  // Check 3: affiliateBiographies collection
  console.log('\n📁 Checking "affiliateBiographies" collection...');
  try {
    const affiliateBioSnapshot = await db.collection('affiliateBiographies').get();
    console.log(`   Found ${affiliateBioSnapshot.size} documents`);
    
    affiliateBioSnapshot.forEach((doc) => {
      const data = doc.data();
      const name = data.businessName || data.affiliateId || 'Unknown Affiliate';
      // Affiliate biographies have different fields - construct a bio from available data
      const bioParts: string[] = [];
      if (data.profession) bioParts.push(`Profession: ${data.profession}`);
      if (data.burningDesire) bioParts.push(data.burningDesire);
      if (data.uniqueFact) bioParts.push(data.uniqueFact);
      
      const bio = bioParts.join('. ');
      
      if (bio && bio.length > 10) {
        sources.push({
          collection: 'affiliateBiographies',
          docId: doc.id,
          name,
          bio: bio.substring(0, 100) + '...',
          bioLength: bio.length,
        });
      }
    });
  } catch (error) {
    console.log(`   ⚠️  Error accessing affiliateBiographies: ${error}`);
  }
  
  // Summary
  console.log('\n📊 ANALYSIS SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n✅ Biographical data found: ${sources.length} sources`);
  
  if (sources.length > 0) {
    console.log('\n   Sources with bios:');
    sources.forEach((source) => {
      console.log(`   • ${source.name} (${source.collection})`);
      console.log(`     ID: ${source.docId}`);
      console.log(`     Bio length: ${source.bioLength} characters`);
      console.log(`     Preview: ${source.bio}`);
      console.log();
    });
  }
  
  console.log(`\n⚠️  Missing/short biographies: ${missingBios.length} team members`);
  
  if (missingBios.length > 0) {
    console.log('\n   Team members needing bios:');
    missingBios.forEach((member) => {
      console.log(`   • ${member.name} (${member.id})`);
      console.log(`     Current bio: "${member.bio || 'EMPTY'}"`);
      console.log(`     Title: ${member.title || member.expertise || 'N/A'}`);
      console.log();
    });
  }
  
  // Collection mismatch warning
  const hasTeamMembersUnderscore = sources.some(s => s.collection === 'team_members');
  const hasTeamMembersCamel = sources.some(s => s.collection === 'teamMembers');
  
  if (hasTeamMembersUnderscore && !hasTeamMembersCamel) {
    console.log('\n⚠️  COLLECTION MISMATCH DETECTED:');
    console.log('   Data exists in "team_members" but app uses "teamMembers"');
    console.log('   Run: npx ts-node scripts/analyze-and-fix-biographies.ts fix');
  }
  
  return { sources, missingBios };
}

async function fixCollectionMismatch() {
  console.log('🔧 Fixing collection mismatch (team_members → teamMembers)...\n');
  
  try {
    // Read from team_members
    const sourceSnapshot = await db.collection('team_members').get();
    console.log(`📖 Reading ${sourceSnapshot.size} documents from "team_members"`);
    
    let migrated = 0;
    let errors = 0;
    
    for (const doc of sourceSnapshot.docs) {
      const data = doc.data();
      const name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      
      try {
        // Check if already exists in teamMembers
        const existingQuery = await db.collection('teamMembers')
          .where('emailPrimary', '==', data.emailPrimary)
          .limit(1)
          .get();
        
        if (!existingQuery.empty) {
          // Update existing
          const existingDoc = existingQuery.docs[0];
          await existingDoc.ref.update({
            bio: data.bio || data.fullBio || existingDoc.data().bio || '',
            fullBio: data.fullBio || data.bio || existingDoc.data().fullBio || '',
            updatedAt: Timestamp.now(),
          });
          console.log(`   ✓ Updated ${name} in teamMembers`);
        } else {
          // Create new document in teamMembers
          await db.collection('teamMembers').add({
            ...data,
            bio: data.bio || data.fullBio || '',
            fullBio: data.fullBio || data.bio || '',
            createdAt: data.createdAt || Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          console.log(`   ✓ Migrated ${name} to teamMembers`);
        }
        
        migrated++;
      } catch (error) {
        console.error(`   ❌ Error migrating ${name}: ${error}`);
        errors++;
      }
    }
    
    console.log(`\n✅ Migration complete: ${migrated} migrated, ${errors} errors`);
    
  } catch (error) {
    console.error(`❌ Error during migration: ${error}`);
  }
}

async function importMockBiographies() {
  console.log('📥 Importing mock biographical data...\n');
  
  // Mock biographies from lib/mock-data/affiliates.ts
  const mockBios = [
    {
      firstName: 'Sarah',
      lastName: 'Mitchell',
      email: 'sarah.mitchell@precisionmfg.com',
      title: 'Manufacturing Process Engineer',
      bio: 'Sarah Mitchell is a seasoned Manufacturing Process Engineer with 12 years of experience helping small manufacturers achieve operational excellence. She previously served as Senior Engineer at Boeing, Process Lead at Caterpillar, and Quality Manager at Siemens. Sarah holds 3 patents in automated assembly processes and is passionate about helping 100 small manufacturers achieve operational excellence by 2026. She is an active member of the Chamber of Commerce, Women in Manufacturing, and Rotary Club. Sarah lives in Charlotte, NC with her husband Tom, their two daughters, and their Golden Retriever named Max. In her free time, she enjoys golf, wine tasting, and hiking.',
    },
    {
      firstName: 'Marcus',
      lastName: 'Chen',
      email: 'marcus.chen@qualityfirst.com',
      title: 'ISO Certification Specialist',
      bio: 'Marcus Chen is an ISO Certification Specialist with 15 years of experience making ISO certification accessible and affordable for manufacturers. He has previously served as Quality Director at John Deere, Lead Auditor at BSI, and QA Manager at Honeywell. Marcus has audited facilities in 23 countries and brings a wealth of international experience to his work. He lives in Raleigh, NC with his wife Emily, their 15-year-old son, and their two cats. Marcus is an active member of ASQ, the Manufacturing Extension Partnership, and the Local Business Alliance. His hobbies include photography, cooking, and chess.',
    },
    {
      firstName: 'Jennifer',
      lastName: 'Rodriguez',
      email: 'jennifer.rodriguez@leanops.com',
      title: 'Lean Manufacturing Consultant',
      bio: 'Jennifer Rodriguez is a Lean Manufacturing Consultant with 9 years of experience eliminating waste and creating sustainable manufacturing practices. She previously worked as Lean Manager at Toyota, Operations Lead at GE Aviation, and in Continuous Improvement at Volvo. Jennifer has completed 15 marathons including the Boston Marathon, demonstrating her dedication and perseverance. She lives in Greensboro, NC with her husband Carlos, their three children, and their family dog named Buddy. Jennifer is active in AME, the Lean Enterprise Institute, and her local running club. Her hobbies include running marathons, gardening, and reading.',
    },
    {
      firstName: 'David',
      lastName: 'Thompson',
      email: 'david.thompson@automatesolutions.com',
      title: 'Industrial Automation Engineer',
      bio: 'David Thompson is an Industrial Automation Engineer with 18 years of experience helping manufacturers embrace Industry 4.0 affordably. He previously served as Automation Director at Fanuc, Robotics Lead at ABB, and Systems Engineer at Rockwell. David built his first robot at age 14 and has been passionate about automation ever since. He lives in Durham, NC with his wife Karen. Their two sons are now 19 and 22 years old. David is active in IEEE, the Robotics Industry Association, and his local maker space. His hobbies include building robots, 3D printing, and fishing.',
    },
    {
      firstName: 'Lisa',
      lastName: 'Patel',
      email: 'lisa.patel@workforcedev.com',
      title: 'Manufacturing Training Specialist',
      bio: 'Lisa Patel is a Manufacturing Training Specialist with 11 years of experience working to close the manufacturing skills gap in North Carolina. She previously served as Training Director at Caterpillar, HR Manager at Michelin, and Learning Lead at Cummins. Lisa speaks four languages fluently, which helps her connect with diverse manufacturing teams. She lives in Winston-Salem, NC with her husband Raj, their 11-year-old daughter, and their parrot named Echo. Lisa is active in SHRM, ATD, and serves on a community college advisory board. Her hobbies include yoga, painting, and traveling.',
    },
    {
      firstName: 'Robert',
      lastName: 'Jackson',
      email: 'robert.jackson@supplychainpro.com',
      title: 'Supply Chain Optimization Expert',
      bio: 'Robert Jackson is a Supply Chain Optimization Expert with 14 years of experience helping manufacturers build resilient, domestic supply chains. He previously served as VP Supply Chain at Ingersoll Rand, Logistics Director at FedEx, and Procurement Lead at Lowe\'s. Robert managed supply chains worth over $2B annually during his corporate career. He is divorced and lives in Charlotte, NC with his twin 16-year-old daughters and their Labrador named Duke. Robert has lived in Charlotte for 20 years and is an active member of APICS, the Council of Supply Chain Management, and his alumni association. His hobbies include golf, bourbon collecting, and college football.',
    },
    {
      firstName: 'Amanda',
      lastName: 'Foster',
      email: 'amanda.foster@digitaltransform.com',
      title: 'Manufacturing Technology Consultant',
      bio: 'Amanda Foster is a Manufacturing Technology Consultant with 7 years of experience working to democratize digital transformation for small manufacturers. She previously served as Digital Lead at Siemens, IT Director at Schneider Electric, and Tech Manager at Cisco. Amanda hosts a popular podcast on manufacturing technology with 50,000 subscribers. She lives in Raleigh, NC with her husband Brian and their two rescue dogs. Amanda has lived in Raleigh for 5 years and is active in Tech Triangle, Women in Tech, and Startup Grind. Her hobbies include attending tech meetups, mountain biking, and podcasting.',
    },
    {
      firstName: 'Michael',
      lastName: 'Wright',
      email: 'michael.wright@isocertify.com',
      title: 'Quality Management Systems Consultant',
      bio: 'Michael Wright is a Quality Management Systems Consultant with 20 years of experience mentoring the next generation of quality professionals. He previously served as Quality VP at Parker Hannifin, Lead Assessor at DNV, and QMS Director at Eaton. Michael has helped over 200 companies achieve ISO certification throughout his career. He lives in Greensboro, NC with his wife Patricia. They have three children aged 24, 26, and 28, and a cat named Whiskers. Michael has lived in Greensboro for 25 years and is an active member of ASQ, AIAG, and serves in church leadership. His hobbies include woodworking, reading history books, and spending time with his grandchildren.',
    },
  ];
  
  let imported = 0;
  let errors = 0;
  
  for (const mockBio of mockBios) {
    try {
      // Check if team member exists by email
      const existingQuery = await db.collection('teamMembers')
        .where('emailPrimary', '==', mockBio.email)
        .limit(1)
        .get();
      
      if (!existingQuery.empty) {
        // Update existing with bio
        const existingDoc = existingQuery.docs[0];
        await existingDoc.ref.update({
          bio: mockBio.bio,
          fullBio: mockBio.bio,
          title: mockBio.title,
          updatedAt: Timestamp.now(),
        });
        console.log(`   ✓ Updated bio for ${mockBio.firstName} ${mockBio.lastName}`);
      } else {
        // Check in team_members collection
        const existingUnderscoreQuery = await db.collection('team_members')
          .where('emailPrimary', '==', mockBio.email)
          .limit(1)
          .get();
        
        if (!existingUnderscoreQuery.empty) {
          const existingDoc = existingUnderscoreQuery.docs[0];
          await existingDoc.ref.update({
            bio: mockBio.bio,
            fullBio: mockBio.bio,
            title: mockBio.title,
            updatedAt: Timestamp.now(),
          });
          console.log(`   ✓ Updated bio in team_members for ${mockBio.firstName} ${mockBio.lastName}`);
        } else {
          console.log(`   ⚠️  Team member not found for ${mockBio.email} - skipping`);
        }
      }
      
      imported++;
    } catch (error) {
      console.error(`   ❌ Error importing bio for ${mockBio.firstName} ${mockBio.lastName}: ${error}`);
      errors++;
    }
  }
  
  console.log(`\n✅ Import complete: ${imported} processed, ${errors} errors`);
}

// Main function
async function main() {
  const command = process.argv[2] || 'analyze';
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Team Member Biography Analysis & Fix Tool');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  switch (command) {
    case 'analyze':
      await analyzeBiographies();
      break;
      
    case 'fix':
      await fixCollectionMismatch();
      break;
      
    case 'import-mock':
      await importMockBiographies();
      break;
      
    default:
      console.log('Usage: npx ts-node scripts/analyze-and-fix-biographies.ts [analyze|fix|import-mock]');
      console.log('\nCommands:');
      console.log('  analyze     - Analyze the database for biographical data');
      console.log('  fix         - Fix collection mismatch (team_members → teamMembers)');
      console.log('  import-mock - Import mock biographical data to existing team members');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   Done!');
  console.log('═══════════════════════════════════════════════════════════');
  
  process.exit(0);
}

main().catch((error) => {
  console.error('\n💥 Error:', error);
  process.exit(1);
});
