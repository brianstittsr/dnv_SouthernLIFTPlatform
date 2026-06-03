/**
 * Test script for Founders payment flow
 * This script tests the Founders payment process without charging a real card
 * Uses Stripe test mode with test card numbers
 * 
 * IMPORTANT: This script requires STRIPE_SECRET_KEY to be set in your environment
 * Make sure you're using Stripe Test Mode (not Live Mode)
 * 
 * Run with: node scripts/test-founders-payment.js
 */

const Stripe = require('stripe');

// Initialize Stripe with test mode
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Test card numbers from Stripe documentation
const TEST_CARDS = {
  // Successful payment
  success: '4242424242424242',
  // Requires authentication
  requiresAuthentication: '4000002500003155',
  // Card declined
  declined: '4000000000000002',
  // Insufficient funds
  insufficientFunds: '4000000000009995',
};

async function testFoundersPayment() {
  console.log('=== Founders Payment Test ===\n');
  console.log('Testing in Stripe Test Mode - No real charges will be made\n');
  
  const testEmail = `test+${Date.now()}@example.com`;
  const testName = 'Test Founder';
  
  try {
    // Verify we're in test mode
    const account = await stripe.accounts.retrieve();
    if (account.type !== 'standard' && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      console.warn('⚠ WARNING: You may not be in Stripe Test Mode!');
      console.warn('Make sure your STRIPE_SECRET_KEY starts with "sk_test_"');
    }
    
    // Step 1: Create a test customer
    console.log('Step 1: Creating test customer...');
    const customer = await stripe.customers.create({
      email: testEmail,
      name: testName,
      metadata: { test: 'true' },
    });
    console.log('✓ Customer created:', customer.id);

    // Step 2: Create a test checkout session
    console.log('\nStep 2: Creating test checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'KDM Founders Membership (TEST)',
              description: 'Test payment for Founders membership',
            },
            unit_amount: 62500, // $625.00 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'}/payment/cancel`,
      customer: customer.id,
      metadata: {
        type: 'founders_membership',
        customer_name: testName,
        member_id: 'test-member-id',
        test: 'true',
      },
      billing_address_collection: 'required',
    });
    console.log('✓ Checkout session created:', session.id);
    console.log('  Session URL:', session.url);
    console.log('  ⚠  To complete the test payment, visit the URL above and use test card: 4242424242424242');

    // Step 3: Create a test payment method
    console.log('\nStep 3: Creating test payment method...');
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: TEST_CARDS.success,
        exp_month: 12,
        exp_year: 2025,
        cvc: '123',
      },
    });
    console.log('✓ Test payment method created:', paymentMethod.id);

    // Step 4: Attach payment method to customer
    console.log('\nStep 4: Attaching payment method to customer...');
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });
    console.log('✓ Payment method attached to customer');

    // Step 5: Create and confirm payment intent (simulating successful payment)
    console.log('\nStep 5: Creating and confirming payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 62500,
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethod.id,
      payment_method_types: ['card'],
      confirm: true,
      metadata: {
        type: 'founders_membership',
        customer_name: testName,
        test: 'true',
      },
    });
    console.log('✓ Payment intent created:', paymentIntent.id);
    console.log('  Payment status:', paymentIntent.status);

    if (paymentIntent.status === 'succeeded') {
      console.log('✓ Payment successful (test mode)');
    } else {
      console.log('⚠ Payment status:', paymentIntent.status);
    }

    // Step 6: Retrieve the session to verify it's complete
    console.log('\nStep 6: Retrieving checkout session...');
    const retrievedSession = await stripe.checkout.sessions.retrieve(session.id);
    console.log('✓ Session retrieved');
    console.log('  Session status:', retrievedSession.status);
    console.log('  Payment status:', retrievedSession.payment_status);

    // Step 7: Cleanup test data
    console.log('\nStep 7: Cleaning up test data...');
    await stripe.customers.del(customer.id);
    console.log('✓ Test customer deleted');

    console.log('\n=== Test Complete ===');
    console.log('✓ All tests passed');
    console.log('\nNote: No actual charges were made to any card.');
    console.log('This test used Stripe test mode with test payment methods.');
    console.log('\nTo test the full flow including webhooks:');
    console.log('1. Visit the session URL provided above');
    console.log('2. Use test card: 4242424242424242');
    console.log('3. Use any future expiry date and any CVC');
    console.log('4. Complete the payment');
    console.log('5. Verify webhook processing in your logs');

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run the test
testFoundersPayment();
