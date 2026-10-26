"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fieldHasValue } from "@/lib/form-builder/controls";
import { getVisibleFields } from "@/lib/form-builder/logic";
import { validateFormValues } from "@/lib/form-builder/validation";
import type { FieldValue, FormField, FormValues, PublicFormSchema } from "@/lib/form-builder/types";
import { FieldControl } from "./field-control";
import { LiftApiError, liftApi, type RunnerFormPayload, type SubmitResult } from "./lift-api";
import { TurnstileWidget } from "./turnstile-widget";

interface FormRunnerProps {
  slug: string;
  /** Where the runner is shown; controls links to follow-up forms. */
  context: "public" | "portal";
  /** Preview a definition without loading it from the API (Form Studio). Submission is disabled. */
  previewForm?: PublicFormSchema;
}

interface Step {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

/** Groups visible fields into steps: one section per step (standard) or one question per step (conversational). */
function buildSteps(form: PublicFormSchema, values: FormValues): Step[] {
  const visible = getVisibleFields(form.fields as FormField[], values, true);
  const firstSection = form.sections[0]?.id;
  const sectionOf = (field: FormField) => field.section ?? firstSection;
  if (form.presentationMode === "conversational") {
    return visible
      .filter((field) => field.type !== "section_header")
      .map((field) => {
        const section = form.sections.find((item) => item.id === sectionOf(field));
        return { id: field.key, title: section?.title ?? form.title, fields: [field] };
      });
  }
  if (!form.sections.length) return [{ id: "all", title: form.title, fields: visible }];
  return form.sections
    .map((section) => ({ id: section.id, title: section.title, description: section.description, fields: visible.filter((field) => sectionOf(field) === section.id) }))
    .filter((step) => step.fields.length > 0);
}

/** Interactive runner for LIFT forms (public, client portal, staff, and preview). */
export function FormRunner({ slug, context, previewForm }: FormRunnerProps) {
  const [payload, setPayload] = useState<RunnerFormPayload | null>(
    previewForm ? { form: previewForm, prefill: {}, viewer: { signedIn: false, isStaff: true, name: null }, captchaSiteKey: null } : null
  );
  const [loadError, setLoadError] = useState<{ message: string; status: number } | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (previewForm) {
      setPayload((current) => (current ? { ...current, form: previewForm } : current));
      return;
    }
    let active = true;
    (async () => {
      try {
        const loaded = await liftApi.loadForm(slug);
        let initial: FormValues = { ...loaded.prefill };
        let initialStep = 0;
        if (loaded.viewer.signedIn) {
          const draft = await liftApi.loadDraft(slug).catch(() => null);
          if (draft) {
            initial = { ...initial, ...draft.values };
            initialStep = draft.stepIndex;
          }
        }
        if (!active) return;
        setPayload(loaded);
        setValues(initial);
        setStepIndex(initialStep);
      } catch (error) {
        if (active) setLoadError({ message: error instanceof Error ? error.message : "This form could not be loaded", status: error instanceof LiftApiError ? error.status : 500 });
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, previewForm]);

  const form = payload?.form;
  const steps = useMemo(() => (form ? buildSteps(form, values) : []), [form, values]);
  const safeIndex = Math.min(stepIndex, Math.max(steps.length - 1, 0));
  const step = steps[safeIndex];
  const isLast = safeIndex >= steps.length - 1;
  const conversational = form?.presentationMode === "conversational";

  useEffect(() => {
    headingRef.current?.focus();
  }, [safeIndex]);

  const setValue = useCallback((key: string, value: FieldValue) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  /** Validates answers (optionally only some keys); returns the error map, empty when valid. */
  const validate = (keys?: string[]): Record<string, string> => {
    if (!form) return {};
    const outcome = validateFormValues(form.fields as FormField[], form.sections, values, { isStaff: true, onlyFieldKeys: keys });
    setErrors(outcome.errors);
    return outcome.errors;
  };

  const saveDraft = async (nextStep: number, silent = true) => {
    if (previewForm || !payload?.viewer.signedIn) return;
    setSavingDraft(!silent);
    try {
      await liftApi.saveDraft(slug, values, nextStep);
      if (!silent) toast.success("Progress saved. You can finish later from My LIFT Forms.");
    } catch {
      if (!silent) toast.error("Progress could not be saved");
    } finally {
      setSavingDraft(false);
    }
  };

  const goNext = () => {
    if (!step) return;
    const stepErrors = validate(step.fields.filter((field) => fieldHasValue(field.type)).map((field) => field.key));
    if (Object.keys(stepErrors).length) return;
    const next = Math.min(safeIndex + 1, steps.length - 1);
    setStepIndex(next);
    void saveDraft(next);
  };

  const submit = async () => {
    if (!form || previewForm) {
      toast.info("Preview only - submissions are disabled in the Form Studio.");
      return;
    }
    const allErrors = validate();
    if (Object.keys(allErrors).length) {
      const firstErrorStep = steps.findIndex((candidate) => candidate.fields.some((field) => allErrors[field.key]));
      if (firstErrorStep >= 0) setStepIndex(firstErrorStep);
      toast.error("Please correct the highlighted answers");
      return;
    }
    if (payload?.captchaSiteKey && !captchaToken) {
      toast.error("Please complete the verification check");
      return;
    }
    setSubmitting(true);
    try {
      const response = await liftApi.submit(slug, {
        values,
        completionSeconds: Math.round((Date.now() - startedAt.current) / 1000),
        captchaToken: captchaToken ?? undefined,
        website: "",
      });
      setResult(response);
      if (payload?.viewer.signedIn) void liftApi.deleteDraft(slug).catch(() => undefined);
    } catch (error) {
      if (error instanceof LiftApiError && Object.keys(error.fieldErrors).length) {
        setErrors(error.fieldErrors);
        const firstErrorStep = steps.findIndex((candidate) => candidate.fields.some((field) => error.fieldErrors[field.key]));
        if (firstErrorStep >= 0) setStepIndex(firstErrorStep);
      }
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>{loadError.status === 401 ? "Please sign in" : "Form unavailable"}</CardTitle>
          <CardDescription>{loadError.message}</CardDescription>
        </CardHeader>
        {loadError.status === 401 && (
          <CardContent>
            <Button asChild>
              <Link href={`/sign-in?redirect=${encodeURIComponent(`/portal/lift/forms/${slug}`)}`}>Sign in</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-64 items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading form...
      </div>
    );
  }

  if (result) {
    const nextHref = result.nextFormSlug ? `/portal/lift/forms/${result.nextFormSlug}` : null;
    return (
      <Card className="mx-auto max-w-2xl" role="status" aria-live="polite">
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-green-600" aria-hidden="true" />
          <CardTitle className="text-2xl">Submitted</CardTitle>
          <CardDescription className="text-base">{result.completionMessage ?? "Thank you. Your response has been received."}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          {nextHref && (
            <Button asChild size="lg">
              <Link href={nextHref}>
                Continue to the next form
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
          {nextHref && context === "public" && !payload?.viewer.signedIn && (
            <p className="text-center text-sm text-muted-foreground">
              The next form is in the LIFT client portal. <Link className="underline" href="/sign-up">Create an account</Link> or{" "}
              <Link className="underline" href={`/sign-in?redirect=${encodeURIComponent(nextHref)}`}>sign in</Link> with the email you used.
            </p>
          )}
          {payload?.viewer.signedIn && (
            <Button asChild variant="outline">
              <a href={`/api/lift/submissions/${result.submissionId}/pdf`}>
                <Download className="mr-2 h-4 w-4" />
                Download a PDF copy
              </a>
            </Button>
          )}
          <p className="text-xs text-muted-foreground">Reference: {result.submissionId}</p>
        </CardContent>
      </Card>
    );
  }

  const progress = steps.length ? Math.round(((safeIndex + 1) / steps.length) * 100) : 0;

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{form.category}</p>
          <CardTitle className="text-2xl">{form.title}</CardTitle>
          {safeIndex === 0 && form.description && <CardDescription className="mt-1 text-base">{form.description}</CardDescription>}
          {form.ombControlNumber && (
            <p className="mt-1 text-xs text-muted-foreground">
              OMB Control No. {form.ombControlNumber}
              {form.ombExpiresOn ? ` · Expires ${form.ombExpiresOn}` : ""}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {conversational ? "Question" : "Step"} {safeIndex + 1} of {steps.length}
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} aria-label="Form progress" />
        </div>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (isLast) void submit();
            else goNext();
          }}
          className="space-y-6"
        >
          {step && (
            <section aria-labelledby="form-step-heading" className="space-y-6">
              <h2 id="form-step-heading" ref={headingRef} tabIndex={-1} className={conversational ? "text-sm font-medium text-muted-foreground outline-none" : "text-lg font-semibold outline-none"}>
                {step.title}
              </h2>
              {step.description && <p className="text-sm text-muted-foreground">{step.description}</p>}
              {step.fields.map((field) => (
                <FieldControl
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  values={values}
                  error={errors[field.key]}
                  slug={slug}
                  emphasis={conversational}
                  onChange={(value) => setValue(field.key, value)}
                />
              ))}
            </section>
          )}

          {/* Honeypot for bots; hidden from people and assistive technology. */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          {isLast && payload?.captchaSiteKey && <TurnstileWidget siteKey={payload.captchaSiteKey} onToken={setCaptchaToken} />}

          <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" disabled={safeIndex === 0} onClick={() => setStepIndex(Math.max(0, safeIndex - 1))}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {payload?.viewer.signedIn && !previewForm && (
                <Button type="button" variant="outline" disabled={savingDraft} onClick={() => void saveDraft(safeIndex, false)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save and finish later
                </Button>
              )}
            </div>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLast ? form.submitLabel ?? "Submit" : "Continue"}
              {!isLast && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
