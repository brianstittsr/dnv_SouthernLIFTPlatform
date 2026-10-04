require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\n/g, '\n'),
  }),
});
(async () => {
  const db = admin.firestore();
  const cm = await db.collection('consortiumMembers').get();
  console.log('consortiumMembers total:', cm.size);
  const statusCount = {};
  let missingUid = 0;
  cm.docs.forEach(d => {
    const m = d.data();
    const st = m.onboardingReviewStatus || 'not_reviewed';
    statusCount[st] = (statusCount[st] || 0) + 1;
    if (!m.firebaseUid) missingUid++;
  });
  console.log('  statuses:', JSON.stringify(statusCount), '| missing firebaseUid:', missingUid);

  const users = await db.collection('users').get();
  console.log('users total:', users.size);
  let ciComplete = 0, approved = 0, both = 0;
  users.docs.forEach(d => {
    const u = d.data();
    if (u.companyIntelligenceComplete) ciComplete++;
    if (u.onboardingReviewStatus === 'approved') approved++;
    if (u.companyIntelligenceComplete && u.onboardingReviewStatus === 'approved') both++;
  });
  console.log('  companyIntelligenceComplete:', ciComplete, '| approved:', approved, '| BOTH:', both);

  const tm = await db.collection('teamMembers').get().catch(() => null);
  if (tm) console.log('teamMembers total:', tm.size);

  // check a couple of member docs for id vs firebaseUid alignment with users
  for (const d of cm.docs.slice(0, 5)) {
    const m = d.data();
    const uid = m.firebaseUid || d.id;
    const u = await db.collection('users').doc(uid).get();
    console.log(`  member ${d.id}: firebaseUid=${m.firebaseUid || 'NONE'} | users/${uid} exists: ${u.exists} | ciComplete: ${u.exists ? !!u.data().companyIntelligenceComplete : 'n/a'} | status: ${u.exists ? u.data().onboardingReviewStatus : 'n/a'}`);
  }
})();
