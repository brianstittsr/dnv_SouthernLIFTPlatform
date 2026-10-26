import { NextResponse } from "next/server";
import { getRequester, jsonError, type Requester } from "./context";
import { SubmissionError } from "./process-submission";

/** Resolves an admin requester or returns an error response. */
export async function requireAdminRequester(): Promise<Requester | NextResponse> {
  const requester = await getRequester();
  if (!requester) return jsonError("Authentication required", 401);
  if (!requester.isAdmin) return jsonError("Admin access required", 403);
  return requester;
}

/** Resolves a staff requester or returns an error response. */
export async function requireStaffRequester(): Promise<Requester | NextResponse> {
  const requester = await getRequester();
  if (!requester) return jsonError("Authentication required", 401);
  if (!requester.isStaff) return jsonError("Staff access required", 403);
  return requester;
}

/** Maps thrown errors to safe JSON responses. */
export function handleRouteError(error: unknown, context: string): NextResponse {
  if (error instanceof SubmissionError) {
    return NextResponse.json({ error: error.message, fieldErrors: error.fieldErrors }, { status: 400 });
  }
  const message = error instanceof Error ? error.message : "Unexpected error";
  console.error(`${context}:`, error);
  if (message === "Database not initialized" || message === "File storage is not configured") return jsonError("Service is not configured", 503);
  if (message === "Forbidden") return jsonError("Access denied", 403);
  return jsonError("Something went wrong. Please try again.", 500);
}
