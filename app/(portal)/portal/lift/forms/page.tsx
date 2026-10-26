"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, Download, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { liftFetch } from "@/components/forms/lift-api";

interface MyForm {
  slug: string;
  title: string;
  description: string;
  category: string;
  lifecycleRef: string | null;
  audience: "public" | "client" | "staff";
  submissions: { id: string; createdAt: string; status: string }[];
}

/** Lists the LIFT lifecycle forms available to the signed-in user, in lifecycle order. */
export default function MyLiftFormsPage() {
  const [forms, setForms] = useState<MyForm[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    liftFetch<MyForm[]>("/api/lift/my-forms")
      .then(setForms)
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  const clientForms = forms?.filter((form) => form.audience !== "staff") ?? [];
  const staffForms = forms?.filter((form) => form.audience === "staff") ?? [];

  const renderForm = (form: MyForm) => {
    const latest = form.submissions[0];
    return (
      <Card key={form.slug} className="flex flex-col">
        <CardHeader className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline">{form.lifecycleRef ? `${form.lifecycleRef} · ${form.category}` : form.category}</Badge>
            {latest && (
              <span className="flex items-center gap-1 text-xs text-green-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Submitted {new Date(latest.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <CardTitle className="text-lg">{form.title}</CardTitle>
          <CardDescription>{form.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={`/portal/lift/forms/${form.slug}`}>{latest ? "Submit again" : "Start"}</Link>
          </Button>
          {latest && (
            <Button asChild size="sm" variant="outline">
              <a href={`/api/lift/submissions/${latest.id}/pdf`}>
                <Download className="mr-1 h-4 w-4" />
                PDF
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <ClipboardList className="h-7 w-7 text-primary" aria-hidden="true" />
          My LIFT Forms
        </h1>
        <p className="text-muted-foreground">Complete your LIFT Center forms in order. Answers you give once are filled in on later forms.</p>
      </div>
      {error && <p className="text-destructive">{error}</p>}
      {!forms && !error && (
        <div className="flex items-center gap-2 text-muted-foreground" role="status">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading forms...
        </div>
      )}
      {forms && clientForms.length === 0 && <p className="text-muted-foreground">No LIFT forms are published yet.</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{clientForms.map(renderForm)}</div>
      {staffForms.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Staff forms</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{staffForms.map(renderForm)}</div>
        </section>
      )}
    </div>
  );
}
