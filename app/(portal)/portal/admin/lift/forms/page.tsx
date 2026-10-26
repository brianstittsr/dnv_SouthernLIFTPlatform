"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, FilePlus2, Inbox, Loader2, Sprout } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { liftFetch } from "@/components/forms/lift-api";
import type { LiftFormDoc } from "@/lib/form-builder/types";

/** Admin list of LIFT forms with seeding of the Part B lifecycle templates. */
export default function LiftFormStudioPage() {
  const router = useRouter();
  const [forms, setForms] = useState<LiftFormDoc[] | null>(null);
  const [busy, setBusy] = useState<"seed" | "new" | null>(null);

  const load = useCallback(async () => {
    try {
      setForms(await liftFetch<LiftFormDoc[]>("/api/lift/forms"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Forms could not be loaded");
      setForms([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const seed = async () => {
    setBusy("seed");
    try {
      const results = await liftFetch<{ slug: string; action: string }[]>("/api/lift/forms/seed", { method: "POST" });
      const created = results.filter((item) => item.action !== "skipped").length;
      toast.success(created ? `Seeded ${created} LIFT form${created === 1 ? "" : "s"}` : "All LIFT forms already exist");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Seeding failed");
    } finally {
      setBusy(null);
    }
  };

  const createBlank = async () => {
    setBusy("new");
    try {
      const form = await liftFetch<LiftFormDoc>("/api/lift/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: `new-form-${Date.now().toString(36)}`,
          title: "Untitled form",
          description: "",
          category: "LIFT",
          presentationMode: "standard",
          audience: "client",
          sections: [{ id: "main", title: "Questions" }],
          fields: [],
        }),
      });
      router.push(`/portal/admin/lift/forms/${form.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Form could not be created");
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">LIFT Form Studio</h1>
          <p className="text-muted-foreground">Build, version, and publish the LIFT client lifecycle forms.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/portal/admin/lift/submissions">
              <Inbox className="mr-2 h-4 w-4" />
              Submissions
            </Link>
          </Button>
          <Button variant="outline" onClick={() => void seed()} disabled={busy !== null}>
            {busy === "seed" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sprout className="mr-2 h-4 w-4" />}
            Seed LIFT forms (B1-B10)
          </Button>
          <Button onClick={() => void createBlank()} disabled={busy !== null}>
            {busy === "new" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
            New form
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forms</CardTitle>
          <CardDescription>Editing a published form returns it to draft. Publish to release a new version; past submissions keep their original version.</CardDescription>
        </CardHeader>
        <CardContent>
          {!forms ? (
            <div className="flex items-center gap-2 text-muted-foreground" role="status">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : forms.length === 0 ? (
            <p className="text-muted-foreground">No forms yet. Use &quot;Seed LIFT forms&quot; to create the lifecycle forms.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Submissions</TableHead>
                  <TableHead className="sr-only">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell>{form.lifecycleRef ?? "-"}</TableCell>
                    <TableCell>
                      <Link href={`/portal/admin/lift/forms/${form.id}`} className="font-medium hover:underline">
                        {form.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">{form.slug}</div>
                    </TableCell>
                    <TableCell className="capitalize">{form.audience}</TableCell>
                    <TableCell className="capitalize">{form.presentationMode}</TableCell>
                    <TableCell>
                      <Badge variant={form.status === "published" ? "default" : "secondary"}>
                        {form.status} · v{form.version}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{form.analytics?.totalSubmissions ?? 0}</TableCell>
                    <TableCell className="text-right">
                      {form.status === "published" && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={form.audience === "public" ? `/forms/${form.slug}` : `/portal/lift/forms/${form.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Open
                          </a>
                        </Button>
                      )}
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
