import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const COLLECTION_NAME = "consortiumPricing";

    // Create KDM Founders Membership pricing tier
    const foundersProduct = {
      name: 'KDM Founders Membership',
      priceType: 'one-time',
      price: 62500, // $625.00 in cents
      isPromotional: false,
      description: 'One-time Founding member payment for smart business decision to capitalize on opportunities through September 30th',
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, COLLECTION_NAME), foundersProduct);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      product: foundersProduct,
      message: 'KDM Founders Membership product created successfully'
    });

  } catch (error) {
    console.error('Error creating Founders product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Founders product' },
      { status: 500 }
    );
  }
}
