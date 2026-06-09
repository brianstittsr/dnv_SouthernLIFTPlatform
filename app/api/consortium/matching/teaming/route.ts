import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { CONSORTIUM_COLLECTIONS, ConsortiumProfile } from "@/lib/consortium-schema";
import {
  calculateTeamingMatch,
  batchTeamingMatching,
} from "@/lib/ai-matching";

/**
 * POST /api/consortium/matching/teaming
 * Match a partner to other partners for teaming opportunities
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, options } = body;

    if (!partnerId) {
      return NextResponse.json(
        { error: "partnerId is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get the partner's profile
    const partnerRef = doc(db, CONSORTIUM_COLLECTIONS.PROFILES, partnerId);
    const partnerSnap = await getDoc(partnerRef);

    if (!partnerSnap.exists()) {
      return NextResponse.json(
        { error: "Partner profile not found" },
        { status: 404 }
      );
    }

    const partner: ConsortiumProfile = {
      id: partnerSnap.id,
      ...partnerSnap.data(),
    } as ConsortiumProfile;

    // Get all other consortium profiles
    const profilesRef = collection(db, CONSORTIUM_COLLECTIONS.PROFILES);
    const profilesSnap = await getDocs(profilesRef);

    if (profilesSnap.empty) {
      return NextResponse.json({
        matches: [],
        message: "No other consortium profiles found",
      });
    }

    const allProfiles: ConsortiumProfile[] = profilesSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((p) => p.id !== partnerId) as ConsortiumProfile[];

    // Perform batch teaming matching
    const matches = batchTeamingMatching(partner, allProfiles, options);

    return NextResponse.json({
      matches,
      totalPartners: allProfiles.length,
      matchedPartners: matches.length,
    });
  } catch (error: any) {
    console.error("Error matching teaming partners:", error);
    return NextResponse.json(
      { error: error.message || "Failed to match teaming partners" },
      { status: 500 }
    );
  }
}
