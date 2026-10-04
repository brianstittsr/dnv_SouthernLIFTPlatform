"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Mail, Copy, Check, ShieldCheck } from "lucide-react";
import { type TeamMemberDoc } from "@/lib/schema";
import { buildReadinessReport } from "@/lib/readiness-report";
import { toast } from "sonner";
import { getAuth } from "firebase/auth";

interface ReadinessReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMemberDoc[];
}

export function ReadinessReportDialog({
  open,
  onOpenChange,
  members,
}: ReadinessReportDialogProps) {
  const report = useMemo(() => buildReadinessReport(members), [members]);
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const scoredCount = members.filter((m) => m.govReadinessScore).length;

  const handleSend = async () => {
    if (!recipient.trim()) {
      toast.error("Please enter a recipient email");
      return;
    }
    setSending(true);
    try {
      const auth = getAuth();
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      if (!token) {
        toast.error("You must be logged in to send the report");
        return;
      }

      const response = await fetch("/api/admin/team-members/readiness-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to: recipient.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send report");
      }
      toast.success(`Readiness report sent to ${recipient}`);
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to send report");
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Report copied to clipboard");
  };

  const handleMailto = () => {
    const subject = encodeURIComponent("KDM Consortium Readiness Report");
    const body = encodeURIComponent(report.text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            GovCon Readiness Report
          </DialogTitle>
          <DialogDescription>
            {scoredCount} of {report.total} members scored. Run the readiness scan to refresh data
            before sending.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="rounded-md border bg-muted p-2 text-center">
              <div className="text-lg font-bold">{report.avgScore}</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
            <div className="rounded-md border bg-muted p-2 text-center">
              <div className="text-lg font-bold">{report.contractReady}</div>
              <div className="text-xs text-muted-foreground">Contract-Ready</div>
            </div>
            <div className="rounded-md border bg-muted p-2 text-center">
              <div className="text-lg font-bold">{report.missingCi}</div>
              <div className="text-xs text-muted-foreground">Missing Co. Intel</div>
            </div>
            <div className="rounded-md border bg-muted p-2 text-center">
              <div className="text-lg font-bold">{report.reminded}</div>
              <div className="text-xs text-muted-foreground">Reminded</div>
            </div>
          </div>

          <div className="rounded-md border bg-muted p-4 font-mono text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
            {report.text}
          </div>

          <div className="space-y-2">
            <Label htmlFor="readiness-recipient">Email report to</Label>
            <Input
              id="readiness-recipient"
              type="email"
              placeholder="keith@kdm-assoc.com"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCopy} disabled={copied}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" onClick={handleMailto}>
            <Mail className="w-4 h-4 mr-2" />
            Open Mail
          </Button>
          <Button onClick={handleSend} disabled={sending || !recipient.trim() || !scoredCount}>
            {sending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            {sending ? "Sending..." : "Email Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
