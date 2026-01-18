import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import {
  getSystemConfig,
  updateIndustries,
  updateRevenueConfig,
  updatePackHealthConfig,
  updatePartnerAssignments,
  updatePlatformSettings,
} from "@/lib/config";

/**
 * GET /api/admin/settings
 * Get system configuration
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    if (claims.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const config = await getSystemConfig();

    if (!config) {
      return NextResponse.json(
        { error: "Failed to load configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json(config);
  } catch (error: any) {
    console.error("Error fetching system config:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update system configuration
 */
export async function PUT(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    if (claims.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { error: "Missing required fields: section, data" },
        { status: 400 }
      );
    }

    // Update specific configuration section
    switch (section) {
      case "industries":
        await updateIndustries(data, decodedToken.uid);
        break;

      case "revenueConfig":
        await updateRevenueConfig(data, decodedToken.uid);
        break;

      case "packHealthConfig":
        await updatePackHealthConfig(data, decodedToken.uid);
        break;

      case "partnerAssignments":
        await updatePartnerAssignments(data, decodedToken.uid);
        break;

      case "settings":
        await updatePlatformSettings(data, decodedToken.uid);
        break;

      default:
        return NextResponse.json(
          { error: `Invalid section: ${section}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${section} updated successfully`,
    });
  } catch (error: any) {
    console.error("Error updating system config:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update configuration" },
      { status: 500 }
    );
  }
}
