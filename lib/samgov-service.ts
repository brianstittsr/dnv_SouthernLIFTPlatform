import { getSamGovConfig } from "@/lib/sam-gov-config";

/**
 * Thin client for the Cgray SAM.gov proxy server.
 * Reads the API key + server URL from Settings > Integrations > SAM.gov API Server
 * (persisted in platformSettings/global, see lib/sam-gov-config.ts).
 */

export interface SamGovSearchParams {
  q?: string;
  qMode?: "ALL" | "EXACT" | "ANY";
  page?: number;
  size?: number;
  sort?: string;
  is_active?: boolean;
  naics?: string;
  psc?: string;
  notice_type?: string;
  "response_date.from"?: string;
  "response_date.to"?: string;
  "modified_date.from"?: string;
  "modified_date.to"?: string;
  [key: string]: unknown;
}

export interface SamGovOpportunity {
  noticeId: string;
  id?: string;
  title: string;
  type?: string;
  solicitationNumber?: string;
  organizationHierarchy?: string;
  postedDate?: string;
  responseDeadLine?: string;
  naicsCode?: string;
  classificationCode?: string;
  typeOfSetAsideDescription?: string;
  description?: string;
  uiLink?: string;
  active?: string | boolean;
  [key: string]: unknown;
}

export interface SamGovSearchResponse {
  opportunitiesData: SamGovOpportunity[];
  pagination?: {
    totalElements?: number;
    totalPages?: number;
    number?: number;
    size?: number;
  };
  error?: string;
}

const REQUEST_TIMEOUT_MS = 60_000; // cold Vercel functions on the proxy can be slow

async function samgovRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const config = await getSamGovConfig();
  if (!config) {
    throw new Error(
      "SAM.gov integration is not configured. Add the API key and Server URL in Settings > Integrations."
    );
  }

  let res: Response;
  try {
    res = await fetch(`${config.serverUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(`SAM.gov API timed out after ${REQUEST_TIMEOUT_MS / 1000}s (${config.serverUrl})`);
    }
    throw new Error(
      `Could not reach SAM.gov API Server at ${config.serverUrl}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;

  if (!res.ok) {
    throw new Error(`SAM.gov API error (${res.status}): ${data?.error || res.statusText}`);
  }
  // The proxy sometimes returns HTTP 200 with an error payload
  if (data && typeof data === "object" && typeof data.error === "string" && data.error) {
    throw new Error(`SAM.gov API error: ${data.error}`);
  }
  if (data === null) {
    throw new Error("SAM.gov API returned an empty or non-JSON response");
  }

  return data as T;
}

/** Run a broad opportunity search against the Cgray SAM.gov proxy. */
export async function searchSamGovOpportunities(
  params: SamGovSearchParams
): Promise<SamGovSearchResponse> {
  return samgovRequest<SamGovSearchResponse>("/api/search", {
    random: Date.now(),
    index: "opp",
    responseType: "json",
    is_active: true,
    page: 0,
    size: 100,
    sort: "-modifiedDate",
    ...params,
  });
}

/** Fetch full detail for a single opportunity by notice ID. */
export async function getSamGovOpportunityDetail(
  noticeId: string
): Promise<Record<string, unknown>> {
  return samgovRequest<Record<string, unknown>>(`/api/opportunity/${noticeId}`, {});
}

/** Look up a NAICS code's title/description. */
export async function lookupNaicsCode(q: string): Promise<Record<string, unknown>> {
  return samgovRequest<Record<string, unknown>>("/api/naics", { q });
}

/** True if the SAM.gov integration has been configured in Settings. */
export async function isSamGovConfigured(): Promise<boolean> {
  const config = await getSamGovConfig();
  return !!config;
}
