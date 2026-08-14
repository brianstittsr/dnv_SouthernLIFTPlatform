import { NextRequest, NextResponse } from "next/server";
import { getSamGovConfig } from "@/lib/sam-gov-config";

/**
 * SAM.gov API Proxy Route
 * 
 * Proxies search requests to the SAM.gov API Server using the API key
 * stored in platform settings. This keeps the API key server-side only.
 */

interface SAMSearchParams {
  q?: string;
  qMode?: "ALL" | "EXACT" | "ANY";
  page?: number;
  size?: number;
  sort?: string;
  is_active?: boolean;
  naics?: string;
  psc?: string;
  notice_type?: string;
  "response_date.from"?: string;
  "response_date.to"?: string;
  "modified_date.from"?: string;
  "modified_date.to"?: string;
  includeFullDetails?: boolean;
}

/**
 * POST /api/opportunities/sam-gov
 * 
 * Search SAM.gov opportunities via the proxy API server.
 * Request body follows the SAM.gov API Server search schema.
 */
export async function POST(request: NextRequest) {
  try {
    const config = await getSamGovConfig();
    
    if (!config) {
      return NextResponse.json(
        { error: "SAM.gov API is not configured. Please add your API key and server URL in Settings > Integrations." },
        { status: 503 }
      );
    }

    const body: SAMSearchParams = await request.json();
    
    // Default to active opportunities only
    const searchParams: SAMSearchParams = {
      is_active: true,
      size: 25,
      page: 0,
      ...body,
    };

    const response = await fetch(`${config.serverUrl}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(
        { error: errorData.error || `SAM.gov API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("SAM.gov search error:", error);
    return NextResponse.json(
      { error: "Failed to search SAM.gov opportunities" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/opportunities/sam-gov
 * 
 * Get a single opportunity by noticeId (passed as query param).
 */
export async function GET(request: NextRequest) {
  try {
    const config = await getSamGovConfig();
    
    if (!config) {
      return NextResponse.json(
        { error: "SAM.gov API is not configured. Please add your API key and server URL in Settings > Integrations." },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const noticeId = searchParams.get("noticeId");
    
    if (!noticeId) {
      return NextResponse.json(
        { error: "noticeId query parameter is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${config.serverUrl}/api/opportunity/${noticeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(
        { error: errorData.error || `SAM.gov API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("SAM.gov opportunity detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunity details" },
      { status: 500 }
    );
  }
}
