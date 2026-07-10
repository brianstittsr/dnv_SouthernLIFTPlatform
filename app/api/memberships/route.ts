/**
 * memberships API Route
 *
 * Handles CRUD operations for KDM Consortium memberships
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { auth as adminAuth, db as adminDb } from '@/lib/firebase-admin';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import { COLLECTIONS, MembershipDoc } from '@/lib/schema';
import {
  createStripeCustomer,
  createCheckoutSession,
  memberSHIP_TIERS
} from '@/lib/stripe';
import crypto from 'crypto';
import { sendWelcomeEmail } from '@/lib/email-demo';
import { sendEmail } from '@/lib/email';

/**
 * GET /api/memberships
 * Retrieve all memberships or filter by userId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
    let q;

    if (userId && status) {
      q = query(
        membershipsRef,
        where('userId', '==', userId),
        where('status', '==', status)
      );
    } else if (userId) {
      q = query(membershipsRef, where('userId', '==', userId));
    } else if (status) {
      q = query(membershipsRef, where('status', '==', status));
    } else {
      q = query(membershipsRef, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const memberships = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ memberships });
  } catch (error: any) {
    console.error('Error fetching memberships:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch memberships' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/memberships
 * Create a new membership (initiates Stripe checkout)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId: providedUserId,
      email,
      name,
      tier = 'core-capture',
      billingCycle = 'monthly',
      trialDays,
      successUrl,
      cancelUrl,
      firstName,
      lastName,
      companyName
    } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'email and name are required' },
        { status: 400 }
      );
    }

    if (!db || !adminAuth || !adminDb) {
      return NextResponse.json(
        { error: 'Database or authentication services not initialized' },
        { status: 500 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const displayFirstName = firstName || name.split(' ')[0] || '';
    const displayLastName = lastName || name.split(' ').slice(1).join(' ') || '';

    // Create Firebase Auth user for new registrations
    let firebaseUid = providedUserId;
    let tempPassword = '';
    let isNewUser = false;

    if (!firebaseUid) {
      tempPassword = crypto.randomBytes(12).toString('hex');
      isNewUser = true;

      try {
        const userRecord = await adminAuth.createUser({
          email: normalizedEmail,
          password: tempPassword,
          displayName: name,
          emailVerified: false,
        });
        firebaseUid = userRecord.uid;
      } catch (authError: any) {
        console.error('Failed to create Firebase Auth user:', authError);
        if (authError.code === 'auth/email-already-exists') {
          return NextResponse.json(
            { error: 'An account with this email already exists. Please sign in instead.' },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      // Create user document
      const userData = {
        id: firebaseUid,
        userId: firebaseUid,
        email: normalizedEmail,
        firstName: displayFirstName,
        lastName: displayLastName,
        name,
        companyName: companyName || '',
        phone: '',
        role: 'consortium_member',
        svpRole: 'consortium_member',
        membershipType: 'kdm-consortium',
        membershipStatus: 'pending',
        membershipTier: tier,
        hasChangedPassword: false,
        isTempPassword: true,
        tempPassword,
        consortiumOnboardingComplete: false,
        tags: ['KDM Consortium Member', 'New Lead'],
        subscriptionTier: tier,
        subscriptionStatus: 'pending',
        profileCompleteness: 20,
        createdAt: AdminTimestamp.now(),
        updatedAt: AdminTimestamp.now(),
      };

      await adminDb.collection(COLLECTIONS.USERS).doc(firebaseUid).set(userData);
    }

    // Check if user already has an active membership
    const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
    const existingQuery = query(
      membershipsRef,
      where('userId', '==', firebaseUid),
      where('status', 'in', ['active', 'trialing'])
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: 'User already has an active membership' },
        { status: 400 }
      );
    }

    // Create Stripe customer
    const customer = await createStripeCustomer({
      email: normalizedEmail,
      name,
      userId: firebaseUid,
      metadata: {
        tier,
        billingCycle,
        firstName: displayFirstName,
        lastName: displayLastName,
        companyName: companyName || '',
        firebaseUid,
      },
    });

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';
    const session = await createCheckoutSession({
      customerId: customer.id,
      tier: tier as 'core-capture',
      billingCycle: billingCycle as 'monthly' | 'annual',
      successUrl: successUrl || `${baseUrl}/portal/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: cancelUrl || `${baseUrl}/portal/membership/cancel`,
      trialDays,
      metadata: {
        firstName: displayFirstName,
        lastName: displayLastName,
        companyName: companyName || '',
        firebaseUid,
        membershipType: 'kdm-consortium',
      },
    });

    // Create pending membership record
    const tierConfig = memberSHIP_TIERS[tier as keyof typeof memberSHIP_TIERS];
    const membershipData: Omit<MembershipDoc, 'id'> = {
      userId: firebaseUid,
      tier: tier as 'core-capture' | 'pursuit-pack' | 'custom',
      status: 'trialing',
      billingCycle: billingCycle as 'monthly' | 'annual',
      amount: billingCycle === 'monthly'
        ? (tierConfig as any).monthlyPrice
        : (tierConfig as any).annualPrice,
      stripeSubscriptionId: '', // Will be set by webhook
      stripeCustomerId: customer.id,
      currentPeriodStart: Timestamp.now(),
      currentPeriodEnd: Timestamp.now(),
      cancelAtPeriodEnd: false,
      metadata: {
        conciergeHoursUsed: 0,
        conciergeHoursLimit: (tierConfig as any).conciergeHoursLimit || 0,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(membershipsRef, membershipData);

    // Send welcome email to new registrations
    if (isNewUser && tempPassword) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://www.kdm-assoc.com';
        const signInUrl = `${appUrl}/sign-in`;

        await sendEmail({
          to: normalizedEmail,
          subject: 'Welcome to the KDM Consortium — Your Account Access',
          html: `
            <h1>Welcome, ${displayFirstName}!</h1>
            <p>Congratulations! You have been registered as a <strong>member of the KDM Consortium</strong>. Your account is ready to use.</p>

            <h2>Your Login Credentials</h2>
            <ul>
              <li><strong>Username (email):</strong> ${normalizedEmail}</li>
              <li><strong>Temporary password:</strong> ${tempPassword}</li>
            </ul>
            <p><a href="${signInUrl}" style="font-weight:bold;">Sign In to Your Account</a></p>

            <h2>Important: Change Your Password</h2>
            <p>For security, you will be asked to create your own password the first time you sign in. You can also update your password anytime from your account settings after signing in.</p>

            <h2>Next Steps to Unlock SAM.gov Resources</h2>
            <ol>
              <li><strong>Sign in and change your password</strong> using the link above.</li>
              <li><strong>Complete your Consortium Member Onboarding</strong> at <a href="${appUrl}/portal/consortium/onboarding">${appUrl}/portal/consortium/onboarding</a>. This includes:
                <ul>
                  <li>Company profile and capabilities</li>
                  <li>NAICS codes and certifications</li>
                  <li>Government contracting readiness documents (SAM registration, CAGE code, capability statement, etc.)</li>
                </ul>
              </li>
              <li><strong>Once your readiness is validated</strong>, you will be able to explore SAM.gov opportunities and participate in curated contract pursuit teams.</li>
            </ol>

            <p>Need help? Contact us at <a href="mailto:kmoore@kdm-assoc.com">kmoore@kdm-assoc.com</a>.</p>
            <p>Best regards,<br>The KDM & Associates Team</p>
          `,
          text: `Welcome, ${displayFirstName}! You have been registered as a member of the KDM Consortium. Username: ${normalizedEmail} Temporary password: ${tempPassword} Sign in at ${signInUrl}. You will be asked to change your password on first sign in. Next: complete consortium onboarding at ${appUrl}/portal/consortium/onboarding to unlock SAM.gov resources.`,
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }

    return NextResponse.json({
      membershipId: docRef.id,
      checkoutUrl: session.url,
      customerId: customer.id,
      userId: firebaseUid,
      isNewUser,
    });
  } catch (error: any) {
    console.error('Error creating membership:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create membership' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/memberships
 * Update membership (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { membershipId, updates } = body;

    if (!membershipId || !updates) {
      return NextResponse.json(
        { error: 'membershipId and updates are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const membershipRef = doc(db, COLLECTIONS.MEMBERSHIPS, membershipId);
    const membershipSnap = await getDoc(membershipRef);

    if (!membershipSnap.exists()) {
      return NextResponse.json(
        { error: 'membership not found' },
        { status: 404 }
      );
    }

    await updateDoc(membershipRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true,
      membershipId 
    });
  } catch (error: any) {
    console.error('Error updating membership:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update membership' },
      { status: 500 }
    );
  }
}
