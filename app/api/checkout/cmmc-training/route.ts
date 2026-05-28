import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { sendTemplatedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { 
      customerEmail, 
      customerName, 
      trainingLevel, 
      memberId,
      companyInfo 
    } = await req.json();

    if (!customerEmail || !customerName || !trainingLevel) {
      return NextResponse.json(
        { error: 'Customer email, name, and training level are required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Define pricing based on training level
    const pricingMap = {
      'standard': {
        amount: 250000, // $2,500.00 in cents
        name: 'Standard CMMC Cohort Training',
        description: '8-week virtual cohort training with instruction materials and certification preparation'
      },
      'premium': {
        amount: 450000, // $4,500.00 in cents
        name: 'Premium CMMC Cohort Training',
        description: '12-week virtual cohort training with one-on-one mentoring and certification preparation'
      },
      'enterprise': {
        amount: 1500000, // $15,000.00 in cents
        name: 'Enterprise CMMC Cohort Training',
        description: '16-week onsite and virtual training with team training and custom implementation guidance'
      }
    };

    const selectedPricing = pricingMap[trainingLevel as keyof typeof pricingMap];
    if (!selectedPricing) {
      return NextResponse.json(
        { error: 'Invalid training level. Must be standard, premium, or enterprise' },
        { status: 400 }
      );
    }

    // Check if this member has already paid for this training level
    if (db && memberId) {
      const trainingQuery = query(
        collection(db, 'cmmc_training_payments'),
        where('memberId', '==', memberId),
        where('trainingLevel', '==', trainingLevel),
        where('status', '==', 'completed')
      );
      const existingPayments = await getDocs(trainingQuery);
      
      if (!existingPayments.empty) {
        return NextResponse.json(
          { error: 'Member has already paid for this CMMC training level' },
          { status: 400 }
        );
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPricing.name,
              description: selectedPricing.description,
              images: [], // Add CMMC training images if available
            },
            unit_amount: selectedPricing.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'}/training/cmmc/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'}/training/cmmc`,
      customer_email: customerEmail,
      metadata: {
        type: 'cmmc_training',
        training_level: trainingLevel,
        customer_name: customerName,
        member_id: memberId || 'guest',
        company_info: companyInfo || '',
      },
      billing_address_collection: 'required',
    });

    // Record the training payment attempt in Firestore
    if (db) {
      await addDoc(collection(db, 'cmmc_training_payments'), {
        sessionId: session.id,
        customerEmail,
        customerName,
        memberId: memberId || null,
        companyInfo: companyInfo || null,
        trainingLevel,
        amount: selectedPricing.amount,
        currency: 'usd',
        status: 'pending',
        type: 'cmmc_training',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      pricing: selectedPricing,
    });

  } catch (error) {
    console.error('Error creating CMMC training checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Return available CMMC training options
  const trainingOptions = [
    {
      id: 'standard',
      name: 'Standard CMMC Cohort Training',
      price: 250000, // $2,500.00 in cents
      duration: '8 weeks',
      format: 'Virtual Cohort',
      includes: [
        'Expert instruction',
        'Training materials',
        'Certification preparation',
        'Group discussions'
      ]
    },
    {
      id: 'premium',
      name: 'Premium CMMC Cohort Training',
      price: 450000, // $4,500.00 in cents
      duration: '12 weeks',
      format: 'Virtual Cohort + Mentoring',
      includes: [
        'Expert instruction',
        'Training materials',
        'Certification preparation',
        'One-on-one mentoring',
        'Priority support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise CMMC Cohort Training',
      price: 1500000, // $15,000.00 in cents
      duration: '16 weeks',
      format: 'Onsite + Virtual',
      includes: [
        'Expert instruction',
        'Training materials',
        'Certification preparation',
        'Team training',
        'Custom implementation guidance',
        'Onsite consultation'
      ]
    }
  ];

  return NextResponse.json({
    trainingOptions,
    message: 'CMMC training options available'
  });
}
