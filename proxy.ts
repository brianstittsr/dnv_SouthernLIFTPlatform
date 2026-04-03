import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = [
    '/portal',
    '/api/admin',
  ];

  // Public API routes (no auth required)
  const publicApiRoutes = [
    '/api/checkout/webhook', // Stripe webhooks
    '/api/contact',
    '/api/book-call',
  ];

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));

  // Allow public API routes
  if (isPublicApi) {
    return NextResponse.next();
  }

  // Check for session cookie on protected routes
  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('session');

    // If no session cookie, redirect to sign-in
    if (!sessionCookie) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
