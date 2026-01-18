import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/revenue/attribution
 * Log revenue attribution event
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const {
      partnerId,
      smeId,
      buyerId,
      eventType,
      revenueAmount,
      attributionPercentage,
      source,
      dealId,
      notes,
    } = body;

    // Validate required fields
    if (!partnerId || !smeId || !eventType || !revenueAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate event type
    const validEventTypes = [
      "lead_generated",
      "service_delivered",
      "introduction_facilitated",
      "conversion_completed",
    ];

    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }

    // Create immutable attribution event
    const attributionData = {
      partnerId,
      smeId,
      buyerId: buyerId || null,
      eventType,
      revenueAmount: parseFloat(revenueAmount),
      attributionPercentage: attributionPercentage || 100,
      
      // Metadata
      source: source || null,
      dealId: dealId || null,
      notes: notes || null,
      
      // Settlement tracking
      settlementStatus: "pending",
      settlementId: null,
      
      // Immutable tracking
      createdAt: Timestamp.now(),
      createdBy: decodedToken.uid,
      isImmutable: true,
    };

    const attributionRef = await db.collection("attributionEvents").add(attributionData);

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "revenue_attribution_logged",
      resource: "attribution_event",
      resourceId: attributionRef.id,
      details: { eventType, revenueAmount, partnerId },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      attributionId: attributionRef.id,
    });
  } catch (error: any) {
    console.error("Error logging attribution:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log attribution" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/revenue/attribution
 * Get attribution events (filtered by role)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    const searchParams = req.nextUrl.searchParams;
    const eventType = searchParams.get("eventType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = db.collection("attributionEvents").orderBy("createdAt", "desc");

    // Filter by role
    if (claims.role === "partner_user") {
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();
      query = query.where("partnerId", "==", userData?.partnerId) as any;
    }

    if (eventType) {
      query = query.where("eventType", "==", eventType) as any;
    }

    if (startDate) {
      query = query.where("createdAt", ">=", Timestamp.fromDate(new Date(startDate))) as any;
    }

    if (endDate) {
      query = query.where("createdAt", "<=", Timestamp.fromDate(new Date(endDate))) as any;
    }

    const eventsSnapshot = await query.limit(100).get();

    const events = eventsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Error fetching attribution events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch attribution events" },
      { status: 500 }
    );
  }
}
