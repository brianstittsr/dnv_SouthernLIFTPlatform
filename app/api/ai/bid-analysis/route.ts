import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/ai/bid-analysis
 * Generate AI bid/no-bid analysis for an opportunity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      opportunityId,
      pursuitBriefId,
      title,
      agency,
      memberId,
      companyName,
      opportunityDetails,
    } = body;

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    if (!opportunityId || !memberId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Integrate with AI service (OpenAI, Anthropic, etc.)
    // For now, generate mock analysis
    const mockAnalysis = generateMockBidAnalysis(opportunityDetails);

    // Store the analysis in Firestore
    const analysisData = {
      opportunityId,
      pursuitBriefId: pursuitBriefId || null,
      title: title || "Untitled Opportunity",
      agency: agency || "Unknown Agency",
      memberId,
      companyName: companyName || "",
      ...mockAnalysis,
      status: "completed",
      generatedAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await db.collection(COLLECTIONS.AI_BID_ANALYSES).add(analysisData);

    return NextResponse.json({
      success: true,
      analysisId: docRef.id,
      analysis: analysisData,
    });
  } catch (error) {
    console.error("Error generating bid analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate bid analysis" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/bid-analysis?memberId=xxx
 * Get bid analyses for a member
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
      // Get specific analysis
      const doc = await db.collection(COLLECTIONS.AI_BID_ANALYSES).doc(analysisId).get();
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

    // Get all analyses for member
    const snapshot = await db
      .collection(COLLECTIONS.AI_BID_ANALYSES)
      .where("memberId", "==", memberId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const analyses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("Error fetching bid analyses:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}

// Mock analysis generator (replace with actual AI integration)
function generateMockBidAnalysis(details: any) {
  const recommendations = ["bid", "no-bid", "review"] as const;
  const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
  
  return {
    recommendation,
    confidenceScore: Math.floor(Math.random() * 30) + 70, // 70-100
    winProbability: Math.floor(Math.random() * 40) + 30, // 30-70
    factors: [
      {
        name: "Past Performance Alignment",
        score: Math.floor(Math.random() * 40) + 60,
        weight: 0.25,
        description: "Your company's past performance strongly aligns with this requirement",
        positive: true,
      },
      {
        name: "Certification Match",
        score: Math.floor(Math.random() * 40) + 60,
        weight: 0.20,
        description: "Required certifications are within your current capabilities",
        positive: true,
      },
      {
        name: "Competitive Position",
        score: Math.floor(Math.random() * 50) + 40,
        weight: 0.25,
        description: "Moderate competition expected with established incumbents",
        positive: Math.random() > 0.5,
      },
      {
        name: "Resource Availability",
        score: Math.floor(Math.random() * 30) + 60,
        weight: 0.15,
        description: "Current capacity sufficient for contract delivery",
        positive: true,
      },
      {
        name: "Financial Viability",
        score: Math.floor(Math.random() * 30) + 60,
        weight: 0.15,
        description: "Contract value aligns with business objectives",
        positive: true,
      },
    ],
    capabilityGaps: recommendation === "bid" 
      ? []
      : [
          {
            requirement: "CMMC Level 2 Certification",
            severity: "medium" as const,
            suggestedPartners: [],
          },
        ],
    competitiveLandscape: {
      estimatedCompetitors: Math.floor(Math.random() * 10) + 3,
      incumbentExists: Math.random() > 0.5,
      incumbentName: Math.random() > 0.5 ? "Major Defense Contractor Inc." : undefined,
      smallBusinessSetAside: Math.random() > 0.3,
      setAsideType: Math.random() > 0.5 ? "SDVOSB" : undefined,
    },
    financialAssessment: {
      estimatedProposalCost: Math.floor(Math.random() * 50000) + 10000,
      potentialRevenue: Math.floor(Math.random() * 2000000) + 500000,
      breakEvenProbability: Math.floor(Math.random() * 30) + 60,
      recommendedInvestment: Math.floor(Math.random() * 40000) + 15000,
    },
  };
}
