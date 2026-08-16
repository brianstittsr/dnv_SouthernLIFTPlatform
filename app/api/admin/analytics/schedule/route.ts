import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import type { Timestamp } from "firebase-admin/firestore";

interface ScheduleBody {
  name: string;
  projectId: string;
  environment?: string;
  days?: number;
  frequency: "daily" | "weekly" | "monthly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients: string[];
  includePdf?: boolean;
  subject?: string;
  enabled?: boolean;
}

function computeNextRunAt(
  frequency: "daily" | "weekly" | "monthly",
  dayOfWeek?: number,
  dayOfMonth?: number
): Date {
  const now = new Date();
  const next = new Date(now);
  next.setHours(9, 0, 0, 0);

  if (frequency === "daily") {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  if (frequency === "weekly") {
    const targetDay = typeof dayOfWeek === "number" ? dayOfWeek % 7 : 1;
    const daysUntilTarget = (targetDay + 7 - now.getDay()) % 7 || 7;
    next.setDate(now.getDate() + daysUntilTarget);
    return next;
  }

  const targetDay = typeof dayOfMonth === "number" ? Math.min(Math.max(dayOfMonth, 1), 31) : 1;
  next.setDate(targetDay);
  if (next <= now) {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

async function authorize(request: NextRequest): Promise<{ success: boolean; error?: string; status?: number }> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { success: false, error: "Unauthorized", status: 401 };
  }

  const idToken = authorization.split("Bearer ")[1];
  let decoded: any;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return { success: false, error: "Invalid token", status: 401 };
  }

  const isAdmin =
    decoded.admin === true ||
    decoded.role === "admin" ||
    decoded.role === "platform_admin" ||
    decoded.svpRole === "platform_admin" ||
    (Array.isArray(decoded.svpRoles) && decoded.svpRoles.includes("platform_admin")) ||
    decoded.email?.endsWith("@kdm-assoc.com");

  if (!isAdmin) {
    return { success: false, error: "Forbidden", status: 403 };
  }

  return { success: true };
}

function normalizeBody(body: ScheduleBody) {
  const recipients = (body.recipients || [])
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);

  if (recipients.length === 0) {
    throw new Error("At least one recipient email is required");
  }

  const frequency = body.frequency || "weekly";
  const nextRunAt = computeNextRunAt(frequency, body.dayOfWeek, body.dayOfMonth);

  return {
    name: body.name || "Untitled Report",
    projectId: body.projectId || process.env.VERCEL_PROJECT_ID || "",
    environment: body.environment || "production",
    days: typeof body.days === "number" && body.days > 0 ? body.days : 7,
    frequency,
    dayOfWeek: frequency === "weekly" ? (body.dayOfWeek ?? 1) : undefined,
    dayOfMonth: frequency === "monthly" ? (body.dayOfMonth ?? 1) : undefined,
    recipients,
    includePdf: body.includePdf ?? true,
    subject: body.subject?.trim() || undefined,
    enabled: body.enabled !== false,
    nextRunAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const snapshot = await db
      .collection(COLLECTIONS.ANALYTICS_SCHEDULED_REPORTS)
      .orderBy("createdAt", "desc")
      .get();

    const items = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        enabled: data.enabled,
        projectId: data.projectId,
        environment: data.environment,
        days: data.days,
        frequency: data.frequency,
        dayOfWeek: data.dayOfWeek,
        dayOfMonth: data.dayOfMonth,
        recipients: data.recipients,
        includePdf: data.includePdf,
        subject: data.subject,
        lastRunAt: data.lastRunAt ? (data.lastRunAt as Timestamp).toDate().toISOString() : null,
        nextRunAt: data.nextRunAt ? (data.nextRunAt as Timestamp).toDate().toISOString() : null,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null,
      };
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("Error fetching scheduled reports:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch scheduled reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const body = (await request.json()) as ScheduleBody;
    const normalized = normalizeBody(body);

    const docRef = await db.collection(COLLECTIONS.ANALYTICS_SCHEDULED_REPORTS).add({
      ...normalized,
      lastRunAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Scheduled report created",
    });
  } catch (error) {
    console.error("Error creating scheduled report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create scheduled report" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const body = (await request.json()) as ScheduleBody & { id: string };
    const { id, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 });
    }

    const normalized = normalizeBody(rest);
    const docRef = db.collection(COLLECTIONS.ANALYTICS_SCHEDULED_REPORTS).doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return NextResponse.json({ error: "Scheduled report not found" }, { status: 404 });
    }

    await docRef.update({
      ...normalized,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Scheduled report updated" });
  } catch (error) {
    console.error("Error updating scheduled report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update scheduled report" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 });
    }

    await db.collection(COLLECTIONS.ANALYTICS_SCHEDULED_REPORTS).doc(id).delete();

    return NextResponse.json({ success: true, message: "Scheduled report deleted" });
  } catch (error) {
    console.error("Error deleting scheduled report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete scheduled report" },
      { status: 500 }
    );
  }
}
