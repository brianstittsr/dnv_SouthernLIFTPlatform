import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

/**
 * DELETE /api/admin/pricing/tiers/[id]
 * Delete a pricing tier
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

    const tierRef = doc(db, 'pricing_tiers', params.id);
    await deleteDoc(tierRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pricing tier:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete pricing tier' },
      { status: 500 }
    );
  }
}
