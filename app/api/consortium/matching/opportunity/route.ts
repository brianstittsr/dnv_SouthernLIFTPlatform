import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { CONSORTIUM_COLLECTIONS, ConsortiumProfile } from "@/lib/consortium-schema";
import {
  calculateOpportunityMatch,
  batchOpportunityMatching,
  Opportunity,
} from "@/lib/ai-matching";

/**
 * POST /api/consortium/matching/opportunity
 * Match an opportunity to consortium partners
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunity, options } = body;

    if (!opportunity) {
      return NextResponse.json(
        { error: "opportunity is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get all consortium profiles
    const profilesRef = collection(db, CONSORTIUM_COLLECTIONS.PROFILES);
    const profilesSnap = await getDocs(profilesRef);

    if (profilesSnap.empty) {
      return NextResponse.json({
        matches: [],
        message: "No consortium profiles found",
      });
    }

    const profiles: ConsortiumProfile[] = profilesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ConsortiumProfile[];

    // Perform batch matching
    const matches = batchOpportunityMatching(opportunity, profiles, options);

    // Save matches to database
    const matchesRef = collection(db, CONSORTIUM_COLLECTIONS.CAPABILITY_MATCHES);
    // In production, would save each match to database

    return NextResponse.json({
      matches,
      totalPartners: profiles.length,
      matchedPartners: matches.length,
    });
  } catch (error: any) {
    console.error("Error matching opportunity:", error);
    return NextResponse.json(
      { error: error.message || "Failed to match opportunity" },
      { status: 500 }
    );
  }
}
