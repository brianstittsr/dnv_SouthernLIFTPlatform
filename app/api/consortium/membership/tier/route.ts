import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { CONSORTIUM_COLLECTIONS, MembershipTier } from "@/lib/consortium-schema";
import {
  determineMembershipTier,
  processTierTransition,
  checkTierEligibility,
  generateTierRecommendation,
  getTierPricing,
  calculatePricingDifference,
} from "@/lib/membership-tiers";

/**
 * GET /api/consortium/membership/tier?userId=xxx
 * Get current membership tier and eligibility information
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const checkEligibility = searchParams.get("checkEligibility") === "true";

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

    const profile = profileSnap.data() as any;
    const currentTier = profile.membershipTier?.tier;

    // Get tier pricing
    const pricing = getTierPricing(currentTier || "standard");

    // Check eligibility for all tiers if requested
    let eligibilityChecks: any = {};
    if (checkEligibility) {
      const tiers: MembershipTier[] = ["standard", "elite", "core_capture", "founder"];
      tiers.forEach((tier) => {
        eligibilityChecks[tier] = checkTierEligibility(profile as any, tier);
      });
    }

    return NextResponse.json({
      currentTier,
      membershipTier: profile.membershipTier,
      pricing,
      eligibilityChecks,
    });
  } catch (error: any) {
    console.error("Error fetching membership tier:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch membership tier" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/consortium/membership/tier
 * Request tier transition or get tier recommendation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, targetTier, requestedBy, reason } = body;

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

    const profile = profileSnap.data() as any;
    const currentTier = profile.membershipTier?.tier;

    if (action === "recommend") {
      // Generate tier recommendation
      const recommendation = generateTierRecommendation(profile as any);
      return NextResponse.json({
        recommendation,
      });
    }

    if (action === "transition" && targetTier) {
      // Process tier transition
      const transitionRequest = {
        partnerId: userId,
        currentTier: currentTier || "standard",
        targetTier,
        requestedBy: requestedBy || userId,
        reason: reason || "User requested tier change",
      };

      const result = processTierTransition(transitionRequest);

      if (result.success && result.newTier) {
        // Update profile with new tier
        await updateDoc(profileRef, {
          "membershipTier.tier": result.newTier,
          "membershipTier.assignedAt": result.effectiveDate || Timestamp.now(),
          "membershipTier.assignedBy": requestedBy,
          "membershipTier.assignmentReason": reason,
          "membershipTier.updatedAt": Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      return NextResponse.json({
        result,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'recommend' or 'transition'" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error processing membership tier request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process membership tier request" },
      { status: 500 }
    );
  }
}
