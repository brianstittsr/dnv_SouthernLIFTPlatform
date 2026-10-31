/**
 * REA capture persistence: scenario building, Evidence extraction, and
 * Firestore metadata records in `reaCaptures` (server-only collection).
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { storeFileBuffer } from "@/lib/file-store";
import { capturesDir } from "./runner";

export const REA_CAPTURES_COLLECTION = "reaCaptures";

export type ReaArtifactKind =
  | "dom"
  | "screenshot"
  | "accessibility"
  | "url"
  | "history"
  | "storage";

export type ReaEventFamily =
  | "console"
  | "page-errors"
  | "network"
  | "websockets"
  | "frames"
  | "workers";

export interface ReaScenarioAction {
  step_id: string;
  action: string;
  [key: string]: unknown;
}

/** Declarative browser-scenario input accepted by `capture-browser-scenario`. */
export interface ReaBrowserScenario {
  browser: {
    mode: "launch";
    executable_path: string;
    headless?: boolean;
  };
  start_url: { url: string };
  actions: ReaScenarioAction[];
  capture?: {
    after_each_step?: ReaArtifactKind[];
    at_end?: ReaArtifactKind[];
    events?: ReaEventFamily[];
    network?: {
      request_body?: boolean;
      response_body?: boolean;
      header_values?: boolean;
    };
  };
  environment?: Record<string, unknown>;
}

interface CaptureArtifactValue {
  sha256?: string;
  bytes?: number;
  media_type?: string;
  data_base64?: string;
  text?: string;
  url?: string;
}

export interface ReaCaptureStep {
  step_index: number;
  step_id: string;
  action: string;
  elapsed_ms?: number;
  status?: string;
  error?: string | null;
  after_url?: { url?: string };
  artifacts?: Record<string, { state?: string; value?: CaptureArtifactValue }>;
}

export interface ReaCaptureEvidence {
  evidence_id: string;
  normalized_result?: {
    steps?: ReaCaptureStep[];
    duration_ms?: number;
    limitations?: unknown[];
  };
  limitations?: unknown[];
}

export interface ReaCaptureMeta {
  id: string;
  url: string;
  finalUrl: string | null;
  evidenceId: string;
  evidenceFile: string;
  status: "completed" | "failed";
  artifactsRequested: string[];
  screenshotFileId: string | null;
  screenshotUrl: string | null;
  domFileId: string | null;
  domUrl: string | null;
  steps: { stepId: string; action: string; status: string; elapsedMs?: number }[];
  durationMs: number | null;
  limitations: string[];
  createdBy: string;
  createdAt: FirebaseFirestore.Timestamp;
  environments: {
    name: string;
    dir: string;
    dryRun: boolean;
    state: string | null;
    createdAt: FirebaseFirestore.Timestamp;
  }[];
  scriptExports: {
    dir: string;
    fileCount: number;
    createdAt: FirebaseFirestore.Timestamp;
  }[];
}

/**
 * Builds the launch-mode scenario for a URL capture.
 * When `captureNetwork` is set, network events (requests, responses, headers,
 * bodies) are retained — required for `environment-build` functionality
 * cloning; page-artifact-only captures cannot build an environment.
 */
export function buildCaptureScenario(options: {
  url: string;
  chromePath: string;
  headless: boolean;
  settleMs: number;
  artifacts: ReaArtifactKind[];
  captureNetwork?: boolean;
}): ReaBrowserScenario {
  return {
    browser: {
      mode: "launch",
      executable_path: options.chromePath,
      headless: options.headless,
    },
    start_url: { url: options.url },
    actions: [
      {
        step_id: "settle",
        action: "wait_for_timeout",
        duration_ms: options.settleMs,
      },
    ],
    capture: {
      at_end: options.artifacts,
      ...(options.captureNetwork
        ? {
            events: ["network"],
            network: {
              request_body: true,
              response_body: true,
              header_values: true,
            },
          }
        : {}),
    },
  };
}

function artifactValue(
  evidence: ReaCaptureEvidence,
  kind: ReaArtifactKind
): CaptureArtifactValue | null {
  const steps = evidence.normalized_result?.steps ?? [];
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const artifact = steps[i].artifacts?.[kind];
    if (artifact?.state === "captured" && artifact.value) {
      return artifact.value;
    }
  }
  return null;
}

