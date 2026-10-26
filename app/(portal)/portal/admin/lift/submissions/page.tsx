"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Download, FileText, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { liftFetch } from "@/components/forms/lift-api";
import type { FieldValue, FormField, FormSection, LiftFormDoc, LiftFormSubmissionDoc, TableRow as FormTableRow } from "@/lib/form-builder/types";

type SubmissionSummary = Omit<LiftFormSubmissionDoc, "values" | "signatures">;
interface SubmissionDetail {
  submission: LiftFormSubmissionDoc & { reviewNote?: string };
  form: { title: string; sections: FormSection[]; fields: FormField[] } | null;
}

/** Formats a stored answer for staff review. */
function displayValue(value: FieldValue | undefined, field: FormField): string {
  if (value === undefined || value === null || value === "") return "-";
  if (field.type === "currency" && typeof value === "number") return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
  if (field.type === "checkbox") return value === true ? "Yes" : "No";
  if (field.type === "yes_no") return value === "yes" ? "Yes" : "No";
  if (field.type === "repeating_table" && Array.isArray(value)) {
    return (value as FormTableRow[]).map((row) => Object.values(row).filter((cell) => cell !== null && cell !== "").join(" · ")).join("\n") || "-";
  }
  if (field.type === "signature") return "Signed";
  if (Array.isArray(value)) return value.map((item) => (typeof item === "object" && item && "fileName" in item ? String(item.fileName) : String(item))).join(", ");
  return String(value);
}

