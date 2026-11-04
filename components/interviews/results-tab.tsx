"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { liftFetch } from "@/components/forms/lift-api";
import type { LiftInterviewSessionDoc } from "@/lib/interview/types";

type SafeSession = Omit<LiftInterviewSessionDoc, "sessionToken">;

export interface ResultsTabProps {
  interviewId: string;
}

/** Sessions list with transcript + AI evaluation viewer. */
export function ResultsTab({ interviewId }: ResultsTabProps) {
  const [sessions, setSessions] = useState<SafeSession[] | null>(null);
  const [selected, setSelected] = useState<SafeSession | null>(null);

  const load = useCallback(async () => {
    try {
      setSessions(await liftFetch<SafeSession[]>(`/api/lift/interviews/${interviewId}/sessions`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sessions could not be loaded");
      setSessions([]);
    }
  }, [interviewId]);

  useEffect(() => {
    void load();
  }, [load]);

  const fmtDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    return m < 1 ? "<1 min" : `${m} min`;
  };

  const evaln = selected?.evaluation;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>
          Every interview taken through invites or the public link — transcript and AI evaluation included.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!sessions ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
        ) : sessions.length === 0 ? (
          <p className="text-muted-foreground">No sessions yet — publish and send invites to start collecting interviews.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Respondent</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="sr-only">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.respondentName}</div>
                    <div className="text-xs text-muted-foreground">{s.respondentEmail || "—"}</div>
                  </TableCell>
                  <TableCell className="capitalize">{s.source.replace("_", " ")}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "completed" ? "default" : "secondary"}>{s.status.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    {typeof s.evaluation?.overallScore === "number" ? (
                      <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{s.evaluation.overallScore}/100</span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{fmtDuration(s.completionSeconds)}</TableCell>
                  <TableCell className="text-sm">{new Date(s.startedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelected(s)}>
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.respondentName}</DialogTitle>
                <DialogDescription>
                  {selected.interviewTitle} · v{selected.interviewVersion} · {selected.source.replace("_", " ")} ·{" "}
                  {new Date(selected.startedAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              {evaln && (
                <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Evaluation</h3>
                    <div className="flex items-center gap-2">
                      {evaln.source === "fallback" && <Badge variant="outline">basic (AI unavailable)</Badge>}
                      {typeof evaln.overallScore === "number" && <Badge>{evaln.overallScore}/100</Badge>}
                    </div>
                  </div>
                  {evaln.summary && <p className="text-sm">{evaln.summary}</p>}
                  {evaln.insights.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Key insights</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">{evaln.insights.map((i) => <li key={i}>{i}</li>)}</ul>
                    </div>
                  )}
                  {evaln.rubricScores.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Rubric scores</h4>
                      <ul className="text-sm space-y-1">
                        {evaln.rubricScores.map((r) => (
                          <li key={r.criterion} className="flex justify-between gap-4">
                            <span>{r.criterion} <span className="text-muted-foreground">— {r.note}</span></span>
                            <span className="font-medium whitespace-nowrap">{r.score}/{r.maxScore}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evaln.recommendedNextSteps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Recommended next steps</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">{evaln.recommendedNextSteps.map((s) => <li key={s}>{s}</li>)}</ul>
                    </div>
                  )}
                </div>
              )}

              {selected.coveredTopics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selected.coveredTopics.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold">Transcript</h3>
                {selected.messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No messages recorded.</p>
                ) : (
                  selected.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                          m.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
