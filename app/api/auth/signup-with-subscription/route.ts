import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { createStripeCustomer, createmembershipSubscription } from '@/lib/stripe';
import { sendWelcomeEmail } from '@/lib/email-demo';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { 
      email, 
      password, 
      planId = 'consortium-monthly', 
      paymentMethodId,
      firstName,
      lastName,
      companyName 
    } = await req.json();

    // Validate required fields
    if (!email || !password || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Email, password, and payment method are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create Stripe customer
    const customer = await createStripeCustomer({
      email,
      name: firstName && lastName ? `${firstName} ${lastName}` : companyName || email.split('@')[0],
      userId: '', // Will be set after user creation
      metadata: { source: 'kdm-consortium-signup' }
    });

    // Create subscription
    const subscription = await createmembershipSubscription({
      customerId: customer.id,
      tier: 'core-capture',
      billingCycle: 'monthly'
    });

    // Generate temporary password and username from registration data
    const tempPassword = crypto.randomBytes(12).toString('hex');
    
    // Generate username: firstName.lastName or companyName if available, otherwise email prefix
    let username: string;
    if (firstName && lastName) {
      username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
    } else if (companyName) {
      username = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    } else {
      username = email.split('@')[0];
    }
    
    // Add random number to ensure uniqueness
    username = username + Math.floor(Math.random() * 1000);
    
    // Create user record with registration data
    const userRef = await db.collection('users').add({
      email,
      username,
      tempPassword,
      isTempPassword: true,
      profileComplete: false,
      onboardingStep: 0,
      hasChangedPassword: false,
      firstName: firstName || null,
      lastName: lastName || null,
      companyName: companyName || null,
      subscription: {
        customerId: customer.id,
        subscriptionId: subscription.id,
        planId,
        status: subscription.status,
        currentPeriodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : null,
        createdAt: Timestamp.now()
      },
      stripeCustomerId: customer.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Send welcome email with temporary password and username
    await sendWelcomeEmail(email, username, tempPassword, userRef.id);

    return NextResponse.json({
      success: true,
      userId: userRef.id,
      customerId: customer.id,
      subscriptionId: subscription.id,
      message: 'Account created successfully. Check your email for login instructions.'
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 500 }
    );
  }
}
