import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * PATCH /api/admin/users/[uid]/role
 * Update a user's role and svpRole
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    // Check custom claims first, then fall back to Firestore user document
    let isAdmin = claims.role === "platform_admin";
    
    if (!isAdmin) {
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();
      isAdmin = userData?.role === "platform_admin" || userData?.svpRole === "platform_admin";
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get user ID from params
    const { uid } = await params;

    // Parse request body
    const body = await req.json();
    const { role, svpRole } = body;

    if (!role && !svpRole) {
      return NextResponse.json(
        { error: "Missing required field: role or svpRole" },
        { status: 400 }
      );
    }

    // Update Firebase Auth custom claims
    const userRecord = await auth.getUser(uid);
    const currentClaims = userRecord.customClaims || {};
    
    await auth.setCustomUserClaims(uid, {
      ...currentClaims,
      role: role || currentClaims.role,
      tenantId: currentClaims.tenantId || "kdm-svp-platform",
    });

    // Update Firestore user document
    const userDocRef = db.collection("users").doc(uid);
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (role) {
      updateData.role = role;
    }
    if (svpRole) {
      updateData.svpRole = svpRole;
    }

    await userDocRef.update(updateData);

    // Update permissions document
    const permissionsRef = db.collection("userPermissions").doc(uid);
    await permissionsRef.set({
      userId: uid,
      role: role || svpRole,
      tenantId: "kdm-svp-platform",
      updatedAt: Timestamp.now(),
    }, { merge: true });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "user_role_updated",
      resource: "user",
      resourceId: uid,
      details: { role, svpRole },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      user: {
        uid,
        role,
        svpRole,
      },
    });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}
