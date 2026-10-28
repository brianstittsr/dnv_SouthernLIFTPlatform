"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ClipboardList, Loader2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { liftFetch } from "@/components/forms/lift-api";
import { useUserProfile } from "@/contexts/user-profile-context";

interface MyForm {
  slug: string;
  title: string;
  category: string;
  lifecycleRef: string | null;
  audience: "public" | "client" | "staff";
  submissions: { id: string; createdAt: string; status: string }[];
}

interface ChecklistItem {
  label: string;
  description: string;
  done: boolean;
  href: string;
  action: string;
}

/** Shows the client's onboarding checklist plus the status of each LIFT lifecycle form. */
export default function OnboardingProgressPage() {
  const { profile, profileCompletion } = useUserProfile();
  const [forms, setForms] = useState<MyForm[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    liftFetch<MyForm[]>("/api/lift/my-forms")
      .then(setForms)
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  const clientForms = forms?.filter((form) => form.audience !== "staff") ?? [];
  const submittedCount = clientForms.filter((form) => form.submissions.length > 0).length;

  const checklist: ChecklistItem[] = [
    {
      label: "Complete your profile",
      description: `Profile ${profileCompletion}% complete`,
      done: profileCompletion === 100,
      href: "/portal/profile",
      action: "Edit profile",
    },
    {
      label: "Finish LIFT Client Onboarding",
      description: "Program expectations and business profile wizard",
      done: profile.affiliateOnboardingComplete,
      href: "/portal/onboarding",
      action: "Open onboarding",
    },
    {
      label: "Submit the MBDA Client Intake & Letter of Engagement",
      description: "Required before advising services begin",
      done: clientForms.some(
        (form) => form.submissions.length > 0 && form.slug.includes("intake")
      ),
      href: "/portal/lift/forms",
      action: "Open forms",
    },
    {
      label: "Complete the baseline survey",
      description: "Helps your advisor set goals and measure progress",
      done: clientForms.some(
        (form) => form.submissions.length > 0 && form.slug.includes("baseline")
      ),
      href: "/portal/lift/forms",
      action: "Open forms",
    },
  ];

  const doneCount = checklist.filter((item) => item.done).length + submittedCount;
  const totalCount = checklist.length + clientForms.length;
  const overallPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <ClipboardList className="h-7 w-7 text-primary" aria-hidden="true" />
          Onboarding Progress
        </h1>
        <p className="text-muted-foreground">
          Track your enrollment steps and LIFT program forms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall progress</CardTitle>
          <CardDescription>
            {doneCount} of {totalCount} items complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallPercent} aria-label="Onboarding progress" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Onboarding checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 rounded-lg border p-3"
            >
              <div className="flex items-start gap-3">
                {item.done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" aria-hidden="true" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                )}
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {!item.done && (
                <Button asChild size="sm" variant="outline">
                  <Link href={item.href}>{item.action}</Link>
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">LIFT form status</CardTitle>
          <CardDescription>
            {submittedCount} of {clientForms.length} forms submitted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!forms && !error && (
            <div className="flex items-center gap-2 text-muted-foreground" role="status">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading form status...
            </div>
          )}
          {clientForms.map((form) => {
            const latest = form.submissions[0];
            return (
              <div
                key={form.slug}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <div className="flex items-start gap-3">
                  {latest ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" aria-hidden="true" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-medium">{form.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {latest
                        ? `Submitted ${new Date(latest.createdAt).toLocaleDateString()}`
                        : "Not started"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {form.lifecycleRef && <Badge variant="outline">{form.lifecycleRef}</Badge>}
                  {!latest && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/portal/lift/forms/${form.slug}`}>Start</Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {forms && clientForms.length === 0 && (
            <p className="text-sm text-muted-foreground">No LIFT forms are published yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" aria-hidden="true" />
        Questions? Contact your LIFT advisor.
      </div>
    </div>
  );
}
