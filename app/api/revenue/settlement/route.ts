import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/revenue/settlement
 * Calculate and create quarterly settlement (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    // Verify admin role
    if (claims.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { startDate, endDate, platformFeePercentage } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: startDate, endDate" },
        { status: 400 }
      );
    }

    const platformFee = platformFeePercentage || 10;

    // Get all pending attribution events for the period
    const eventsSnapshot = await db
      .collection("attributionEvents")
      .where("settlementStatus", "==", "pending")
      .where("createdAt", ">=", Timestamp.fromDate(new Date(startDate)))
      .where("createdAt", "<=", Timestamp.fromDate(new Date(endDate)))
      .get();

    if (eventsSnapshot.empty) {
      return NextResponse.json(
        { message: "No pending events for this period" },
        { status: 200 }
      );
    }

    // Group events by partner
    const partnerRevenue = new Map<string, any>();

    eventsSnapshot.docs.forEach((doc) => {
      const event = doc.data();
      const partnerId = event.partnerId;
      const attributedAmount = event.revenueAmount * (event.attributionPercentage / 100);

      if (!partnerRevenue.has(partnerId)) {
        partnerRevenue.set(partnerId, {
          partnerId,
          totalRevenue: 0,
          eventCount: 0,
          eventIds: [],
          eventsByType: {
            lead_generated: 0,
            service_delivered: 0,
            introduction_facilitated: 0,
            conversion_completed: 0,
          },
        });
      }

      const partnerData = partnerRevenue.get(partnerId);
      partnerData.totalRevenue += attributedAmount;
      partnerData.eventCount += 1;
      partnerData.eventIds.push(doc.id);

      if (partnerData.eventsByType[event.eventType] !== undefined) {
        partnerData.eventsByType[event.eventType] += attributedAmount;
      }
    });

    // Create settlements for each partner
    const settlements = [];

    for (const [partnerId, data] of partnerRevenue) {
      const grossRevenue = data.totalRevenue;
      const platformFeeAmount = grossRevenue * (platformFee / 100);
      const netRevenue = grossRevenue - platformFeeAmount;

      const settlementData = {
        partnerId,
        periodStart: Timestamp.fromDate(new Date(startDate)),
        periodEnd: Timestamp.fromDate(new Date(endDate)),
        
        grossRevenue,
        platformFeePercentage: platformFee,
        platformFeeAmount,
        netRevenue,
        
        eventCount: data.eventCount,
        eventIds: data.eventIds,
        eventsByType: data.eventsByType,
        
        status: "calculated",
        settlementDate: Timestamp.now(),
        createdAt: Timestamp.now(),
        createdBy: decodedToken.uid,
      };

      const settlementRef = await db.collection("revenueSettlements").add(settlementData);

      // Update attribution events with settlement ID
      const batch = db.batch();
      data.eventIds.forEach((eventId: string) => {
        const eventRef = db.collection("attributionEvents").doc(eventId);
        batch.update(eventRef, {
          settlementStatus: "settled",
          settlementId: settlementRef.id,
        });
      });
      await batch.commit();

      // Send notification to partner
      const partnerDoc = await db.collection("users").doc(partnerId).get();
      const partnerData = partnerDoc.data();

      if (partnerData?.email) {
        await db.collection("emailQueue").add({
          to: [partnerData.email],
          subject: "Quarterly Revenue Settlement",
          body: `
            <h2>Revenue Settlement Report</h2>
            <p>Your quarterly revenue settlement has been calculated.</p>
            <p><strong>Period:</strong> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
            <p><strong>Gross Revenue:</strong> $${grossRevenue.toFixed(2)}</p>
            <p><strong>Platform Fee (${platformFee}%):</strong> $${platformFeeAmount.toFixed(2)}</p>
            <p><strong>Net Revenue:</strong> $${netRevenue.toFixed(2)}</p>
            <p><strong>Events:</strong> ${data.eventCount}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/partner/revenue">View Details</a></p>
          `,
          createdAt: Timestamp.now(),
          status: "pending",
        });
      }

      settlements.push({
        settlementId: settlementRef.id,
        partnerId,
        netRevenue,
      });
    }

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "settlement_calculated",
      resource: "revenue_settlement",
      resourceId: "batch",
      details: {
        startDate,
        endDate,
        partnerCount: settlements.length,
        totalEvents: eventsSnapshot.size,
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      settlements,
      totalEvents: eventsSnapshot.size,
    });
  } catch (error: any) {
    console.error("Error calculating settlement:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate settlement" },
      { status: 500 }
    );
  }
}
