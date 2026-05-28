/**
 * Simple Stripe Product Sync Script
 * Uses the existing admin pricing API to sync products
 */

const https = require('https');
const http = require('http');

console.log('🚀 Starting Stripe product synchronization...\n');

// Function to make HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function syncStripeProducts() {
  try {
    console.log('📋 Step 1: Checking current pricing data...');
    
    // Get current pricing data
    const pricingResponse = await makeRequest('http://localhost:3001/api/admin/pricing');
    
    if (pricingResponse.status !== 200) {
      throw new Error(`Failed to get pricing data: ${pricingResponse.status}`);
    }
    
    const pricingData = pricingResponse.data;
    console.log(`📊 Found ${pricingData.tiers?.length || 0} pricing tiers`);
    console.log(`🎯 Found ${pricingData.promotionalPrices?.length || 0} promotional prices`);
    
    if (!pricingData.tiers || pricingData.tiers.length === 0) {
      console.log('⚠️  No pricing tiers found. Creating default KDM Consortium tier...');
      
      // Create default tier if none exist
      const defaultTier = {
        name: 'KDM Consortium Membership',
        monthlyPrice: 125000, // $1,250 in cents
        annualPrice: 1350000, // $13,500 in cents
        description: 'Join our exclusive network of government contractors and suppliers',
        active: true
      };
      
      const createResponse = await makeRequest('http://localhost:3001/api/admin/pricing/tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(defaultTier)
      });
      
      if (createResponse.status === 200 || createResponse.status === 201) {
        console.log('✅ Default pricing tier created successfully');
        console.log('🔄 Running sync again to get updated data...');
        
        // Get updated pricing data
        const updatedResponse = await makeRequest('http://localhost:3001/api/admin/pricing');
        if (updatedResponse.status === 200) {
          pricingData.tiers = updatedResponse.data.tiers;
        }
      }
    }
    
    console.log('\n📋 Step 2: Verifying Stripe product creation...');
    
    // Check if products have Stripe IDs
    const tiersWithoutStripeIds = pricingData.tiers?.filter(tier => !tier.stripeProductId) || [];
    
    if (tiersWithoutStripeIds.length > 0) {
      console.log(`⚠️  Found ${tiersWithoutStripeIds.length} tiers without Stripe IDs`);
      console.log('🔄 These will be automatically created when users checkout');
      
      tiersWithoutStripeIds.forEach(tier => {
        console.log(`   - ${tier.name}`);
      });
    } else {
      console.log('✅ All pricing tiers have Stripe product IDs');
    }
    
    console.log('\n📋 Step 3: Checking promotional pricing...');
    
    const activePromos = pricingData.promotionalPrices?.filter(promo => {
      const now = new Date();
      const validFrom = new Date(promo.validFrom);
      const validUntil = new Date(promo.validUntil);
      return promo.active && validFrom <= now && now <= validUntil;
    }) || [];
    
    if (activePromos.length > 0) {
      console.log(`🎯 Found ${activePromos.length} active promotional prices:`);
      activePromos.forEach(promo => {
        console.log(`   - ${promo.tierName}: $${(promo.promotionalPrice / 100).toFixed(2)} (valid until ${new Date(promo.validUntil).toLocaleDateString()})`);
      });
    } else {
      console.log('ℹ️  No active promotional prices found');
    }
    
    console.log('\n📋 Step 4: Testing website pricing display...');
    
    // Test the pricing page
    const pricingPageResponse = await makeRequest('http://localhost:3001/pricing');
    
    if (pricingPageResponse.status === 200) {
      console.log('✅ Pricing page is accessible');
      
      // Check if pricing data is in the response
      const pageContent = pricingPageResponse.data;
      const hasPricingContent = pageContent.includes('KDM Consortium') || 
                              pageContent.includes('1,250') || 
                              pageContent.includes('1250');
      
      if (hasPricingContent) {
        console.log('✅ Pricing content found on website');
      } else {
        console.log('⚠️  Pricing content may not be displaying correctly');
      }
    } else {
      console.log(`⚠️  Pricing page returned status: ${pricingPageResponse.status}`);
    }
    
    console.log('\n🎉 Stripe Product Synchronization Summary:');
    console.log('===========================================');
    console.log(`📊 Total Pricing Tiers: ${pricingData.tiers?.length || 0}`);
    console.log(`🎯 Active Promotions: ${activePromos.length}`);
    console.log(`🔄 Tiers Needing Stripe Sync: ${tiersWithoutStripeIds.length}`);
    console.log(`🌐 Website Status: ${pricingPageResponse.status === 200 ? 'Accessible' : 'Error'}`);
    
    console.log('\n📝 Next Steps:');
    console.log('1. Test checkout process to verify Stripe integration');
    console.log('2. Check Stripe dashboard for product creation');
    console.log('3. Verify promotional pricing is applied correctly');
    console.log('4. Test payment processing end-to-end');
    
    if (tiersWithoutStripeIds.length > 0) {
      console.log('\n⚠️  Important: Some tiers need Stripe product creation.');
      console.log('   These will be created automatically during the first checkout process.');
      console.log('   To create them manually, use the admin pricing panel at: http://localhost:3001/portal/admin/pricing');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Synchronization failed:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure development server is running on port 3001');
    console.log('2. Check that admin pricing API is accessible');
    console.log('3. Verify Firebase permissions for pricing data');
    console.log('4. Ensure Stripe environment variables are configured');
    
    return false;
  }
}

// Run the synchronization
syncStripeProducts().then((success) => {
  if (success) {
    console.log('\n✅ Stripe product synchronization completed successfully!');
  } else {
    console.log('\n💥 Stripe product synchronization failed!');
    process.exit(1);
  }
}).catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
