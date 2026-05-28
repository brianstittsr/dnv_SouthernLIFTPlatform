import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    return NextResponse.json({
      stripeKeyExists: !!stripeKey,
      stripeKeyLength: stripeKey?.length || 0,
      stripeKeyPrefix: stripeKey?.substring(0, 7) || 'missing',
      publishableKeyExists: !!publishableKey,
      publishableKeyPrefix: publishableKey?.substring(0, 7) || 'missing',
      environment: process.env.NODE_ENV,
      allEnvVars: Object.keys(process.env).filter(key => key.includes('STRIPE'))
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
