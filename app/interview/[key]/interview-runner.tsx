"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Bot, CheckCircle2, Clock, FileText, ListChecks, Loader2, Send, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { cn } from "@/lib/utils";

interface InterviewInfo {
  title: string;
  description: string;
  processDescription: string;
  estimatedMinutes: number;
  mode: "conversational" | "scripted";
  alreadyCompleted: boolean;
  recipientName?: string;
  recipientEmail?: string;
  resumable: boolean;
  captchaSiteKey: string | null;
}

interface ChatMessage {
  role: "assistant" | "respondent";
  content: string;
}

type Phase = "loading" | "landing" | "chat" | "done" | "error";

/** Public interview runner — works for invite links (inv_) and public links (pub_). */
export function InterviewRunner() {
  const params = useParams<{ key: string }>();
  const key = params.key;
  const [phase, setPhase] = useState<Phase>("loading");
  const [info, setInfo] = useState<InterviewInfo | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number | null }>({ current: 0, total: null });
  const scrollRef = useRef<HTMLDivElement>(null);

  const api = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      const res = await fetch(`/api/public/interview/${encodeURIComponent(key)}${path}`, {
        credentials: "same-origin",
        ...init,
      });
      const body = (await res.json().catch(() => ({}))) as { data?: T; error?: string };
      if (!res.ok) throw new Error(body.error ?? "Request failed");
      return body.data as T;
    },
    [key]
  );

  useEffect(() => {
    api<InterviewInfo>("")
      .then((data) => {
        setInfo(data);
        setName(data.recipientName ?? "");
        setEmail(data.recipientEmail ?? "");
        setPhase(data.alreadyCompleted ? "done" : "landing");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "This interview link is not available");
        setPhase("error");
      });
  }, [api]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const start = async () => {
    if (!name.trim()) return;
    setPhase("chat");
    setThinking(true);
    try {
      const result = await api<{ sessionId: string; messages: ChatMessage[]; finished?: boolean }>("/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined, captchaToken: captchaToken ?? undefined, website: "" }),
      });
      setSessionId(result.sessionId);
      setMessages(result.messages);
      if (result.finished) setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the interview");
      setPhase("error");
    } finally {
      setThinking(false);
    }
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || !sessionId || thinking) return;
    setDraft("");
    setMessages((m) => [...m, { role: "respondent", content: text }]);
    setThinking(true);
    try {
      const result = await api<{ reply: string; finished: boolean; questionIndex?: number; totalQuestions: number | null }>(
        "/message",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message: text }),
        }
      );
      setMessages((m) => [...m, { role: "assistant", content: result.reply }]);
      if (result.totalQuestions) setProgress({ current: result.questionIndex ?? 0, total: result.totalQuestions });
      if (result.finished) setPhase("done");
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: err instanceof Error ? err.message : "Something went wrong — please try again." }]);
    } finally {
      setThinking(false);
    }
  };

  const endEarly = async () => {
    if (!sessionId || thinking) return;
    setThinking(true);
    try {
      await api("/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setPhase("done");
    } catch {
      setPhase("done");
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">AI Interview</p>
            <h1 className="text-xl font-bold leading-tight">{info?.title ?? "Interview"}</h1>
          </div>
        </div>

        {phase === "loading" && (
          <Card><CardContent className="flex items-center gap-3 p-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading your interview...</CardContent></Card>
        )}

        {phase === "error" && (
          <Card><CardContent className="p-8 text-center">
            <p className="font-medium">This interview isn&apos;t available</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </CardContent></Card>
        )}

        {phase === "done" && (
          <Card><CardContent className="p-10 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="text-xl font-semibold">Interview complete</h2>
            <p className="text-sm text-muted-foreground">
              Thank you{info?.recipientName ? `, ${info.recipientName.split(" ")[0]}` : ""} — your responses were recorded
              and will be reviewed by the team that sent this interview.
            </p>
          </CardContent></Card>
        )}

        {phase === "landing" && info && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8 space-y-6">
                {info.description && <p className="text-base leading-relaxed">{info.description}</p>}

                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">How it works</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{info.processDescription}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-muted/30 p-3 text-center">
                    <ListChecks className="mx-auto mb-1 h-5 w-5 text-primary" />
                    <p className="text-xs font-medium">{info.mode === "scripted" ? "Prepared questions" : "Natural conversation"}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 text-center">
                    <Clock className="mx-auto mb-1 h-5 w-5 text-primary" />
                    <p className="text-xs font-medium">About {info.estimatedMinutes} minutes</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 text-center">
                    <FileText className="mx-auto mb-1 h-5 w-5 text-primary" />
                    <p className="text-xs font-medium">No login needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="iv-name">Your name</Label>
                    <Input id="iv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iv-email">Email <span className="text-muted-foreground">(optional)</span></Label>
                    <Input id="iv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                </div>
                {info.captchaSiteKey && <TurnstileWidget siteKey={info.captchaSiteKey} onToken={setCaptchaToken} />}
                <Button className="w-full" size="lg" onClick={() => void start()} disabled={!name.trim()}>
                  {info.resumable ? "Resume interview" : "Start the interview"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Your answers are recorded as a transcript and shared only with the team that sent this interview.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {phase === "chat" && (
          <Card className="flex h-[70vh] flex-col overflow-hidden">
            {progress.total ? (
              <div className="border-b px-4 py-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Question {Math.min(progress.current + 1, progress.total)} of {progress.total}</span>
                  <span>{Math.round(((progress.current) / progress.total) * 100)}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, (progress.current / progress.total) * 100)}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "assistant" ? "justify-start" : "justify-end")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                      m.role === "assistant" ? "rounded-bl-sm bg-muted" : "rounded-br-sm bg-primary text-primary-foreground"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  rows={2}
                  placeholder="Type your answer..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  className="resize-none"
                />
                <div className="flex flex-col gap-1">
                  <Button size="icon" onClick={() => void send()} disabled={!draft.trim() || thinking}>
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title="End interview" onClick={() => void endEarly()} disabled={thinking}>
                    <StopCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
    </div>
  );
}
