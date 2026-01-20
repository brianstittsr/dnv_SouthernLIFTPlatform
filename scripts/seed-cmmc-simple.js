// Simple Node.js script to seed CMMC courses
// Run with: node seed-cmmc-simple.js

const https = require('https');

const courses = [
  {
    title: "CMMC Level 1 Foundations",
    slug: "cmmc-level-1-foundations",
    description: "Master the fundamentals of CMMC Level 1 compliance. Learn to implement basic cybersecurity hygiene practices required for protecting Federal Contract Information (FCI).",
    priceInCents: 149900,
    compareAtPriceInCents: 199900,
    estimatedDurationWeeks: 8,
    difficultyLevel: "beginner",
    maxParticipants: 50,
  },
  {
    title: "CMMC Level 2 Advanced Implementation",
    slug: "cmmc-level-2-advanced",
    description: "Comprehensive training for CMMC Level 2 compliance. Implement advanced security practices to protect Controlled Unclassified Information (CUI) and meet DoD requirements.",
    priceInCents: 349900,
    compareAtPriceInCents: 449900,
    estimatedDurationWeeks: 12,
    difficultyLevel: "intermediate",
    maxParticipants: 40,
  },
  {
    title: "CMMC Level 3 Expert Certification",
    slug: "cmmc-level-3-expert",
    description: "Advanced training for CMMC Level 3 compliance. Master expert-level security practices for protecting highly sensitive CUI and critical national security information.",
    priceInCents: 599900,
    compareAtPriceInCents: 799900,
    estimatedDurationWeeks: 16,
    difficultyLevel: "advanced",
    maxParticipants: 25,
  }
];

console.log('🚀 Starting CMMC courses seed...\n');
console.log('📝 This script will call the API endpoint to seed the courses.\n');
console.log('⚠️  Make sure:');
console.log('   1. Your dev server is running (npm run dev)');
console.log('   2. ADMIN_SEED_TOKEN is set in .env.local\n');

const token = process.env.ADMIN_SEED_TOKEN || 'your-admin-token-here';
const port = process.env.PORT || '3000';

const options = {
  hostname: 'localhost',
  port: port,
  path: '/api/seed-cmmc-courses',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.success) {
        console.log('✅ Success! CMMC courses seeded.\n');
        console.log('📚 Created courses:');
        result.courses.forEach(course => {
          console.log(`   - ${course.title} (ID: ${course.cohortId})`);
        });
        console.log('\n🎉 You can now view them at: http://localhost:' + port + '/cohorts');
      } else {
        console.error('❌ Error:', result.error);
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n💡 Tips:');
  console.log('   - Make sure dev server is running: npm run dev');
  console.log('   - Check if port 3000 is correct (or use PORT env var)');
  console.log('   - Verify ADMIN_SEED_TOKEN in .env.local');
});

req.end();
