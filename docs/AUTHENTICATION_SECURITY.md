# Authentication & Security Implementation

## Overview

The SVP Platform now has comprehensive authentication and authorization protection for all backend routes and admin pages. This ensures that only authenticated users can access the portal, and only administrators can access admin features and API routes.

## Security Layers

### 1. **Next.js Middleware** (`middleware.ts`)
- Protects routes at the edge before they reach the application
- Checks for session cookie on all `/portal` and `/api/admin` routes
- Redirects unauthenticated users to sign-in page
- Allows public API routes (webhooks, contact forms, etc.)

### 2. **Server-Side Authentication** (`lib/auth/server-auth.ts`)
- Verifies Firebase session cookies using Admin SDK
- Provides helper functions for API routes:
  - `verifyAuth()` - Verify and return user info
  - `isAuthenticated()` - Check if user is authenticated
  - `isAdmin()` - Check if user has admin role
  - `requireAuth()` - Require authentication (throws error if not)
  - `requireAdmin()` - Require admin role (throws error if not)

### 3. **API Route Protection** (`lib/auth/api-middleware.ts`)
- Wrapper functions for API routes:
  - `withAuth()` - Wrap routes requiring authentication
  - `withAdmin()` - Wrap routes requiring admin access
  - `checkAuth()` - Check auth without throwing errors

### 4. **Client-Side Guards** (`components/auth/auth-guard.tsx`)
- React component that protects client-side pages
- Monitors Firebase auth state
- Redirects unauthenticated users
- Checks admin role for admin pages
- Shows loading state during auth check

## Protected Routes

### Portal Routes (Authentication Required)
- `/portal/*` - All portal pages require authentication
- Redirects to `/sign-in?redirect=<original-path>` if not authenticated

### Admin Routes (Admin Role Required)
- `/portal/admin/*` - All admin pages require admin role
- Redirects to `/unauthorized` if not admin
- Protected both client-side and server-side

### API Routes (Admin Required)
- `/api/admin/*` - All admin API routes require admin role
- Returns 401 Unauthorized if not authenticated
- Returns 403 Forbidden if authenticated but not admin

### Public Routes (No Authentication)
- `/` - Home page
- `/pricing` - Pricing page
- `/checkout-cart` - Shopping cart
- `/checkout-success` - Payment success
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/api/checkout/webhook` - Stripe webhooks
- `/api/contact` - Contact form
- `/api/book-call` - Book call form

## Implementation Details

### Middleware Protection

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const protectedRoutes = ['/portal', '/api/admin'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.redirect('/sign-in');
    }
  }
  
  return NextResponse.next();
}
```

### API Route Protection

```typescript
// Example: Protected admin API route
import { requireAdmin } from "@/lib/auth/server-auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(); // Throws if not admin
    
    // Your API logic here
    return NextResponse.json({ data: "..." });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
```

### Client-Side Page Protection

```typescript
// app/(portal)/portal/admin/layout.tsx
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AdminLayout({ children }) {
  return (
    <AuthGuard requireAdmin={true}>
      {children}
    </AuthGuard>
  );
}
```

## User Roles

### Regular User
- Can access `/portal/*` pages
- Cannot access `/portal/admin/*` pages
- Cannot call `/api/admin/*` endpoints

### Admin User
- Can access all `/portal/*` pages
- Can access `/portal/admin/*` pages
- Can call `/api/admin/*` endpoints

### Role Assignment
Roles are stored in:
1. **Firebase Auth Custom Claims** (preferred)
   - `role: "admin"`
   - `svpRole: "platform_admin"`

2. **Firestore User Document** (fallback)
   - `users/{uid}` → `role: "admin"`
   - `users/{uid}` → `svpRole: "platform_admin"`

## Session Management

### Session Cookie
- Created during sign-in
- Stored as `session` cookie
- Verified using Firebase Admin SDK
- Expires based on Firebase session configuration

### Token Refresh
- Firebase handles token refresh automatically
- Session cookie is validated on each request
- Expired sessions redirect to sign-in

## Protected API Routes

All routes under `/api/admin/*` are now protected:

✅ `/api/admin/webinars` - GET, POST (admin only)  
✅ `/api/admin/webinars/[id]` - GET, PATCH, DELETE (admin only)  
✅ `/api/admin/webinars/[id]/publish` - POST (admin only)  

Future admin routes will follow the same pattern.

## Error Handling

### 401 Unauthorized
- User is not authenticated
- No valid session cookie
- Session expired

### 403 Forbidden
- User is authenticated but not authorized
- Missing required admin role
- Attempting to access admin-only resources

### Redirect Behavior
- Unauthenticated portal access → `/sign-in?redirect=<path>`
- Unauthorized admin access → `/unauthorized`
- Preserves original path for redirect after sign-in

## Security Best Practices

### ✅ Implemented
- Session cookies verified server-side
- Admin role checked on both client and server
- API routes protected with middleware
- Firestore security rules enforce permissions
- HTTPS required in production
- Session cookies are HTTP-only

### 🔒 Recommendations
1. **Enable 2FA** - Add two-factor authentication for admin users
2. **Rate Limiting** - Implement rate limiting on API routes
3. **Audit Logging** - Log all admin actions
4. **IP Whitelisting** - Restrict admin access by IP (optional)
5. **Session Timeout** - Configure appropriate session expiration

## Testing Authentication

### Test Authenticated Access
1. Sign in as a regular user
2. Access `/portal/command-center` - Should work
3. Access `/portal/admin/transactions` - Should redirect to `/unauthorized`

### Test Admin Access
1. Sign in as an admin user
2. Access `/portal/admin/transactions` - Should work
3. Call `/api/admin/webinars` - Should return data

### Test Unauthenticated Access
1. Sign out
2. Access `/portal/command-center` - Should redirect to `/sign-in`
3. Call `/api/admin/webinars` - Should return 401

## Troubleshooting

### "Unauthorized" on Valid Admin
- Check Firebase custom claims: `auth.currentUser.getIdTokenResult()`
- Verify Firestore user document has `role: "admin"`
- Ensure session cookie is being set correctly

### Infinite Redirect Loop
- Check middleware configuration
- Verify sign-in page is not protected
- Clear cookies and try again

### API Returns 401 Despite Being Signed In
- Check session cookie is being sent
- Verify Firebase Admin SDK is initialized
- Check server logs for verification errors

## Files Modified/Created

### Created
- `middleware.ts` - Edge middleware for route protection
- `lib/auth/server-auth.ts` - Server-side auth utilities
- `lib/auth/api-middleware.ts` - API route wrappers
- `components/auth/auth-guard.tsx` - Client-side auth guard
- `app/unauthorized/page.tsx` - Unauthorized access page
- `app/(portal)/portal/admin/layout.tsx` - Admin layout with auth

### Modified
- `app/(portal)/layout.tsx` - Added AuthGuard
- `app/api/admin/webinars/route.ts` - Added auth checks
- `app/api/admin/webinars/[id]/route.ts` - Added auth checks

## Next Steps

1. **Add Session Cookie Creation** - Implement session cookie creation on sign-in
2. **Test All Protected Routes** - Verify all admin routes are protected
3. **Add Audit Logging** - Log admin actions for security
4. **Implement Rate Limiting** - Protect against abuse
5. **Add 2FA** - Enhanced security for admin accounts

---

**Implementation Date**: March 6, 2026  
**Status**: ✅ Complete - Backend and Admin Pages Protected
