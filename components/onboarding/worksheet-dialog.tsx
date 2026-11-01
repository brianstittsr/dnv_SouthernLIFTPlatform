"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileDown, FileUp, Loader2, Play, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  coerceField,
  findWorksheetField,
  type WorksheetAnswers,
} from "@/lib/onboarding/worksheet";
import { checkWorksheet, type WorksheetIssue } from "@/lib/onboarding/worksheet-qc";

interface WorksheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Resuming at this index lands on the wizard's last (Review) step — the wizard clamps to its step count. */
const REVIEW_STEP = 999;

type Stage =
  | { name: "menu" }
  | { name: "fix"; answers: WorksheetAnswers; issues: WorksheetIssue[]; index: number; fixed: number }
  | { name: "confirm"; answers: WorksheetAnswers; fixed: number };

/**
 * Preparation dialog before LIFT client onboarding: download the Word
 * worksheet, upload a completed one, fix any fields that fail the
 * quality-control check in a guided field wizard, then the verified
 * answers are written to the onboarding draft and the wizard opens on
 * the Review step at 100% for final changes.
 */
export function WorksheetDialog({ open, onOpenChange }: WorksheetDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>({ name: "menu" });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entry, setEntry] = useState("");
  const [entryNoLinkedin, setEntryNoLinkedin] = useState(false);
  const [entryConfirmed, setEntryConfirmed] = useState(false);

  const reset = () => {
    setStage({ name: "menu" });
    setEntry("");
    setEntryNoLinkedin(false);
    setEntryConfirmed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const startWizard = () => {
    handleOpenChange(false);
    router.push("/portal/onboarding");
  };

  const idToken = async (): Promise<string> => {
    const token = await auth?.currentUser?.getIdToken();
    if (!token) throw new Error("Please sign in again before uploading.");
    return token;
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/onboarding/worksheet", {
        method: "POST",
        headers: { Authorization: `Bearer ${await idToken()}` },
        body,
      });
      const result = (await response.json().catch(() => ({}))) as {
        data?: { answers: WorksheetAnswers; fieldsFilled: number };
        error?: string;
      };
      if (!response.ok || !result.data) {
        throw new Error(result.error || "Could not read the worksheet");
      }

      const { answers, fieldsFilled } = result.data;
      const issues = checkWorksheet(answers);
      if (issues.length > 0) {
        setStage({ name: "fix", answers, issues, index: 0, fixed: 0 });
        toast.message(
          `We read ${fieldsFilled} fields — ${issues.length} need${issues.length === 1 ? "s" : ""} a quick check.`,
        );
      } else {
        setStage({ name: "confirm", answers, fixed: 0 });
      }
    } catch (error) {
      console.error("Worksheet upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Could not read the worksheet");
    } finally {
      setIsUploading(false);
    }
  };

  /** Applies the current fix-wizard entry to the answers, then advances. */
  const applyEntry = (fix: Extract<Stage, { name: "fix" }>, skip: boolean) => {
    const issue = fix.issues[fix.index];
    const field = findWorksheetField(issue.key);
    const answers = { ...fix.answers };
    let applied = false;

    if (!skip && field) {
      if (issue.key === "linkedin" && entryNoLinkedin) {
        answers.noLinkedin = true;
        delete answers.linkedin;
        applied = true;
      } else {
        const value = coerceField(field, [entry]);
        if (value !== undefined && !(Array.isArray(value) && value.length === 0)) {
          answers[issue.key] = value;
          applied = true;
        }
      }
    }

    if (!skip && issue.required && !applied) {
      toast.error("A valid answer is required for this field.");
      return;
    }

    const next = { ...fix, index: fix.index + 1, fixed: fix.fixed + (applied ? 1 : 0) };
    setEntry("");
    setEntryNoLinkedin(false);
    setEntryConfirmed(false);
    if (next.index >= fix.issues.length) {
      setStage({ name: "confirm", answers: next.answers, fixed: next.fixed });
    } else {
      setStage(next);
    }
  };

  /** Writes verified answers to the draft at the Review step, then opens the wizard. */
  const populateAndReview = async (answers: WorksheetAnswers) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/onboarding/worksheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await idToken()}`,
        },
        body: JSON.stringify({ answers, step: REVIEW_STEP }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Could not save your answers");
      }
      toast.success("Onboarding populated", {
        description: "You're on the Review step — check everything and submit when ready.",
      });
      startWizard();
    } catch (error) {
      console.error("Saving worksheet answers failed:", error);
      toast.error(error instanceof Error ? error.message : "Could not save your answers");
    } finally {
      setIsSaving(false);
    }
  };

  /** Renders the input appropriate for the current fix-wizard issue. */
  const renderIssueInput = (issue: WorksheetIssue) => {
    if (issue.key === "linkedin") {
      return (
        <div className="space-y-3">
          <Input
            type="url"
            placeholder="https://www.linkedin.com/in/..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            disabled={entryNoLinkedin}
          />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={entryNoLinkedin}
              onCheckedChange={(checked) => setEntryNoLinkedin(checked === true)}
            />
            I don&apos;t have a LinkedIn profile (personal or company)
          </label>
        </div>
      );
    }
    if (issue.kind === "bool") {
      return (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={entryConfirmed}
            onCheckedChange={(checked) => {
              setEntryConfirmed(checked === true);
              setEntry(checked === true ? "yes" : "");
            }}
          />
          Yes, I confirm
        </label>
      );
    }
    if (issue.kind === "yesno" || (issue.kind === "choice" && issue.options)) {
      const options = issue.kind === "yesno" ? ["yes", "no"] : issue.options!;
      return (
        <Select value={entry} onValueChange={setEntry}>
          <SelectTrigger>
            <SelectValue placeholder="Choose..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (issue.kind === "contacts") {
      return (
        <Textarea
          rows={4}
          placeholder={"One per line: Name, email"}
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        />
      );
    }
    const inputType =
      issue.key === "contactEmail" ? "email" : issue.kind === "number" ? "number" : issue.key === "website" ? "url" : "text";
    return (
      <Input
        type={inputType}
        placeholder={issue.kind === "list" ? "Separate multiple with commas" : "Type your answer"}
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />
    );
  };

  const entryIsUsable = (issue: WorksheetIssue): boolean => {
    if (issue.key === "linkedin") return entryNoLinkedin || entry.trim().length > 0;
    if (issue.kind === "bool") return entryConfirmed;
    return entry.trim().length > 0;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {stage.name === "menu" && (
          <>
            <DialogHeader>
              <DialogTitle>Prepare for LIFT onboarding</DialogTitle>
              <DialogDescription>
                The wizard asks about your business, certifications, and goals.
                You can gather everything first with our Word worksheet — or
                upload it once completed and we&apos;ll fill the fields for you.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/api/onboarding/worksheet" download>
                  <FileDown className="mr-2 h-4 w-4" />
                  Download the Word worksheet
                </a>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileUp className="mr-2 h-4 w-4" />
                )}
                {isUploading ? "Reading your worksheet..." : "Upload your completed worksheet"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                }}
              />

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button className="w-full" onClick={startWizard}>
                <Play className="mr-2 h-4 w-4" />
                Start the onboarding wizard
              </Button>
            </div>
          </>
        )}

        {stage.name === "fix" && (
          <>
            <DialogHeader>
              <DialogTitle>Quick check — field {stage.index + 1} of {stage.issues.length}</DialogTitle>
              <DialogDescription>
                A few entries from your worksheet need attention before we fill the form.
              </DialogDescription>
            </DialogHeader>
            <Progress value={((stage.index + 1) / stage.issues.length) * 100} className="h-1.5" />

            {(() => {
              const issue = stage.issues[stage.index];
              return (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="fix-entry">{issue.label}</Label>
                    <p className="mt-1 text-sm text-muted-foreground">{issue.message}</p>
                  </div>
                  {renderIssueInput(issue)}
                  <div className="flex items-center justify-between pt-1">
                    {!issue.required ? (
                      <Button variant="ghost" size="sm" onClick={() => applyEntry(stage, true)}>
                        Skip this field
                      </Button>
                    ) : (
                      <span />
                    )}
                    <Button
                      size="sm"
                      disabled={issue.required && !entryIsUsable(issue)}
                      onClick={() => applyEntry(stage, false)}
                    >
                      Save &amp; continue
                    </Button>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {stage.name === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Ready to review</DialogTitle>
              <DialogDescription>
                We&apos;ll populate your onboarding with the answers from your
                worksheet{stage.fixed > 0 ? ` plus the ${stage.fixed} field${stage.fixed === 1 ? "" : "s"} you just corrected` : ""}.
                You&apos;ll land on the Review step to check everything before submitting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Button className="w-full" disabled={isSaving} onClick={() => void populateAndReview(stage.answers)}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {isSaving ? "Populating your form..." : "Populate my onboarding form"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={reset}>
                Start over
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
