import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { searchSamGovOpportunities, type SamGovOpportunity } from "@/lib/samgov-service";

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await auth.verifyIdToken(token);

    // Get user document to check onboarding status
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();

    // Check if onboarding is complete
    if (!userData?.isOnboardingComplete) {
      return NextResponse.json(
        { 
          error: "Onboarding not complete",
          requiresOnboarding: true,
          redirectUrl: "/portal/onboarding"
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { forceRefresh = false, query = "" } = body;

    // Manual keyword search — hit SAM.gov directly, bypassing the cache
    if (typeof query === "string" && query.trim()) {
      try {
        const live = await searchSamGovOpportunities({
          q: query.trim(),
          qMode: "ALL",
          size: 25,
        });
        const results = (live.opportunitiesData || []).map((o) =>
          mapLiveResult(o, [], "Keyword match from live SAM.gov search")
        );
        return NextResponse.json({
          opportunities: results,
          fromCache: false,
          live: true,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
          { error: `Live SAM.gov search failed: ${msg}` },
          { status: 502 }
        );
      }
    }

    // Get user's NAICS codes and certifications from onboarding data
    const naicsCodes: string[] = Array.isArray(userData?.primaryNaics)
      ? userData.primaryNaics.map(String)
      : [];
    const certifications: string[] = Array.isArray(userData?.certifications)
      ? userData.certifications.map(String)
      : [];

    if (naicsCodes.length === 0) {
      return NextResponse.json(
        { error: "No NAICS codes found in your profile. Please complete onboarding." },
        { status: 400 }
      );
    }

    // Check if we have cached opportunities for this user
    if (!forceRefresh) {
      const cachedOpportunities = await db
        .collection("users")
        .doc(decodedToken.uid)
        .collection("matchedOpportunities")
        .orderBy("matchedAt", "desc")
        .limit(1)
        .get();

      if (!cachedOpportunities.empty) {
        const cached = cachedOpportunities.docs[0].data();
        const cacheAge = Date.now() - (cached.matchedAt?.toMillis?.() || 0);
        // Cache is valid for 24 hours
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return NextResponse.json({
            opportunities: cached.opportunities || [],
            fromCache: true,
            lastUpdated: cached.matchedAt?.toDate?.()?.toISOString(),
          });
        }
      }
    }

    // No keyword — a real NAICS-driven search: one proxy call per primary
    // NAICS code (first 6-digit code in each profile entry), merged/deduped.
    const naicsDigits = [
      ...new Set(
        naicsCodes
          .map((n: unknown) => String(n).match(/\d{6}/)?.[0])
          .filter((v): v is string => Boolean(v))
      ),
    ];
    if (naicsDigits.length === 0) {
      return NextResponse.json(
        { error: "No valid NAICS codes found in your profile. Please complete onboarding." },
        { status: 400 }
      );
    }

    let matchedOpportunities: ReturnType<typeof mapLiveResult>[];
    try {
      const merged = new Map<string, ReturnType<typeof mapLiveResult>>();
      for (const naics of naicsDigits.slice(0, 3)) {
        const live = await searchSamGovOpportunities({ naics, size: 25 });
        for (const opp of live.opportunitiesData || []) {
          const id = String(opp.noticeId || opp.id || "");
          if (id && !merged.has(id)) {
            merged.set(id, mapLiveResult(opp, certifications));
          }
        }
      }
      matchedOpportunities = [...merged.values()]
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 50);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: `Live SAM.gov search failed: ${msg}` },
        { status: 502 }
      );
    }

    // Cache the results
    await db
      .collection("users")
      .doc(decodedToken.uid)
      .collection("matchedOpportunities")
      .add({
        opportunities: matchedOpportunities,
        matchedAt: new Date(),
        naicsCodes,
        certifications,
      });

    return NextResponse.json({
      opportunities: matchedOpportunities,
      fromCache: false,
      live: true,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error searching opportunities:", error);
    return NextResponse.json(
      { error: "Failed to search opportunities" },
      { status: 500 }
    );
  }
}

/**
 * Map a raw SAM.gov proxy result into the Opportunity shape the UI expects.
 * Results arrive already NAICS-filtered, so the score starts at 60 and adds
 * a certification/set-aside alignment bonus and a posting-recency bonus.
 */
function mapLiveResult(
  o: SamGovOpportunity,
  certifications: string[] = [],
  matchReasonOverride?: string
) {
  const noticeId = String(o.noticeId || o.id || "");
  const setAside = o.typeOfSetAsideDescription || "None listed";
  const certMatches = certifications.filter((cert) => {
    const certLower = String(cert).toLowerCase();
    return certLower && setAside.toLowerCase().includes(certLower);
  }).length;
  const postedMs = o.postedDate ? new Date(o.postedDate).getTime() : 0;
  const daysOld = postedMs ? Math.floor((Date.now() - postedMs) / 86400000) : Number.POSITIVE_INFINITY;
  const recencyBonus = daysOld <= 7 ? 10 : daysOld <= 14 ? 7 : daysOld <= 30 ? 5 : 0;
  const matchScore = Math.min(60 + Math.min(certMatches * 15, 30) + recencyBonus, 100);
  return {
    id: noticeId,
    noticeId,
    title: o.title || "Untitled opportunity",
    agency: o.organizationHierarchy || "Federal Agency",
    solicitationNumber: o.solicitationNumber || "",
    naicsCodes: o.naicsCode ? [o.naicsCode] : [],
    description: typeof o.description === "string" ? o.description.slice(0, 600) : "",
    postedDate: o.postedDate || "",
    dueDate: o.responseDeadLine || "",
    value: "See listing",
    location: "",
    setAside,
    matchScore,
    matchReason:
      matchReasonOverride ??
      (certMatches > 0
        ? "NAICS match plus certification/set-aside alignment"
        : "NAICS match from your profile"),
    status: "active",
    uiLink: `https://sam.gov/opp/${noticeId}/view`,
  };
}
