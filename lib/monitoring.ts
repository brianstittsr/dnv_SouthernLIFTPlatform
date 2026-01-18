/**
 * System Health Monitoring
 * 
 * Tracks and stores system metrics for monitoring dashboard
 */

import { db } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

// ============================================================================
// Metric Types
// ============================================================================

export interface SystemMetric {
  id: string;
  timestamp: Timestamp;
  
  // API Performance
  apiResponseTime95p: number; // 95th percentile in ms
  apiResponseTimeAvg: number; // Average in ms
  apiRequestCount: number;
  
  // Error Tracking
  errorCount: number;
  errorRate: number; // Percentage
  recentErrors: Array<{
    timestamp: Timestamp;
    endpoint: string;
    error: string;
    statusCode: number;
  }>;
  
  // Uptime
  uptimePercentage: number; // 0-100
  isHealthy: boolean;
  
  // Database Performance
  dbQueryCount: number;
  dbQueryTimeAvg: number; // Average in ms
  dbQueryTime95p: number; // 95th percentile in ms
  
  // User Activity
  concurrentUsers: number;
  activeUsers: number;
  
  // System Resources
  memoryUsage?: number; // MB
  cpuUsage?: number; // Percentage
  
  createdAt: Timestamp;
}

export interface UptimeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  uptimePercentage: number;
  totalDowntimeMinutes: number;
  incidentCount: number;
  createdAt: Timestamp;
}

// ============================================================================
// Metric Collection
// ============================================================================

/**
 * Record API request metrics
 */
