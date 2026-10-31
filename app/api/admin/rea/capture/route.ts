import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/server-auth";
import {
  buildCaptureScenario,
  persistCapture,
  type ReaArtifactKind,
  type ReaCaptureEvidence,
} from "@/lib/rea/captures";
import { capturesDir, findChromeExecutable, runReaJson } from "@/lib/rea/runner";

const ARTIFACTS = [
  "dom",
  "screenshot",
  "accessibility",
  "url",
  "history",
  "storage",
] as const;

const bodySchema = z.object({
  url: z.string().url(),
  headless: z.boolean().default(true),
  settleMs: z.number().int().min(0).max(60_000).default(2000),
  artifacts: z.array(z.enum(ARTIFACTS)).min(1).default(["dom", "screenshot", "url"]),
  /** Retain network events — required for environment-build cloning. */
  captureNetwork: z.boolean().default(true),
  /** Full custom scenario JSON; when supplied it replaces the generated one. */
  scenario: z.record(z.string(), z.unknown()).optional(),
});

/** POST /api/admin/rea/capture — run a browser capture of a URL. */
export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;

  try {
    new URL(body.url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const chromePath = findChromeExecutable();
  if (!chromePath) {
    return NextResponse.json(
      {
        error:
          "No Chrome-family browser found. Set REA_CHROME_PATH to a Chrome/Edge executable.",
      },
      { status: 422 }
    );
  }

  const scenario =
    body.scenario ??
    buildCaptureScenario({
      url: body.url,
      chromePath,
      headless: body.headless,
      settleMs: body.settleMs,
      artifacts: body.artifacts as ReaArtifactKind[],
      captureNetwork: body.captureNetwork,
    });

  const scenarioFile = path.join(
    capturesDir(),
    `scenario-${Date.now()}.json`
  );
  await writeFile(scenarioFile, JSON.stringify(scenario), "utf8");

  try {
    const evidence = await runReaJson<ReaCaptureEvidence>(
      ["capture-browser-scenario", scenarioFile],
      300_000
    );
    const meta = await persistCapture({
      evidence,
      url: body.url,
      artifactsRequested: body.artifacts,
      createdBy: user.uid,
    });
    return NextResponse.json({
      captureId: meta.id,
      evidenceId: meta.evidenceId,
      finalUrl: meta.finalUrl,
      status: meta.status,
      steps: meta.steps,
      durationMs: meta.durationMs,
      screenshotUrl: meta.screenshotUrl,
      domUrl: meta.domUrl,
      limitations: meta.limitations,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Capture failed" },
      { status: 500 }
    );
  }
}
