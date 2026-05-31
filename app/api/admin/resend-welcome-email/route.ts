import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import crypto from 'crypto';
import { sendWelcomeEmail } from '@/lib/email-demo';

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user is admin
    if (!decodedToken.email?.includes('admin') && !decodedToken.email?.includes('kdm-assoc.com')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = getFirestore();
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    // Generate new temporary password
    const tempPassword = crypto.randomBytes(12).toString('hex');

    // Generate username from existing data or email
    let username: string;
    if (userData.firstName && userData.lastName) {
      username = `${userData.firstName.toLowerCase()}.${userData.lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
    } else if (userData.companyName) {
      username = userData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    } else {
      username = userData.email?.split('@')[0] || 'user';
    }

    // Add random number to ensure uniqueness
    username = username + Math.floor(Math.random() * 1000);

    // Update user document with new credentials
    await updateDoc(userDocRef, {
      username,
      tempPassword,
      isTempPassword: true,
      hasChangedPassword: false,
      updatedAt: new Date(),
    });

    // Send welcome email
    await sendWelcomeEmail(userData.email, username, tempPassword, userId);

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome email resent successfully',
      email: userData.email,
      username
    });

  } catch (error) {
    console.error('Error resending welcome email:', error);
    return NextResponse.json({ error: 'Failed to resend welcome email' }, { status: 500 });
  }
}
