"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { liftFetch } from "@/components/forms/lift-api";
import { REPORT_TYPE_LABELS, REPORT_TYPES, type LiftReportType, type SerializedLiftReport } from "@/lib/reports/types";

interface ClientOption {
  id: string;
  legalName: string;
  status: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEAR_OPTIONS = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

/** Admin-only AI reporting: generate fixed, free-form, or client deep-dive reports from platform data. */
export default function LiftReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<SerializedLiftReport[] | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [generating, setGenerating] = useState(false);

  const now = new Date();
  const [type, setType] = useState<LiftReportType>("monthly_internal");
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [quarter, setQuarter] = useState(String(Math.ceil((now.getMonth() + 1) / 3)));
  const [half, setHalf] = useState(now.getMonth() < 6 ? "1" : "2");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [prompt, setPrompt] = useState("");
  const [liftClientId, setLiftClientId] = useState("");

  const load = useCallback(async () => {
    try {
      setReports(await liftFetch<SerializedLiftReport[]>("/api/lift/reports"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reports could not be loaded");
      setReports([]);
    }
  }, []);

  useEffect(() => {
    void load();
    liftFetch<ClientOption[]>("/api/lift/reports/clients").then(setClients).catch(() => setClients([]));
  }, [load]);

  const generate = async () => {
    setGenerating(true);
    try {
      const body: Record<string, unknown> = { type };
      if (type === "monthly_internal") Object.assign(body, { year: Number(year), month: Number(month) });
      if (type === "quarterly_milestone") Object.assign(body, { year: Number(year), quarter: Number(quarter) });
      if (type === "semi_annual_mbda") Object.assign(body, { year: Number(year), half: Number(half) });
      if (type === "annual_performance") Object.assign(body, { year: Number(year) });
      if (type === "freeform") Object.assign(body, { prompt, ...(start ? { start } : {}), ...(end ? { end } : {}) });
      if (type === "client_deepdive") Object.assign(body, { liftClientId, ...(prompt ? { prompt } : {}), ...(start ? { start } : {}), ...(end ? { end } : {}) });
      const report = await liftFetch<SerializedLiftReport>("/api/lift/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      toast.success("Report generated");
      router.push(`/portal/admin/lift/reports/${report.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Report generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const needsYear = type !== "freeform" && type !== "client_deepdive";
  const canGenerate = !generating && (type !== "freeform" || prompt.trim().length > 0) && (type !== "client_deepdive" || liftClientId.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">LIFT Reports</h1>
        <p className="text-muted-foreground">
          AI-analyzed, data-driven reports for MBDA reporting and program management. Admin access only — every report keeps the data pack it was generated from.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate a report
          </CardTitle>
          <CardDescription>Report figures come only from platform data; AI writes the narrative. Unverified claims are excluded from MBDA measures.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="report-type">Report type</Label>
              <Select value={type} onValueChange={(value) => setType(value as LiftReportType)}>
                <SelectTrigger id="report-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>{REPORT_TYPE_LABELS[value]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {needsYear && (
              <div className="space-y-2">
                <Label htmlFor="report-year">Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger id="report-year"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {type === "monthly_internal" && (
              <div className="space-y-2">
                <Label htmlFor="report-month">Month</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger id="report-month"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((name, index) => <SelectItem key={name} value={String(index + 1)}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {type === "quarterly_milestone" && (
              <div className="space-y-2">
                <Label htmlFor="report-quarter">Quarter</Label>
                <Select value={quarter} onValueChange={setQuarter}>
                  <SelectTrigger id="report-quarter"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((q) => <SelectItem key={q} value={String(q)}>Q{q}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {type === "semi_annual_mbda" && (
              <div className="space-y-2">
                <Label htmlFor="report-half">Half</Label>
                <Select value={half} onValueChange={setHalf}>
                  <SelectTrigger id="report-half"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">H1 (Jan–Jun)</SelectItem>
                    <SelectItem value="2">H2 (Jul–Dec)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {type === "client_deepdive" && (
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="report-client">Client</Label>
                <Select value={liftClientId} onValueChange={setLiftClientId}>
                  <SelectTrigger id="report-client"><SelectValue placeholder="Choose a LIFT client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.legalName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {(type === "freeform" || type === "client_deepdive") && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="report-start">Period start (optional)</Label>
                <Input id="report-start" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-end">Period end (optional)</Label>
                <Input id="report-end" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
              </div>
            </div>
          )}

          {(type === "freeform" || type === "client_deepdive") && (
            <div className="space-y-2">
              <Label htmlFor="report-prompt">
                {type === "freeform" ? "What should the analysis focus on? *" : "Focus for the deep dive (optional)"}
              </Label>
              <Textarea
                id="report-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={3}
                maxLength={2000}
                placeholder={
                  type === "freeform"
                    ? 'e.g. "Which parishes are underserved?" or "Where are the capability gaps blocking contracts?"'
                    : 'e.g. "Readiness for a first federal bid" — leave blank for a general review'
                }
              />
            </div>
          )}

          <Button onClick={() => void generate()} disabled={!canGenerate}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
            {generating ? "Analyzing platform data..." : "Generate report"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved reports</CardTitle>
          <CardDescription>Reports are stored with their data pack so figures stay auditable and reproducible.</CardDescription>
        </CardHeader>
        <CardContent>
          {!reports ? (
            <div className="flex items-center gap-2 text-muted-foreground" role="status">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : reports.length === 0 ? (
            <p className="text-muted-foreground">No reports yet — generate your first one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead className="sr-only">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Link href={`/portal/admin/lift/reports/${report.id}`} className="font-medium text-primary hover:underline">
                        {report.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">by {report.createdByName}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{REPORT_TYPE_LABELS[report.type]}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap">{report.periodLabel ?? "—"}</TableCell>
                    <TableCell><Badge variant={report.source === "ai" ? "default" : "secondary"}>{report.source === "ai" ? "AI" : "Data"}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/api/lift/reports/${report.id}/pdf`}><Download className="mr-1 h-4 w-4" /> PDF</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
