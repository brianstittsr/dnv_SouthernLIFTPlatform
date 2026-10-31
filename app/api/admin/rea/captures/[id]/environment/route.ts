import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/auth/server-auth";
import { appendCaptureActivity, getCapture } from "@/lib/rea/captures";
import { envsDir, runReaJson } from "@/lib/rea/runner";

const bodySchema = z.object({
  name: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]*$/, "kebab-case name")
    .max(60)
    .optional(),
  dryRun: z.boolean().default(false),
});

interface EnvironmentBuildReport {
  status?: string | null;
  name?: string;
  directory?: string | null;
  coverage?: {
    reads?: { state?: number; recorded?: number };
    writes?: { served?: unknown[]; withheld?: unknown[] };
  } | null;
  warnings?: unknown[];
  files?: { path?: string; bytes?: number }[];
  tool_count?: number;
  manifest?: { name?: string; tools?: number };
}

/**
 * POST /api/admin/rea/captures/[id]/environment — build an AgentEnv
 * environment bundle from a saved capture (functionality cloning).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const capture = await getCapture(id);
  if (!capture) {
    return NextResponse.json({ error: "Capture not found" }, { status: 404 });
  }

  const host = (() => {
    try {
      return new URL(capture.url).host.replace(/[^a-z0-9.-]+/g, "-");
    } catch {
      return "capture";
    }
  })();
  const envName = parsed.data.name ?? `${host}-${Date.now().toString(36)}`.slice(0, 60);
  const envDir = path.join(envsDir(), envName);

  const args = ["environment-build", capture.evidenceFile];
  if (parsed.data.dryRun) {
    args.push("--dry-run");
  } else {
    args.push(envDir, "--name", envName);
  }

  try {
    const report = await runReaJson<EnvironmentBuildReport>(args, 300_000);
    if (!parsed.data.dryRun) {
      await appendCaptureActivity(id, {
        environments: [
          {
            name: envName,
            dir: envDir,
            dryRun: false,
            state: report.status ?? null,
            createdAt: Timestamp.now(),
          },
        ],
      });
    }
    return NextResponse.json({ name: envName, dir: envDir, report });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Environment build failed" },
      { status: 500 }
    );
  }
}
