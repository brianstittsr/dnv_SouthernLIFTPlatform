import { NextRequest, NextResponse } from "next/server";
import { getSamGovConfig } from "@/lib/sam-gov-config";

/**
 * POST /api/consortium/matching/naics-opportunities
 *
 * First layer of AI Matchmaking: matches the member's Company Intelligence
 * NAICS codes against live SAM.gov RFI/RFP/solicitation notices. Falls back
 * to a small labeled mock dataset if the SAM.gov integration has not been
 * configured yet, so the matching UI remains usable in demos.
 */

interface MatchedOpportunity {
  id: string;
  title: string;
  agency: string;
  solicitationNumber: string;
  noticeType: string;
  postedDate: string;
  deadline: string;
  location: string;
  naicsCodes: string[];
  matchedNaicsCodes: string[];
  matchScore: number;
  setAside?: string;
  description: string;
  url?: string;
  isMockData: boolean;
}

function scoreNaicsOverlap(memberCodes: string[], oppCodes: string[]): { score: number; matched: string[] } {
  const matched: string[] = [];
  let score = 0;

  for (const oppCode of oppCodes) {
    const exact = memberCodes.find((c) => c === oppCode);
    if (exact) {
      matched.push(exact);
      score += 100;
      continue;
    }
    // Partial match on NAICS sub-sector (first 4 digits)
    const partial = memberCodes.find((c) => c.slice(0, 4) === oppCode.slice(0, 4));
    if (partial) {
      matched.push(partial);
      score += 60;
    }
  }

  const normalized = oppCodes.length > 0 ? Math.min(100, Math.round(score / oppCodes.length)) : 0;
  return { score: normalized, matched: Array.from(new Set(matched)) };
}

const MOCK_RFX_POOL: Omit<MatchedOpportunity, "matchScore" | "matchedNaicsCodes">[] = [
  {
    id: "mock_rfi_1",
    title: "Sources Sought: Advanced Manufacturing Support Services",
    agency: "Department of Defense",
    solicitationNumber: "SS-DOD-2025-0142",
    noticeType: "Sources Sought (RFI)",
    postedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    location: "Multiple Locations",
    naicsCodes: ["332710", "332721"],
    setAside: "Small Business",
    description: "Seeking capability statements from qualified small businesses for precision machining and metal fabrication support.",
    isMockData: true,
  },
  {
    id: "mock_rfp_1",
    title: "Request for Proposal: IT Modernization & Cloud Migration",
    agency: "Department of Veterans Affairs",
    solicitationNumber: "RFP-VA-2025-0987",
    noticeType: "Solicitation (RFP)",
    postedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    location: "Remote",
    naicsCodes: ["541511", "541512"],
    setAside: "SDVOSB",
    description: "Proposal requested for cloud migration, application modernization, and infrastructure support services.",
    isMockData: true,
  },
  {
    id: "mock_rfi_2",
    title: "Sources Sought: Cybersecurity Assessment Services",
    agency: "Department of Homeland Security",
    solicitationNumber: "SS-DHS-2025-0233",
    noticeType: "Sources Sought (RFI)",
    postedDate: new Date(Date.now() - 8 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    location: "Washington, DC",
    naicsCodes: ["541512", "541519"],
    setAside: "8(a)",
    description: "Market research to identify vendors capable of providing NIST 800-171 / CMMC readiness assessments.",
    isMockData: true,
  },
  {
    id: "mock_rfp_2",
    title: "Request for Proposal: Engineering & Technical Support Services",
    agency: "Army Corps of Engineers",
    solicitationNumber: "RFP-USACE-2025-0410",
    noticeType: "Solicitation (RFP)",
    postedDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
    location: "Multiple Locations",
    naicsCodes: ["541330", "541380"],
    setAside: "HUBZone",
    description: "Proposal requested for civil engineering design, environmental compliance, and technical support services.",
    isMockData: true,
  },
  {
    id: "mock_rfi_3",
    title: "Sources Sought: Supply Chain & Logistics Optimization",
    agency: "Defense Logistics Agency",
    solicitationNumber: "SS-DLA-2025-0059",
    noticeType: "Sources Sought (RFI)",
    postedDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 25 * 86400000).toISOString(),
    location: "Multiple Locations",
    naicsCodes: ["488510", "541614"],
    setAside: "WOSB",
    description: "Requesting capability statements for supply chain analytics and logistics optimization support.",
    isMockData: true,
  },
];

