"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Camera,
  CheckCircle2,
  FileCode,
  Loader2,
  Package,
  RefreshCw,
  XCircle,
} from "lucide-react";

const ARTIFACT_OPTIONS = [
  { id: "screenshot", label: "Screenshot" },
  { id: "dom", label: "DOM (HTML)" },
  { id: "accessibility", label: "Accessibility tree" },
  { id: "url", label: "Final URL" },
  { id: "history", label: "History" },
  { id: "storage", label: "Storage" },
] as const;

interface ReaStatus {
  ready: boolean;
  version: string | null;
  chromePath: string | null;
  chromeFound: boolean;
}

interface CaptureStep {
  stepId: string;
  action: string;
  status: string;
  elapsedMs?: number;
}

interface CaptureRow {
  id: string;
  url: string;
  finalUrl: string | null;
  evidenceId: string;
  status: string;
  screenshotUrl: string | null;
  domUrl: string | null;
  stepCount: number;
  durationMs: number | null;
  environments: { name: string; dir: string }[];
  scriptExports: { dir: string; fileCount: number }[];
  createdAt: string | null;
}

interface CaptureResult {
  captureId: string;
  evidenceId: string;
  finalUrl: string | null;
  status: string;
  steps: CaptureStep[];
  durationMs: number | null;
  screenshotUrl: string | null;
  domUrl: string | null;
  limitations: string[];
}

