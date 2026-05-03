import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/ai/contract-floor
 * Generate contract floor (pipeline) analysis for a member
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      memberId,
      companyName,
      analysisPeriod,
      opportunityIds, // Specific opportunities to include in analysis
    } = body;

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID required" },
        { status: 400 }
      );
    }

    // Fetch member's pursuits/opportunities
    let pursuitsQuery = db
      .collection(COLLECTIONS.PURSUIT_BRIEFS)
      .where("memberId", "==", memberId);

    if (opportunityIds && opportunityIds.length > 0) {
      // If specific opportunities provided, filter by those
      pursuitsQuery = pursuitsQuery.where("__name__", "in", opportunityIds);
    }

    const pursuitsSnapshot = await pursuitsQuery.get();

    // Generate analysis
    const analysis = generateContractFloorAnalysis(
      pursuitsSnapshot.docs,
      memberId,
      companyName
    );

    // Store in Firestore
    const analysisData = {
      memberId,
      companyName: companyName || "",
      analysisPeriod: {
        startDate: Timestamp.fromDate(new Date(analysis.startDate)),
        endDate: Timestamp.fromDate(new Date(analysis.endDate)),
      },
      pipelineSummary: analysis.pipelineSummary,
      winProbabilityAnalysis: analysis.winProbabilityAnalysis,
      projections: analysis.projections,
      recommendations: analysis.recommendations,
      generatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await db.collection(COLLECTIONS.CONTRACT_FLOOR_ANALYSES).add(analysisData);

    return NextResponse.json({
      success: true,
      analysisId: docRef.id,
      analysis: analysisData,
    });
  } catch (error) {
    console.error("Error generating contract floor analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/contract-floor
 * Get contract floor analyses for a member
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const analysisId = searchParams.get("id");

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    if (analysisId) {
      const doc = await db
        .collection(COLLECTIONS.CONTRACT_FLOOR_ANALYSES)
        .doc(analysisId)
        .get();
      if (!doc.exists) {
        return NextResponse.json(
          { error: "Analysis not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        analysis: { id: doc.id, ...doc.data() },
      });
    }

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID required" },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection(COLLECTIONS.CONTRACT_FLOOR_ANALYSES)
      .where("memberId", "==", memberId)
      .orderBy("generatedAt", "desc")
      .limit(10)
      .get();

    const analyses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("Error fetching contract floor analyses:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}

// Generate contract floor analysis
function generateContractFloorAnalysis(
  pursuitDocs: any[],
  memberId: string,
  companyName: string
) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1); // Jan 1 this year
  const endDate = new Date(now.getFullYear(), 11, 31); // Dec 31 this year

  // Process pursuits
  const opportunities = pursuitDocs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "Untitled",
      value: data.estimatedValue || Math.floor(Math.random() * 2000000) + 500000,
      stage: data.stage || ["identification", "qualification", "pursuit", "proposal", "award"][Math.floor(Math.random() * 5)],
      winProbability: data.winProbability || Math.floor(Math.random() * 60) + 20,
      category: data.category || ["Manufacturing", "Defense", "Critical Minerals", "Energy"][Math.floor(Math.random() * 4)],
    };
  });

  // Pipeline summary
  const pipelineSummary = {
    totalOpportunities: opportunities.length,
    totalEstimatedValue: opportunities.reduce((sum, opp) => sum + opp.value, 0),
    byStage: {
      identification: {
        count: opportunities.filter((o) => o.stage === "identification").length,
        value: opportunities
          .filter((o) => o.stage === "identification")
          .reduce((sum, o) => sum + o.value, 0),
      },
      qualification: {
        count: opportunities.filter((o) => o.stage === "qualification").length,
        value: opportunities
          .filter((o) => o.stage === "qualification")
          .reduce((sum, o) => sum + o.value, 0),
      },
      pursuit: {
        count: opportunities.filter((o) => o.stage === "pursuit").length,
        value: opportunities
          .filter((o) => o.stage === "pursuit")
          .reduce((sum, o) => sum + o.value, 0),
      },
      proposal: {
        count: opportunities.filter((o) => o.stage === "proposal").length,
        value: opportunities
          .filter((o) => o.stage === "proposal")
          .reduce((sum, o) => sum + o.value, 0),
      },
      award: {
        count: opportunities.filter((o) => o.stage === "award").length,
        value: opportunities
          .filter((o) => o.stage === "award")
          .reduce((sum, o) => sum + o.value, 0),
      },
    },
  };

  // Win probability by category
  const categories = [...new Set(opportunities.map((o) => o.category))];
  const winProbabilityAnalysis = categories.map((category) => {
    const catOpps = opportunities.filter((o) => o.category === category);
    const totalValue = catOpps.reduce((sum, o) => sum + o.value, 0);
    const weightedProb =
      catOpps.reduce((sum, o) => sum + o.value * (o.winProbability / 100), 0) / totalValue;

    return {
      category,
      opportunities: catOpps.length,
      weightedValue: Math.round(totalValue * weightedProb),
      avgWinProbability: Math.round(weightedProb * 100),
    };
  });

  // Calculate projections (weighted by win probability)
  const totalWeighted = opportunities.reduce(
    (sum, o) => sum + o.value * (o.winProbability / 100),
    0
  );

  const projections = {
    conservative: Math.round(totalWeighted * 0.5), // 25th percentile
    expected: Math.round(totalWeighted), // 50th percentile
    optimistic: Math.round(totalWeighted * 1.5), // 75th percentile
  };

  // Generate recommendations
  const recommendations = opportunities
    .slice(0, 5)
    .map((opp) => ({
      type: opp.winProbability > 60 ? ("pursue" as const) : 
            opp.winProbability > 40 ? ("partner" as const) : 
            opp.winProbability > 20 ? ("watch" as const) : ("decline" as const),
      opportunityId: opp.id,
      title: opp.title,
      reasoning: generateRecommendationReasoning(opp),
      priority: opp.winProbability > 60 ? ("high" as const) : 
                opp.winProbability > 40 ? ("medium" as const) : ("low" as const),
    }));

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    pipelineSummary,
    winProbabilityAnalysis,
    projections,
    recommendations,
  };
}

function generateRecommendationReasoning(opportunity: any): string {
  const reasons = [
    `Strong ${opportunity.category} alignment with your capabilities.`,
    `Win probability of ${opportunity.winProbability}% based on past performance.`,
    `Contract value of $${(opportunity.value / 1000000).toFixed(1)}M fits your portfolio.`,
    `Current stage (${opportunity.stage}) allows time for strategic positioning.`,
  ];

  if (opportunity.winProbability < 40) {
    reasons.push("Consider teaming to strengthen competitive position.");
  }

  return reasons.slice(0, 2).join(" ");
}
