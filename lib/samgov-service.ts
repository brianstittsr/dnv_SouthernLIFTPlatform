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

async function samgovRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const config = await getSamGovConfig();
  if (!config) {
    throw new Error(
      "SAM.gov integration is not configured. Add the API key and Server URL in Settings > Integrations."
    );
  }

  const res = await fetch(`${config.serverUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": config.apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({} as { error?: string }));
    throw new Error(`SAM.gov API error (${res.status}): ${errData.error || res.statusText}`);
  }

  return res.json() as Promise<T>;
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
