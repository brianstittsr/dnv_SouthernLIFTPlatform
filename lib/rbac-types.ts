/**
 * Role-Based Access Control (RBAC) Types and Constants
 * 
 * This file contains only types and constants that can be safely
 * imported in both client and server components.
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// Role Definitions
// ============================================================================

export type UserRole =
  | "sme_user"
  | "consortium_partner"
  | "qa_reviewer"
  | "buyer"
  | "cmmc_instructor"
  | "marketing_staff"
  | "platform_admin";

export const USER_ROLES: Record<UserRole, string> = {
  sme_user: "SME User",
  consortium_partner: "Consortium Partner",
  qa_reviewer: "QA Reviewer",
  buyer: "Buyer",
  cmmc_instructor: "CMMC Instructor",
  marketing_staff: "Marketing Staff",
  platform_admin: "Platform Admin",
};

// ============================================================================
// Permission Definitions
// ============================================================================

export type Permission =
  // Proof Pack permissions
  | "proof_pack:create"
  | "proof_pack:read"
  | "proof_pack:update"
  | "proof_pack:delete"
  | "proof_pack:submit"
  | "proof_pack:review"
  | "proof_pack:approve"
  | "proof_pack:share"
  // Lead permissions
  | "lead:create"
  | "lead:read"
  | "lead:update"
  | "lead:assign"
  | "lead:view_all"
  // Introduction permissions
  | "introduction:request"
  | "introduction:read"
  | "introduction:respond"
  | "introduction:view_all"
  // Cohort permissions
  | "cohort:create"
  | "cohort:read"
  | "cohort:update"
  | "cohort:enroll"
  | "cohort:manage"
  // Content permissions
  | "content:create"
  | "content:read"
  | "content:update"
  | "content:publish"
  | "content:delete"
  // Revenue permissions
  | "revenue:view_own"
  | "revenue:view_all"
  | "revenue:dispute"
  | "revenue:approve"
  // Event permissions
  | "event:create"
  | "event:read"
  | "event:update"
  | "event:manage"
  // User management permissions
  | "user:create"
  | "user:read"
  | "user:update"
  | "user:delete"
  | "user:assign_role"
  // System permissions
  | "system:configure"
  | "system:monitor"
  | "system:audit_logs"
  // Routing permissions
  | "routing:configure"
  | "routing:override";

// ============================================================================
// Role Permission Matrix
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  sme_user: [
    "proof_pack:create",
    "proof_pack:read",
    "proof_pack:update",
    "proof_pack:delete",
    "proof_pack:submit",
    "proof_pack:share",
    "introduction:request",
    "introduction:read",
    "introduction:respond",
    "cohort:read",
    "cohort:enroll",
    "content:read",
    "revenue:view_own",
    "event:read",
  ],
  consortium_partner: [
    "proof_pack:read",
    "lead:read",
    "lead:update",
    "lead:assign",
    "introduction:read",
    "introduction:view_all",
    "cohort:read",
    "content:read",
    "revenue:view_own",
    "revenue:dispute",
    "event:read",
  ],
  qa_reviewer: [
    "proof_pack:read",
    "proof_pack:review",
    "proof_pack:approve",
    "content:read",
    "event:read",
  ],
  buyer: [
    "proof_pack:read",
    "introduction:request",
    "introduction:read",
    "cohort:read",
    "content:read",
    "event:read",
  ],
  cmmc_instructor: [
    "cohort:create",
    "cohort:read",
    "cohort:update",
    "cohort:manage",
    "content:create",
    "content:read",
    "content:update",
    "content:publish",
    "event:read",
  ],
  marketing_staff: [
    "content:create",
    "content:read",
    "content:update",
    "content:publish",
    "content:delete",
    "event:create",
    "event:read",
    "event:update",
    "event:manage",
  ],
  platform_admin: [
    // All permissions
    "proof_pack:create",
    "proof_pack:read",
    "proof_pack:update",
    "proof_pack:delete",
    "proof_pack:submit",
    "proof_pack:review",
    "proof_pack:approve",
    "proof_pack:share",
    "lead:create",
    "lead:read",
    "lead:update",
    "lead:assign",
    "lead:view_all",
    "introduction:request",
    "introduction:read",
    "introduction:respond",
    "introduction:view_all",
    "cohort:create",
    "cohort:read",
    "cohort:update",
    "cohort:enroll",
    "cohort:manage",
    "content:create",
    "content:read",
    "content:update",
    "content:publish",
    "content:delete",
    "revenue:view_own",
    "revenue:view_all",
    "revenue:dispute",
    "revenue:approve",
    "event:create",
    "event:read",
    "event:update",
    "event:manage",
    "user:create",
    "user:read",
    "user:update",
    "user:delete",
    "user:assign_role",
    "system:configure",
    "system:monitor",
    "system:audit_logs",
    "routing:configure",
    "routing:override",
  ],
};

// ============================================================================
// Firestore Permission Document Structure
// ============================================================================

export interface UserPermissionsDoc {
  id: string;
  userId: string;
  role: UserRole;
  
  // Base permissions from role
  basePermissions: Permission[];
  
  // Additional custom permissions
  customPermissions: Permission[];
  
  // Partner-specific assignments (for consortium partners)
  partnerAssignments?: {
    partnerId: string;
    assignedSmeIds: string[];
    verticals: string[];
  };
  
  // Subscription tier (for SME users)
  subscriptionTier?: "free" | "diy" | "dwy" | "dfy";
  
  // Tenant isolation
  tenantId: string;
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastRoleChange?: Timestamp;
}

// ============================================================================
// Custom Claims Structure
// ============================================================================

export interface CustomClaims {
  role: UserRole;
  tenantId: string;
  isActive: boolean;
}
