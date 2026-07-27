"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Copy, Check, Loader2, Building2, Plus } from "lucide-react";

interface InviteResult {
  uid: string;
  email: string;
  tempPassword: string;
}

interface CompanyOption {
  id: string;
  legalCompanyName: string;
  displayName?: string;
}

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  role: "sme_user" as UserRole,
  companyId: "",
  companyName: "",
};

export function InviteUserDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<InviteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Company search state
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [companyMode, setCompanyMode] = useState<"existing" | "new" | "none">(
    "none"
  );
  const [newCompanyName, setNewCompanyName] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const searchCompanies = useCallback(async (search: string) => {
    if (!auth?.currentUser) return;
    setSearchLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `/api/companies?search=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.companies) {
        setCompanies(data.companies);
      }
    } catch {
      // ignore
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && companyMode === "existing" && companies.length === 0) {
      searchCompanies("");
    }
  }, [open, companyMode, companies.length, searchCompanies]);

  const handleCompanySearch = (value: string) => {
    setCompanySearch(value);
    if (companyMode === "existing") {
      searchCompanies(value);
    }
  };

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

      // If creating a new company, create it first
      let finalCompanyId = form.companyId;
      let finalCompanyName = form.companyName;

      if (companyMode === "new" && newCompanyName.trim()) {
        const companyRes = await fetch("/api/companies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            legalCompanyName: newCompanyName.trim(),
          }),
        });
        const companyData = await companyRes.json();

        if (!companyRes.ok && companyData.error) {
          if (companyData.companyId) {
            finalCompanyId = companyData.companyId;
            finalCompanyName = newCompanyName.trim();
          } else {
            throw new Error(companyData.error);
          }
        } else {
          finalCompanyId = companyData.company.id;
          finalCompanyName = newCompanyName.trim();
        }
      }

      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          companyId: finalCompanyId || undefined,
          companyName: finalCompanyName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invitation");
      }

      // Link the new user to the existing company as a member
      if (finalCompanyId && data.user?.uid) {
        await fetch(`/api/companies/${finalCompanyId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: data.user.uid }),
        });
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
    setCompanyMode("none");
    setCompanySearch("");
    setNewCompanyName("");
    setCompanies([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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

              {/* Company Selection */}
              <div className="space-y-2">
                <Label>Company (optional)</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={companyMode === "none" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setCompanyMode("none");
                      setForm((prev) => ({
                        ...prev,
                        companyId: "",
                        companyName: "",
                      }));
                    }}
                  >
                    None
                  </Button>
                  <Button
                    type="button"
                    variant={
                      companyMode === "existing" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setCompanyMode("existing");
                      searchCompanies("");
                    }}
                  >
                    <Building2 className="mr-1 h-3 w-3" />
                    Existing
                  </Button>
                  <Button
                    type="button"
                    variant={companyMode === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setCompanyMode("new");
                      setForm((prev) => ({
                        ...prev,
                        companyId: "",
                        companyName: "",
                      }));
                    }}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    New
                  </Button>
                </div>

                {companyMode === "existing" && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Search companies..."
                      value={companySearch}
                      onChange={(e) => handleCompanySearch(e.target.value)}
                    />
                    {searchLoading && (
                      <p className="text-xs text-muted-foreground">
                        Searching...
                      </p>
                    )}
                    {!searchLoading && companies.length > 0 && (
                      <Select
                        value={form.companyId}
                        onValueChange={(value) => {
                          const company = companies.find(
                            (c) => c.id === value
                          );
                          setForm((prev) => ({
                            ...prev,
                            companyId: value,
                            companyName:
                              company?.legalCompanyName ||
                              company?.displayName ||
                              "",
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.legalCompanyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {!searchLoading &&
                      companies.length === 0 &&
                      companySearch && (
                        <p className="text-xs text-muted-foreground">
                          No companies found. Try a different search or create
                          a new one.
                        </p>
                      )}
                  </div>
                )}

                {companyMode === "new" && (
                  <Input
                    placeholder="Enter company name"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                  />
                )}
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
