/**
 * Server-side Authentication Utilities
 * Provides authentication checks for API routes and server components
 */

import { cookies } from "next/headers";
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
