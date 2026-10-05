"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, Save, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface ComposerRecipient {
  name: string;
  email: string;
}

interface CannedMessage {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface LeadEmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: ComposerRecipient[];
  onSent?: () => void;
}

export function LeadEmailComposer({
  open,
  onOpenChange,
  recipients,
  onSent,
}: LeadEmailComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<CannedMessage[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, COLLECTIONS.CANNED_EMAIL_MESSAGES),
      orderBy("name", "asc")
    );
    return onSnapshot(q, (snapshot) => {
      setTemplates(
        snapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          subject: d.data().subject,
          body: d.data().body,
        }))
      );
    });
  }, []);

  useEffect(() => {
    if (open) {
      setSubject("");
      setBody("");
      setSelectedTemplate("");
      setTemplateName("");
    }
  }, [open]);

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setTemplateName(template.name);
    }
  };

  const saveTemplate = async () => {
    if (!db || !templateName.trim() || !subject.trim() || !body.trim()) {
      toast.error("Template needs a name, subject, and body");
      return;
    }
    setSavingTemplate(true);
    try {
      await addDoc(collection(db, COLLECTIONS.CANNED_EMAIL_MESSAGES), {
        name: templateName.trim(),
        subject: subject.trim(),
        body: body.trim(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setTemplateName("");
      toast.success("Canned message saved");
    } catch (error) {
      console.error("Error saving canned message:", error);
      toast.error("Failed to save canned message");
    } finally {
      setSavingTemplate(false);
    }
  };

  const deleteTemplate = async () => {
    if (!db || !selectedTemplate) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.CANNED_EMAIL_MESSAGES, selectedTemplate));
      setSelectedTemplate("");
      setTemplateName("");
      toast.success("Canned message deleted");
    } catch (error) {
      console.error("Error deleting canned message:", error);
      toast.error("Failed to delete canned message");
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0 || !subject.trim() || !body.trim()) {
      toast.error("Recipient, subject, and message are required");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/book-call-leads/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipients.map((r) => r.email),
          subject: subject.trim(),
          body: body.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");

      if (data.failed?.length) {
        toast.warning(
          `Sent to ${data.sent} recipient(s); failed for ${data.failed.map((f: { to: string }) => f.to).join(", ")}`
        );
      } else {
        toast.success(`Email sent to ${data.sent} recipient${data.sent === 1 ? "" : "s"}`);
      }
      onSent?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Lead{recipients.length === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription>
            Send a direct email or reuse a canned message
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>To</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {recipients.map((r) => (
                <Badge key={r.email} variant="secondary">
                  {r.name ? `${r.name} ` : ""}&lt;{r.email}&gt;
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="composer-template">Canned message</Label>
              <Select value={selectedTemplate} onValueChange={applyTemplate}>
                <SelectTrigger id="composer-template">
                  <SelectValue placeholder="Choose a saved message..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <SelectItem value="-" disabled>
                      No saved messages yet
                    </SelectItem>
                  ) : (
                    templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedTemplate && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={deleteTemplate}
                title="Delete selected canned message"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="composer-subject">Subject</Label>
            <Input
              id="composer-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="composer-body">Message</Label>
            <Textarea
              id="composer-body"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
            />
          </div>

          <div className="flex gap-2 items-end rounded-md border p-3 bg-muted/40">
            <div className="flex-1 space-y-1">
              <Label htmlFor="composer-template-name" className="text-xs">
                Save as canned message
              </Label>
              <Input
                id="composer-template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={saveTemplate}
              disabled={savingTemplate || !templateName.trim() || !subject.trim() || !body.trim()}
            >
              {savingTemplate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || recipients.length === 0 || !subject.trim() || !body.trim()}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send to {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