/** Staff review of LIFT form submissions, including the B1 AI summary. */
export default function LiftSubmissionsPage() {
  const [forms, setForms] = useState<LiftFormDoc[]>([]);
  const [formSlug, setFormSlug] = useState("");
  const [rows, setRows] = useState<SubmissionSummary[] | null>(null);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    liftFetch<LiftFormDoc[]>("/api/lift/forms").then(setForms).catch(() => setForms([]));
  }, []);

  const load = useCallback(async () => {
    setRows(null);
    try {
      setRows(await liftFetch<SubmissionSummary[]>(`/api/lift/submissions${formSlug ? `?formSlug=${encodeURIComponent(formSlug)}` : ""}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submissions could not be loaded");
      setRows([]);
    }
  }, [formSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const open = async (id: string) => {
    setOpenId(id);
    setDetail(null);
    try {
      setDetail(await liftFetch<SubmissionDetail>(`/api/lift/submissions/${id}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission could not be loaded");
      setOpenId(null);
    }
  };

  const review = async (update: { status?: "accepted" | "rejected"; aiSummaryStatus?: "confirmed" | "rejected" }) => {
    if (!openId) return;
    setReviewing(true);
    try {
      await liftFetch(`/api/lift/submissions/${openId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) });
      toast.success("Review saved");
      await open(openId);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review failed");
    } finally {
      setReviewing(false);
    }
  };

  const submission = detail?.submission;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portal/admin/lift/forms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Form Studio
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">LIFT Form Submissions</h1>
          <p className="text-muted-foreground">Review submissions, confirm intake summaries, and download signed PDFs.</p>
        </div>
        <div className="w-72 space-y-1">
          <label htmlFor="filter-form" className="text-sm font-medium">
            Form
          </label>
          <select id="filter-form" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={formSlug} onChange={(event) => setFormSlug(event.target.value)}>
            <option value="">All forms</option>
            {forms.map((form) => (
              <option key={form.id} value={form.slug}>
                {form.lifecycleRef ? `${form.lifecycleRef} · ` : ""}
                {form.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {!rows ? (
            <div className="flex items-center gap-2 text-muted-foreground" role="status">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground">No submissions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Respondent</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="sr-only">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">{new Date(row.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {row.formTitle}
                      <div className="text-xs text-muted-foreground">v{row.formVersion}</div>
                    </TableCell>
                    <TableCell>
                      {row.submittedByName}
                      {row.submittedByEmail && <div className="text-xs text-muted-foreground">{row.submittedByEmail}</div>}
                    </TableCell>
                    <TableCell className="capitalize">{row.source.replace("_", " ")}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={row.status === "accepted" ? "default" : row.status === "rejected" ? "destructive" : "secondary"}>{row.status}</Badge>
                        {row.aiSummary && <Badge variant="outline">AI: {row.aiSummary.status.replace(/_/g, " ")}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => void open(row.id)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={openId !== null} onOpenChange={(isOpen) => !isOpen && setOpenId(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{submission?.formTitle ?? "Submission"}</DialogTitle>
            <DialogDescription>
              {submission ? `${submission.submittedByName} · ${new Date(submission.createdAt).toLocaleString()} · ${submission.id}` : "Loading..."}
            </DialogDescription>
          </DialogHeader>
          {!detail || !submission ? (
            <div className="flex items-center gap-2 text-muted-foreground" role="status">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : (
            <div className="space-y-5">
              {submission.aiSummary && (
                <Card className="border-primary/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Intake summary ({submission.aiSummary.source === "ai" ? "AI" : "rules"}) · {submission.aiSummary.status.replace(/_/g, " ")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="whitespace-pre-line">{submission.aiSummary.needsAssessment}</p>
                    {submission.aiSummary.recommendedServicePlan.length > 0 && (
                      <ul className="list-disc pl-5">
                        {submission.aiSummary.recommendedServicePlan.map((item, index) => (
                          <li key={index}>
                            <span className="font-medium">{item.serviceArea}:</span> {item.action}
                          </li>
                        ))}
                      </ul>
                    )}
                    {submission.aiSummary.eligibilityFlags.length > 0 && (
                      <div className="rounded-md bg-amber-50 p-2 text-amber-900">
                        <p className="font-medium">Verify:</p>
                        <ul className="list-disc pl-5">
                          {submission.aiSummary.eligibilityFlags.map((flag, index) => (
                            <li key={index}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" disabled={reviewing} onClick={() => void review({ aiSummaryStatus: "confirmed" })}>
                        <Check className="mr-1 h-4 w-4" /> Confirm summary
                      </Button>
                      <Button size="sm" variant="outline" disabled={reviewing} onClick={() => void review({ aiSummaryStatus: "rejected" })}>
                        <X className="mr-1 h-4 w-4" /> Reject summary
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(detail.form?.sections.length ? detail.form.sections : [{ id: "", title: "Answers" }]).map((section) => {
                const sectionFields = (detail.form?.fields ?? []).filter(
                  (field) => (field.section ?? detail.form?.sections[0]?.id ?? "") === section.id && field.type !== "statement" && field.type !== "section_header" && field.key in submission.values
                );
                if (!sectionFields.length) return null;
                return (
                  <section key={section.id || "answers"} className="space-y-2">
                    <h3 className="font-semibold">{section.title}</h3>
                    <dl className="divide-y rounded-md border text-sm">
                      {sectionFields.map((field) => (
                        <div key={field.key} className="grid gap-1 px-3 py-2 sm:grid-cols-[40%_1fr]">
                          <dt className="text-muted-foreground">{field.label.length > 160 ? `${field.label.slice(0, 160)}...` : field.label}</dt>
                          <dd className="whitespace-pre-line">{displayValue(submission.values[field.key], field)}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                );
              })}

              {submission.files?.length > 0 && (
                <section className="space-y-2">
                  <h3 className="font-semibold">Files</h3>
                  <ul className="space-y-1">
                    {submission.files.map((file) => (
                      <li key={file.uploadId}>
                        <a className="flex items-center gap-2 text-sm text-primary hover:underline" href={`/api/lift/submissions/${submission.id}/files/${file.uploadId}`}>
                          <FileText className="h-4 w-4" /> {file.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <p className="break-all text-xs text-muted-foreground">Content hash: {submission.contentHash}</p>

              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button asChild variant="outline">
                  <a href={`/api/lift/submissions/${submission.id}/pdf`}>
                    <Download className="mr-2 h-4 w-4" /> PDF
                  </a>
                </Button>
                <Button disabled={reviewing} onClick={() => void review({ status: "accepted" })}>
                  <Check className="mr-2 h-4 w-4" /> Accept
                </Button>
                <Button variant="destructive" disabled={reviewing} onClick={() => void review({ status: "rejected" })}>
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
