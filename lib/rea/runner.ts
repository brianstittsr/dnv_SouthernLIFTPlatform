/**
 * Server-side REA (rea-agents) runner.
 *
 * Spawns the installed `rea-agents` CLI as a child process and returns parsed
 * JSON output. Browser-capture commands launch a local Chrome-family browser,
 * so they only work where one is installed (local dev, self-hosted server) —
 * not on serverless runtimes without a browser binary.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

// Anchor resolution at the project root — under Next.js bundling,
// import.meta.url points inside .next/server and can miss node_modules.
const require2 = createRequire(path.join(process.cwd(), "package.json"));

/** Absolute path to the rea-agents CLI entry script inside node_modules. */
export function reaCliPath(): string {
  return require2.resolve("rea-agents/scripts/rea.mjs");
}

/** Workspace directory that holds saved REA capture Evidence JSON. */
export function capturesDir(): string {
  const dir = path.join(process.cwd(), ".rea-captures");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

/** Workspace directory that holds exported scripts and environment bundles. */
export function envsDir(): string {
  const dir = path.join(process.cwd(), ".rea-envs");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Finds a Chrome-family executable for `capture-browser-scenario` launch mode.
 * Order: REA_CHROME_PATH env, then common Windows install locations.
 */
export function findChromeExecutable(): string | null {
  if (process.env.REA_CHROME_PATH && existsSync(process.env.REA_CHROME_PATH)) {
    return process.env.REA_CHROME_PATH;
  }
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    process.env.LOCALAPPDATA
      ? `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`
      : "",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export interface ReaRunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

/**
 * Runs `rea <args>` and captures output. Defaults to a 5-minute ceiling —
 * browser captures can take 30-60s, analysis can take several minutes.
 */
export function runRea(args: string[], timeoutMs = 300_000): Promise<ReaRunResult> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [reaCliPath(), ...args], {
      env: { ...process.env, NO_COLOR: "1" },
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ exitCode: -1, stdout, stderr: stderr + String(err), timedOut });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code ?? -1, stdout, stderr, timedOut });
    });
  });
}

export interface ReaErrorBody {
  code?: string;
  message?: string;
  remediation?: { action?: string };
  details?: { issues?: { path: string[]; message: string }[] };
}

/**
 * Runs a REA command with `--format json` output. Parses stdout and throws a
 * readable Error on non-zero exit or unparseable output.
 */
export async function runReaJson<T = unknown>(
  args: string[],
  timeoutMs?: number
): Promise<T> {
  const result = await runRea([...args, "--format", "json"], timeoutMs);
  const trimmed = result.stdout.trim();
  if (result.timedOut) {
    throw new Error("REA command timed out. Try a shorter capture or larger timeout.");
  }
  if (result.exitCode !== 0) {
    let message = `REA exited with code ${result.exitCode}`;
    try {
      const body = JSON.parse(trimmed) as { error?: string; code?: string; message?: string; details?: { issues?: { path: string[]; message: string }[] } };
      const issueText = body.details?.issues
        ?.map((i) => `${i.path.join(".") || "input"}: ${i.message}`)
        .join("; ");
      message = body.message || body.error || message;
      if (issueText) message += ` — ${issueText}`;
    } catch {
      if (result.stderr.trim()) message = result.stderr.trim().slice(0, 500);
    }
    throw new Error(message);
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error("REA returned unparseable output");
  }
}
