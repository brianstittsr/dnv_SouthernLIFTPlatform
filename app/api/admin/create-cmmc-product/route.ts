import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    
    // Create CMMC Cohort Training product in Stripe
    const product = await stripe.products.create({
      name: 'CMMC Cohort Training',
      description: 'Comprehensive CMMC (Cybersecurity Maturity Model Certification) cohort training program for government contractors and small businesses. Includes expert instruction, practical implementation guidance, and certification preparation.',
      images: [], // Add product images if available
      metadata: {
        type: 'training',
        category: 'cmmc',
        cohort_based: 'true',
        target_audience: 'government_contractors',
      },
    });

    // Create multiple pricing options for CMMC training
    const standardPrice = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: 250000, // $2,500.00 in cents
      nickname: 'Standard CMMC Cohort Training',
      metadata: {
        duration: '8_weeks',
        format: 'virtual_cohort',
        includes: 'instruction_materials_certification_prep',
        level: 'standard',
      },
    });

    const premiumPrice = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: 450000, // $4,500.00 in cents
      nickname: 'Premium CMMC Cohort Training',
      metadata: {
        duration: '12_weeks',
        format: 'virtual_cohort_plus_mentoring',
        includes: 'instruction_materials_certification_prep_one_on_one_mentoring',
        level: 'premium',
      },
    });

    const enterprisePrice = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: 1500000, // $15,000.00 in cents
      nickname: 'Enterprise CMMC Cohort Training',
      metadata: {
        duration: '16_weeks',
        format: 'onsite_plus_virtual',
        includes: 'instruction_materials_certification_prep_team_training_custom_implementation',
        level: 'enterprise',
      },
    });

    // Store in Firestore for tracking
    if (db) {
      await addDoc(collection(db, 'cmmc_training_products'), {
        stripeProductId: product.id,
        name: 'CMMC Cohort Training',
        description: 'Comprehensive CMMC cohort training program',
        prices: [
          {
            id: standardPrice.id,
            amount: 250000,
            currency: 'usd',
            nickname: 'Standard CMMC Cohort Training',
            metadata: standardPrice.metadata,
          },
          {
            id: premiumPrice.id,
            amount: 450000,
            currency: 'usd',
            nickname: 'Premium CMMC Cohort Training',
            metadata: premiumPrice.metadata,
          },
          {
            id: enterprisePrice.id,
            amount: 1500000,
            currency: 'usd',
            nickname: 'Enterprise CMMC Cohort Training',
            metadata: enterprisePrice.metadata,
          },
        ],
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
      },
      prices: [
        {
          id: standardPrice.id,
          amount: 250000,
          currency: 'usd',
          nickname: 'Standard CMMC Cohort Training',
        },
        {
          id: premiumPrice.id,
          amount: 450000,
          currency: 'usd',
          nickname: 'Premium CMMC Cohort Training',
        },
        {
          id: enterprisePrice.id,
          amount: 1500000,
          currency: 'usd',
          nickname: 'Enterprise CMMC Cohort Training',
        },
      ],
      message: 'CMMC Cohort Training product created successfully',
    });

  } catch (error) {
    console.error('Error creating CMMC product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create CMMC product' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const stripe = getStripe();
    
    // Check if CMMC product already exists
    const products = await stripe.products.list({
      limit: 100,
      active: true,
    });

    const cmmcProduct = products.data.find(p => 
      p.name.toLowerCase().includes('cmmc') && 
      p.name.toLowerCase().includes('training')
    );

    if (cmmcProduct) {
      // Get prices for the existing product
      const prices = await stripe.prices.list({
        product: cmmcProduct.id,
        active: true,
        limit: 10,
      });

      return NextResponse.json({
        exists: true,
        product: cmmcProduct,
        prices: prices.data,
        message: 'CMMC training product already exists',
      });
    }

    return NextResponse.json({
      exists: false,
      message: 'CMMC training product not found',
    });

  } catch (error) {
    console.error('Error checking CMMC product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check CMMC product' },
      { status: 500 }
    );
  }
}
