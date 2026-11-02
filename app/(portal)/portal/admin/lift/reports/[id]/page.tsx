"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2, Mail, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { liftFetch } from "@/components/forms/lift-api";
import { REPORT_TYPE_LABELS, type SerializedLiftReport } from "@/lib/reports/types";

const paragraphs = (text: string) =>
  text.split(/\n{2,}/).map((block, index) => (
    <p key={index} className="whitespace-pre-line leading-relaxed">{block}</p>
  ));

/** Detail view of one saved AI report with PDF/email/delete actions (admin only). */
export default function LiftReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [report, setReport] = useState<SerializedLiftReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  const [recipients, setRecipients] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReport(await liftFetch<SerializedLiftReport>(`/api/lift/reports/${id}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Report could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const sendEmail = async () => {
    const to = recipients.split(/[,\s]+/).map((item) => item.trim()).filter(Boolean);
    if (!to.length) {
      toast.error("Enter at least one email address");
      return;
    }
    setSending(true);
    try {
      await liftFetch(`/api/lift/reports/${id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      toast.success(`Report emailed to ${to.length} recipient${to.length === 1 ? "" : "s"}`);
      setEmailOpen(false);
      setRecipients("");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Email failed");
    } finally {
      setSending(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this report? The data pack snapshot is deleted with it.")) return;
    setDeleting(true);
    try {
      await liftFetch(`/api/lift/reports/${id}`, { method: "DELETE" });
      toast.success("Report deleted");
      router.push("/portal/admin/lift/reports");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading report...
      </div>
    );
  }
  if (!report) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/admin/lift/reports"><ArrowLeft className="mr-2 h-4 w-4" /> All reports</Link>
        </Button>
        <p className="text-muted-foreground">Report not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portal/admin/lift/reports"><ArrowLeft className="mr-2 h-4 w-4" /> All reports</Link>
          </Button>
          <h1 className="text-3xl font-bold">{report.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{REPORT_TYPE_LABELS[report.type]}</Badge>
            <Badge variant={report.source === "ai" ? "default" : "secondary"}>{report.source === "ai" ? "AI-assisted" : "Data summary"}</Badge>
            {report.periodLabel && <span>Period: {report.periodLabel}</span>}
            {report.clientName && <span>Client: {report.clientName}</span>}
            <span>Generated {new Date(report.createdAt).toLocaleString()} by {report.createdByName}</span>
            {report.model && <span>Model: {report.model}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/lift/reports/${report.id}/pdf`}><Download className="mr-2 h-4 w-4" /> PDF</a>
          </Button>
          <Button variant="outline" onClick={() => setEmailOpen(true)}><Mail className="mr-2 h-4 w-4" /> Email</Button>
          <Button variant="destructive" onClick={() => void remove()} disabled={deleting}>
            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} Delete
          </Button>
        </div>
      </div>

      {report.prompt && (
        <Card>
          <CardContent className="pt-6">
            <p className="border-l-4 border-primary bg-muted/40 p-3 italic">Analysis focus: {report.prompt}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Key metrics</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Measure</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.metrics.map((metric, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{metric.label}</TableCell>
                  <TableCell>
                    {metric.value}
                    {metric.note && <div className="text-xs text-muted-foreground">{metric.note}</div>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Executive summary</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">{paragraphs(report.narrative.executiveSummary)}</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Analysis</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">{paragraphs(report.narrative.trendAnalysis)}</CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Gaps &amp; risks</CardTitle></CardHeader>
          <CardContent>
            {report.narrative.gapsAndRisks.length ? (
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {report.narrative.gapsAndRisks.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">None identified.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
          <CardContent>
            {report.narrative.recommendations.length ? (
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {report.narrative.recommendations.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">None provided.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {report.narrative.evidenceNotes && (
        <Card>
          <CardHeader><CardTitle>Data coverage &amp; limitations</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">{paragraphs(report.narrative.evidenceNotes)}</CardContent>
        </Card>
      )}

      {report.emailedTo && report.emailedTo.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Delivery log</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {report.emailedTo.map((entry, index) => (
                <li key={index}>Emailed to {entry.to.join(", ")} on {new Date(entry.sentAt).toLocaleString()}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {report.dataPack && (
        <details className="rounded-lg border p-4">
          <summary className="cursor-pointer text-sm font-medium">Data pack snapshot (audit trail)</summary>
          <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(report.dataPack, null, 2)}</pre>
        </details>
      )}

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email this report</DialogTitle>
            <DialogDescription>The report is sent as a PDF attachment with the executive summary in the body.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-recipients">Recipients</Label>
              <Input
                id="report-recipients"
                value={recipients}
                onChange={(event) => setRecipients(event.target.value)}
                placeholder="pi@subr.edu, director@kdm-assoc.com"
              />
              <p className="text-xs text-muted-foreground">Separate multiple addresses with commas or spaces.</p>
            </div>
            <Button onClick={() => void sendEmail()} disabled={sending} className="w-full">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
