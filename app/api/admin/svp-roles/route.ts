import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

// Valid SVP roles
const VALID_SVP_ROLES = [
  "platform_admin",
  "sme_user",
  "partner_user",
  "buyer",
  "qa_reviewer",
  "cmmc_instructor",
];

/**
 * GET /api/admin/svp-roles
 * Get all users with SVP roles (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Check if user is platform admin
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (userData?.svpRole !== "platform_admin" && userData?.role !== "admin") {
      return NextResponse.json(
        { error: "Only platform admins can view SVP roles" },
        { status: 403 }
      );
    }

    // Get all users with SVP roles
    const usersSnapshot = await db
      .collection("users")
      .where("svpRole", "!=", null)
      .get();

    const users = usersSnapshot.docs.map((doc) => ({
      uid: doc.id,
      email: doc.data().email,
      svpRole: doc.data().svpRole,
      role: doc.data().role,
      svpRoleUpdatedAt: doc.data().svpRoleUpdatedAt?.toDate(),
    }));

    return NextResponse.json({ users, validRoles: VALID_SVP_ROLES });
  } catch (error: any) {
    console.error("Error fetching SVP roles:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch SVP roles" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/svp-roles
 * Update a user's SVP role (admin only)
 */
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Check if user is platform admin
    const adminDoc = await db.collection("users").doc(decodedToken.uid).get();
    const adminData = adminDoc.data();

    if (adminData?.svpRole !== "platform_admin" && adminData?.role !== "admin") {
      return NextResponse.json(
        { error: "Only platform admins can update SVP roles" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, svpRole } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (svpRole && !VALID_SVP_ROLES.includes(svpRole)) {
      return NextResponse.json(
        { error: `Invalid SVP role. Valid roles: ${VALID_SVP_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    // Update user's SVP role
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      svpRoleUpdatedAt: Timestamp.now(),
      svpRoleUpdatedBy: decodedToken.uid,
    };

    if (svpRole) {
      updateData.svpRole = svpRole;
    } else {
      // Remove SVP role if null/empty
      updateData.svpRole = null;
    }

    await userRef.update(updateData);

    // Update custom claims
    const existingUser = await auth.getUser(userId);
    const existingClaims = existingUser.customClaims || {};
    
    await auth.setCustomUserClaims(userId, {
      ...existingClaims,
      svpRole: svpRole || null,
    });

    // Log the action
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "svp_role_updated",
      resource: "user",
      resourceId: userId,
      details: {
        targetEmail: userDoc.data()?.email,
        newSvpRole: svpRole || "removed",
        previousSvpRole: userDoc.data()?.svpRole || "none",
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: svpRole ? `SVP role updated to ${svpRole}` : "SVP role removed",
    });
  } catch (error: any) {
    console.error("Error updating SVP role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update SVP role" },
      { status: 500 }
    );
  }
}
