import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/leads/[id]/activities
 * Log activity for a lead
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const { activityType, details, outcome, activityDate, attachments } = body;

    if (!activityType || !details) {
      return NextResponse.json(
        { error: "Missing required fields: activityType, details" },
        { status: 400 }
      );
    }

    const activityData = {
      activityType, // call, email, meeting, note
      details,
      outcome: outcome || null,
      activityDate: activityDate
        ? Timestamp.fromDate(new Date(activityDate))
        : Timestamp.now(),
      attachments: attachments || [],
      loggedBy: decodedToken.uid,
      createdAt: Timestamp.now(),
    };

    const activityRef = await db
      .collection("leads")
      .doc(id)
      .collection("activities")
      .add(activityData);

    // Update lead's last activity timestamp
    await db.collection("leads").doc(id).update({
      lastActivityAt: activityData.activityDate,
      updatedAt: Timestamp.now(),
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "lead_activity_logged",
      resource: "lead",
      resourceId: id,
      details: { activityType, activityId: activityRef.id },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      activityId: activityRef.id,
    });
  } catch (error: any) {
    console.error("Error logging activity:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log activity" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads/[id]/activities
 * Get activities for a lead
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    await auth.verifyIdToken(token);

    const searchParams = req.nextUrl.searchParams;
    const activityType = searchParams.get("activityType");

    let query = db
      .collection("leads")
      .doc(id)
      .collection("activities")
      .orderBy("activityDate", "desc");

    if (activityType) {
      query = query.where("activityType", "==", activityType) as any;
    }

    const activitiesSnapshot = await query.get();

    const activities = activitiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
