"use client";

import { useState, useEffect, useMemo, type ReactElement } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth as firebaseAuth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Mail,
  ShieldCheck,
  Sparkles,
  Clock,
} from "lucide-react";

interface ReviewFinding {
  field: string;
  severity: "missing" | "weak" | "ok";
  note: string;
  source: "rule" | "ai";
}

interface MemberDetail {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  membershipStatus?: string;
  avatar?: string;
  onboardingReviewStatus: "not_reviewed" | "changes_requested" | "approved";
  naicsCodes: string[];
  certifications: string[];
  companyIntelligence: any;
  readinessDocuments: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface HistoryEntry {
  id: string;
  action: "requested_changes" | "approved";
  adminName?: string;
  aiSummary?: string;
  emailMessage?: string;
  createdAt?: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  missing: "bg-red-100 text-red-800 border-red-300",
  weak: "bg-amber-100 text-amber-800 border-amber-300",
  ok: "bg-green-100 text-green-800 border-green-300",
};

const SEVERITY_ICON: Record<string, ReactElement> = {
  missing: <XCircle className="h-4 w-4 text-red-600" />,
  weak: <AlertTriangle className="h-4 w-4 text-amber-600" />,
  ok: <CheckCircle2 className="h-4 w-4 text-green-600" />,
};

function defaultDraftMessage(name: string, items: ReviewFinding[]): string {
  return `Hi ${name},\n\nThanks for completing your KDM Consortium onboarding! Our team reviewed your profile and found a few items that need more detail before we can activate AI-powered opportunity matching, recommendations, and teaming for your account.`;
}

export default function OnboardingReviewDetailPage() {
  const params = useParams<{ memberId: string }>();
  const router = useRouter();
  const memberId = params.memberId;

  const [member, setMember] = useState<MemberDetail | null>(null);
  const [findings, setFindings] = useState<ReviewFinding[]>([]);
  const [readyForApproval, setReadyForApproval] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getToken = async () => {
    const currentUser = firebaseAuth?.currentUser;
    if (!currentUser) throw new Error("You must be signed in");
    return currentUser.getIdToken();
  };

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/onboarding-review/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load member");
      setMember(data.data);
      setFindings(data.analysis?.findings || []);
      setReadyForApproval(data.analysis?.readyForApproval ?? false);
      setAiSummary(data.analysis?.aiSummary || "");
      setHistory(data.history || []);

      const issues = (data.analysis?.findings || []).filter((f: ReviewFinding) => f.severity !== "ok");
      setSelectedItems(new Set(issues.map((f: ReviewFinding) => f.field)));
    } catch (error) {
      console.error("Error loading member detail:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load member");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const issues = useMemo(() => findings.filter((f) => f.severity !== "ok"), [findings]);
  const okFindings = useMemo(() => findings.filter((f) => f.severity === "ok"), [findings]);

  const toggleSelected = (field: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const openRequestDialog = () => {
    if (!member) return;
    const name = `${member.firstName} ${member.lastName}`.trim() || "there";
    setDraftMessage(defaultDraftMessage(name, issues));
    setShowRequestDialog(true);
  };

  const handleSendRequestChanges = async () => {
    if (!member) return;
    const items = issues
      .filter((f) => selectedItems.has(f.field))
      .map((f) => ({ field: f.field, note: f.note }));

    if (items.length === 0) {
      toast.error("Select at least one item to include");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/onboarding-review/${member.id}/request-changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items,
          message: draftMessage,
          checklistSnapshot: findings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send request");
      toast.success(`Update request sent to ${member.email}`);
      setShowRequestDialog(false);
      fetchDetail();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!member) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/onboarding-review/${member.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ checklistSnapshot: findings, aiSummary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve");
      toast.success(`${member.firstName} approved — full AI access unlocked`);
      setShowApproveDialog(false);
      fetchDetail();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !member) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const ci = member.companyIntelligence;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/portal/admin/consortium/onboarding-review")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Onboarding Review
      </Button>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-muted-foreground">
            {member.email} · {member.company || "No company"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              member.onboardingReviewStatus === "approved"
                ? "bg-green-100 text-green-800 border-green-300"
                : member.onboardingReviewStatus === "changes_requested"
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-slate-100 text-slate-800 border-slate-300"
            }
          >
            {member.onboardingReviewStatus.replace("_", " ")}
          </Badge>
          <Button variant="outline" onClick={openRequestDialog} disabled={issues.length === 0}>
            <Mail className="mr-2 h-4 w-4" /> Request Changes
          </Button>
          <Button onClick={() => setShowApproveDialog(true)}>
            <ShieldCheck className="mr-2 h-4 w-4" /> Approve
          </Button>
        </div>
      </div>

      {/* AI Sufficiency Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Sufficiency Review
          </CardTitle>
          <CardDescription>{aiSummary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {issues.map((f) => (
            <div key={f.field} className="flex items-start gap-3 p-3 rounded-lg border">
              <Checkbox
                checked={selectedItems.has(f.field)}
                onCheckedChange={() => toggleSelected(f.field)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {SEVERITY_ICON[f.severity]}
                  <span className="font-medium text-sm">{f.field}</span>
                  <Badge variant="outline" className={`${SEVERITY_STYLES[f.severity]} text-xs`}>
                    {f.severity}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {f.source === "ai" ? "AI" : "Rule"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{f.note}</p>
              </div>
            </div>
          ))}
          {okFindings.length > 0 && (
            <details className="mt-3">
              <summary className="text-sm text-muted-foreground cursor-pointer">
                {okFindings.length} item{okFindings.length !== 1 ? "s" : ""} sufficient
              </summary>
              <div className="mt-2 space-y-1">
                {okFindings.map((f) => (
                  <div key={f.field} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    {f.field}
                  </div>
                ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground">Company Description</p>
            <p>{ci?.companyDescription || "—"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">NAICS Codes</p>
              <p>{member.naicsCodes?.join(", ") || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Certifications</p>
              <p>{member.certifications?.join(", ") || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Technical Expertise</p>
              <p>{ci?.technicalExpertise?.join(", ") || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Service Offerings</p>
              <p>{ci?.serviceOfferings?.join(", ") || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">States Served</p>
              <p>{ci?.statesServed?.join(", ") || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">SAM.gov / UEI / CAGE</p>
              <p>
                {ci?.samRegistration?.status || "—"} {ci?.uei ? `· UEI ${ci.uei}` : ""} {ci?.cageCode ? `· CAGE ${ci.cageCode}` : ""}
              </p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Notable Past Contracts</p>
            {(ci?.notableContracts?.length || 0) > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {ci.notableContracts.map((c: any, i: number) => (
                  <li key={i}>
                    <strong>{c.contractTitle}</strong> — {c.client}: {c.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Readiness Documents</p>
            {(member.readinessDocuments?.length || 0) > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {member.readinessDocuments.map((d: any, i: number) => (
                  <li key={i}>
                    {d.type?.replace(/_/g, " ")} — {d.fileName} ({d.status})
                  </li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Review History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="p-3 rounded-lg border text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{h.action.replace("_", " ")}</span>
                  <span className="text-xs text-muted-foreground">
                    {h.createdAt ? new Date(h.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">by {h.adminName}</p>
                {h.emailMessage && <p className="mt-1 text-muted-foreground">{h.emailMessage}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Request Changes Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Profile Updates</DialogTitle>
            <DialogDescription>
              Review and edit the auto-drafted email before sending to {member.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium mb-1">Flagged items ({selectedItems.size} selected):</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                {issues
                  .filter((f) => selectedItems.has(f.field))
                  .map((f) => (
                    <li key={f.field}>
                      {f.field}: {f.note}
                    </li>
                  ))}
              </ul>
            </div>
            <Textarea
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              rows={6}
              className="text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendRequestChanges} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Onboarding Content</DialogTitle>
            <DialogDescription>
              {readyForApproval
                ? "This member's profile is sufficiently detailed for AI search, recommendations, and teaming."
                : "Warning: this member still has flagged items. Approving anyway will unlock full AI access despite incomplete content."}
            </DialogDescription>
          </DialogHeader>
          {!readyForApproval && (
            <div className="p-3 rounded-lg border bg-amber-50 text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <span>{issues.length} item{issues.length !== 1 ? "s" : ""} still flagged.</span>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Approve & Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
