import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/revenue/dashboard
 * Get partner revenue dashboard data
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const partnerId = userData?.partnerId;

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID not found" },
        { status: 400 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get("period") || "month"; // month, quarter, year

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "quarter":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get attribution events for period
    const eventsSnapshot = await db
      .collection("attributionEvents")
      .where("partnerId", "==", partnerId)
      .where("createdAt", ">=", Timestamp.fromDate(startDate))
      .get();

    const events = eventsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate totals
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let settledRevenue = 0;

    const revenueByType = {
      lead_generated: 0,
      service_delivered: 0,
      introduction_facilitated: 0,
      conversion_completed: 0,
    };

    events.forEach((event: any) => {
      const amount = event.revenueAmount * (event.attributionPercentage / 100);
      totalRevenue += amount;

      if (event.settlementStatus === "pending") {
        pendingRevenue += amount;
      } else if (event.settlementStatus === "settled") {
        settledRevenue += amount;
      }

      if (revenueByType[event.eventType as keyof typeof revenueByType] !== undefined) {
        revenueByType[event.eventType as keyof typeof revenueByType] += amount;
      }
    });

    // Get settlement history
    const settlementsSnapshot = await db
      .collection("revenueSettlements")
      .where("partnerId", "==", partnerId)
      .orderBy("settlementDate", "desc")
      .limit(10)
      .get();

    const settlements = settlementsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      totalRevenue,
      pendingRevenue,
      settledRevenue,
      revenueByType,
      events,
      settlements,
      period,
    });
  } catch (error: any) {
    console.error("Error fetching revenue dashboard:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch revenue dashboard" },
      { status: 500 }
    );
  }
}
