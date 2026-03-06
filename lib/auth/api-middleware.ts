/**
 * API Route Authentication Middleware
 * Provides helper functions to protect API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, requireAuth, requireAdmin } from "./server-auth";

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const user = await requireAuth();
      return await handler(req, user);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unauthorized" },
        { status: 401 }
      );
    }
  };
}

/**
 * Wrapper for API routes that require admin access
 */
export function withAdmin(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const user = await requireAdmin();
      return await handler(req, user);
    } catch (error) {
      const status = error instanceof Error && error.message.includes("Forbidden") ? 403 : 401;
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unauthorized" },
        { status }
      );
    }
  };
}

/**
 * Check authentication and return user or null
 */
export async function checkAuth(req: NextRequest) {
  try {
    return await verifyAuth();
  } catch (error) {
    return null;
  }
}
