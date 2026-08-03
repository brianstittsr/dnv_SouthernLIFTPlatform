"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { auth } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Bot,
  Send,
  Loader2,
  User,
  Paperclip,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  Database,
  Layers,
  AlertTriangle,
  ArrowRight,
  Plus,
  History,
  Trash2,
  BarChart3,
  X,
  RefreshCw,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SiteImplementationPlan, SiteChangeRequest } from "@/app/api/admin/site-assistant/route";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasPlan?: boolean;
  plan?: SiteImplementationPlan;
}

interface ExecutionStep {
  step: string;
  status: "pending" | "done" | "error";
  message?: string;
  timestamp: string;
}

const SUGGESTED_REQUESTS = [
  "Add a new testimonial to the homepage testimonials section",
  "Update the hero banner headline and subtitle on the main landing page",
  "Create a new press release about our federal procurement center milestone",
  "Add an upcoming event for a CMMC webinar next month",
  "Change the consortium membership pricing description",
  "Update the about page with new team member information",
];

function PlanPanel({
  plan,
  onApprove,
  onRevise,
  isExecuting,
  executionLog,
  executionSummary,
}: {
  plan: SiteImplementationPlan;
  onApprove: (mode: "plan_only" | "execute") => void;
  onRevise: () => void;
  isExecuting: boolean;
  executionLog: ExecutionStep[];
  executionSummary: { total: number; completed: number; failed: number; pending: number } | null;
}) {
  const [sectionsOpen, setSectionsOpen] = useState({
    pages: true,
    assets: false,
    firestore: false,
    steps: true,
    risks: false,
  });

  const complexityColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }[plan.estimatedComplexity];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Implementation Plan Ready</span>
        </div>
        <Badge className={cn("text-xs", complexityColor)}>
          Complexity: {plan.estimatedComplexity}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground italic">{plan.summary}</p>

      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <strong>Requested change:</strong>
        <p className="mt-1 text-muted-foreground">{plan.requestedChange}</p>
      </div>

      {/* Affected Pages */}
      <Collapsible
        open={sectionsOpen.pages}
        onOpenChange={(v) => setSectionsOpen((s) => ({ ...s, pages: v }))}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between h-8 px-3">
            <span className="flex items-center gap-2 text-xs font-medium">
              <Layers className="h-3 w-3" />
              Affected Pages / Components ({plan.affectedPages.length})
            </span>
            {sectionsOpen.pages ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 mt-2">
            {plan.affectedPages.map((page, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-background rounded border text-xs">
                <code className="text-primary font-mono shrink-0">{page.path}</code>
                <div>
                  <div className="font-medium">{page.name}</div>
                  <div className="text-muted-foreground">{page.change}</div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Content Assets */}
      {plan.contentAssets.length > 0 && (
        <Collapsible
          open={sectionsOpen.assets}
          onOpenChange={(v) => setSectionsOpen((s) => ({ ...s, assets: v }))}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between h-8 px-3">
              <span className="flex items-center gap-2 text-xs font-medium">
                <Paperclip className="h-3 w-3" />
                Content / Assets ({plan.contentAssets.length})
              </span>
              {sectionsOpen.assets ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-1 mt-2">
              {plan.contentAssets.map((asset, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded border text-xs">
                  <Badge
                    variant={asset.status === "available" ? "secondary" : "outline"}
                    className={cn("text-xs shrink-0", asset.status === "needed" && "border-orange-400 text-orange-700")}
                  >
                    {asset.status === "available" ? "Available" : "Needed"}
                  </Badge>
                  <span className="text-muted-foreground">{asset.description}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Firestore Updates */}
      {plan.firestoreUpdates.length > 0 && (
        <Collapsible
          open={sectionsOpen.firestore}
          onOpenChange={(v) => setSectionsOpen((s) => ({ ...s, firestore: v }))}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between h-8 px-3">
              <span className="flex items-center gap-2 text-xs font-medium">
                <Database className="h-3 w-3" />
                Firestore Updates ({plan.firestoreUpdates.length})
              </span>
              {sectionsOpen.firestore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-1 mt-2">
              {plan.firestoreUpdates.map((u, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded border text-xs">
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-xs",
                      u.action === "create" && "border-green-400 text-green-700",
                      u.action === "update" && "border-blue-400 text-blue-700",
                      u.action === "delete" && "border-red-400 text-red-700"
                    )}
                  >
                    {u.action}
                  </Badge>
                  <div>
                    <code className="text-primary font-mono">{u.collection}</code>
                    {u.documentId && <span className="text-muted-foreground"> / {u.documentId}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Implementation Steps */}
      <Collapsible
        open={sectionsOpen.steps}
        onOpenChange={(v) => setSectionsOpen((s) => ({ ...s, steps: v }))}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between h-8 px-3">
            <span className="flex items-center gap-2 text-xs font-medium">
              <ArrowRight className="h-3 w-3" />
              Implementation Steps ({plan.implementationSteps.length})
            </span>
            {sectionsOpen.steps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ol className="space-y-2 mt-2">
            {plan.implementationSteps.map((step) => (
              <li key={step.order} className="flex gap-3 p-2 rounded border text-xs">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {step.order}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{step.title}</span>
                    <Badge variant="outline" className={cn("text-xs", step.automated ? "border-green-400 text-green-700" : "border-orange-400 text-orange-700")}>
                      {step.automated ? "Auto" : "Manual"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </CollapsibleContent>
      </Collapsible>

      {/* Risks */}
      {plan.risks.length > 0 && (
        <Collapsible
          open={sectionsOpen.risks}
          onOpenChange={(v) => setSectionsOpen((s) => ({ ...s, risks: v }))}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between h-8 px-3">
              <span className="flex items-center gap-2 text-xs font-medium text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                Risks & Notes ({plan.risks.length})
              </span>
              {sectionsOpen.risks ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="space-y-1 mt-2">
              {plan.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 p-2 rounded border border-orange-200 bg-orange-50 text-xs text-orange-800">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                  {risk}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Execution Log */}
      {executionLog.length > 0 && (
        <div className="space-y-2">
          <Separator />
          <p className="text-xs font-medium flex items-center gap-2">
            <BarChart3 className="h-3 w-3" />
            Execution Progress
          </p>
          {executionSummary && (
            <div className="flex gap-3 text-xs">
              <span className="text-green-700">✓ {executionSummary.completed} done</span>
              {executionSummary.failed > 0 && <span className="text-red-700">✗ {executionSummary.failed} failed</span>}
              {executionSummary.pending > 0 && <span className="text-orange-600">⏳ {executionSummary.pending} manual</span>}
            </div>
          )}
          <div className="space-y-1">
            {executionLog.map((log, i) => (
              <div key={i} className={cn(
                "flex items-start gap-2 p-2 rounded text-xs",
                log.status === "done" && "bg-green-50 text-green-800",
                log.status === "error" && "bg-red-50 text-red-800",
                log.status === "pending" && "bg-orange-50 text-orange-800"
              )}>
                {log.status === "done" && <CheckCircle className="h-3 w-3 shrink-0 mt-0.5" />}
                {log.status === "error" && <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />}
                {log.status === "pending" && <Clock className="h-3 w-3 shrink-0 mt-0.5" />}
                <div>
                  <div className="font-medium">{log.step}</div>
                  {log.message && <div className="opacity-75">{log.message}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {executionLog.length === 0 && (
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => onApprove("execute")}
            disabled={isExecuting}
            className="flex-1"
          >
            {isExecuting ? (
              <><Loader2 className="h-3 w-3 mr-2 animate-spin" />Executing...</>
            ) : (
              <><Play className="h-3 w-3 mr-2" />Approve & Execute</>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onApprove("plan_only")}
            disabled={isExecuting}
          >
            <Eye className="h-3 w-3 mr-2" />
            Plan Only
          </Button>
          <Button size="sm" variant="ghost" onClick={onRevise} disabled={isExecuting}>
            Revise
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SiteAssistantPage() {
  const { profile } = useUserProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const [attachedLinks, setAttachedLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [activePlan, setActivePlan] = useState<SiteImplementationPlan | null>(null);
  const [executionLog, setExecutionLog] = useState<ExecutionStep[]>([]);
  const [executionSummary, setExecutionSummary] = useState<{ total: number; completed: number; failed: number; pending: number } | null>(null);
  const [pastSessions, setPastSessions] = useState<SiteChangeRequest[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = useCallback(async () => {
    const userId = auth?.currentUser?.uid;
    if (!userId) return;
    try {
      const res = await fetch(`/api/admin/site-assistant?userId=${userId}`);
      const data = await res.json();
      if (data.sessions) setPastSessions(data.sessions);
    } catch {
      // non-fatal
    }
  }, []);

  async function handleSubmit(query?: string) {
    const text = query || input;
    if (!text.trim()) return;

    const userId = auth?.currentUser?.uid || profile?.id || "unknown";

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      }));

      const res = await fetch("/api/admin/site-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId,
          conversationHistory,
          attachedLinks,
          userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Plan generated. See details below.",
        timestamp: new Date(),
        hasPlan: data.hasPlan,
        plan: data.plan,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (data.plan) {
        setActivePlan(data.plan);
        setExecutionLog([]);
        setExecutionSummary(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to get response";
      toast.error(msg);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `Error: ${msg}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprovePlan(mode: "plan_only" | "execute") {
    if (!activePlan) return;

    if (mode === "plan_only") {
      toast.success("Plan saved. No changes were made to the site.");
      setActivePlan(null);
      return;
    }

    const userId = auth?.currentUser?.uid || profile?.id || "unknown";
    setIsExecuting(true);

    try {
      const res = await fetch("/api/admin/site-assistant/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, plan: activePlan, userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution failed");

      setExecutionLog(data.executionLog || []);
      setExecutionSummary(data.summary);

      if (data.status === "completed") {
        toast.success("All automated steps completed successfully!");
      } else if (data.status === "failed") {
        toast.error("Some steps failed. Check the execution log.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setIsExecuting(false);
    }
  }

  function handleRevise() {
    setActivePlan(null);
    setExecutionLog([]);
    setExecutionSummary(null);
    setInput("Please revise the plan: ");
    inputRef.current?.focus();
  }

  function addLink() {
    const url = linkInput.trim();
    if (!url) return;
    if (!attachedLinks.includes(url)) {
      setAttachedLinks((prev) => [...prev, url]);
    }
    setLinkInput("");
    setShowLinkInput(false);
  }

  function startNewSession() {
    setMessages([]);
    setActivePlan(null);
    setExecutionLog([]);
    setExecutionSummary(null);
    setAttachedLinks([]);
    setInput("");
  }

  return (
    <div className="container mx-auto p-6 space-y-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" />
            Site Implementation Assistant
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Describe a website change in plain language — get a structured plan, then execute it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button variant="outline" size="sm" onClick={startNewSession}>
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Past Change Requests</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pastSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No past sessions found.</p>
            ) : (
              <div className="space-y-2">
                {pastSessions.slice(0, 10).map((session) => (
                  <div key={session.sessionId} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{session.userRequest?.slice(0, 80)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(session.updatedAt).toLocaleDateString()} ·{" "}
                        <Badge variant="secondary" className="text-xs">{session.status}</Badge>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Chat Panel */}
        <div className="xl:col-span-2 flex flex-col" style={{ minHeight: "600px" }}>
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Conversation</CardTitle>
                  <CardDescription className="text-xs">Describe the change you want to make to the KDM/SVP website</CardDescription>
                </div>
                {messages.length > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs" onClick={startNewSession}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    New
                  </Button>
                )}
              </div>
            </CardHeader>

            <Separator />

            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-6">
                  <Bot className="h-14 w-14 text-primary/20" />
                  <div className="space-y-2">
                    <h3 className="font-semibold">What would you like to change?</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Describe a website change in plain language. I&apos;ll ask clarifying questions if needed, then generate a complete implementation plan for your approval.
                    </p>
                  </div>
                  <div className="grid gap-2 w-full max-w-lg">
                    <p className="text-xs text-muted-foreground">Try asking:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {SUGGESTED_REQUESTS.map((req) => (
                        <Button
                          key={req}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1.5 text-left"
                          onClick={() => handleSubmit(req)}
                        >
                          {req}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}

                      <div className={cn(
                        "max-w-[80%] rounded-lg px-4 py-3 text-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        <div className="text-xs opacity-50 mt-2">
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {msg.hasPlan && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            Implementation plan generated — see plan panel
                          </div>
                        )}
                      </div>

                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Analyzing request...
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              )}
            </ScrollArea>

            <Separator />

            {/* Attached Links */}
            {attachedLinks.length > 0 && (
              <div className="px-4 pt-3 flex flex-wrap gap-2">
                {attachedLinks.map((link) => (
                  <Badge key={link} variant="secondary" className="text-xs flex items-center gap-1 pr-1">
                    <LinkIcon className="h-3 w-3" />
                    <span className="max-w-[160px] truncate">{link}</span>
                    <button
                      onClick={() => setAttachedLinks((prev) => prev.filter((l) => l !== link))}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {showLinkInput && (
              <div className="px-4 pt-2 flex gap-2">
                <Input
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https://example.com/reference"
                  className="text-sm h-8"
                  onKeyDown={(e) => e.key === "Enter" && addLink()}
                />
                <Button size="sm" className="h-8" onClick={addLink}>Add</Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowLinkInput(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Input Row */}
            <div className="p-4 space-y-2">
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe the website change you want to make..."
                  className="flex-1 min-h-[60px] max-h-[120px] resize-none text-sm"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <div className="flex flex-col gap-1.5">
                  <Button
                    onClick={() => handleSubmit()}
                    disabled={isLoading || !input.trim()}
                    size="sm"
                    className="h-9"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    title="Attach reference link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Enter to send · Shift+Enter for new line · Use the link icon to attach reference URLs
              </p>
            </div>
          </Card>
        </div>

        {/* Plan Panel */}
        <div className="xl:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Implementation Plan
              </CardTitle>
              <CardDescription className="text-xs">
                The plan will appear here once enough context is gathered. Review and approve before any changes are made.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {!activePlan && executionLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <FileText className="h-10 w-10 text-muted-foreground/30" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">No plan yet</p>
                    <p className="text-xs text-muted-foreground">
                      Start a conversation to generate a structured implementation plan.
                    </p>
                  </div>
                  <div className="space-y-2 w-full text-left">
                    <p className="text-xs font-medium text-muted-foreground">Plan includes:</p>
                    {[
                      "Affected pages & components",
                      "Content / asset requirements",
                      "Firestore collection updates",
                      "Step-by-step implementation",
                      "Risks & rollback notes",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-primary/40" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : activePlan ? (
                <ScrollArea className="max-h-[600px]">
                  <PlanPanel
                    plan={activePlan}
                    onApprove={handleApprovePlan}
                    onRevise={handleRevise}
                    isExecuting={isExecuting}
                    executionLog={executionLog}
                    executionSummary={executionSummary}
                  />
                </ScrollArea>
              ) : executionLog.length > 0 ? (
                <div className="space-y-3">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Execution complete. See log below.
                    </AlertDescription>
                  </Alert>
                  {executionSummary && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-green-50 rounded p-2">
                        <div className="text-lg font-bold text-green-700">{executionSummary.completed}</div>
                        <div className="text-xs text-green-600">Done</div>
                      </div>
                      {executionSummary.failed > 0 && (
                        <div className="bg-red-50 rounded p-2">
                          <div className="text-lg font-bold text-red-700">{executionSummary.failed}</div>
                          <div className="text-xs text-red-600">Failed</div>
                        </div>
                      )}
                      {executionSummary.pending > 0 && (
                        <div className="bg-orange-50 rounded p-2">
                          <div className="text-lg font-bold text-orange-700">{executionSummary.pending}</div>
                          <div className="text-xs text-orange-600">Manual</div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="space-y-1">
                    {executionLog.map((log, i) => (
                      <div key={i} className={cn(
                        "flex items-start gap-2 p-2 rounded text-xs",
                        log.status === "done" && "bg-green-50 text-green-800",
                        log.status === "error" && "bg-red-50 text-red-800",
                        log.status === "pending" && "bg-orange-50 text-orange-800"
                      )}>
                        {log.status === "done" && <CheckCircle className="h-3 w-3 shrink-0 mt-0.5" />}
                        {log.status === "error" && <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />}
                        {log.status === "pending" && <Clock className="h-3 w-3 shrink-0 mt-0.5" />}
                        <div>
                          <div className="font-medium">{log.step}</div>
                          {log.message && <div className="opacity-75">{log.message}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={startNewSession}>
                    <Plus className="h-3 w-3 mr-2" />
                    Start New Request
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
