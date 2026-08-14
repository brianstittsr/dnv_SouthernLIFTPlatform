import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

/**
 * POST /api/consortium/matching/teaming-partners
 *
 * Second layer of AI Matchmaking ("Like People Matches"): finds other KDM
 * Consortium members whose Company Intelligence NAICS codes overlap with
 * the requesting member's NAICS codes, for teaming purposes.
 */

interface TeamingPartnerMatch {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  avatarUrl: string;
  email: string;
  naicsCodes: string[];
  matchedNaicsCodes: string[];
  matchScore: number;
}

function scoreOverlap(memberCodes: string[], otherCodes: string[]): { score: number; matched: string[] } {
  if (memberCodes.length === 0 || otherCodes.length === 0) return { score: 0, matched: [] };

  const matched: string[] = [];
  for (const code of memberCodes) {
    if (otherCodes.includes(code)) {
      matched.push(code);
    } else if (otherCodes.some((c) => c.slice(0, 4) === code.slice(0, 4))) {
      matched.push(code);
    }
  }

  const uniqueMatched = Array.from(new Set(matched));
  const union = new Set([...memberCodes, ...otherCodes]).size;
  const score = union > 0 ? Math.round((uniqueMatched.length / union) * 100) : 0;
  return { score, matched: uniqueMatched };
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const body = await request.json();
    const naicsCodes: string[] = Array.isArray(body?.naicsCodes)
      ? body.naicsCodes.filter((c: unknown) => typeof c === "string" && c.trim().length > 0)
      : [];
    const excludeUserId: string | undefined = body?.excludeUserId;

    if (naicsCodes.length === 0) {
      return NextResponse.json({
        partners: [],
        message: "Add NAICS codes in Company Intel to find teaming partners with similar capabilities.",
      });
    }

    // Consortium members store their Company Intelligence NAICS codes flat
    // on the users/{uid} document (single source of truth).
    const snapshot = await db
      .collection("users")
      .where("svpRole", "==", "consortium_member")
      .get();

    const partners: TeamingPartnerMatch[] = [];

    snapshot.forEach((docSnap) => {
      if (docSnap.id === excludeUserId) return;

      const data = docSnap.data();
      const otherNaics: string[] = Array.isArray(data.naicsCodes) ? data.naicsCodes : [];
      if (otherNaics.length === 0) return;

      const { score, matched } = scoreOverlap(naicsCodes, otherNaics);
      if (score <= 0) return;

      partners.push({
        id: docSnap.id,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        company: data.legalCompanyName || data.company || "",
        jobTitle: data.jobTitle || "",
        avatarUrl: data.avatarUrl || "",
        email: data.email || "",
        naicsCodes: otherNaics,
        matchedNaicsCodes: matched,
        matchScore: score,
      });
    });

    partners.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ partners: partners.slice(0, 25) });
  } catch (error) {
    console.error("Error matching teaming partners:", error);
    return NextResponse.json(
      { error: "Failed to match teaming partners" },
      { status: 500 }
    );
  }
}
