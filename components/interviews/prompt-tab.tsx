"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Lightbulb, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { liftFetch } from "@/components/forms/lift-api";
import type { InterviewConfig, InterviewPromptRecommendation } from "@/lib/interview/types";

interface SuggestResult {
  systemPrompt: string;
  suggestedQuestions: string[];
  tips: string[];
  aiPowered: boolean;
}

export interface PromptTabProps {
  config: InterviewConfig;
  onApply: (patch: Partial<InterviewConfig>) => void;
}

/** Curated prompt recommendations + AI-generated prompt editing. */
export function PromptTab({ config, onApply }: PromptTabProps) {
  const [recommendations, setRecommendations] = useState<InterviewPromptRecommendation[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      setRecommendations(
        await liftFetch<InterviewPromptRecommendation[]>(`/api/lift/interviews/recommendations?domain=${config.domain}`)
      );
    } catch {
      setRecommendations([]);
    }
  }, [config.domain]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyRecommendation = (rec: InterviewPromptRecommendation) => {
    onApply({
      systemPrompt: rec.systemPrompt,
      keyQuestions: rec.suggestedQuestions,
      objective: config.objective || rec.suggestedObjective,
      topicsToCover: config.topicsToCover.length ? config.topicsToCover : rec.suggestedTopics,
      evaluationRubric: config.evaluationRubric || rec.suggestedRubric,
    });
    toast.success(`Applied "${rec.title}" — review the prompt below, then save.`);
  };

  const generate = async () => {
    setGenerating(true);
    setTips([]);
    try {
      const result = await liftFetch<SuggestResult>("/api/lift/interviews/suggest-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      onApply({ systemPrompt: result.systemPrompt });
      setSuggestedQuestions(result.suggestedQuestions);
      setTips(result.tips);
      toast.success(
        result.aiPowered
          ? "Generated a prompt from your setup fields."
          : "OpenAI isn't configured — applied the closest template instead."
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Prompt generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* ─── Recommendations ─────────────────────────────────────────── */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Prompt recommendations</CardTitle>
          <CardDescription>
            Curated interviewer prompts for the {INTERVIEW_DOMAIN_SHORT[config.domain] ?? config.domain} domain. Using
            one fills the prompt, questions, and any empty setup fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!recommendations ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
          ) : recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recommendations for this domain — try &quot;Generate with AI&quot;.</p>
          ) : (
            recommendations.map((rec) => (
              <div key={rec.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{rec.title}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{rec.suggestedQuestions.length} questions</Badge>
                  <Button size="sm" variant="secondary" onClick={() => applyRecommendation(rec)}>
                    <Check className="mr-1 h-3 w-3" /> Use this
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ─── Editor + AI generate ────────────────────────────────────── */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Interviewer prompt</CardTitle>
              <CardDescription>
                The system prompt the AI interviewer runs on. Generate one from your setup, adopt a recommendation, or
                write your own — it always gets the interview rules appended at runtime.
              </CardDescription>
            </div>
            <Button onClick={() => void generate()} disabled={generating} variant="secondary">
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate with AI
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="iv-systemprompt">System prompt</Label>
            <Textarea
              id="iv-systemprompt"
              rows={16}
              className="font-mono text-sm"
              placeholder="Leave blank and one is assembled automatically from your setup fields — or generate/adopt one here to customize it."
              value={config.systemPrompt}
              onChange={(e) => onApply({ systemPrompt: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to auto-assemble from setup. Use <code>{"{{estimatedMinutes}}"}</code> to insert the target length.
            </p>
          </div>

          {suggestedQuestions.length > 0 && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Suggested questions
              </div>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {suggestedQuestions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
              <Button size="sm" variant="outline" onClick={() => { onApply({ keyQuestions: suggestedQuestions }); toast.success("Added to must-ask questions."); }}>
                Add to questions
              </Button>
            </div>
          )}

          {tips.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
              {tips.map((tip) => (
                <p key={tip} className="text-sm text-amber-800 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" /> {tip}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const INTERVIEW_DOMAIN_SHORT: Record<string, string> = {
  business_advising: "business advising",
  hiring_screening: "hiring & screening",
  customer_research: "customer research",
  program_readiness: "program readiness",
  custom: "custom",
};
