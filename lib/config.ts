/**
 * System Configuration Management
 * 
 * Centralized configuration for platform settings that can be
 * adjusted without code deployments
 */

import { db } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

// ============================================================================
// Configuration Types
// ============================================================================

export interface IndustryCategory {
  id: string;
  name: string;
  description?: string;
  naicsCodes?: string[];
  isActive: boolean;
}

export interface RevenueShareConfig {
  id: string;
  name: string;
  platformFeePercentage: number; // Default: 10%
  partnerSharePercentage: number; // Default: 90%
  
  // Revenue type specific overrides
  leadGenerationFee?: number;
  serviceDeliveryFee?: number;
  introductionFee?: number;
  
  isDefault: boolean;
  updatedAt: Timestamp;
}

export interface PackHealthConfig {
  id: string;
  
  // Thresholds
  introEligibilityThreshold: number; // Default: 70
  criticalThreshold: number; // Default: 40
  warningThreshold: number; // Default: 70
  
  // Scoring weights
  completenessWeight: number; // Default: 40%
  expirationWeight: number; // Default: 30%
  qualityWeight: number; // Default: 20%
  remediationWeight: number; // Default: 10%
  
  updatedAt: Timestamp;
}

export interface PartnerVerticalAssignment {
  id: string;
  partnerId: string;
  partnerName: string;
  
  // Assigned verticals (6 verticals)
  verticals: string[];
  
  // Service capabilities
  capabilities: string[];
  
  // Geographic coverage
  geographicCoverage?: string[];
  
  isActive: boolean;
  updatedAt: Timestamp;
}

export interface SystemConfig {
  id: string;
  
  // Industry categories
  industries: IndustryCategory[];
  
  // Revenue configuration
  revenueConfig: RevenueShareConfig;
  
  // Pack Health configuration
  packHealthConfig: PackHealthConfig;
  
  // Partner assignments
  partnerAssignments: PartnerVerticalAssignment[];
  
  // Platform-wide settings
  settings: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    maxUploadSizeMB: number;
    sessionTimeoutMinutes: number;
  };
  
  updatedAt: Timestamp;
  updatedBy: string;
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_INDUSTRIES: IndustryCategory[] = [
  {
    id: "aerospace",
    name: "Aerospace & Defense",
    description: "Aircraft, spacecraft, defense systems",
    naicsCodes: ["3364", "3366"],
    isActive: true,
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Information security, network security",
    naicsCodes: ["541512", "541519"],
    isActive: true,
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    description: "Industrial manufacturing, production",
    naicsCodes: ["3332", "3333"],
    isActive: true,
  },
  {
    id: "it_services",
    name: "IT Services",
    description: "Software development, IT consulting",
    naicsCodes: ["541511", "541512"],
    isActive: true,
  },
  {
    id: "logistics",
    name: "Logistics & Supply Chain",
    description: "Transportation, warehousing, distribution",
    naicsCodes: ["484", "493"],
    isActive: true,
  },
  {
    id: "professional_services",
    name: "Professional Services",
    description: "Consulting, advisory, professional services",
    naicsCodes: ["541", "5416"],
    isActive: true,
  },
];

export const DEFAULT_REVENUE_CONFIG: RevenueShareConfig = {
  id: "default",
  name: "Default Revenue Share",
  platformFeePercentage: 10,
  partnerSharePercentage: 90,
  leadGenerationFee: 500,
  serviceDeliveryFee: 1000,
  introductionFee: 250,
  isDefault: true,
  updatedAt: Timestamp.now(),
};

export const DEFAULT_PACK_HEALTH_CONFIG: PackHealthConfig = {
  id: "default",
  introEligibilityThreshold: 70,
  criticalThreshold: 40,
  warningThreshold: 70,
  completenessWeight: 40,
  expirationWeight: 30,
  qualityWeight: 20,
  remediationWeight: 10,
  updatedAt: Timestamp.now(),
};

// ============================================================================
// Configuration Management Functions
// ============================================================================

/**
 * Get system configuration
 */
