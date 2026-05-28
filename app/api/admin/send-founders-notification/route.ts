import { NextRequest, NextResponse } from 'next/server';
import { sendTemplatedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { customerName, customerEmail, amount, sessionId, paymentDate, type } = await req.json();

    if (!customerName || !customerEmail || !amount) {
      return NextResponse.json(
        { error: 'Customer name, email, and amount are required' },
        { status: 400 }
      );
    }

    // Send notification to Keith Moore
    await sendTemplatedEmail('foundersPaymentNotification', 'kmoore@kdm-assoc.com', {
      customerName,
      customerEmail,
      amount,
      sessionId: sessionId || 'MANUAL-' + Date.now(),
      paymentDate: paymentDate || new Date().toLocaleDateString(),
      type: type || 'Founders Membership'
    });

    // Send notification to Nelinia
    await sendTemplatedEmail('foundersPaymentNotification', 'nelinia@strategicvalueplus.com', {
      customerName,
      customerEmail,
      amount,
      sessionId: sessionId || 'MANUAL-' + Date.now(),
      paymentDate: paymentDate || new Date().toLocaleDateString(),
      type: type || 'Founders Membership'
    });

    return NextResponse.json({
      success: true,
      message: 'Founders payment notifications sent successfully'
    });

  } catch (error) {
    console.error('Error sending Founders notifications:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
