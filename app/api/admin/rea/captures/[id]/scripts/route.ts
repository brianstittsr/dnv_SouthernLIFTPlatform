import { NextRequest, NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { Timestamp } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/auth/server-auth";
import { appendCaptureActivity, getCapture } from "@/lib/rea/captures";
import { envsDir, runReaJson } from "@/lib/rea/runner";

interface ScriptExportResult {
  normalized_result?: {
    scripts?: unknown[];
    output_directory?: string;
    analysis_input?: { input_path?: string };
    capture_completeness?: { status?: string; missing_sections?: string[] };
  };
}

/**
 * POST /api/admin/rea/captures/[id]/scripts — export the captured website's
 * scripts for static analysis (feature/functionality cloning).
 * Optional ?analyze=true runs analyze-javascript-application on the output.
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
  const capture = await getCapture(id);
  if (!capture) {
    return NextResponse.json({ error: "Capture not found" }, { status: 404 });
  }

  const outDir = path.join(envsDir(), `${id}-scripts`);
  const analyze = new URL(request.url).searchParams.get("analyze") === "true";

  try {
    const result = await runReaJson<ScriptExportResult>(
      ["export-web-scripts", capture.evidenceFile, outDir],
      120_000
    );

    let fileCount = result.normalized_result?.scripts?.length ?? 0;
    try {
      // Layout: <outDir>/files/origins/<hash>/<path> — count files recursively.
      const countFiles = async (dir: string): Promise<number> => {
        const entries = await readdir(dir, { withFileTypes: true });
        let n = 0;
        for (const e of entries) {
          n += e.isDirectory() ? await countFiles(path.join(dir, e.name)) : 1;
        }
        return n;
      };
      fileCount = Math.max(fileCount, await countFiles(outDir));
    } catch {
      // keep reported count
    }

    await appendCaptureActivity(id, {
      scriptExports: [
        { dir: outDir, fileCount, createdAt: Timestamp.now() },
      ],
    });

    let analysis: unknown = null;
    if (analyze && fileCount > 0) {
      // Export layout is <outDir>/files/... — analyze that subtree.
      const analysisPath =
        result.normalized_result?.analysis_input?.input_path ??
        path.join(outDir, "files");
      // evidence_output never overwrites — unique name per run.
      const evidenceOut = path.join(
        envsDir(),
        `${id}-analysis-${Date.now().toString(36)}.evidence`
      );
      analysis = await runReaJson(
        [
          "analyze-javascript-application",
          analysisPath,
          "--detail",
          "summary",
          "--evidence_output",
          evidenceOut,
        ],
        300_000
      );
    }

    return NextResponse.json({ dir: outDir, fileCount, result, analysis });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Script export failed" },
      { status: 500 }
    );
  }
}
