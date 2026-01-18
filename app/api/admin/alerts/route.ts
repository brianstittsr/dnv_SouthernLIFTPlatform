import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import {
  getAlertConfig,
  updateAlertConfig,
  getActiveAlerts,
  acknowledgeAlert,
  resolveAlert,
} from "@/lib/alerts";

/**
 * GET /api/admin/alerts
 * Get alert configuration and active alerts
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    if (claims.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const [config, activeAlerts] = await Promise.all([
      getAlertConfig(),
      getActiveAlerts(),
    ]);

    return NextResponse.json({
      config,
      activeAlerts,
    });
  } catch (error: any) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/alerts
 * Update alert configuration
 */
export async function PUT(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    if (claims.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    await updateAlertConfig(body, decodedToken.uid);

    return NextResponse.json({
      success: true,
      message: "Alert configuration updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating alert config:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update alert configuration" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/alerts
 * Acknowledge or resolve an alert
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    if (claims.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, alertId } = body;

    if (!action || !alertId) {
      return NextResponse.json(
        { error: "Missing required fields: action, alertId" },
        { status: 400 }
      );
    }

    if (action === "acknowledge") {
      await acknowledgeAlert(alertId, decodedToken.uid);
    } else if (action === "resolve") {
      await resolveAlert(alertId);
    } else {
      return NextResponse.json(
        { error: `Invalid action: ${action}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Alert ${action}d successfully`,
    });
  } catch (error: any) {
    console.error("Error processing alert action:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process alert action" },
      { status: 500 }
    );
  }
}
