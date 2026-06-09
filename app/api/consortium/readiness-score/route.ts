import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { CONSORTIUM_COLLECTIONS } from "@/lib/consortium-schema";
import { calculateReadinessScore, generateReadinessScoreReport } from "@/lib/readiness-scoring";

/**
 * GET /api/consortium/readiness-score?userId=xxx
 * Get the current readiness score for a consortium member
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get consortium profile
    const profileRef = doc(db, CONSORTIUM_COLLECTIONS.PROFILES, userId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return NextResponse.json(
        { error: "Consortium profile not found" },
        { status: 404 }
      );
    }

    const profile = profileSnap.data();

    return NextResponse.json({
      readinessScore: profile.readinessScore,
      report: generateReadinessScoreReport(userId, profile.readinessScore),
    });
  } catch (error: any) {
    console.error("Error fetching readiness score:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch readiness score" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/consortium/readiness-score
 * Calculate and update readiness score for a consortium member
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, forceRecalculate = false } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get consortium profile
    const profileRef = doc(db, CONSORTIUM_COLLECTIONS.PROFILES, userId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return NextResponse.json(
        { error: "Consortium profile not found" },
        { status: 404 }
      );
    }

    const profile = profileSnap.data();

    // Check if recalculation is needed
    const lastCalculated = profile.readinessScore?.lastCalculated?.toDate();
    const now = new Date();
    const daysSinceCalculation = lastCalculated
      ? Math.floor((now.getTime() - lastCalculated.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (!forceRecalculate && daysSinceCalculation < 7) {
      // Return existing score if less than 7 days old
      return NextResponse.json({
        readinessScore: profile.readinessScore,
        report: generateReadinessScoreReport(userId, profile.readinessScore),
        message: "Using existing score (less than 7 days old)",
      });
    }

    // Calculate new readiness score
    const readinessInput = {
      samRegistrationStatus: profile.governmentContractingProfile?.samRegistrationStatus || "not_registered",
      samExpirationDate: profile.governmentContractingProfile?.samExpirationDate,
      uei: profile.governmentContractingProfile?.uei,
      cageCode: profile.governmentContractingProfile?.cageCode,
      naicsCodes: profile.naicsCodes?.map((n: any) => n.code) || [],
      certifications: profile.certifications || [],
      pastPerformanceCount: profile.pastPerformance?.length || 0,
      gsaScheduleHolder: profile.governmentContractingProfile?.gsaScheduleHolder || false,
    };

    const newReadinessScore = calculateReadinessScore(readinessInput);

    // Update profile with new score
    await updateDoc(profileRef, {
      "readinessScore": newReadinessScore,
      "readinessScore.lastCalculated": Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      readinessScore: newReadinessScore,
      report: generateReadinessScoreReport(userId, newReadinessScore),
      message: "Readiness score recalculated successfully",
    });
  } catch (error: any) {
    console.error("Error calculating readiness score:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate readiness score" },
      { status: 500 }
    );
  }
}
