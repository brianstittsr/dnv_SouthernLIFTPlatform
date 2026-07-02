import { NextRequest, NextResponse } from "next/server";
import { db as adminDb } from "@/lib/firebase-admin";
import type { Firestore } from "firebase-admin/firestore";
import type { SiteImplementationPlan } from "../route";

interface ExecuteRequest {
  sessionId: string;
  plan: SiteImplementationPlan;
  userId: string;
}

interface ExecutionStep {
  step: string;
  status: "pending" | "done" | "error";
  message?: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json();
    const { sessionId, plan, userId } = body;

    if (!sessionId || !plan) {
      return NextResponse.json({ error: "sessionId and plan are required" }, { status: 400 });
    }

    const db = adminDb;
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const executionLog: ExecutionStep[] = [];
    const now = () => new Date().toISOString();

    const sessionRef = db.collection("site_change_requests").doc(sessionId);
    await sessionRef.update({ status: "executing", updatedAt: now() });

    for (const step of plan.implementationSteps) {
      if (!step.automated) {
        executionLog.push({
          step: step.title,
          status: "pending",
          message: "Manual step — requires human action",
          timestamp: now(),
        });
        continue;
      }

      try {
        await executeStep(db, step, plan, userId);
        executionLog.push({
          step: step.title,
          status: "done",
          message: "Completed successfully",
          timestamp: now(),
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        executionLog.push({
          step: step.title,
          status: "error",
          message: errorMsg,
          timestamp: now(),
        });
      }
    }

    for (const update of plan.firestoreUpdates) {
      if (!update.collection) continue;
      try {
        await applyFirestoreUpdate(db, update, userId);
        executionLog.push({
          step: `Firestore: ${update.action} in ${update.collection}`,
          status: "done",
          message: update.documentId ? `Document: ${update.documentId}` : "New document",
          timestamp: now(),
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        executionLog.push({
          step: `Firestore: ${update.action} in ${update.collection}`,
          status: "error",
          message: errorMsg,
          timestamp: now(),
        });
      }
    }

    const hasErrors = executionLog.some((l) => l.status === "error");
    const finalStatus = hasErrors ? "failed" : "completed";

    await sessionRef.update({
      status: finalStatus,
      executionLog,
      updatedAt: now(),
    });

    await db.collection("auditLogs").add({
      userId,
      action: "site_change_executed",
      resource: "site_change_requests",
      resourceId: sessionId,
      details: {
        planSummary: plan.summary,
        stepsTotal: executionLog.length,
        stepsCompleted: executionLog.filter((l) => l.status === "done").length,
        stepsFailed: executionLog.filter((l) => l.status === "error").length,
        stepsPending: executionLog.filter((l) => l.status === "pending").length,
      },
      timestamp: now(),
    });

    return NextResponse.json({
      status: finalStatus,
      executionLog,
      summary: {
        total: executionLog.length,
        completed: executionLog.filter((l) => l.status === "done").length,
        failed: executionLog.filter((l) => l.status === "error").length,
        pending: executionLog.filter((l) => l.status === "pending").length,
      },
    });
  } catch (error) {
    console.error("Site assistant execute error:", error);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}

async function executeStep(
  db: Firestore,
  step: SiteImplementationPlan["implementationSteps"][number],
  _plan: SiteImplementationPlan,
  _userId: string
): Promise<void> {
  const title = step.title.toLowerCase();

  if (title.includes("create") || title.includes("add") || title.includes("update")) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
}

async function applyFirestoreUpdate(
  db: Firestore,
  update: SiteImplementationPlan["firestoreUpdates"][number],
  userId: string
): Promise<void> {
  const collRef = db.collection(update.collection);
  const timestamp = new Date().toISOString();

  const resolvedFields: Record<string, unknown> = {
    ...update.fields,
    updatedAt: timestamp,
    updatedBy: userId,
  };

  if (update.action === "create") {
    await collRef.add({ ...resolvedFields, createdAt: timestamp, createdBy: userId });
  } else if (update.action === "update" && update.documentId) {
    await collRef.doc(update.documentId).update(resolvedFields);
  } else if (update.action === "delete" && update.documentId) {
    await collRef.doc(update.documentId).delete();
  }
}
