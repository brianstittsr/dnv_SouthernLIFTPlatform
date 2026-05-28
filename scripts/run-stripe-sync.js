/**
 * Simple Stripe Product Sync Script
 * Run this script to sync Stripe products with the website
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Stripe product synchronization...\n');

try {
  // Check if the development server is running
  console.log('📋 Checking development server status...');
  
  try {
    const response = require('child_process').execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/admin/pricing', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (response.trim() === '200') {
      console.log('✅ Development server is running and accessible');
    } else {
      console.log('⚠️  Development server response:', response.trim());
    }
  } catch (error) {
    console.log('❌ Development server not accessible. Please start the server with: npm run dev');
    process.exit(1);
  }

  // Create a temporary sync script that bypasses authentication
  console.log('📝 Creating temporary sync endpoint...');
  
  const tempScript = `
const { getStripe } = require('../lib/stripe');
const { db } = require('../lib/firebase');
const { collection, getDocs, doc, updateDoc, Timestamp } = require('firebase/firestore');

async function syncProducts() {
  console.log('🔄 Starting product synchronization...');
  
  try {
    const stripe = getStripe();
    
    // Get pricing tiers from Firestore
    const tiersRef = collection(db, 'pricing_tiers');
    const tiersSnapshot = await getDocs(tiersRef);
    const tiers = tiersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(\`📊 Found \${tiers.length} pricing tiers\`);
    
    // Get existing Stripe products
    const products = await stripe.products.list({ limit: 100 });
    console.log(\`📦 Found \${products.data.length} Stripe products\`);
    
    let created = 0;
    let updated = 0;
    
    for (const tier of tiers) {
      const existingProduct = products.data.find(p => 
        p.id === tier.stripeProductId || 
        p.name === tier.name ||
        p.metadata.tier === tier.name
      );
      
      if (!existingProduct) {
        // Create new product
        const product = await stripe.products.create({
          name: tier.name,
          description: tier.description,
          type: 'service',
          active: tier.active,
          metadata: {
            tier: tier.name,
            firestoreId: tier.id
          }
        });
        
        // Create prices
        const monthlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: tier.monthlyPrice,
          currency: 'usd',
          recurring: { interval: 'month' },
          metadata: { tier: tier.name, billingCycle: 'monthly' }
        });
        
        let annualPrice = null;
        if (tier.annualPrice) {
          annualPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: tier.annualPrice,
            currency: 'usd',
            recurring: { interval: 'year' },
            metadata: { tier: tier.name, billingCycle: 'annual' }
          });
        }
        
        // Update Firestore
        await updateDoc(doc(db, 'pricing_tiers', tier.id), {
          stripeProductId: product.id,
          stripePriceIdMonthly: monthlyPrice.id,
          stripePriceIdAnnual: annualPrice?.id,
          updatedAt: Timestamp.now()
        });
        
        console.log(\`✅ Created product: \${tier.name}\`);
        created++;
      } else {
        // Update existing product if needed
        if (existingProduct.name !== tier.name || existingProduct.description !== tier.description) {
          await stripe.products.update(existingProduct.id, {
            name: tier.name,
            description: tier.description,
            active: tier.active
          });
          console.log(\`🔄 Updated product: \${tier.name}\`);
          updated++;
        }
        
        // Update Firestore with product ID if missing
        if (!tier.stripeProductId) {
          await updateDoc(doc(db, 'pricing_tiers', tier.id), {
            stripeProductId: existingProduct.id,
            updatedAt: Timestamp.now()
          });
        }
      }
    }
    
    console.log(\`\\n🎉 Synchronization complete!\`);
    console.log(\`📈 Created: \${created} products\`);
    console.log(\`🔄 Updated: \${updated} products\`);
    
  } catch (error) {
    console.error('❌ Synchronization failed:', error);
    process.exit(1);
  }
}

syncProducts().then(() => {
  console.log('\\n✅ Stripe products are now synced with the website!');
  process.exit(0);
}).catch((error) => {
  console.error('\\n💥 Sync failed:', error);
  process.exit(1);
});
  `;
  
  // Write the temporary script
  const tempPath = path.join(__dirname, 'temp-sync-script.js');
  fs.writeFileSync(tempPath, tempScript);
  
  console.log('🔄 Running synchronization...');
  
  // Run the sync script
  try {
    execSync(`node "${tempPath}"`, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  } finally {
    // Clean up temporary script
    try {
      fs.unlinkSync(tempPath);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
  
  console.log('\n🎯 Next steps:');
  console.log('1. Check the pricing page: http://localhost:3001/pricing');
  console.log('2. Verify products in Stripe dashboard');
  console.log('3. Test checkout process');
  
} catch (error) {
  console.error('❌ Sync process failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Ensure STRIPE_SECRET_KEY is set in .env.local');
  console.log('2. Ensure Firebase is initialized');
  console.log('3. Check development server is running on port 3001');
  process.exit(1);
}
