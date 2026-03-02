/**
 * Automated Performance Alerts
 * 
 * Monitors system metrics and sends alerts when thresholds are exceeded
 */

import { db } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { getCurrentSystemHealth } from "./monitoring";

// ============================================================================
// Alert Types
// ============================================================================

export interface AlertConfig {
  id: string;
  
  // Alert thresholds
  apiResponseTimeThreshold: number; // ms (default: 500)
  errorRateThreshold: number; // percentage (default: 1)
  uptimeThreshold: number; // percentage (default: 99.9)
  dbQueryTimeThreshold: number; // ms (default: 1000)
  
  // Alert conditions
  consecutiveMinutesRequired: number; // default: 5
  
  // Notification settings
  emailEnabled: boolean;
  adminEmails: string[];
  
  // Alert cooldown (prevent spam)
  cooldownMinutes: number; // default: 30
  
  isActive: boolean;
  updatedAt: Timestamp;
}

export interface Alert {
  id: string;
  type: "api_response_time" | "error_rate" | "uptime" | "db_query_time";
  severity: "warning" | "critical";
  
  // Metric details
  currentValue: number;
  threshold: number;
  
  // Alert metadata
  message: string;
  details: Record<string, any>;
  
  // Status
  status: "active" | "resolved" | "acknowledged";
  
  // Timestamps
  triggeredAt: Timestamp;
  resolvedAt?: Timestamp;
  acknowledgedAt?: Timestamp;
  acknowledgedBy?: string;
  
  // Notification tracking
  emailSent: boolean;
  emailSentAt?: Timestamp;
  
  createdAt: Timestamp;
}

export interface AlertHistory {
  id: string;
  alertId: string;
  type: string;
  triggeredAt: Timestamp;
  resolvedAt?: Timestamp;
  duration?: number; // minutes
  maxValue: number;
  threshold: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  id: "default",
  apiResponseTimeThreshold: 500,
  errorRateThreshold: 1,
  uptimeThreshold: 99.9,
  dbQueryTimeThreshold: 1000,
  consecutiveMinutesRequired: 5,
  emailEnabled: true,
  adminEmails: [],
  cooldownMinutes: 30,
  isActive: true,
  updatedAt: Timestamp.now(),
};

// ============================================================================
// Alert Configuration Management
// ============================================================================

/**
 * Get alert configuration
 */
export async function getAlertConfig(): Promise<AlertConfig> {
  try {
    const configDoc = await db.collection("alertConfig").doc("main").get();
    
    if (!configDoc.exists) {
      // Initialize with defaults
      await db.collection("alertConfig").doc("main").set(DEFAULT_ALERT_CONFIG);
      return DEFAULT_ALERT_CONFIG;
    }
    
    return configDoc.data() as AlertConfig;
  } catch (error) {
    console.error("Error getting alert config:", error);
    return DEFAULT_ALERT_CONFIG;
  }
}

/**
 * Update alert configuration
 */
