import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { assignUserRole, suspendUser, USER_ROLES, UserRole } from "@/lib/rbac";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/admin/users
 * List all users with filtering and search
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

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const roleFilter = searchParams.get("role");
    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Fetch users from Firebase Auth
    const listUsersResult = await auth.listUsers(1000); // Max 1000 users per call
    let users = listUsersResult.users;

    // Filter by role
    if (roleFilter) {
      users = users.filter(
        (user) => user.customClaims?.role === roleFilter
      );
    }

    // Filter by status
    if (statusFilter === "active") {
      users = users.filter((user) => !user.disabled);
    } else if (statusFilter === "suspended") {
      users = users.filter((user) => user.disabled);
    }

    // Search by email
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.email?.toLowerCase().includes(query) ||
          user.displayName?.toLowerCase().includes(query)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    // Fetch additional user data from Firestore
    const enrichedUsers = await Promise.all(
      paginatedUsers.map(async (user) => {
        const userDoc = await db.collection("users").doc(user.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          disabled: user.disabled,
          createdAt: user.metadata.creationTime,
          lastSignIn: user.metadata.lastSignInTime,
          role: user.customClaims?.role || "none",
          tenantId: user.customClaims?.tenantId,
          ...userData,
        };
      })
    );

    return NextResponse.json({
      users: enrichedUsers,
      total: users.length,
      page,
      limit,
      totalPages: Math.ceil(users.length / limit),
    });
  } catch (error: any) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create a new user account
 */
export async function POST(req: NextRequest) {
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
    const { email, password, displayName, role, tenantId } = body;

    // Validate inputs
    if (!email || !password || !role || !tenantId) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, role, tenantId" },
        { status: 400 }
      );
    }

    if (!Object.keys(USER_ROLES).includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${Object.keys(USER_ROLES).join(", ")}` },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    // Assign role using RBAC system
    await assignUserRole(userRecord.uid, role as UserRole, tenantId);

    // Create user document in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      email,
      displayName: displayName || email.split("@")[0],
      role,
      tenantId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "user_created",
      resource: "user",
      resourceId: userRecord.uid,
      details: { email, role, tenantId },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        uid: userRecord.uid,
        email,
        displayName,
        role,
        tenantId,
      },
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users
 * Delete a user account
 */
export async function DELETE(req: NextRequest) {
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

    // Get userId from query params
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (userId === decodedToken.uid) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user from Firebase Auth
    await auth.deleteUser(userId);

    // Delete user document from Firestore
    await db.collection("users").doc(userId).delete();

    // Delete user permissions
    await db.collection("userPermissions").doc(userId).delete();

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "user_deleted",
      resource: "user",
      resourceId: userId,
      details: {},
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
