import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { sendTemplatedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { customerEmail, customerName, memberId } = await req.json();

    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Customer email and name are required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Check if this member has already paid for Founders membership
    if (db && memberId) {
      const paymentsQuery = query(
        collection(db, 'founders_payments'),
        where('memberId', '==', memberId),
        where('status', '==', 'completed')
      );
      const existingPayments = await getDocs(paymentsQuery);
      
      if (!existingPayments.empty) {
        return NextResponse.json(
          { error: 'Member has already paid for Founders membership' },
          { status: 400 }
        );
      }
    }

    // Create Stripe checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'KDM Founders Membership',
              description: 'One-time payment for KDM Founders membership - Smart business decision to capitalize on opportunities through September 30th',
              images: [], // Add product images if available
            },
            unit_amount: 62500, // $625.00 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'}/payment/cancel`,
      customer_email: customerEmail,
      metadata: {
        type: 'founders_membership',
        customer_name: customerName,
        member_id: memberId || 'guest',
      },
      billing_address_collection: 'required',
    });

    // Record the payment attempt in Firestore
    if (db) {
      await addDoc(collection(db, 'founders_payments'), {
        sessionId: session.id,
        customerEmail,
        customerName,
        memberId: memberId || null,
        amount: 62500, // Amount in cents
        currency: 'usd',
        status: 'pending',
        type: 'founders_membership',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating Founders checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // This could be used to retrieve payment status or session info
  return NextResponse.json({
    message: 'Founders checkout endpoint',
    price: 62500, // $625.00 in cents
    currency: 'usd',
    description: 'KDM Founders Membership - One-time payment'
  });
}
