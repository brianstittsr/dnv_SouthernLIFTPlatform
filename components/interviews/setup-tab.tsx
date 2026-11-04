"use client";

import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FOLLOW_UP_DEPTHS,
  INTERVIEW_DOMAINS,
  INTERVIEW_OUTPUTS,
  INTERVIEW_TONES,
  type InterviewConfig,
  type InterviewOutput,
} from "@/lib/interview/types";

const LINES = (v: string[]) => v.join("\n");
const toList = (v: string) =>
  v.split("\n").map((s) => s.trim()).filter(Boolean);

export interface SetupTabProps {
  config: InterviewConfig;
  onChange: (patch: Partial<InterviewConfig>) => void;
  onSave: () => void;
  saving: boolean;
  published: boolean;
}

/** Setup fields that shape the interview toward the creator's desired outcome. */
export function SetupTab({ config, onChange, onSave, saving, published }: SetupTabProps) {
  const toggleOutput = (output: InterviewOutput, checked: boolean) => {
    const next = checked
      ? [...new Set([...config.outputs, output])]
      : config.outputs.filter((o) => o !== output);
    onChange({ outputs: next });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ─── Basics ──────────────────────────────────────────────────── */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>What respondents see on the interview&apos;s landing page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="iv-title">Interview title</Label>
            <Input id="iv-title" value={config.title} onChange={(e) => onChange({ title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iv-domain">Domain</Label>
            <Select value={config.domain} onValueChange={(v) => onChange({ domain: v as InterviewConfig["domain"] })}>
              <SelectTrigger id="iv-domain"><SelectValue /></SelectTrigger>
              <SelectContent>
                {INTERVIEW_DOMAINS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="iv-desc">Description</Label>
            <Textarea
              id="iv-desc"
              rows={2}
              placeholder="Shown on the interview's welcome screen — tell respondents what this interview is about and why they were invited."
              value={config.description}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="iv-proc">Interview process description</Label>
            <Textarea
              id="iv-proc"
              rows={3}
              placeholder="Explains how the interview works (questions one at a time, ~X minutes, transcript reviewed by your team). Leave blank to use the default."
              value={config.processDescription}
              onChange={(e) => onChange({ processDescription: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Leave blank for a professional default based on the interview mode.</p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Outcome ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Your outcome</CardTitle>
          <CardDescription>Fields that help the AI interviewer deliver what you actually need.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="iv-objective">Objective — what should this interview accomplish?</Label>
            <Textarea
              id="iv-objective"
              rows={3}
              placeholder="e.g., Identify which service areas this client needs so an advisor can build a service plan before the first meeting."
              value={config.objective}
              onChange={(e) => onChange({ objective: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">The single most important field — it steers every question the AI asks.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="iv-audience">Who will be interviewed?</Label>
            <Input
              id="iv-audience"
              placeholder="e.g., Rural small business owners enrolled in LIFT"
              value={config.targetAudience}
              onChange={(e) => onChange({ targetAudience: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iv-topics">Topics the interview must cover</Label>
            <Textarea
              id="iv-topics"
              rows={4}
              placeholder={"One per line, e.g.:\nAccess to capital\nGovernment contracting experience\nBiggest current challenge"}
              value={LINES(config.topicsToCover)}
              onChange={(e) => onChange({ topicsToCover: toList(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">The AI won&apos;t close until these are covered (and marks each off as it goes).</p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Format ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Format &amp; style</CardTitle>
          <CardDescription>How the AI conducts the conversation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Interview mode</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["conversational", "scripted"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChange({ mode })}
                  className={`rounded-md border p-3 text-left text-sm transition-colors ${
                    config.mode === mode ? "border-primary bg-primary/5" : "hover:bg-muted"
                  }`}
                >
                  <div className="font-medium capitalize">{mode}</div>
                  <div className="text-xs text-muted-foreground">
                    {mode === "conversational"
                      ? "AI adapts and follows up naturally"
                      : "Fixed questions, in order"}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="iv-questions">
              {config.mode === "scripted" ? "Questions (asked in order)" : "Must-ask questions"}
            </Label>
            <Textarea
              id="iv-questions"
              rows={5}
              placeholder={"One per line. These seed from recommendations too — the Prompt tab can generate them for you."}
              value={LINES(config.keyQuestions)}
              onChange={(e) => onChange({ keyQuestions: toList(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iv-tone">Tone</Label>
              <Select value={config.tone} onValueChange={(v) => onChange({ tone: v as InterviewConfig["tone"] })}>
                <SelectTrigger id="iv-tone"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="iv-depth">Follow-up depth</Label>
              <Select value={config.followUpDepth} onValueChange={(v) => onChange({ followUpDepth: v as InterviewConfig["followUpDepth"] })}>
                <SelectTrigger id="iv-depth"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FOLLOW_UP_DEPTHS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="iv-minutes">Estimated length (minutes)</Label>
            <Input
              id="iv-minutes"
              type="number"
              min={2}
              max={60}
              className="w-28"
              value={config.estimatedMinutes}
              onChange={(e) => onChange({ estimatedMinutes: Math.min(60, Math.max(2, Number(e.target.value) || 10)) })}
            />
            <p className="text-xs text-muted-foreground">Shown to respondents and used to pace the conversation.</p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Evaluation ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation &amp; results</CardTitle>
          <CardDescription>What you get back from each completed interview.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="iv-rubric">Evaluation rubric</Label>
            <Textarea
              id="iv-rubric"
              rows={3}
              placeholder="e.g., Score readiness 1-5 on: capital documentation, contracting experience, clarity of needs. Flag anything requiring advisor follow-up."
              value={config.evaluationRubric}
              onChange={(e) => onChange({ evaluationRubric: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Applied to each transcript at completion — visible to you, never to respondents.</p>
          </div>
          <div className="space-y-2">
            <Label>Outputs per interview</Label>
            <div className="space-y-2">
              {INTERVIEW_OUTPUTS.map((o) => (
                <label key={o.value} className="flex items-start gap-3 text-sm">
                  <Checkbox
                    checked={config.outputs.includes(o.value)}
                    onCheckedChange={(c) => toggleOutput(o.value, c === true)}
                  />
                  <span>
                    <span className="font-medium">{o.label}</span>
                    <span className="block text-xs text-muted-foreground">{o.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Voice ───────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Opening &amp; closing</CardTitle>
          <CardDescription>Optional — customize what the interviewer says first and last.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="iv-greeting">Greeting message</Label>
            <Textarea
              id="iv-greeting"
              rows={2}
              placeholder="e.g., Hi! I'm an AI interviewer for the LIFT program. This takes about 10 minutes — ready when you are."
              value={config.greetingMessage}
              onChange={(e) => onChange({ greetingMessage: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iv-closing">Closing message</Label>
            <Textarea
              id="iv-closing"
              rows={2}
              placeholder="e.g., Thanks — an advisor will review your responses and follow up within two business days."
              value={config.closingMessage}
              onChange={(e) => onChange({ closingMessage: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex items-center gap-3">
        <Button onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save setup
        </Button>
        {published && (
          <p className="text-sm text-amber-600">Saving edits returns this interview to draft — republish to deploy.</p>
        )}
      </div>
    </div>
  );
}