export async function recordApiMetric(
  endpoint: string,
  responseTime: number,
  statusCode: number,
  error?: string
): Promise<void> {
  try {
    await db.collection("apiMetrics").add({
      endpoint,
      responseTime,
      statusCode,
      error: error || null,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (err) {
    console.error("Error recording API metric:", err);
  }
}

/**
 * Record database query metrics
 */
export async function recordDbMetric(
  collection: string,
  operation: string,
  queryTime: number
): Promise<void> {
  try {
    await db.collection("dbMetrics").add({
      collection,
      operation,
      queryTime,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (err) {
    console.error("Error recording DB metric:", err);
  }
}

/**
 * Calculate and store aggregated system metrics
 */
export async function aggregateSystemMetrics(): Promise<void> {
  try {
    const now = Timestamp.now();
    const fiveMinutesAgo = Timestamp.fromMillis(now.toMillis() - 5 * 60 * 1000);

    // Fetch recent API metrics
    const apiMetricsSnapshot = await db
      .collection("apiMetrics")
      .where("timestamp", ">=", fiveMinutesAgo)
      .get();

    const apiMetrics = apiMetricsSnapshot.docs.map((doc) => doc.data());
    
    // Calculate API metrics
    const responseTimes = apiMetrics.map((m: any) => m.responseTime).sort((a, b) => a - b);
    const apiResponseTime95p = responseTimes.length > 0
      ? responseTimes[Math.floor(responseTimes.length * 0.95)]
      : 0;
    const apiResponseTimeAvg = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
    
    // Calculate error metrics
    const errorMetrics = apiMetrics.filter((m: any) => m.statusCode >= 400);
    const errorRate = apiMetrics.length > 0
      ? (errorMetrics.length / apiMetrics.length) * 100
      : 0;
    
    const recentErrors = errorMetrics.slice(-10).map((m: any) => ({
      timestamp: m.timestamp,
      endpoint: m.endpoint,
      error: m.error || "Unknown error",
      statusCode: m.statusCode,
    }));

    // Fetch recent DB metrics
    const dbMetricsSnapshot = await db
      .collection("dbMetrics")
      .where("timestamp", ">=", fiveMinutesAgo)
      .get();

    const dbMetrics = dbMetricsSnapshot.docs.map((doc) => doc.data());
    const dbQueryTimes = dbMetrics.map((m: any) => m.queryTime).sort((a, b) => a - b);
    const dbQueryTime95p = dbQueryTimes.length > 0
      ? dbQueryTimes[Math.floor(dbQueryTimes.length * 0.95)]
      : 0;
    const dbQueryTimeAvg = dbQueryTimes.length > 0
      ? dbQueryTimes.reduce((a, b) => a + b, 0) / dbQueryTimes.length
      : 0;

    // Calculate uptime (based on error rate and response time)
    const isHealthy = errorRate < 1 && apiResponseTime95p < 500;
    const uptimePercentage = isHealthy ? 100 : 99.5;

    // Get concurrent users (from active sessions)
    const activeSessionsSnapshot = await db
      .collection("activeSessions")
      .where("lastActivity", ">=", fiveMinutesAgo)
      .get();
    const concurrentUsers = activeSessionsSnapshot.size;

    // Store aggregated metric
    await db.collection("systemMetrics").add({
      timestamp: now,
      apiResponseTime95p,
      apiResponseTimeAvg,
      apiRequestCount: apiMetrics.length,
      errorCount: errorMetrics.length,
      errorRate,
      recentErrors,
      uptimePercentage,
      isHealthy,
      dbQueryCount: dbMetrics.length,
      dbQueryTimeAvg,
      dbQueryTime95p,
      concurrentUsers,
      activeUsers: concurrentUsers,
      createdAt: now,
    });

    // Update daily uptime record
    await updateDailyUptime(uptimePercentage, !isHealthy);
  } catch (err) {
    console.error("Error aggregating system metrics:", err);
  }
}

/**
 * Update daily uptime record
 */
async function updateDailyUptime(
  currentUptime: number,
  hasIncident: boolean
): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const uptimeRef = db.collection("uptimeRecords").doc(today);
    const uptimeDoc = await uptimeRef.get();

    if (uptimeDoc.exists) {
      const data = uptimeDoc.data() as UptimeRecord;
      const downtimeMinutes = hasIncident ? 5 : 0; // 5-minute intervals
      
      await uptimeRef.update({
        uptimePercentage: (data.uptimePercentage + currentUptime) / 2,
        totalDowntimeMinutes: data.totalDowntimeMinutes + downtimeMinutes,
        incidentCount: data.incidentCount + (hasIncident ? 1 : 0),
      });
    } else {
      await uptimeRef.set({
        id: today,
        date: today,
        uptimePercentage: currentUptime,
        totalDowntimeMinutes: hasIncident ? 5 : 0,
        incidentCount: hasIncident ? 1 : 0,
        createdAt: Timestamp.now(),
      });
    }
  } catch (err) {
    console.error("Error updating daily uptime:", err);
  }
}

/**
 * Get system metrics for a time range
 */
export async function getSystemMetrics(
  timeRange: "hour" | "day" | "week" | "month"
): Promise<SystemMetric[]> {
  try {
    const now = Timestamp.now();
    let startTime: Timestamp;

    switch (timeRange) {
      case "hour":
        startTime = Timestamp.fromMillis(now.toMillis() - 60 * 60 * 1000);
        break;
      case "day":
        startTime = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        startTime = Timestamp.fromMillis(now.toMillis() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startTime = Timestamp.fromMillis(now.toMillis() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const metricsSnapshot = await db
      .collection("systemMetrics")
      .where("timestamp", ">=", startTime)
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    return metricsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SystemMetric[];
  } catch (err) {
    console.error("Error fetching system metrics:", err);
    return [];
  }
}

/**
 * Get uptime records for a time range
 */
export async function getUptimeRecords(days: number = 30): Promise<UptimeRecord[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    const uptimeSnapshot = await db
      .collection("uptimeRecords")
      .where("date", ">=", startDateStr)
      .orderBy("date", "desc")
      .get();

    return uptimeSnapshot.docs.map((doc) => doc.data()) as UptimeRecord[];
  } catch (err) {
    console.error("Error fetching uptime records:", err);
    return [];
  }
}

/**
 * Get current system health status
 */
export async function getCurrentSystemHealth(): Promise<{
  isHealthy: boolean;
  uptimePercentage: number;
  apiResponseTime95p: number;
  errorRate: number;
  concurrentUsers: number;
}> {
  try {
    const latestMetricSnapshot = await db
      .collection("systemMetrics")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (latestMetricSnapshot.empty) {
      return {
        isHealthy: true,
        uptimePercentage: 100,
        apiResponseTime95p: 0,
        errorRate: 0,
        concurrentUsers: 0,
      };
    }

    const metric = latestMetricSnapshot.docs[0].data() as SystemMetric;

    return {
      isHealthy: metric.isHealthy,
      uptimePercentage: metric.uptimePercentage,
      apiResponseTime95p: metric.apiResponseTime95p,
      errorRate: metric.errorRate,
      concurrentUsers: metric.concurrentUsers,
    };
  } catch (err) {
    console.error("Error fetching current system health:", err);
    return {
      isHealthy: false,
      uptimePercentage: 0,
      apiResponseTime95p: 0,
      errorRate: 0,
      concurrentUsers: 0,
    };
  }
}