export async function getSystemConfig(): Promise<SystemConfig | null> {
  try {
    const configDoc = await db.collection("systemConfig").doc("main").get();
    
    if (!configDoc.exists) {
      // Initialize with defaults
      const defaultConfig: SystemConfig = {
        id: "main",
        industries: DEFAULT_INDUSTRIES,
        revenueConfig: DEFAULT_REVENUE_CONFIG,
        packHealthConfig: DEFAULT_PACK_HEALTH_CONFIG,
        partnerAssignments: [],
        settings: {
          maintenanceMode: false,
          registrationEnabled: true,
          maxUploadSizeMB: 10,
          sessionTimeoutMinutes: 60,
        },
        updatedAt: Timestamp.now(),
        updatedBy: "system",
      };
      
      await db.collection("systemConfig").doc("main").set(defaultConfig);
      return defaultConfig;
    }
    
    return configDoc.data() as SystemConfig;
  } catch (error) {
    console.error("Error getting system config:", error);
    return null;
  }
}

/**
 * Update industry categories
 */
export async function updateIndustries(
  industries: IndustryCategory[],
  updatedBy: string
): Promise<void> {
  try {
    await db.collection("systemConfig").doc("main").update({
      industries,
      updatedAt: Timestamp.now(),
      updatedBy,
    });
    
    // Log audit event
    await db.collection("auditLogs").add({
      userId: updatedBy,
      action: "config_updated",
      resource: "system_config",
      resourceId: "industries",
      details: { industriesCount: industries.length },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating industries:", error);
    throw new Error("Failed to update industries");
  }
}

/**
 * Update revenue share configuration
 */
export async function updateRevenueConfig(
  revenueConfig: RevenueShareConfig,
  updatedBy: string
): Promise<void> {
  try {
    // Validate percentages
    if (revenueConfig.platformFeePercentage + revenueConfig.partnerSharePercentage !== 100) {
      throw new Error("Platform fee and partner share must total 100%");
    }
    
    await db.collection("systemConfig").doc("main").update({
      revenueConfig: {
        ...revenueConfig,
        updatedAt: Timestamp.now(),
      },
      updatedAt: Timestamp.now(),
      updatedBy,
    });
    
    // Log audit event
    await db.collection("auditLogs").add({
      userId: updatedBy,
      action: "config_updated",
      resource: "system_config",
      resourceId: "revenue_config",
      details: {
        platformFeePercentage: revenueConfig.platformFeePercentage,
        partnerSharePercentage: revenueConfig.partnerSharePercentage,
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating revenue config:", error);
    throw error;
  }
}

/**
 * Update Pack Health configuration
 */
export async function updatePackHealthConfig(
  packHealthConfig: PackHealthConfig,
  updatedBy: string
): Promise<void> {
  try {
    // Validate weights total 100%
    const totalWeight =
      packHealthConfig.completenessWeight +
      packHealthConfig.expirationWeight +
      packHealthConfig.qualityWeight +
      packHealthConfig.remediationWeight;
    
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error("Pack Health weights must total 100%");
    }
    
    await db.collection("systemConfig").doc("main").update({
      packHealthConfig: {
        ...packHealthConfig,
        updatedAt: Timestamp.now(),
      },
      updatedAt: Timestamp.now(),
      updatedBy,
    });
    
    // Log audit event
    await db.collection("auditLogs").add({
      userId: updatedBy,
      action: "config_updated",
      resource: "system_config",
      resourceId: "pack_health_config",
      details: {
        introEligibilityThreshold: packHealthConfig.introEligibilityThreshold,
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating Pack Health config:", error);
    throw error;
  }
}

/**
 * Update partner vertical assignments
 */
export async function updatePartnerAssignments(
  partnerAssignments: PartnerVerticalAssignment[],
  updatedBy: string
): Promise<void> {
  try {
    await db.collection("systemConfig").doc("main").update({
      partnerAssignments,
      updatedAt: Timestamp.now(),
      updatedBy,
    });
    
    // Log audit event
    await db.collection("auditLogs").add({
      userId: updatedBy,
      action: "config_updated",
      resource: "system_config",
      resourceId: "partner_assignments",
      details: { partnersCount: partnerAssignments.length },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating partner assignments:", error);
    throw new Error("Failed to update partner assignments");
  }
}

/**
 * Update platform settings
 */
export async function updatePlatformSettings(
  settings: SystemConfig["settings"],
  updatedBy: string
): Promise<void> {
  try {
    await db.collection("systemConfig").doc("main").update({
      settings,
      updatedAt: Timestamp.now(),
      updatedBy,
    });
    
    // Log audit event
    await db.collection("auditLogs").add({
      userId: updatedBy,
      action: "config_updated",
      resource: "system_config",
      resourceId: "platform_settings",
      details: settings,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating platform settings:", error);
    throw new Error("Failed to update platform settings");
  }
}
