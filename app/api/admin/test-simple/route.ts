import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      message: 'Admin API working',
      timestamp: new Date().toISOString(),
      path: '/api/admin/test-simple'
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
