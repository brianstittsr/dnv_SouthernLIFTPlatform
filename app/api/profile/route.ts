import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/profile
 * Get user profile
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userDoc.data());
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update user profile
 */
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const {
      companyName,
      industry,
      description,
      website,
      logo,
      certifications,
      capabilities,
      serviceOfferings,
    } = body;

    // Validate logo size if provided (max 1MB base64)
    if (logo && logo.length > 1.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Logo size exceeds 1MB limit" },
        { status: 400 }
      );
    }

    // Calculate profile completeness
    let completeness = 20; // Base (email, company name)
    if (description) completeness += 15;
    if (website) completeness += 10;
    if (logo) completeness += 10;
    if (certifications && certifications.length > 0) completeness += 20;
    if (capabilities && capabilities.length > 0) completeness += 15;
    if (serviceOfferings && serviceOfferings.length > 0) completeness += 10;

    const updateData: any = {
      updatedAt: Timestamp.now(),
      profileCompleteness: completeness,
    };

    if (companyName !== undefined) updateData.companyName = companyName;
    if (industry !== undefined) updateData.industry = industry;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (logo !== undefined) updateData.logo = logo;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (capabilities !== undefined) updateData.capabilities = capabilities;
    if (serviceOfferings !== undefined) updateData.serviceOfferings = serviceOfferings;

    await db.collection("users").doc(decodedToken.uid).update(updateData);

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "profile_updated",
      resource: "user",
      resourceId: decodedToken.uid,
      details: { profileCompleteness: completeness },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profileCompleteness: completeness,
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
