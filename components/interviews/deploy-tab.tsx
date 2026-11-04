"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Check, Copy, ExternalLink, Link2, Loader2, Mail, Rocket, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { liftFetch } from "@/components/forms/lift-api";
import type { LiftInterviewDoc, LiftInterviewInviteDoc } from "@/lib/interview/types";

interface SendResult {
  inviteId: string;
  email: string;
  emailSent: boolean;
  onPlatform: boolean;
  error?: string;
}

export interface DeployTabProps {
  interview: LiftInterviewDoc;
  onChanged: (interview: LiftInterviewDoc) => void;
}

/** Publish, share, and send the interview to recipients. */
export function DeployTab({ interview, onChanged }: DeployTabProps) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [recipients, setRecipients] = useState("");
  const [sending, setSending] = useState(false);
  const [invites, setInvites] = useState<LiftInterviewInviteDoc[] | null>(null);
  const [copied, setCopied] = useState(false);

  const published = interview.status === "published";
  const publicLink = `${typeof window !== "undefined" ? window.location.origin : ""}/interview/pub_${interview.slug}`;

  const loadInvites = useCallback(async () => {
    try {
      setInvites(await liftFetch<LiftInterviewInviteDoc[]>(`/api/lift/interviews/${interview.id}/invites`));
    } catch {
      setInvites([]);
    }
  }, [interview.id]);

  useEffect(() => {
    void loadInvites();
  }, [loadInvites]);

  const publish = async () => {
    setPublishing(true);
    try {
      const updated = await liftFetch<LiftInterviewDoc>(`/api/lift/interviews/${interview.id}/publish`, { method: "POST" });
      onChanged(updated);
      toast.success(`Published version ${updated.version}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const togglePublicLink = async (enabled: boolean) => {
    setToggling(true);
    try {
      const updated = await liftFetch<LiftInterviewDoc>(`/api/lift/interviews/${interview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicLinkEnabled: enabled }),
      });
      onChanged(updated);
      toast.success(enabled ? "Public link enabled" : "Public link disabled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the public link");
    } finally {
      setToggling(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const archive = async () => {
    if (!confirm("Archive this interview? Links stop working and it leaves the list.")) return;
    try {
      await liftFetch(`/api/lift/interviews/${interview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      toast.success("Interview archived");
      router.push("/portal/admin/lift/interviews");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Archive failed");
    }
  };

  /** Accepts "email", "email, Name" or "Name <email>" per line. */
  const parseRecipients = (raw: string): { name: string; email: string }[] => {
    const out: { name: string; email: string }[] = [];
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const angle = trimmed.match(/^(.*)<([^>]+)>$/);
      if (angle) {
        out.push({ name: angle[1].trim(), email: angle[2].trim() });
        continue;
      }
      const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
      const email = parts.find((p) => p.includes("@")) ?? parts[0];
      const name = parts.length > 1 ? parts.find((p) => p !== email) ?? "" : "";
      if (email?.includes("@")) out.push({ name, email });
    }
    return out;
  };

  const send = async () => {
    const list = parseRecipients(recipients);
    if (list.length === 0) {
      toast.error("Add at least one recipient — one per line: name, email");
      return;
    }
    if (list.length > 50) {
      toast.error("Send a maximum of 50 invites at once");
      return;
    }
    setSending(true);
    try {
      const results = await liftFetch<SendResult[]>(`/api/lift/interviews/${interview.id}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: list }),
      });
      const sent = results.filter((r) => r.emailSent).length;
      const platform = results.filter((r) => r.onPlatform).length;
      toast.success(
        `Sent ${sent} of ${results.length} invites${platform ? ` (${platform} also notified in-app)` : ""}.`
      );
      const failures = results.filter((r) => !r.emailSent);
      if (failures.length) toast.error(`Email failed for: ${failures.map((f) => f.email).join(", ")}`);
      setRecipients("");
      await loadInvites();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sending failed");
    } finally {
      setSending(false);
    }
  };

  const statusColor = (status: string) =>
    status === "completed" ? "default" : status === "started" ? "secondary" : "outline";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ─── Publish ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Publish</CardTitle>
          <CardDescription>
            Publishing freezes a version respondents can take. Current status:{" "}
            <Badge variant={published ? "default" : "secondary"}>{interview.status} · v{interview.version}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button onClick={() => void publish()} disabled={publishing}>
              {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
              {published ? `Republish (v${interview.version + 1})` : "Publish"}
            </Button>
            <Button variant="outline" onClick={() => void archive()}>
              <Archive className="mr-2 h-4 w-4" /> Archive
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sessions record the version they ran against, so results stay comparable across publishes.
          </p>
        </CardContent>
      </Card>

      {/* ─── Public link ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Public link</CardTitle>
          <CardDescription>One shareable URL anyone can open — no tracking per recipient.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={interview.publicLinkEnabled}
              disabled={!published || toggling}
              onCheckedChange={(v) => void togglePublicLink(v)}
            />
            <Label>{interview.publicLinkEnabled ? "Enabled" : "Disabled"}</Label>
          </div>
          {interview.publicLinkEnabled && (
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-muted px-3 py-2 text-sm">{publicLink}</code>
              <Button size="icon" variant="outline" onClick={() => void copyLink()}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="outline" asChild>
                <a href={publicLink} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
              </Button>
            </div>
          )}
          {!published && <p className="text-xs text-muted-foreground">Publish first to enable the link.</p>}
        </CardContent>
      </Card>

      {/* ─── Invites ─────────────────────────────────────────────────── */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Send invites</CardTitle>
          <CardDescription>
            Tracked, unique links per recipient — works for platform members (they also get an in-app notification)
            and anyone off-platform via email. Paste one recipient per line:{" "}
            <code>Name, email@example.com</code> or <code>Name &lt;email@example.com&gt;</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Textarea
              rows={4}
              className="flex-1"
              placeholder={"Jane Doe, jane@example.com\nJohn Smith <john@example.com>"}
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              disabled={!published}
            />
            <Button onClick={() => void send()} disabled={!published || sending} className="md:self-start">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send invites
            </Button>
          </div>
          {!published && <p className="text-xs text-muted-foreground">Publish the interview before sending invites.</p>}

          {invites && invites.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="sr-only">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.recipientName}</TableCell>
                    <TableCell>{invite.recipientEmail}{invite.recipientUid ? <Badge variant="outline" className="ml-2 text-xs">member</Badge> : null}</TableCell>
                    <TableCell><Badge variant={statusColor(invite.status)}>{invite.status}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(invite.sentAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{invite.completedAt ? new Date(invite.completedAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/interview/inv_${invite.token}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
