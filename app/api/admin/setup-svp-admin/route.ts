import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

// Platform admin email - this user will have full SVP platform access
const PLATFORM_ADMIN_EMAIL = "bstitt@strategicvalueplus.com";

/**
 * POST /api/admin/setup-svp-admin
 * Initialize the platform admin user with SVP role
 * This should only be run once during initial setup
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Only allow the platform admin email to run this setup
    if (decodedToken.email !== PLATFORM_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Only the designated platform admin can run this setup" },
        { status: 403 }
      );
    }

    // Update the user document with platform admin role
    const userRef = db.collection("users").doc(decodedToken.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        role: "platform_admin",
        tenantId: "kdm-svp-platform",
        updatedAt: Timestamp.now(),
        updatedBy: "system_setup",
      });
    } else {
      await userRef.set({
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: "platform_admin",
        tenantId: "kdm-svp-platform",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        updatedBy: "system_setup",
      });
    }

    // Set custom claims for the user
    await auth.setCustomUserClaims(decodedToken.uid, {
      role: "platform_admin",
      tenantId: "kdm-svp-platform",
    });

    // Create permissions document
    await db.collection("userPermissions").doc(decodedToken.uid).set({
      userId: decodedToken.uid,
      role: "platform_admin",
      tenantId: "kdm-svp-platform",
      permissions: [
        "admin:read",
        "admin:write",
        "admin:delete",
        "users:manage",
        "roles:manage",
        "settings:manage",
        "analytics:view",
        "audit:view",
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }, { merge: true });

    // Log the setup action
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "svp_platform_admin_setup",
      resource: "user",
      resourceId: decodedToken.uid,
      details: {
        email: decodedToken.email,
        svpRole: "platform_admin",
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Platform admin setup complete",
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        svpRole: "platform_admin",
      },
    });
  } catch (error: any) {
    console.error("Error setting up platform admin:", error);
    return NextResponse.json(
      { error: error.message || "Failed to setup platform admin" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/setup-svp-admin
 * Check if the current user is the platform admin
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const userRef = db.collection("users").doc(decodedToken.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    return NextResponse.json({
      isPlatformAdmin: userData?.role === "platform_admin" || decodedToken.customClaims?.role === "platform_admin",
      email: decodedToken.email,
      role: userData?.role || decodedToken.customClaims?.role || null,
      canSetup: decodedToken.email === PLATFORM_ADMIN_EMAIL,
    });
  } catch (error: any) {
    console.error("Error checking platform admin:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check platform admin" },
      { status: 500 }
    );
  }
}
