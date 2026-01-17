import { NextRequest, NextResponse } from "next/server";
import { checkPaymentReminders } from "@/lib/payments-service";

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET handler for scheduled payment checks
 */
export async function GET(request: NextRequest) {
  // Verify authorization for cron jobs
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const results = await checkPaymentReminders();
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results,
    });
  } catch (error) {
    console.error("Scheduled payment check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for manual trigger
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const results = await checkPaymentReminders();
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results,
    });
  } catch (error) {
    console.error("Manual payment check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
