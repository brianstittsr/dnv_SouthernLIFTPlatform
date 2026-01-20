/**
 * Role-Based Access Control (RBAC) System - Server-Side Functions
 * 
 * This file contains server-side only functions that use Firebase Admin SDK.
 * For types and constants, import from ./rbac-types.ts
 */

import { auth } from "firebase-admin";
import { db } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import type {
  UserRole,
  Permission,
  UserPermissionsDoc,
  CustomClaims,
} from "./rbac-types";
import { ROLE_PERMISSIONS } from "./rbac-types";

// Re-export types for convenience
export type { UserRole, Permission, UserPermissionsDoc, CustomClaims };
export { ROLE_PERMISSIONS, USER_ROLES } from "./rbac-types";

// ============================================================================
// Role Management Functions
// ============================================================================

/**
 * Assign a role to a user (updates both custom claims and Firestore)
 */
export async function assignUserRole(
  userId: string,
  role: UserRole,
  tenantId: string,
  additionalPermissions: Permission[] = []
): Promise<void> {
  try {
    // Update Firebase Auth custom claims
    await auth().setCustomUserClaims(userId, {
      role,
      tenantId,
      isActive: true,
    } as CustomClaims);

    // Get base permissions for role
    const basePermissions = ROLE_PERMISSIONS[role];

    // Update Firestore permissions document
    const permissionsRef = db.collection("userPermissions").doc(userId);
    await permissionsRef.set({
      id: userId,
      userId,
      role,
      basePermissions,
      customPermissions: additionalPermissions,
      tenantId,
      isActive: true,
      updatedAt: Timestamp.now(),
      lastRoleChange: Timestamp.now(),
    }, { merge: true });

    // Log the role assignment in audit trail
    await logAuditEvent({
      userId,
      action: "role_assigned",
      resource: "user",
      resourceId: userId,
      details: { role, tenantId },
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error assigning user role:", error);
    throw new Error("Failed to assign user role");
  }
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const permissionsDoc = await db
      .collection("userPermissions")
      .doc(userId)
      .get();

    if (!permissionsDoc.exists) {
      return false;
    }

    const permissions = permissionsDoc.data() as UserPermissionsDoc;

    if (!permissions.isActive) {
      return false;
    }

    // Check both base and custom permissions
    const allPermissions = [
      ...permissions.basePermissions,
      ...permissions.customPermissions,
    ];

    return allPermissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(
  userId: string
): Promise<Permission[]> {
  try {
    const permissionsDoc = await db
      .collection("userPermissions")
      .doc(userId)
      .get();

    if (!permissionsDoc.exists) {
      return [];
    }

    const permissions = permissionsDoc.data() as UserPermissionsDoc;

    if (!permissions.isActive) {
      return [];
    }

    return [
      ...permissions.basePermissions,
      ...permissions.customPermissions,
    ];
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
}

/**
 * Add custom permission to a user
 */
export async function addCustomPermission(
  userId: string,
  permission: Permission
): Promise<void> {
  try {
    const permissionsRef = db.collection("userPermissions").doc(userId);
    const permissionsDoc = await permissionsRef.get();

    if (!permissionsDoc.exists) {
      throw new Error("User permissions not found");
    }

    const permissions = permissionsDoc.data() as UserPermissionsDoc;
    const customPermissions = permissions.customPermissions || [];

    if (!customPermissions.includes(permission)) {
      customPermissions.push(permission);

      await permissionsRef.update({
        customPermissions,
        updatedAt: Timestamp.now(),
      });

      // Log the permission addition
      await logAuditEvent({
        userId,
        action: "permission_added",
        resource: "user",
        resourceId: userId,
        details: { permission },
        timestamp: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error adding custom permission:", error);
    throw new Error("Failed to add custom permission");
  }
}

/**
 * Remove custom permission from a user
 */
export async function removeCustomPermission(
  userId: string,
  permission: Permission
): Promise<void> {
  try {
    const permissionsRef = db.collection("userPermissions").doc(userId);
    const permissionsDoc = await permissionsRef.get();

    if (!permissionsDoc.exists) {
      throw new Error("User permissions not found");
    }

    const permissions = permissionsDoc.data() as UserPermissionsDoc;
    const customPermissions = permissions.customPermissions || [];

    const updatedPermissions = customPermissions.filter(
      (p) => p !== permission
    );

    await permissionsRef.update({
      customPermissions: updatedPermissions,
      updatedAt: Timestamp.now(),
    });

    // Log the permission removal
    await logAuditEvent({
      userId,
      action: "permission_removed",
      resource: "user",
      resourceId: userId,
      details: { permission },
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error removing custom permission:", error);
    throw new Error("Failed to remove custom permission");
  }
}

/**
 * Suspend a user (deactivate without deleting)
 */
export async function suspendUser(userId: string): Promise<void> {
  try {
    // Update Firebase Auth custom claims
    const user = await auth().getUser(userId);
    const currentClaims = user.customClaims as CustomClaims;

    await auth().setCustomUserClaims(userId, {
      ...currentClaims,
      isActive: false,
    });

    // Update Firestore permissions
    await db.collection("userPermissions").doc(userId).update({
      isActive: false,
      updatedAt: Timestamp.now(),
    });

    // Log the suspension
    await logAuditEvent({
      userId,
      action: "user_suspended",
      resource: "user",
      resourceId: userId,
      details: {},
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error suspending user:", error);
    throw new Error("Failed to suspend user");
  }
}

/**
 * Reactivate a suspended user
 */
export async function reactivateUser(userId: string): Promise<void> {
  try {
    // Update Firebase Auth custom claims
    const user = await auth().getUser(userId);
    const currentClaims = user.customClaims as CustomClaims;

    await auth().setCustomUserClaims(userId, {
      ...currentClaims,
      isActive: true,
    });

    // Update Firestore permissions
    await db.collection("userPermissions").doc(userId).update({
      isActive: true,
      updatedAt: Timestamp.now(),
    });

    // Log the reactivation
    await logAuditEvent({
      userId,
      action: "user_reactivated",
      resource: "user",
      resourceId: userId,
      details: {},
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error reactivating user:", error);
    throw new Error("Failed to reactivate user");
  }
}

// ============================================================================
// Audit Logging
// ============================================================================

interface AuditEvent {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  timestamp: Timestamp;
  ipAddress?: string;
}

async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    await db.collection("auditLogs").add({
      ...event,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error logging audit event:", error);
  }
}

// ============================================================================
// Authorization Middleware Helpers
// ============================================================================

/**
 * Verify user has required role (fast check using custom claims)
 */
export function requireRole(requiredRole: UserRole) {
  return async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.split("Bearer ")[1];
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const decodedToken = await auth().verifyIdToken(token);
      const claims = decodedToken as any;

      if (!claims.isActive) {
        return res.status(403).json({ error: "Account suspended" });
      }

      if (claims.role !== requiredRole && claims.role !== "platform_admin") {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Error verifying role:", error);
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}

/**
 * Verify user has required permission (detailed check using Firestore)
 */
export function requirePermission(requiredPermission: Permission) {
  return async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.split("Bearer ")[1];
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const decodedToken = await auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      const hasRequiredPermission = await hasPermission(
        userId,
        requiredPermission
      );

      if (!hasRequiredPermission) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Error verifying permission:", error);
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}