function buildMockMatches(naicsCodes: string[]): MatchedOpportunity[] {
  return MOCK_RFX_POOL.map((opp) => {
    const { score, matched } = scoreNaicsOverlap(naicsCodes, opp.naicsCodes);
    return { ...opp, matchScore: score, matchedNaicsCodes: matched };
  })
    .filter((opp) => opp.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const naicsCodes: string[] = Array.isArray(body?.naicsCodes)
      ? body.naicsCodes.filter((c: unknown) => typeof c === "string" && c.trim().length > 0)
      : [];

    if (naicsCodes.length === 0) {
      return NextResponse.json(
        { opportunities: [], samGovConfigured: false, message: "No NAICS codes found on company profile. Add NAICS codes in Company Intel to see matches." },
        { status: 200 }
      );
    }

    const config = await getSamGovConfig();

    if (!config) {
      return NextResponse.json({
        opportunities: buildMockMatches(naicsCodes),
        samGovConfigured: false,
      });
    }

    // Query SAM.gov live for each NAICS code (limit to avoid excessive calls)
    const codesToQuery = naicsCodes.slice(0, 5);
    const byNoticeId = new Map<string, any>();

    await Promise.all(
      codesToQuery.map(async (naics) => {
        try {
          const response = await fetch(`${config.serverUrl}/api/search`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": config.apiKey,
            },
            body: JSON.stringify({
              naics,
              is_active: true,
              size: 15,
              page: 0,
            }),
          });

          if (!response.ok) return;

          const data = await response.json();
          const results = data.opportunitiesData || data.opportunities || [];
          for (const opp of results) {
            const noticeId = opp.noticeId || opp.id;
            if (noticeId && !byNoticeId.has(noticeId)) {
              byNoticeId.set(noticeId, opp);
            }
          }
        } catch (err) {
          console.error(`SAM.gov search failed for NAICS ${naics}:`, err);
        }
      })
    );

    const opportunities: MatchedOpportunity[] = Array.from(byNoticeId.values()).map((opp: any) => {
      const oppNaics: string[] = opp.naicsCode
        ? [opp.naicsCode]
        : Array.isArray(opp.naicsCodes)
        ? opp.naicsCodes
        : [];
      const { score, matched } = scoreNaicsOverlap(naicsCodes, oppNaics);

      return {
        id: opp.noticeId || opp.id || "",
        title: opp.title || "Untitled Opportunity",
        agency:
          (opp.organizationHierarchy || opp.department || "Unknown Agency")
            .toString()
            .split("::")
            .pop() || "Unknown Agency",
        solicitationNumber: opp.solicitationNumber || "",
        noticeType: opp.type || opp.noticeType || "Solicitation",
        postedDate: opp.postedDate || "",
        deadline: opp.responseDeadLine || opp.deadline || "",
        location: opp.placeOfPerformance
          ? `${opp.placeOfPerformance.city || ""}, ${opp.placeOfPerformance.state || ""}`.replace(/^, |, $/g, "")
          : "Not specified",
        naicsCodes: oppNaics,
        matchedNaicsCodes: matched,
        matchScore: score,
        setAside: opp.typeOfSetAsideDescription || undefined,
        description: opp.description || "",
        url: opp.uiLink || opp.url || undefined,
        isMockData: false,
      };
    })
      .filter((opp) => opp.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 50);

    return NextResponse.json({
      opportunities,
      samGovConfigured: true,
    });
  } catch (error) {
    console.error("Error matching NAICS opportunities:", error);
    return NextResponse.json(
      { error: "Failed to match opportunities" },
      { status: 500 }
    );
  }
}
