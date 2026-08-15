import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { suggestNaicsCodes } from "@/lib/samgov-ai";

/**
 * POST /api/samgov/naics-suggestions
 * Body: { userId: string }
 *
 * Generates AI-recommended NAICS codes for a member's profile based on their
 * company description, expertise, and existing NAICS codes. Persists the
 * result to samgovNaicsSuggestions and returns it.
 */
export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const userSnap = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userData = userSnap.data() || {};

    const suggestions = await suggestNaicsCodes({
      userId,
      name: [userData.firstName, userData.lastName].filter(Boolean).join(" ") || "Member",
      companyName: userData.companyName || userData.company || userData.legalCompanyName || undefined,
      companyDescription: userData.companyDescription || undefined,
      naicsCodes: Array.isArray(userData.naicsCodes) ? userData.naicsCodes : undefined,
      certifications: Array.isArray(userData.certifications) ? userData.certifications : undefined,
    });

    if (suggestions.length === 0) {
      return NextResponse.json({
        suggestions: [],
        message: "No suggestions generated. Ensure the LLM is configured in Settings > LLM Configuration and the profile has a company description.",
      });
    }

    const docRef = db.collection(COLLECTIONS.SAMGOV_NAICS_SUGGESTIONS).doc(userId);
    const now = Timestamp.now();
    await docRef.set(
      {
        userId,
        suggestedCodes: suggestions,
        basedOn: userData.companyDescription ? userData.companyDescription.slice(0, 200) : "profile data",
        status: "active",
        generatedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error("naics-suggestions error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
