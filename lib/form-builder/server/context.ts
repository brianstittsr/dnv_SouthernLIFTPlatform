import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { verifyAuth } from "@/lib/auth/server-auth";
import { COLLECTIONS } from "@/lib/schema";

/** The signed-in user making a request, with LIFT staff/admin flags. */
export interface Requester {
  uid: string;
  email: string | null;
  name: string;
  isStaff: boolean;
  isAdmin: boolean;
}

const ADMIN_ROLES = new Set(["admin", "platform_admin"]);
const STAFF_ROLES = new Set(["admin", "platform_admin", "team", "team_member", "consultant", "partner_user", "cmmc_instructor", "qa_reviewer"]);

/** Resolves the current user from the session cookie and their users document. */
export async function getRequester(): Promise<Requester | null> {
  const user = await verifyAuth();
  if (!user) return null;
  let role = user.role;
  let svpRole = user.svpRole;
  let name = user.email ?? "User";
  if (db) {
    const snapshot = await db.collection(COLLECTIONS.USERS).doc(user.uid).get();
    const data = snapshot.data();
    if (data) {
      role = role ?? (data.role as string | undefined);
      svpRole = svpRole ?? (data.svpRole as string | undefined);
      const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
      name = (data.displayName as string | undefined) || fullName || name;
    }
  }
  const roles = [role, svpRole].filter((value): value is string => Boolean(value));
  return {
    uid: user.uid,
    email: user.email,
    name,
    isAdmin: roles.some((value) => ADMIN_ROLES.has(value)),
    isStaff: roles.some((value) => STAFF_ROLES.has(value)),
  };
}

/** Consistent JSON error response. */
export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Returns the Firestore instance or throws a clear error when Firebase Admin is not configured. */
export function requireDb(): FirebaseFirestore.Firestore {
  if (!db) throw new Error("Database not initialized");
  return db;
}

/** Hashes the client IP so raw addresses are never stored. */
export function hashIp(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`lift:${ip}`).digest("hex").slice(0, 32);
}

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Best-effort fixed-window rate limiter (per server instance).
 * Returns true when the request is allowed.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [bucketKey, value] of buckets) if (value.resetAt <= now) buckets.delete(bucketKey);
    }
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

/** Verifies a Cloudflare Turnstile token when TURNSTILE_SECRET_KEY is configured. */
export async function verifyCaptcha(token: string | undefined, request: NextRequest): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) body.set("remoteip", ip);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return false;
  }
}

/** Writes an audit event for LIFT form activity. Never throws. */
export async function writeAudit(action: string, entityId: string, actor: { uid?: string; name?: string } | null, detail: Record<string, unknown> = {}): Promise<void> {
  try {
    if (!db) return;
    await db.collection(COLLECTIONS.LIFT_AUDIT).add({
      action,
      entityId,
      actorUid: actor?.uid ?? null,
      actorName: actor?.name ?? null,
      detail,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("LIFT audit write failed:", error);
  }
}

/** Removes undefined values recursively (Firestore rejects them); keeps Timestamps and other class instances. */
export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => stripUndefined(item)) as unknown as T;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, stripUndefined(item)])
    ) as T;
  }
  return value;
}

/** Converts Firestore Timestamps (recursively) to ISO strings for JSON responses. */
export function serializeFirestore<T>(value: T): T {
  if (value instanceof Timestamp) return value.toDate().toISOString() as unknown as T;
  if (Array.isArray(value)) return value.map((item) => serializeFirestore(item)) as unknown as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, serializeFirestore(item)])) as T;
  }
  return value;
}
