import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { 
  createSubscriptionLead, 
  getLeads, 
  getLeadById, 
  updateLead,
  resyncLeadToSVP 
} from "@/lib/subscription-leads/lead-service";
import type { CreateLeadRequest, UpdateLeadRequest } from "@/lib/subscription-leads/types";

/**
 * GET /api/subscription/leads
 * Get leads list with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user has admin or sales role
    const userRole = decodedToken.role;
    if (!["platform_admin", "sales", "consortium_partner"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    
    const options = {
      status: searchParams.get("status") as any,
      tier: searchParams.get("tier") as any,
      priority: searchParams.get("priority") as any,
      assignedTo: searchParams.get("assignedTo") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      searchQuery: searchParams.get("q") || undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    const result = await getLeads(options);

    return NextResponse.json({ 
      success: true, 
      data: result.leads,
      total: result.total,
      pagination: {
        limit: options.limit,
        offset: options.offset,
        hasMore: result.total > options.offset + result.leads.length,
      }
    });
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription/leads
 * Create a new subscription lead
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    const required = ["userId", "tier", "email", "companyName", "industry", "userType", "roleTag"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate tier (only DWY and DFY for now)
    if (!["dwy", "dfy"].includes(body.tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Only DWY and DFY tiers create leads." },
        { status: 400 }
      );
    }

    const request: CreateLeadRequest & { 
      email: string; 
      companyName: string; 
      industry: string; 
      userType: "sme" | "buyer";
      roleTag: string;
    } = {
      userId: body.userId,
      tier: body.tier,
      email: body.email,
      companyName: body.companyName,
      industry: body.industry,
      userType: body.userType,
      roleTag: body.roleTag,
      source: body.source || "subscription_checkout",
      proofPackContext: body.proofPackContext,
    };

    const lead = await createSubscriptionLead(request);

    return NextResponse.json({ 
      success: true, 
      data: lead 
    });
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create lead" },
      { status: 500 }
    );
  }
}
