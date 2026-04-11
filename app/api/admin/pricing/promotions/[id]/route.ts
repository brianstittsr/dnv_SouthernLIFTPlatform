import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

/**
 * DELETE /api/admin/pricing/promotions/[id]
 * Delete a promotional price
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const promoRef = doc(db, 'promotional_prices', params.id);
    await deleteDoc(promoRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promotional price:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete promotional price' },
      { status: 500 }
    );
  }
}
