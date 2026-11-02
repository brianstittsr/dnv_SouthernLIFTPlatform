/**
 * Server-side Authentication Utilities
 * Provides authentication checks for API routes and server components
 */

import { cookies, headers } from "next/headers";
import { auth as adminAuth, db as adminDb } from "@/lib/firebase-admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export interface AuthUser {
  uid: string;
  email: string | null;
  role?: string;
  svpRole?: string;
  emailVerified: boolean;
}

/**
 * Verify Firebase ID token from request headers or cookies
 */
export async function verifyAuth(): Promise<AuthUser | null> {
  try {
    if (!adminAuth) {
      console.error("Firebase Admin Auth not initialized");
      return null;
    }

    // Accept Authorization: Bearer <idToken> too — the session cookie can be
    // absent/expired while the client's Firebase auth is still valid, and API
    // callers that send the ID token shouldn't be rejected for that.
    const headerStore = await headers();
    const bearer = headerStore.get("authorization");
    if (bearer?.startsWith("Bearer ")) {
      const idToken = bearer.slice("Bearer ".length).trim();
      if (idToken) {
        try {
          const decodedIdToken = await adminAuth.verifyIdToken(idToken);
          return {
            uid: decodedIdToken.uid,
            email: decodedIdToken.email || null,
            role: decodedIdToken.role as string | undefined,
            svpRole: decodedIdToken.svpRole as string | undefined,
            emailVerified: decodedIdToken.email_verified || false,
          };
        } catch {
          // bad/expired token — fall through to the session cookie
        }
      }
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return null;
    }

    // Verify the session cookie
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      role: decodedToken.role as string | undefined,
      svpRole: decodedToken.svpRole as string | undefined,
      emailVerified: decodedToken.email_verified || false,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await verifyAuth();
  return user !== null;
}

/**
 * Check if user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await verifyAuth();
  if (!user) return false;

  return (
    user.role === "admin" ||
    user.svpRole === "platform_admin"
  );
}

/**
 * Get user role from Firestore if not in token
 */
export async function getUserRole(uid: string): Promise<string | null> {
  try {
    if (!adminDb) {
      console.error("Firebase Admin DB not initialized");
      return null;
    }

    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    return userData?.role || userData?.svpRole || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await verifyAuth();
  if (!user) {
    throw new Error("Unauthorized - Authentication required");
  }
  return user;
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  
  // Check token claims first
  if (user.role === "admin" || user.svpRole === "platform_admin") {
    return user;
  }

  // Fallback to Firestore check
  const role = await getUserRole(user.uid);
  if (role === "admin" || role === "platform_admin") {
    return user;
  }

  throw new Error("Forbidden - Admin access required");
}
