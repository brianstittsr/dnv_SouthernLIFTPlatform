"use client";

import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth } from "@/lib/firebase";
import { USER_ROLES, type UserRole } from "@/lib/rbac-types";
import { toast } from "sonner";
import { Copy, Check, Loader2 } from "lucide-react";

interface InviteResult {
  uid: string;
  email: string;
  tempPassword: string;
}

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  role: "sme_user" as UserRole,
};

export function InviteUserDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<InviteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        toast.error("You must be signed in to invite users");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invitation");
      }

      setResult({
        uid: data.user.uid,
        email: data.user.email,
        tempPassword: data.user.tempPassword,
      });
      setStep("success");
      toast.success("Invitation created");
    } catch (error: any) {
      console.error("Invite error:", error);
      toast.error(error.message || "Failed to create invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.tempPassword) return;
    await navigator.clipboard.writeText(result.tempPassword);
    setCopied(true);
    toast.success("Password copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setStep("form");
    setForm(initialForm);
    setResult(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>
                Create a new platform account. A temporary password will be
                generated that the user must change on first login.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-firstName">First name</Label>
                  <Input
                    id="invite-firstName"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-lastName">Last name</Label>
                  <Input
                    id="invite-lastName"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, role: value as UserRole }))
                  }
                >
                  <SelectTrigger id="invite-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Send Invite
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invitation Created</DialogTitle>
              <DialogDescription>
                Share the temporary password securely. The user will be required
                to change it when they first sign in.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <p>
                  <span className="font-medium">Email:</span> {result?.email}
                </p>
                <p className="break-all">
                  <span className="font-medium">UID:</span> {result?.uid}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    type="text"
                    value={result?.tempPassword || ""}
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
