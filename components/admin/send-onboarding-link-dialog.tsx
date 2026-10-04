"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Link2, Search, UserPlus } from "lucide-react";
import { type TeamMemberDoc } from "@/lib/schema";
import { hasCompanyIntelligence } from "@/lib/member-readiness";
import { toast } from "sonner";
import { getAuth } from "firebase/auth";

type SendMode = "link" | "invite";

interface SendOnboardingLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMemberDoc[];
}

export function SendOnboardingLinkDialog({
  open,
  onOpenChange,
  members,
}: SendOnboardingLinkDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<SendMode>("link");
  const [sending, setSending] = useState(false);

  // Default to members missing a Company Intelligence profile
  const eligible = useMemo(
    () => members.filter((m) => m.emailPrimary || m.emailSecondary),
    [members]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return eligible;
    return eligible.filter((m) =>
      `${m.firstName ?? ""} ${m.lastName ?? ""} ${m.company ?? ""} ${m.emailPrimary ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [eligible, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectMissingCi = () => {
    setSelected(new Set(eligible.filter((m) => !hasCompanyIntelligence(m.companyIntelligence)).map((m) => m.id)));
  };

  const handleSend = async () => {
    if (!selected.size) {
      toast.error("Select at least one member");
      return;
    }
    setSending(true);
    try {
      const auth = getAuth();
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      if (!token) {
        toast.error("You must be logged in");
        return;
      }

      const ids = Array.from(selected);

      if (mode === "link") {
        const response = await fetch("/api/admin/team-members/send-onboarding-link", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ memberIds: ids }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to send links");
        toast.success(`Onboarding link sent to ${data.sent} member${data.sent === 1 ? "" : "s"}`);
        if (data.skippedNoEmail) toast.warning(`${data.skippedNoEmail} skipped — no email on file`);
        data.errors?.forEach((e: string) => toast.warning(e));
      } else {
        // Portal invite path — reuse the existing invite API per member
        const byId = new Map(members.map((m) => [m.id, m]));
        let sent = 0;
        let failed = 0;
        for (const id of ids) {
          const m = byId.get(id);
          const email = m?.emailPrimary || m?.emailSecondary;
          if (!m || !email) { failed += 1; continue; }
          try {
            const response = await fetch("/api/admin/invite", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                email,
                firstName: m.firstName || "Member",
                lastName: m.lastName || "User",
                role: "consortium_member",
                companyName: m.company || undefined,
              }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Invite failed");
            sent += 1;
          } catch {
            failed += 1;
          }
        }
        if (sent) toast.success(`Portal invite sent to ${sent} member${sent === 1 ? "" : "s"}`);
        if (failed) toast.warning(`${failed} invite${failed === 1 ? "" : "s"} failed or skipped`);
      }

      setSelected(new Set());
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Send Onboarding Link
          </DialogTitle>
          <DialogDescription>
            Email members a link to complete their profile through the onboarding wizard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as SendMode)} className="space-y-2">
            <div className="flex items-start gap-2 rounded-md border p-3">
              <RadioGroupItem value="link" id="mode-link" className="mt-0.5" />
              <Label htmlFor="mode-link" className="font-normal cursor-pointer">
                <span className="font-medium">Quick profile link</span> — public wizard at{" "}
                <code className="text-xs">/onboarding/client</code>, no login required. Best for new
                clients.
              </Label>
            </div>
            <div className="flex items-start gap-2 rounded-md border p-3">
              <RadioGroupItem value="invite" id="mode-invite" className="mt-0.5" />
              <Label htmlFor="mode-invite" className="font-normal cursor-pointer">
                <span className="font-medium">Portal account invite</span> — creates a login and
                emails credentials so the member completes onboarding inside the portal (Company
                Intelligence wizard).
              </Label>
            </div>
          </RadioGroup>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm" onClick={selectMissingCi}>
              Select missing profiles
            </Button>
          </div>

          <div className="rounded-md border max-h-[280px] overflow-y-auto">
            {filtered.map((m) => {
              const name = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() || m.id;
              const missingCi = !hasCompanyIntelligence(m.companyIntelligence);
              return (
                <label
                  key={m.id}
                  className="flex items-center gap-3 px-3 py-2 border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selected.has(m.id)}
                    onCheckedChange={() => toggle(m.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.emailPrimary || m.emailSecondary}
                      {m.lastOnboardingLinkSentAt ? " · link sent" : ""}
                    </p>
                  </div>
                  {missingCi && (
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 shrink-0">
                      No profile
                    </span>
                  )}
                </label>
              );
            })}
            {!filtered.length && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No members with an email address match.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending || !selected.size}>
            {sending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : mode === "link" ? (
              <Link2 className="w-4 h-4 mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            {sending ? "Sending..." : `Send to ${selected.size} member${selected.size === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
