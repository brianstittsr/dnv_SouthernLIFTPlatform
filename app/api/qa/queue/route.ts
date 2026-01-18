import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * GET /api/qa/queue
 * Get QA review queue
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

    // Verify QA reviewer role
    if (claims.role !== "qa_reviewer" && claims.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");
    const industry = searchParams.get("industry");

    let query = db
      .collection("proofPacks")
      .where("status", "==", "submitted")
      .orderBy("submittedAt", "asc");

    const queueSnapshot = await query.get();

    let proofPacks = queueSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply client-side filters (Firestore limitations)
    if (minScore) {
      proofPacks = proofPacks.filter(
        (p: any) => p.packHealth?.overallScore >= parseInt(minScore)
      );
    }

    if (maxScore) {
      proofPacks = proofPacks.filter(
        (p: any) => p.packHealth?.overallScore <= parseInt(maxScore)
      );
    }

    if (industry) {
      // Fetch SME data to filter by industry
      const smeIds = proofPacks.map((p: any) => p.smeId);
      const usersSnapshot = await db
        .collection("users")
        .where("smeId", "in", smeIds)
        .get();

      const smeIndustries = new Map();
      usersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        smeIndustries.set(data.smeId, data.industry);
      });

      proofPacks = proofPacks.filter(
        (p: any) => smeIndustries.get(p.smeId) === industry
      );
    }

    return NextResponse.json({ queue: proofPacks });
  } catch (error: any) {
    console.error("Error fetching QA queue:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch QA queue" },
      { status: 500 }
    );
  }
}
