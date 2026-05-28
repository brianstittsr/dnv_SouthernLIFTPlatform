import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Debug API working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}
