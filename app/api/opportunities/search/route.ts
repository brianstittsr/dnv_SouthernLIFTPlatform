import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

export async function POST(req: NextRequest) {
  try {
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
    if (!userData.isOnboardingComplete) {
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
    const { forceRefresh = false } = body;

    // Get user's NAICS codes and certifications from onboarding data
    const naicsCodes = userData.primaryNaics || [];
    const certifications = userData.certifications || [];
    const company = userData.company || "";

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

    // AI-powered opportunity matching
    // In production, this would call an AI service or SAM.gov API
    // For now, we'll simulate the matching logic
    const matchedOpportunities = await generateMatchedOpportunities({
      naicsCodes,
      certifications,
      company,
      userId: decodedToken.uid,
    });

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

// Simulated AI-powered opportunity matching
// In production, this would integrate with SAM.gov API and AI services
async function generateMatchedOpportunities(params: {
  naicsCodes: string[];
  certifications: string[];
  company: string;
  userId: string;
}) {
  const { naicsCodes, certifications, company } = params;

  // Simulated opportunity data based on NAICS codes
  // In production, this would be real data from SAM.gov
  const sampleOpportunities = [
    {
      id: "SAM-001",
      title: "Advanced Manufacturing Support Services",
      agency: "Department of Defense",
      solicitationNumber: "HQ0001-25-R-0001",
      naicsCodes: ["332710", "332813"],
      description: "The Department of Defense requires advanced manufacturing support services including CNC machining, precision fabrication, and quality assurance services.",
      postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      value: "$500,000 - $1,000,000",
      location: "Nationwide",
      setAside: "HUBZone",
      matchScore: 95,
      matchReason: "High match based on NAICS codes and HUBZone certification",
      status: "active",
    },
    {
      id: "SAM-002",
      title: "IT Infrastructure Modernization",
      agency: "Department of Veterans Affairs",
      solicitationNumber: "VA792525P0001",
      naicsCodes: ["541512", "541511"],
      description: "Modernization of IT infrastructure including cloud migration, cybersecurity implementation, and network optimization.",
      postedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      value: "$2,000,000 - $5,000,000",
      location: "Remote",
      setAside: "SDVOSB",
      matchScore: 88,
      matchReason: "Good match based on IT capabilities and SDVOSB certification",
      status: "active",
    },
    {
      id: "SAM-003",
      title: "Logistics and Supply Chain Management",
      agency: "Department of Transportation",
      solicitationNumber: "DTFH61-25-R-00001",
      naicsCodes: ["484110", "492110"],
      description: "Comprehensive logistics and supply chain management services for federal transportation projects.",
      postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      value: "$750,000 - $1,500,000",
      location: "Midwest Region",
      setAside: "8(a)",
      matchScore: 82,
      matchReason: "Match based on logistics capabilities and 8(a) certification",
      status: "active",
    },
    {
      id: "SAM-004",
      title: "Engineering Services for Infrastructure Projects",
      agency: "Army Corps of Engineers",
      solicitationNumber: "W912DY-25-R-0001",
      naicsCodes: ["541330", "237310"],
      description: "Professional engineering services for infrastructure development and maintenance projects.",
      postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      value: "$1,000,000 - $2,500,000",
      location: "Southeast Region",
      setAside: "Small Business",
      matchScore: 78,
      matchReason: "Moderate match based on engineering capabilities",
      status: "active",
    },
    {
      id: "SAM-005",
      title: "Professional Consulting Services",
      agency: "General Services Administration",
      solicitationNumber: "GSQ00CLL25R0001",
      naicsCodes: ["541611", "541612"],
      description: "Professional consulting services for federal agency operations improvement and strategic planning.",
      postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      value: "$250,000 - $500,000",
      location: "Washington DC Metro",
      setAside: "WOSB",
      matchScore: 75,
      matchReason: "Match based on consulting capabilities and WOSB certification",
      status: "active",
    },
  ];

  // Filter and score opportunities based on user's NAICS codes and certifications
  const matched = sampleOpportunities
    .filter((opp) => {
      // Check if any of the user's NAICS codes match the opportunity
      const naicsMatch = opp.naicsCodes.some((code) => naicsCodes.includes(code));
      
      // Check if user has relevant certifications
      const certMatch = certifications.some((cert) => {
        const certLower = cert.toLowerCase();
        return (
          opp.setAside.toLowerCase().includes(certLower) ||
          opp.description.toLowerCase().includes(certLower)
        );
      });

      return naicsMatch || certMatch;
    })
    .map((opp) => ({
      ...opp,
      matchScore: calculateMatchScore(opp, { naicsCodes, certifications }),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  return matched;
}

function calculateMatchScore(
  opportunity: any,
  userParams: { naicsCodes: string[]; certifications: string[] }
): number {
  let score = 0;

  // NAICS code matching (up to 60 points)
  const naicsMatches = opportunity.naicsCodes.filter((code: string) =>
    userParams.naicsCodes.includes(code)
  ).length;
  score += Math.min(naicsMatches * 30, 60);

  // Certification matching (up to 30 points)
  const certMatches = userParams.certifications.filter((cert) => {
    const certLower = cert.toLowerCase();
    return (
      opportunity.setAside.toLowerCase().includes(certLower) ||
      opportunity.description.toLowerCase().includes(certLower)
    );
  }).length;
  score += Math.min(certMatches * 15, 30);

  // Recency bonus (up to 10 points)
  const daysSincePosted = Math.floor(
    (Date.now() - new Date(opportunity.postedDate).getTime()) / (24 * 60 * 60 * 1000)
  );
  if (daysSincePosted < 7) score += 10;
  else if (daysSincePosted < 14) score += 7;
  else if (daysSincePosted < 30) score += 5;

  return Math.min(score, 100);
}