export default function ReaAdminPage() {
  const [status, setStatus] = useState<ReaStatus | null>(null);
  const [url, setUrl] = useState("");
  const [artifacts, setArtifacts] = useState<string[]>(["screenshot", "dom", "url"]);
  const [captureNetwork, setCaptureNetwork] = useState(true);
  const [settleMs, setSettleMs] = useState("2000");
  const [advancedJson, setAdvancedJson] = useState("");
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captures, setCaptures] = useState<CaptureRow[]>([]);
  const [envDialog, setEnvDialog] = useState<{ open: boolean; captureId: string | null }>({
    open: false,
    captureId: null,
  });
  const [envName, setEnvName] = useState("");
  const [envDryRun, setEnvDryRun] = useState(false);
  const [envReport, setEnvReport] = useState<unknown>(null);
  const [envRunning, setEnvRunning] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/rea/status");
      if (res.ok) setStatus(await res.json());
    } catch {
      // leave null
    }
  }, []);

  const loadCaptures = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/rea/captures");
      if (res.ok) setCaptures(await res.json());
    } catch {
      // leave empty
    }
  }, []);

  useEffect(() => {
    loadStatus();
    loadCaptures();
  }, [loadStatus, loadCaptures]);

  const toggleArtifact = (id: string) => {
    setArtifacts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const runCapture = async () => {
    setError(null);
    setResult(null);
    let scenario: Record<string, unknown> | undefined;
    if (useAdvanced && advancedJson.trim()) {
      try {
        scenario = JSON.parse(advancedJson) as Record<string, unknown>;
      } catch {
        setError("Advanced scenario JSON is invalid.");
        return;
      }
    }
    setRunning(true);
    try {
      const res = await fetch("/api/admin/rea/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          headless: true,
          settleMs: Number(settleMs) || 2000,
          artifacts,
          captureNetwork,
          scenario,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Capture failed");
      setResult(data as CaptureResult);
      loadCaptures();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Capture failed");
    } finally {
      setRunning(false);
    }
  };

  const buildEnvironment = async () => {
    if (!envDialog.captureId) return;
    setEnvRunning(true);
    setEnvReport(null);
    try {
      const res = await fetch(
        `/api/admin/rea/captures/${envDialog.captureId}/environment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: envName.trim() || undefined,
            dryRun: envDryRun,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Build failed");
      setEnvReport(data);
      loadCaptures();
    } catch (err) {
      setEnvReport({ error: err instanceof Error ? err.message : "Build failed" });
    } finally {
      setEnvRunning(false);
    }
  };

  const exportScripts = async (captureId: string, analyze: boolean) => {
    setBusyAction(`${captureId}:${analyze ? "analyze" : "scripts"}`);
    try {
      const res = await fetch(
        `/api/admin/rea/captures/${captureId}/scripts${analyze ? "?analyze=true" : ""}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export failed");
      loadCaptures();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Bot className="h-7 w-7 text-primary" aria-hidden="true" />
          REA Studio
        </h1>
        <p className="text-muted-foreground">
          Clone websites, themes, and designs — capture a page, export its
          scripts, or build a replayable environment of its features.
        </p>
      </div>

      {/* Environment status */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <Badge variant={status?.ready ? "default" : "destructive"}>
            REA {status?.version ?? "unavailable"}
          </Badge>
          <Badge variant={status?.chromeFound ? "default" : "outline"}>
            {status?.chromeFound ? "Browser found" : "No browser found"}
          </Badge>
          {status?.chromePath && (
            <code className="text-xs text-muted-foreground">{status.chromePath}</code>
          )}
          {!status?.chromeFound && (
            <p className="text-sm text-muted-foreground">
              Set <code>REA_CHROME_PATH</code> in the server environment to a
              Chrome/Edge executable. Captures run on this server — a browser
              must be installed there.
            </p>
          )}
          <Button variant="ghost" size="sm" onClick={loadStatus}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* New capture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" /> New Capture
          </CardTitle>
          <CardDescription>
            Launch a headless browser at a URL and capture its rendered page —
            screenshot, DOM, and page state. Use the saved capture to study the
            design, export its scripts, or clone its functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="rea-url">Target URL</Label>
              <Input
                id="rea-url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="w-40 space-y-2">
              <Label htmlFor="rea-settle">Settle (ms)</Label>
              <Input
                id="rea-settle"
                type="number"
                min={0}
                max={60000}
                value={settleMs}
                onChange={(e) => setSettleMs(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Artifacts</Label>
            <div className="flex flex-wrap gap-4">
              {ARTIFACT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 text-sm"
                  htmlFor={`art-${opt.id}`}
                >
                  <Checkbox
                    id={`art-${opt.id}`}
                    checked={artifacts.includes(opt.id)}
                    onCheckedChange={() => toggleArtifact(opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm" htmlFor="rea-net">
            <Checkbox
              id="rea-net"
              checked={captureNetwork}
              onCheckedChange={(c) => setCaptureNetwork(c === true)}
            />
            Capture network traffic — required to clone features via{" "}
            <strong>Build Environment</strong>
          </label>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm" htmlFor="rea-adv">
              <Checkbox
                id="rea-adv"
                checked={useAdvanced}
                onCheckedChange={(c) => setUseAdvanced(c === true)}
              />
              Custom scenario JSON (clicks, waits, multi-step flows)
            </label>
            {useAdvanced && (
              <Textarea
                rows={8}
                className="font-mono text-xs"
                placeholder='{"browser":{"mode":"launch","executable_path":"..."},"start_url":{"url":"..."},"actions":[...]}'
                value={advancedJson}
                onChange={(e) => setAdvancedJson(e.target.value)}
              />
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={runCapture}
            disabled={running || !url.trim() || (!useAdvanced && artifacts.length === 0)}
          >
            {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {running ? "Capturing..." : "Run Capture"}
          </Button>
        </CardContent>
      </Card>

      {/* Capture result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Capture Result</CardTitle>
            <CardDescription>
              Evidence {result.evidenceId}
              {result.finalUrl ? ` — ${result.finalUrl}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {result.steps.map((s) => (
                <Badge
                  key={s.stepId}
                  variant={s.status === "completed" ? "default" : "destructive"}
                  className="gap-1"
                >
                  {s.status === "completed" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {s.stepId}
                  {s.elapsedMs != null && ` (${s.elapsedMs}ms)`}
                </Badge>
              ))}
            </div>
            {result.screenshotUrl && (
              <div>
                <Label>Screenshot</Label>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.screenshotUrl}
                  alt="Captured page screenshot"
                  className="mt-2 max-h-[480px] rounded-lg border object-contain"
                />
              </div>
            )}
            <div className="flex gap-2">
              {result.domUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={result.domUrl} target="_blank" rel="noreferrer">
                    View DOM
                  </a>
                </Button>
              )}
            </div>
            {result.limitations.length > 0 && (
              <div>
                <Label>Limitations</Label>
                <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                  {result.limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Capture history */}
      <Card>
        <CardHeader>
          <CardTitle>Captures</CardTitle>
          <CardDescription>
            Saved page captures. Build an environment to clone the site&apos;s
            functionality, or export scripts to study how features are built.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Captured</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Outputs</TableHead>
                <TableHead className="w-[220px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {captures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No captures yet — run one above.
                  </TableCell>
                </TableRow>
              ) : (
                captures.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-[280px] truncate font-medium">
                      {c.url}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>{c.stepCount}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.screenshotUrl && <Badge variant="outline">screenshot</Badge>}
                        {c.domUrl && <Badge variant="outline">dom</Badge>}
                        {c.environments.map((e) => (
                          <Badge key={e.name} variant="secondary">
                            env: {e.name}
                          </Badge>
                        ))}
                        {c.scriptExports.map((s, i) => (
                          <Badge key={i} variant="secondary">
                            scripts: {s.fileCount}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEnvDialog({ open: true, captureId: c.id })}
                        >
                          <Package className="mr-1 h-3 w-3" /> Env
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyAction !== null}
                          onClick={() => exportScripts(c.id, false)}
                        >
                          {busyAction === `${c.id}:scripts` ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <FileCode className="mr-1 h-3 w-3" />
                          )}
                          Scripts
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyAction !== null}
                          onClick={() => exportScripts(c.id, true)}
                        >
                          {busyAction === `${c.id}:analyze` ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : null}
                          Analyze
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Environment build dialog */}
      <Dialog open={envDialog.open} onOpenChange={(o) => setEnvDialog({ open: o, captureId: envDialog.captureId })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Build Environment</DialogTitle>
            <DialogDescription>
              Turn this capture into a replayable environment bundle — a local
              clone of the site&apos;s observed tools and responses that an
              agent can run against without the original app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="env-name">Environment name (optional)</Label>
              <Input
                id="env-name"
                placeholder="kebab-case-name"
                value={envName}
                onChange={(e) => setEnvName(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm" htmlFor="env-dry">
              <Checkbox
                id="env-dry"
                checked={envDryRun}
                onCheckedChange={(c) => setEnvDryRun(c === true)}
              />
              Dry run — report only, write nothing
            </label>
            {envReport != null && (
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(envReport, null, 2)}
              </pre>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEnvDialog({ open: false, captureId: null })}
            >
              Close
            </Button>
            <Button onClick={buildEnvironment} disabled={envRunning}>
              {envRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {envRunning ? "Building..." : "Build"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
