"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { liftFetch } from "@/components/forms/lift-api";
import { SetupTab } from "@/components/interviews/setup-tab";
import { PromptTab } from "@/components/interviews/prompt-tab";
import { DeployTab } from "@/components/interviews/deploy-tab";
import { ResultsTab } from "@/components/interviews/results-tab";
import { interviewConfigSchema, type InterviewConfig, type LiftInterviewDoc } from "@/lib/interview/types";

/** Interview editor: Setup | Prompt | Deploy | Results. */
export default function InterviewEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [interview, setInterview] = useState<LiftInterviewDoc | null>(null);
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    try {
      const doc = await liftFetch<LiftInterviewDoc>(`/api/lift/interviews/${id}`);
      setInterview(doc);
      setConfig(extractConfig(doc));
    } catch {
      setNotFound(true);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchConfig = (patch: Partial<InterviewConfig>) => {
    setConfig((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await liftFetch<LiftInterviewDoc>(`/api/lift/interviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      setInterview(updated);
      setConfig(extractConfig(updated));
      toast.success(updated.status === "draft" ? "Saved — republish when you're ready to deploy." : "Saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (notFound) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/admin/lift/interviews"><ArrowLeft className="mr-1 h-4 w-4" /> All interviews</Link>
        </Button>
        <p className="text-muted-foreground">Interview not found.</p>
      </div>
    );
  }

  if (!interview || !config) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading interview...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-1 -ml-2">
            <Link href="/portal/admin/lift/interviews"><ArrowLeft className="mr-1 h-4 w-4" /> All interviews</Link>
          </Button>
          <h1 className="text-3xl font-bold">{interview.title}</h1>
          <p className="text-muted-foreground">Configure the interview, shape its prompt, deploy it to respondents.</p>
        </div>
        <Badge variant={interview.status === "published" ? "default" : "secondary"} className="mt-2">
          {interview.status} · v{interview.version}
        </Badge>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="prompt">Prompt</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="setup">
          <SetupTab
            config={config}
            onChange={patchConfig}
            onSave={() => void save()}
            saving={saving}
            published={interview.status === "published"}
          />
        </TabsContent>
        <TabsContent value="prompt">
          <PromptTab config={config} onApply={patchConfig} />
        </TabsContent>
        <TabsContent value="deploy">
          <DeployTab interview={interview} onChanged={setInterview} />
        </TabsContent>
        <TabsContent value="results">
          <ResultsTab interviewId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Pull just the editable config fields off the stored doc. */
function extractConfig(doc: LiftInterviewDoc): InterviewConfig {
  return interviewConfigSchema.parse({
    title: doc.title,
    description: doc.description,
    processDescription: doc.processDescription,
    domain: doc.domain,
    mode: doc.mode,
    objective: doc.objective,
    targetAudience: doc.targetAudience,
    tone: doc.tone,
    topicsToCover: doc.topicsToCover,
    keyQuestions: doc.keyQuestions,
    followUpDepth: doc.followUpDepth,
    estimatedMinutes: doc.estimatedMinutes,
    evaluationRubric: doc.evaluationRubric,
    outputs: doc.outputs,
    greetingMessage: doc.greetingMessage,
    closingMessage: doc.closingMessage,
    systemPrompt: doc.systemPrompt,
  });
}
