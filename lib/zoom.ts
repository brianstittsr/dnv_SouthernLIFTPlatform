/**
 * Zoom Server-to-Server OAuth integration for the LMS.
 *
 * Meeting management + attendance data tracking for course sessions:
 * create a Zoom meeting per session, then pull past-meeting participants
 * to record attendance minutes.
 *
 * Credentials resolve from platformSettings.integrations.zoom first, then
 * env vars. Supports both modern names (accountId/clientId/clientSecret)
 * and the legacy settings keys (apiKey/apiSecret) so an existing settings
 * doc keeps working.
 *
 * Setup: Zoom Marketplace → Build App → Server-to-Server OAuth →
 * scopes: meeting:write:meeting (or meeting:write:meeting:admin),
 * report:read:meeting_participants (or report:read:meeting_participant:admin).
 */
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

interface ZoomCredentials {
  accountId: string;
  clientId: string;
  clientSecret: string;
}

interface ZoomTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface ZoomMeeting {
  id: number;
  join_url: string;
  start_url: string;
  topic: string;
  start_time: string;
  duration: number;
}

export interface ZoomParticipant {
  name: string;
  user_email?: string;
  join_time?: string;
  leave_time?: string;
  duration?: number; // seconds
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getCredentials(): Promise<ZoomCredentials | null> {
  let settings: Record<string, string> | null = null;
  if (db) {
    try {
      const snap = await db.collection(COLLECTIONS.PLATFORM_SETTINGS).doc("global").get();
      const zoom = snap.data()?.integrations?.zoom;
      if (zoom && typeof zoom === "object") settings = zoom as Record<string, string>;
    } catch {
      // fall through to env
    }
  }
  const accountId = settings?.accountId || process.env.ZOOM_ACCOUNT_ID || "";
  const clientId =
    settings?.clientId || settings?.apiKey || process.env.ZOOM_CLIENT_ID || process.env.ZOOM_API_KEY || "";
  const clientSecret =
    settings?.clientSecret ||
    settings?.apiSecret ||
    process.env.ZOOM_CLIENT_SECRET ||
    process.env.ZOOM_API_SECRET ||
    "";
  if (!accountId || !clientId || !clientSecret) return null;
  return { accountId, clientId, clientSecret };
}

export async function isZoomConfigured(): Promise<boolean> {
  return (await getCredentials()) !== null;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const creds = await getCredentials();
  if (!creds) throw new Error("Zoom is not configured");

  const params = new URLSearchParams({
    grant_type: "account_credentials",
    account_id: creds.accountId,
  });
  const response = await fetch(`https://zoom.us/oauth/token?${params.toString()}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Zoom auth failed (${response.status})`);
  }
  const data = (await response.json()) as ZoomTokenResponse;
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function zoomRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`https://api.zoom.us/v2${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Zoom API ${path} failed (${response.status}): ${body.slice(0, 200)}`);
  }
  return (await response.json()) as T;
}

/** Creates a scheduled Zoom meeting under the app's host user. */
export async function createMeeting(params: {
  topic: string;
  startTime: Date;
  durationMinutes: number;
  timezone?: string;
}): Promise<ZoomMeeting> {
  return zoomRequest<ZoomMeeting>("/users/me/meetings", {
    method: "POST",
    body: JSON.stringify({
      topic: params.topic,
      type: 2, // scheduled
      start_time: params.startTime.toISOString(),
      duration: params.durationMinutes,
      timezone: params.timezone || "America/Chicago",
      settings: {
        join_before_host: false,
        waiting_room: true,
        registrants_email_notification: false,
      },
    }),
  });
}

interface ParticipantsPage {
  participants: ZoomParticipant[];
  next_page_token?: string;
}

/** Pulls join/leave/duration records for a finished meeting (all pages). */
export async function getPastMeetingParticipants(meetingId: string | number): Promise<ZoomParticipant[]> {
  const all: ZoomParticipant[] = [];
  let pageToken = "";
  do {
    const page = await zoomRequest<ParticipantsPage>(
      `/past_meetings/${encodeURIComponent(String(meetingId))}/participants?page_size=300${pageToken ? `&next_page_token=${pageToken}` : ""}`
    );
    all.push(...(page.participants || []));
    pageToken = page.next_page_token || "";
  } while (pageToken);
  return all;
}
