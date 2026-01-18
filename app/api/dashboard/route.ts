import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * GET /api/dashboard
 * Get dashboard statistics for SME user
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Fetch user profile
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    // Fetch proof packs count
    const proofPacksSnapshot = await db
      .collection("proofPacks")
      .where("smeId", "==", userData?.smeId)
      .get();

    // Fetch active leads count
    const leadsSnapshot = await db
      .collection("leads")
      .where("smeId", "==", userData?.smeId)
      .where("status", "==", "active")
      .get();

    // Fetch introductions count
    const introductionsSnapshot = await db
      .collection("introductions")
      .where("smeId", "==", userData?.smeId)
      .get();

    // Fetch upcoming events count
    const eventsSnapshot = await db
      .collection("cohorts")
      .where("participants", "array-contains", decodedToken.uid)
      .where("startDate", ">=", new Date())
      .get();

    // Calculate average Pack Health
    let packHealthAverage = 0;
    if (!proofPacksSnapshot.empty) {
      const healthScores = proofPacksSnapshot.docs
        .map((doc) => doc.data().packHealth?.overallScore || 0)
        .filter((score) => score > 0);
      
      if (healthScores.length > 0) {
        packHealthAverage = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
      }
    }

    return NextResponse.json({
      proofPacksCount: proofPacksSnapshot.size,
      activeLeadsCount: leadsSnapshot.size,
      introductionsCount: introductionsSnapshot.size,
      upcomingEventsCount: eventsSnapshot.size,
      profileCompleteness: userData?.profileCompleteness || 20,
      subscriptionTier: userData?.subscriptionTier || "free",
      packHealthAverage,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
