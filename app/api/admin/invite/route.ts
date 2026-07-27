import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { assignUserRole, USER_ROLES } from "@/lib/rbac";
import { Timestamp } from "firebase-admin/firestore";
import { randomBytes } from "crypto";
import type { UserRole } from "@/lib/rbac-types";
import { sendTemplatedEmail } from "@/lib/email";

/**
 * POST /api/admin/invite
 * Invite a new user by creating their Firebase Auth account with a
 * randomly generated temporary password. The user must change the
 * password on their first login.
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

    let isAdmin = claims.role === "platform_admin";
    if (!isAdmin) {
      const adminDoc = await db.collection("users").doc(decodedToken.uid).get();
      const adminData = adminDoc.data();
      isAdmin =
        adminData?.role === "platform_admin" ||
        adminData?.svpRole === "platform_admin";
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, firstName, lastName, role, tenantId, companyId, companyName } = body;

    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, firstName, lastName, role" },
        { status: 400 }
      );
    }

    if (!Object.keys(USER_ROLES).includes(role)) {
      return NextResponse.json(
        {
          error: `Invalid role. Must be one of: ${Object.keys(USER_ROLES).join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Prevent duplicate invites
    try {
      await auth.getUserByEmail(email);
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    } catch (error: any) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Generate a secure random temporary password
    const tempPassword =
      randomBytes(16).toString("hex").slice(0, 24) + "A1!";

    const displayName = `${firstName} ${lastName}`.trim();

    // Create the Firebase Auth account
    const userRecord = await auth.createUser({
      email,
      password: tempPassword,
      displayName,
      emailVerified: false,
    });

    // Assign role and permissions using the RBAC system
    await assignUserRole(
      userRecord.uid,
      role as UserRole,
      tenantId || "kdm-svp-platform"
    );

    // Create the Firestore user profile, marking it as a temporary password
    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        id: userRecord.uid,
        email,
        firstName,
        lastName,
        displayName,
        role,
        svpRole: role,
        tenantId: tenantId || "kdm-svp-platform",
        isActive: true,
        emailVerified: false,
        hasChangedPassword: false,
        isTempPassword: true,
        ...(companyId ? { companyId } : {}),
        ...(companyName ? { companyName } : {}),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

    // Log the invite in the audit trail
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "user_invited",
      resource: "user",
      resourceId: userRecord.uid,
      details: { email, role, tenantId: tenantId || "kdm-svp-platform", companyId: companyId || null },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    // Send invitation email with login instructions
    const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || process.env.NEXT_PUBLIC_URL || "https://www.kdm-assoc.com";
    const signInUrl = `${baseUrl}/sign-in`;

    // Generate a password reset link so the user can set their own password securely
    let passwordResetLink: string | undefined;
    try {
      passwordResetLink = await auth.generatePasswordResetLink(email, {
        url: `${baseUrl}/portal/dashboard`,
      });
    } catch (emailError) {
      console.warn("Failed to generate password reset link, falling back to temp password in email:", emailError);
    }

    // Get inviter's display name
    const inviterDoc = await db.collection("users").doc(decodedToken.uid).get();
    const inviterData = inviterDoc.data();
    const inviterName = inviterData?.displayName || inviterData?.firstName || "KDM & Associates";

    try {
      const emailResult = await sendTemplatedEmail(
        "userInvitation",
        email,
        {
          name: displayName,
          email,
          inviterName,
          role: USER_ROLES[role as UserRole] || role,
          signInUrl,
          tempPassword: passwordResetLink ? undefined : tempPassword,
          passwordResetLink: passwordResetLink || undefined,
        }
      );

      if (!emailResult.success) {
        console.error("Failed to send invitation email:", emailResult.error);
      } else {
        console.log(`Invitation email sent to ${email}. Message ID: ${emailResult.messageId}`);
      }
    } catch (emailError: any) {
      console.error("Error sending invitation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Invitation created successfully. An email has been sent to the user with login instructions.",
      user: {
        uid: userRecord.uid,
        email,
        displayName,
        role,
        tenantId: tenantId || "kdm-svp-platform",
        companyId: companyId || undefined,
        tempPassword,
      },
    });
  } catch (error: any) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to invite user" },
      { status: 500 }
    );
  }
}