export async function updateAlertConfig(
  config: Partial<AlertConfig>,
  updatedBy: string
): Promise<void> {
  try {
    await db.collection("alertConfig").doc("main").update({
      ...config,
      updatedAt: Timestamp.now(),
    });
    
    // Log audit event
    await db.collection("auditLogs").add({
      userId: updatedBy,
      action: "alert_config_updated",
      resource: "alert_config",
      resourceId: "main",
      details: config,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating alert config:", error);
    throw new Error("Failed to update alert configuration");
  }
}

// ============================================================================
// Alert Monitoring
// ============================================================================

/**
 * Check system metrics and trigger alerts if thresholds exceeded
 */
export async function checkAndTriggerAlerts(): Promise<void> {
  try {
    const config = await getAlertConfig();
    
    if (!config.isActive) {
      return;
    }
    
    const health = await getCurrentSystemHealth();
    
    // Check API response time
    if (health.apiResponseTime95p > config.apiResponseTimeThreshold) {
      await checkConsecutiveViolation(
        "api_response_time",
        health.apiResponseTime95p,
        config.apiResponseTimeThreshold,
        config.consecutiveMinutesRequired,
        config
      );
    }
    
    // Check error rate
    if (health.errorRate > config.errorRateThreshold) {
      await checkConsecutiveViolation(
        "error_rate",
        health.errorRate,
        config.errorRateThreshold,
        config.consecutiveMinutesRequired,
        config
      );
    }
    
    // Check uptime
    if (health.uptimePercentage < config.uptimeThreshold) {
      await checkConsecutiveViolation(
        "uptime",
        health.uptimePercentage,
        config.uptimeThreshold,
        config.consecutiveMinutesRequired,
        config
      );
    }
  } catch (error) {
    console.error("Error checking alerts:", error);
  }
}

/**
 * Check if metric has violated threshold for consecutive minutes
 */
async function checkConsecutiveViolation(
  type: Alert["type"],
  currentValue: number,
  threshold: number,
  consecutiveMinutes: number,
  config: AlertConfig
): Promise<void> {
  try {
    // Check if there's already an active alert
    const activeAlertSnapshot = await db
      .collection("alerts")
      .where("type", "==", type)
      .where("status", "==", "active")
      .limit(1)
      .get();
    
    if (!activeAlertSnapshot.empty) {
      // Alert already active
      return;
    }
    
    // Check if in cooldown period
    const recentAlertSnapshot = await db
      .collection("alerts")
      .where("type", "==", type)
      .orderBy("triggeredAt", "desc")
      .limit(1)
      .get();
    
    if (!recentAlertSnapshot.empty) {
      const lastAlert = recentAlertSnapshot.docs[0].data() as Alert;
      const cooldownEnd = Timestamp.fromMillis(
        lastAlert.triggeredAt.toMillis() + config.cooldownMinutes * 60 * 1000
      );
      
      if (Timestamp.now().toMillis() < cooldownEnd.toMillis()) {
        // Still in cooldown period
        return;
      }
    }
    
    // Check consecutive violations
    const violationKey = `violation_${type}`;
    const violationDoc = await db.collection("alertViolations").doc(violationKey).get();
    
    let violationCount = 1;
    let firstViolationTime = Timestamp.now();
    
    if (violationDoc.exists) {
      const data = violationDoc.data();
      const lastViolation = data?.lastViolation as Timestamp;
      
      // Check if violation is consecutive (within last 2 minutes)
      if (Timestamp.now().toMillis() - lastViolation.toMillis() < 2 * 60 * 1000) {
        violationCount = (data?.count || 0) + 1;
        firstViolationTime = data?.firstViolation || Timestamp.now();
      } else {
        // Reset count if not consecutive
        violationCount = 1;
        firstViolationTime = Timestamp.now();
      }
    }
    
    // Update violation tracking
    await db.collection("alertViolations").doc(violationKey).set({
      count: violationCount,
      firstViolation: firstViolationTime,
      lastViolation: Timestamp.now(),
      currentValue,
      threshold,
    });
    
    // Trigger alert if consecutive minutes threshold met
    if (violationCount >= consecutiveMinutes) {
      await triggerAlert(type, currentValue, threshold, config);
      
      // Reset violation count
      await db.collection("alertViolations").doc(violationKey).delete();
    }
  } catch (error) {
    console.error("Error checking consecutive violation:", error);
  }
}

/**
 * Trigger an alert
 */
async function triggerAlert(
  type: Alert["type"],
  currentValue: number,
  threshold: number,
  config: AlertConfig
): Promise<void> {
  try {
    const severity = getSeverity(type, currentValue, threshold);
    const message = getAlertMessage(type, currentValue, threshold);
    
    const alert: Omit<Alert, "id"> = {
      type,
      severity,
      currentValue,
      threshold,
      message,
      details: {
        timestamp: Timestamp.now().toDate().toISOString(),
      },
      status: "active",
      triggeredAt: Timestamp.now(),
      emailSent: false,
      createdAt: Timestamp.now(),
    };
    
    // Save alert
    const alertRef = await db.collection("alerts").add(alert);
    
    // Send email notification
    if (config.emailEnabled && config.adminEmails.length > 0) {
      await sendAlertEmail(
        { id: alertRef.id, ...alert } as Alert,
        config.adminEmails
      );
      
      // Update alert with email sent status
      await alertRef.update({
        emailSent: true,
        emailSentAt: Timestamp.now(),
      });
    }
    
    // Log alert in audit trail
    await db.collection("auditLogs").add({
      userId: "system",
      action: "alert_triggered",
      resource: "alert",
      resourceId: alertRef.id,
      details: { type, currentValue, threshold, severity },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error triggering alert:", error);
  }
}

/**
 * Determine alert severity
 */
function getSeverity(
  type: Alert["type"],
  currentValue: number,
  threshold: number
): Alert["severity"] {
  const ratio = type === "uptime"
    ? (threshold - currentValue) / threshold
    : (currentValue - threshold) / threshold;
  
  return ratio > 0.5 ? "critical" : "warning";
}

/**
 * Generate alert message
 */
function getAlertMessage(
  type: Alert["type"],
  currentValue: number,
  threshold: number
): string {
  switch (type) {
    case "api_response_time":
      return `API response time (${currentValue.toFixed(0)}ms) exceeds threshold (${threshold}ms)`;
    case "error_rate":
      return `Error rate (${currentValue.toFixed(2)}%) exceeds threshold (${threshold}%)`;
    case "uptime":
      return `Uptime (${currentValue.toFixed(2)}%) below threshold (${threshold}%)`;
    case "db_query_time":
      return `Database query time (${currentValue.toFixed(0)}ms) exceeds threshold (${threshold}ms)`;
    default:
      return `Performance metric exceeded threshold`;
  }
}

/**
 * Send alert email notification
 */
async function sendAlertEmail(alert: Alert, recipients: string[]): Promise<void> {
  try {
    // Store email notification request
    await db.collection("emailQueue").add({
      to: recipients,
      subject: `[${alert.severity.toUpperCase()}] Platform Performance Alert: ${alert.type}`,
      body: `
        <h2>Performance Alert Triggered</h2>
        <p><strong>Type:</strong> ${alert.type}</p>
        <p><strong>Severity:</strong> ${alert.severity}</p>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Current Value:</strong> ${alert.currentValue}</p>
        <p><strong>Threshold:</strong> ${alert.threshold}</p>
        <p><strong>Triggered At:</strong> ${alert.triggeredAt.toDate().toISOString()}</p>
        <hr>
        <p>Please investigate and take appropriate action.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/admin/monitoring">View Monitoring Dashboard</a></p>
      `,
      createdAt: Timestamp.now(),
      status: "pending",
    });
  } catch (error) {
    console.error("Error sending alert email:", error);
  }
}

/**
 * Resolve an alert
 */
export async function resolveAlert(alertId: string): Promise<void> {
  try {
    await db.collection("alerts").doc(alertId).update({
      status: "resolved",
      resolvedAt: Timestamp.now(),
    });
    
    // Create alert history entry
    const alertDoc = await db.collection("alerts").doc(alertId).get();
    const alert = alertDoc.data() as Alert;
    
    const duration = Math.floor(
      (Timestamp.now().toMillis() - alert.triggeredAt.toMillis()) / (60 * 1000)
    );
    
    await db.collection("alertHistory").add({
      alertId,
      type: alert.type,
      triggeredAt: alert.triggeredAt,
      resolvedAt: Timestamp.now(),
      duration,
      maxValue: alert.currentValue,
      threshold: alert.threshold,
    });
  } catch (error) {
    console.error("Error resolving alert:", error);
    throw new Error("Failed to resolve alert");
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(
  alertId: string,
  userId: string
): Promise<void> {
  try {
    await db.collection("alerts").doc(alertId).update({
      status: "acknowledged",
      acknowledgedAt: Timestamp.now(),
      acknowledgedBy: userId,
    });
    
    // Log audit event
    await db.collection("auditLogs").add({
      userId,
      action: "alert_acknowledged",
      resource: "alert",
      resourceId: alertId,
      details: {},
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error acknowledging alert:", error);
    throw new Error("Failed to acknowledge alert");
  }
}

/**
 * Get active alerts
 */
export async function getActiveAlerts(): Promise<Alert[]> {
  try {
    const alertsSnapshot = await db
      .collection("alerts")
      .where("status", "==", "active")
      .orderBy("triggeredAt", "desc")
      .get();
    
    return alertsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Alert[];
  } catch (error) {
    console.error("Error getting active alerts:", error);
    return [];
  }
}
