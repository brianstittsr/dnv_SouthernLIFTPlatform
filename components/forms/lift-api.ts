import type { FormValues, IntakeAiSummary, PublicFormSchema, UploadRef } from "@/lib/form-builder/types";

/** Error carrying field-level validation messages from the API. */
export class LiftApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly fieldErrors: Record<string, string> = {}) {
    super(message);
  }
}

/** Fetches JSON from a LIFT API route and unwraps `{ data }`, throwing LiftApiError on failure. */
export async function liftFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "same-origin", ...init });
  const body = (await response.json().catch(() => ({}))) as { data?: T; error?: string; fieldErrors?: Record<string, string> };
  if (!response.ok) throw new LiftApiError(body.error ?? "Request failed", response.status, body.fieldErrors ?? {});
  return body.data as T;
}

export interface RunnerFormPayload {
  form: PublicFormSchema;
  prefill: FormValues;
  viewer: { signedIn: boolean; isStaff: boolean; name: string | null };
  captchaSiteKey: string | null;
}

export interface SubmitResult {
  submissionId: string;
  liftClientId?: string;
  contentHash: string;
  completionMessage?: string;
  nextFormSlug?: string;
  aiSummary?: IntakeAiSummary;
}

const encode = encodeURIComponent;

export const liftApi = {
  loadForm: (slug: string) => liftFetch<RunnerFormPayload>(`/api/lift/forms/by-slug/${encode(slug)}`),
  loadDraft: (slug: string) => liftFetch<{ values: FormValues; stepIndex: number } | null>(`/api/lift/forms/by-slug/${encode(slug)}/drafts`),
  saveDraft: (slug: string, values: FormValues, stepIndex: number) =>
    liftFetch<{ saved: boolean }>(`/api/lift/forms/by-slug/${encode(slug)}/drafts`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values, stepIndex }),
    }),
  deleteDraft: (slug: string) => liftFetch<{ deleted: boolean }>(`/api/lift/forms/by-slug/${encode(slug)}/drafts`, { method: "DELETE" }),
  submit: (slug: string, body: { values: FormValues; completionSeconds?: number; captchaToken?: string; website?: string }) =>
    liftFetch<SubmitResult>(`/api/lift/forms/by-slug/${encode(slug)}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  upload: (slug: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return liftFetch<UploadRef>(`/api/lift/forms/by-slug/${encode(slug)}/uploads`, { method: "POST", body: formData });
  },
  lookup: (source: string) => liftFetch<{ value: string; label: string }[]>(`/api/lift/forms/lookups/${encode(source)}`),
};
