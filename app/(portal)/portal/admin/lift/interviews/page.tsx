"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, ClipboardList, ExternalLink, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { liftFetch } from "@/components/forms/lift-api";
import { INTERVIEW_DOMAINS, type LiftInterviewDoc } from "@/lib/interview/types";

const DEFAULT_CONFIG = {
  title: "Untitled interview",
  description: "",
  processDescription: "",
  domain: "business_advising" as const,
  mode: "conversational" as const,
  objective: "",
  targetAudience: "",
  tone: "professional" as const,
  topicsToCover: [],
  keyQuestions: [],
  followUpDepth: "light" as const,
  estimatedMinutes: 10,
  evaluationRubric: "",
  outputs: ["summary", "insights"] as ("summary" | "insights")[],
  greetingMessage: "",
  closingMessage: "",
  systemPrompt: "",
};

function domainLabel(domain: string): string {
  return INTERVIEW_DOMAINS.find((d) => d.value === domain)?.label ?? domain;
}

/** Admin list of AI interviews — the Form Studio's interview module. */
export default function LiftInterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<LiftInterviewDoc[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setInterviews(await liftFetch<LiftInterviewDoc[]>("/api/lift/interviews"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Interviews could not be loaded");
      setInterviews([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createNew = async () => {
    setBusy(true);
    try {
      const interview = await liftFetch<LiftInterviewDoc>("/api/lift/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEFAULT_CONFIG),
      });
      router.push(`/portal/admin/lift/interviews/${interview.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Interview could not be created");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-1 -ml-2">
            <Link href="/portal/admin/lift/forms">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Form Studio
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">AI Interviews</h1>
          <p className="text-muted-foreground">
            Build prompt-driven AI interviews, then send them to anyone — platform members or external contacts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/portal/admin/lift/forms">
              <ClipboardList className="mr-2 h-4 w-4" />
              Forms
            </Link>
          </Button>
          <Button onClick={() => void createNew()} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            New interview
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interviews</CardTitle>
          <CardDescription>
            Editing a published interview returns it to draft — republish before new sessions pick up changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!interviews ? (
            <div className="flex items-center gap-2 text-muted-foreground" role="status">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : interviews.length === 0 ? (
            <p className="text-muted-foreground">No interviews yet. Create one to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interview</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invites</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="sr-only">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell>
                      <Link href={`/portal/admin/lift/interviews/${interview.id}`} className="font-medium hover:underline">
                        {interview.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">~{interview.estimatedMinutes} min</div>
                    </TableCell>
                    <TableCell>{domainLabel(interview.domain)}</TableCell>
                    <TableCell className="capitalize">{interview.mode}</TableCell>
                    <TableCell>
                      <Badge variant={interview.status === "published" ? "default" : "secondary"}>
                        {interview.status} · v{interview.version}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{interview.analytics?.invitesSent ?? 0}</TableCell>
                    <TableCell className="text-right">{interview.analytics?.sessionsCompleted ?? 0}</TableCell>
                    <TableCell className="text-right">
                      {interview.status === "published" && interview.publicLinkEnabled && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/interview/pub_${interview.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Open
                          </a>
                        </Button>
                      )}
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
