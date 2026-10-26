import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getRequester, hashIp, jsonError, verifyCaptcha, writeAudit } from "@/lib/form-builder/server/context";
import { canAccessForm, getFormBySlug, incrementFormCounter } from "@/lib/form-builder/server/forms-repo";
import { processSubmission } from "@/lib/form-builder/server/process-submission";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";
import type { FormValues } from "@/lib/form-builder/types";

const bodySchema = z.object({
  values: z.record(z.string(), z.unknown()),
  completionSeconds: z.number().int().min(0).max(86_400).optional(),
  captchaToken: z.string().max(4000).optional(),
  /** Honeypot: must stay empty (bots tend to fill every input). */
  website: z.string().max(0).optional(),
});

/** POST /api/lift/forms/by-slug/[slug]/submissions - submit answers to a published form. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const requester = await getRequester();
    const ipHash = hashIp(request);
    if (!checkRateLimit(`submit:${requester?.uid ?? ipHash}`, requester ? 30 : 8, 10 * 60 * 1000)) {
      return jsonError("Too many submissions. Please wait a few minutes and try again.", 429);
    }

    const form = await getFormBySlug(slug);
    if (!form) return jsonError("Form not found", 404);
    if (!canAccessForm(form, requester)) return jsonError(requester ? "Access denied" : "Please sign in to submit this form", requester ? 403 : 401);

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Invalid submission", 400);
    if (!requester && !(await verifyCaptcha(parsed.data.captchaToken, request))) return jsonError("Please complete the verification check", 400);

    const result = await processSubmission({
      form,
      rawValues: parsed.data.values as FormValues,
      requester,
      ipHash,
      userAgent: request.headers.get("user-agent") ?? undefined,
      completionSeconds: parsed.data.completionSeconds,
    });
    void incrementFormCounter(form.id, "totalSubmissions");
    await writeAudit("submission.created", result.submissionId, requester, { formSlug: slug, liftClientId: result.liftClientId ?? null });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "LIFT form submission failed");
  }
}
