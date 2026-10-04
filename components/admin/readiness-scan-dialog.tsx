"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Radar } from "lucide-react";
import { toast } from "sonner";
import { getAuth } from "firebase/auth";
import { READINESS_BUCKETS } from "@/lib/member-readiness";

interface ScanResults {
  scanned: number;
  byBucket: Record<string, number>;
  contractReady: number;
  incomplete: { id: string; name: string; email?: string; score: number; gaps: string[] }[];
  reminded: number;
  reminderSkippedCooldown: number;
  noEmail: number;
  errors: string[];
}

interface ReadinessScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful scan so the parent can refetch member data. */
  onScanComplete?: () => void;
}

export function ReadinessScanDialog({ open, onOpenChange, onScanComplete }: ReadinessScanDialogProps) {
  const [sendReminders, setSendReminders] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setResults(null);
    try {
      const auth = getAuth();
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      if (!token) {
        toast.error("You must be logged in");
        return;
      }
      const response = await fetch("/api/admin/team-members/readiness-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sendReminders }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scan failed");
      setResults(data as ScanResults);
      toast.success(`Scanned ${data.scanned} members`);
      if (data.reminded) toast.info(`${data.reminded} reminder email${data.reminded === 1 ? "" : "s"} sent`);
      data.errors?.forEach((e: string) => toast.warning(e));
      onScanComplete?.();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) setResults(null);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radar className="w-5 h-5" />
            GovCon Readiness Scan
          </DialogTitle>
          <DialogDescription>
            Scores every team member against the 7-factor government-contracting readiness model
            (SAM registration, UEI, CAGE, NAICS, certifications, past performance, GSA).
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-md border p-3">
              <Checkbox
                id="send-reminders"
                checked={sendReminders}
                onCheckedChange={(v) => setSendReminders(v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="send-reminders" className="font-normal cursor-pointer">
                <span className="font-medium">Email reminders to incomplete profiles</span> — members
                scoring below 60 or missing a Company Intelligence profile get a reminder to update
                it. Each member is reminded at most once every 14 days.
              </Label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="rounded-md border bg-muted p-2 text-center">
                <div className="text-lg font-bold">{results.scanned}</div>
                <div className="text-xs text-muted-foreground">Scanned</div>
              </div>
              <div className="rounded-md border bg-muted p-2 text-center">
                <div className="text-lg font-bold text-green-700">{results.contractReady}</div>
                <div className="text-xs text-muted-foreground">Contract-Ready</div>
              </div>
              <div className="rounded-md border bg-muted p-2 text-center">
                <div className="text-lg font-bold text-amber-700">{results.reminded}</div>
                <div className="text-xs text-muted-foreground">Reminders Sent</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {READINESS_BUCKETS.map((b) => (
                <Badge key={b.id} variant="secondary" className={b.badgeBg}>
                  {b.label.split(" (")[0]}: {results.byBucket[b.id] ?? 0}
                </Badge>
              ))}
            </div>

            {sendReminders && results.reminderSkippedCooldown > 0 && (
              <p className="text-xs text-muted-foreground">
                {results.reminderSkippedCooldown} member{results.reminderSkippedCooldown === 1 ? "" : "s"}{" "}
                already reminded within the last 14 days — skipped.
                {results.noEmail > 0 && ` ${results.noEmail} have no email on file.`}
              </p>
            )}

            {results.incomplete.length > 0 && (
              <div className="rounded-md border">
                <p className="px-3 py-2 text-sm font-medium border-b bg-muted/50">
                  Needs attention ({results.incomplete.length})
                </p>
                <div className="max-h-[240px] overflow-y-auto divide-y">
                  {results.incomplete.map((m) => (
                    <div key={m.id} className="px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <span className="text-sm font-bold shrink-0">{m.score}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{m.email || "no email"}</p>
                      {m.gaps.length > 0 && (
                        <p className="text-xs text-muted-foreground truncate">Gaps: {m.gaps.join("; ")}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Close</Button>
          <Button onClick={handleScan} disabled={scanning}>
            {scanning ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Radar className="w-4 h-4 mr-2" />
            )}
            {scanning ? "Scanning..." : results ? "Scan Again" : "Run Scan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
