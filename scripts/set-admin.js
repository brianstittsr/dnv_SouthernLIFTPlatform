/**
 * Script to manually set admin custom claims for a user
 * Run with: node scripts/set-admin.js
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = 'bstitt@strategicvalueplus.com';

async function setAdminClaims() {
  try {
    console.log(`Setting admin claims for: ${email}`);
    
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${user.uid}`);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'platform_admin',
      svpRole: 'platform_admin',
      tenantId: 'kdm-svp-platform',
    });
    
    console.log('✅ Admin claims set successfully!');
    console.log('Custom claims:', {
      role: 'platform_admin',
      svpRole: 'platform_admin',
      tenantId: 'kdm-svp-platform',
    });
    
    // Verify claims were set
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('\nVerified custom claims:', updatedUser.customClaims);
    
    console.log('\n⚠️  IMPORTANT: You must sign out and sign back in for changes to take effect!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin claims:', error);
    process.exit(1);
  }
}

setAdminClaims();
