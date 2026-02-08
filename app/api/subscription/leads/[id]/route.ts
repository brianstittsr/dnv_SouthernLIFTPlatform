import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { getLeadById, updateLead, resyncLeadToSVP } from "@/lib/subscription-leads/lead-service";
import type { UpdateLeadRequest } from "@/lib/subscription-leads/types";

/**
 * GET /api/subscription/leads/[id]
 * Get a single lead by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const lead = await getLeadById(id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error: any) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/subscription/leads/[id]
 * Update a lead
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const body = await req.json();

    const updates: UpdateLeadRequest = {
      status: body.status,
      assignedTo: body.assignedTo,
      priority: body.priority,
      contactInfo: body.contactInfo,
      addNote: body.addNote
        ? {
            ...body.addNote,
            authorId: decodedToken.uid,
          }
        : undefined,
    };

    const lead = await updateLead(id, updates);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update lead" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription/leads/[id]/sync
 * Re-sync a lead to SVP
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const result = await resyncLeadToSVP(id);

    return NextResponse.json({
      success: result.success,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error syncing lead:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync lead" },
      { status: 500 }
    );
  }
}
