import { db } from "@/lib/firebase-admin";

/**
 * Shared helper for reading the SAM.gov API proxy configuration
 * (API key + server URL) from platform settings. Used by any server
 * route that needs to call the SAM.gov API Server.
 */
export interface SamGovConfig {
  apiKey: string;
  serverUrl: string;
}

export async function getSamGovConfig(): Promise<SamGovConfig | null> {
  try {
    if (!db) return null;

    const settingsDoc = await db.collection("platformSettings").doc("global").get();

    if (!settingsDoc.exists) {
      return null;
    }

    const data = settingsDoc.data();
    const samgov = data?.integrations?.samgov;

    if (!samgov?.apiKey || !samgov?.serverUrl) {
      return null;
    }

    return {
      apiKey: samgov.apiKey,
      serverUrl: samgov.serverUrl.replace(/\/$/, ""),
    };
  } catch (error) {
    console.error("Error fetching SAM.gov config:", error);
    return null;
  }
}
