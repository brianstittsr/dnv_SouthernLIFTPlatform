import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/ai/teaming-recommendations
 * Generate AI teaming recommendations for an opportunity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      opportunityId,
      pursuitBriefId,
      opportunityTitle,
      naicsCodes,
      requiredCapabilities,
      requiredCertifications,
      forMemberId,
    } = body;

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    if (!opportunityId || !forMemberId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch consortium members with matching capabilities
    const membersSnapshot = await db
      .collection(COLLECTIONS.TEAM_MEMBERS)
      .where("status", "==", "active")
      .where("consortiumOnboardingComplete", "==", true)
      .get();

    // Filter out the requesting member and generate recommendations
    const recommendations = await generateTeamingRecommendations(
      forMemberId,
      membersSnapshot.docs,
      requiredCapabilities || [],
      requiredCertifications || [],
      naicsCodes || []
    );

    // Store recommendation
    const recommendationData = {
      opportunityId,
      pursuitBriefId: pursuitBriefId || null,
      forMemberId,
      opportunityTitle: opportunityTitle || "Untitled Opportunity",
      naicsCodes: naicsCodes || [],
      requiredCapabilities: requiredCapabilities || [],
      requiredCertifications: requiredCertifications || [],
      recommendations,
      suggestedTeamStructure: generateTeamStructure(recommendations),
      status: "active",
      generatedAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // 14 days
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await db
      .collection(COLLECTIONS.AI_TEAMMING_RECOMMENDATIONS)
      .add(recommendationData);

    return NextResponse.json({
      success: true,
      recommendationId: docRef.id,
      recommendation: recommendationData,
    });
  } catch (error) {
    console.error("Error generating teaming recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/teaming-recommendations?memberId=xxx
 * Get teaming recommendations for a member
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const recommendationId = searchParams.get("id");

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    if (recommendationId) {
      const doc = await db
        .collection(COLLECTIONS.AI_TEAMMING_RECOMMENDATIONS)
        .doc(recommendationId)
        .get();
      if (!doc.exists) {
        return NextResponse.json(
          { error: "Recommendation not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        recommendation: { id: doc.id, ...doc.data() },
      });
    }

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID required" },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection(COLLECTIONS.AI_TEAMMING_RECOMMENDATIONS)
      .where("forMemberId", "==", memberId)
      .where("status", "==", "active")
      .orderBy("generatedAt", "desc")
      .limit(20)
      .get();

    const recommendations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Error fetching teaming recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

// Generate teaming recommendations based on capability matching
async function generateTeamingRecommendations(
  forMemberId: string,
  memberDocs: any[],
  requiredCapabilities: string[],
  requiredCertifications: string[],
  naicsCodes: string[]
): Promise<any[]> {
  // Filter out the requesting member
  const otherMembers = memberDocs.filter((doc) => doc.id !== forMemberId);

  const recommendations = otherMembers.map((doc) => {
    const data = doc.data();
    
    // Calculate match score based on various factors
    let matchScore = 50; // Base score
    const matchReasons: string[] = [];

    // NAICS code match
    if (data.naicsCodes && naicsCodes.some((code) => data.naicsCodes.includes(code))) {
      matchScore += 15;
      matchReasons.push("Matching NAICS codes");
    }

    // Certification match
    if (data.certifications && requiredCertifications.some((cert) => 
      data.certifications.some((c: string) => c.toLowerCase().includes(cert.toLowerCase()))
    )) {
      matchScore += 20;
      matchReasons.push("Required certifications held");
    }

    // Past performance in relevant area
    if (data.pastPerformance && data.pastPerformance.length > 0) {
      matchScore += 10;
      matchReasons.push("Strong past performance record");
    }

    // Consortium pillar alignment
    if (data.consortiumPillarFocus && data.consortiumPillarFocus.length > 0) {
      matchScore += 5;
    }

    // Capabilities match
    const complementaryCapabilities = data.marketplaceCategories || [];
    if (requiredCapabilities.some((cap) => 
      complementaryCapabilities.some((c: string) => c.toLowerCase().includes(cap.toLowerCase()))
    )) {
      matchScore += 15;
      matchReasons.push("Complementary capabilities");
    }

    // Cap on score
    matchScore = Math.min(matchScore, 98);

    return {
      memberId: doc.id,
      companyName: data.companyName || data.company || "Unknown Company",
      matchScore,
      matchReasons: matchReasons.length > 0 ? matchReasons : ["Potential teaming partner"],
      complementaryCapabilities,
      relevantCertifications: data.certifications || [],
      pastPerformanceRelevance: data.pastPerformance?.length > 0 
        ? `${data.pastPerformance.length} relevant contracts` 
        : "Limited past performance data",
      geographicFit: Math.random() > 0.3, // Mock data
      sizeFit: Math.random() > 0.2,
      availabilityFit: data.seekingPartners !== false,
      contacted: false,
    };
  });

  // Sort by match score and return top 5
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

function generateTeamStructure(recommendations: any[]): any[] {
  const roles = [
    { role: "Prime Contractor", description: "Overall contract management and primary deliverables" },
    { role: "Technical Lead", description: "Technical expertise and solution architecture" },
    { role: "Manufacturing Partner", description: "Production and manufacturing capabilities" },
    { role: "Compliance Specialist", description: "CMMC, security, and regulatory compliance" },
    { role: "Logistics Partner", description: "Supply chain and distribution" },
  ];

  return roles.slice(0, Math.min(roles.length, recommendations.length + 2)).map((role, index) => ({
    ...role,
    suggestedMemberId: index < recommendations.length ? recommendations[index].memberId : undefined,
    filled: index < recommendations.length,
  }));
}