/** Saves screenshot and DOM artifacts to the fileBlobs store. */
async function storeArtifacts(
  evidence: ReaCaptureEvidence,
  url: string,
  ownerUid: string
): Promise<Pick<ReaCaptureMeta, "screenshotFileId" | "screenshotUrl" | "domFileId" | "domUrl">> {
  const host = safeHost(url);
  const out = {
    screenshotFileId: null as string | null,
    screenshotUrl: null as string | null,
    domFileId: null as string | null,
    domUrl: null as string | null,
  };

  const shot = artifactValue(evidence, "screenshot");
  if (shot?.data_base64) {
    const stored = await storeFileBuffer({
      buffer: Buffer.from(shot.data_base64, "base64"),
      fileName: `rea-${host}-screenshot.png`,
      contentType: shot.media_type || "image/png",
      category: "rea",
      isPublic: false,
      ownerUid,
    });
    out.screenshotFileId = stored.fileId;
    out.screenshotUrl = stored.fileUrl;
  }

  const dom = artifactValue(evidence, "dom");
  const domText = dom?.text ?? (typeof dom?.data_base64 === "string" ? Buffer.from(dom.data_base64, "base64").toString("utf8") : null);
  if (domText) {
    const stored = await storeFileBuffer({
      buffer: Buffer.from(domText, "utf8"),
      fileName: `rea-${host}-dom.html`,
      contentType: "text/html",
      category: "rea",
      isPublic: false,
      ownerUid,
    });
    out.domFileId = stored.fileId;
    out.domUrl = stored.fileUrl;
  }

  return out;
}

function safeHost(url: string): string {
  try {
    return new URL(url).host.replace(/[^a-z0-9.-]+/g, "_");
  } catch {
    return "capture";
  }
}

/**
 * Saves the raw Evidence JSON to `.rea-captures/`, extracts artifacts into
 * fileBlobs, and writes the `reaCaptures` metadata doc. Returns the meta.
 */
export async function persistCapture(options: {
  evidence: ReaCaptureEvidence;
  url: string;
  artifactsRequested: string[];
  createdBy: string;
}): Promise<ReaCaptureMeta> {
  if (!db) throw new Error("Database not initialized");
  const { evidence, url } = options;

  const evidenceFile = path.join(capturesDir(), `${evidence.evidence_id}.json`);
  await writeFile(evidenceFile, JSON.stringify(evidence), "utf8");

  const stored = await storeArtifacts(evidence, url, options.createdBy);
  const steps = (evidence.normalized_result?.steps ?? []).map((s) => ({
    stepId: s.step_id,
    action: s.action,
    status: s.status ?? "unknown",
    elapsedMs: s.elapsed_ms,
  }));
  const lastUrl = [...(evidence.normalized_result?.steps ?? [])]
    .reverse()
    .find((s) => s.after_url?.url)?.after_url?.url ?? null;

  const docRef = db.collection(REA_CAPTURES_COLLECTION).doc();
  const meta: ReaCaptureMeta = {
    id: docRef.id,
    url,
    finalUrl: lastUrl,
    evidenceId: evidence.evidence_id,
    evidenceFile,
    status: "completed",
    artifactsRequested: options.artifactsRequested,
    ...stored,
    steps,
    durationMs: evidence.normalized_result?.duration_ms ?? null,
    limitations: (evidence.limitations ?? []).map((l) => String(l)),
    createdBy: options.createdBy,
    createdAt: Timestamp.now(),
    environments: [],
    scriptExports: [],
  };
  await docRef.set(meta);
  return meta;
}

/** Lists capture metadata newest-first. */
export async function listCaptures(limit = 50): Promise<ReaCaptureMeta[]> {
  if (!db) return [];
  const snap = await db
    .collection(REA_CAPTURES_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => d.data() as ReaCaptureMeta);
}

/** Fetches one capture metadata doc. */
export async function getCapture(id: string): Promise<ReaCaptureMeta | null> {
  if (!db) return null;
  const doc = await db.collection(REA_CAPTURES_COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as ReaCaptureMeta) : null;
}

/** Appends an environment-build or script-export record to a capture. */
export async function appendCaptureActivity(
  id: string,
  patch: Partial<Pick<ReaCaptureMeta, "environments" | "scriptExports">>
): Promise<void> {
  if (!db) return;
  const doc = await db.collection(REA_CAPTURES_COLLECTION).doc(id).get();
  if (!doc.exists) throw new Error("Capture not found");
  const data = doc.data() as ReaCaptureMeta;
  await doc.ref.update({
    environments: [...(data.environments ?? []), ...(patch.environments ?? [])],
    scriptExports: [...(data.scriptExports ?? []), ...(patch.scriptExports ?? [])],
  });
}
