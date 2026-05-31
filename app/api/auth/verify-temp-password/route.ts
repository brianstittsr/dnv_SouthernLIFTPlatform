import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(req: NextRequest) {
  try {
    const { email, tempPassword } = await req.json();

    // Find user by email
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    // Verify temporary password
    const isPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Check if password is still temporary
    if (!user.isTempPassword) {
      return NextResponse.json(
        { error: 'Please use your permanent password' },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = sign(
      { 
        userId, 
        email: user.email,
        isTempPassword: user.isTempPassword,
        onboardingStep: user.onboardingStep
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await db.collection('users').doc(userId).update({
      lastLoginAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        email: user.email,
        isTempPassword: user.isTempPassword,
        onboardingStep: user.onboardingStep,
        profileComplete: user.profileComplete
      }
    });

  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}
