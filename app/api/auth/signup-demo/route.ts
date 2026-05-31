import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendWelcomeEmail } from '@/lib/email-demo';
import crypto from 'crypto';

// Demo/test mode - no actual Stripe charges
export async function POST(req: NextRequest) {
  try {
    const { email, password, planId = 'demo-consortium', paymentMethodId = 'demo-payment-method' } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Generate temporary password
    const tempPassword = crypto.randomBytes(12).toString('hex');
    
    // Create demo user record (no real Stripe integration)
    const userRef = await db.collection('users').add({
      email,
      tempPassword,
      isTempPassword: true,
      profileComplete: false,
      onboardingStep: 0,
      subscription: {
        customerId: `demo-customer-${Date.now()}`,
        subscriptionId: `demo-subscription-${Date.now()}`,
        planId: 'demo-consortium',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: Timestamp.now(),
        isDemo: true // Flag for demo accounts
      },
      stripeCustomerId: `demo-customer-${Date.now()}`,
      isDemo: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Send welcome email with temporary password
    await sendWelcomeEmail(email, tempPassword, userRef.id);

    return NextResponse.json({
      success: true,
      userId: userRef.id,
      customerId: `demo-customer-${Date.now()}`,
      subscriptionId: `demo-subscription-${Date.now()}`,
      isDemo: true,
      message: 'Demo account created successfully. Check your email for login instructions.'
    });

  } catch (error) {
    console.error('Demo signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create demo account' },
      { status: 500 }
    );
  }
}
