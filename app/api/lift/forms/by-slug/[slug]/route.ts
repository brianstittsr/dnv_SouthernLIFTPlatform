import { NextRequest, NextResponse } from "next/server";
import { getRequester, jsonError } from "@/lib/form-builder/server/context";
import { canAccessForm, getFormBySlug, incrementFormCounter, toPublicSchema } from "@/lib/form-builder/server/forms-repo";
import { buildPrefillForRequester } from "@/lib/form-builder/server/prefill";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";

/**
 * GET /api/lift/forms/by-slug/[slug] - sanitized published form for the runner,
 * plus prefill answers for signed-in respondents.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const [form, requester] = await Promise.all([getFormBySlug(slug), getRequester()]);
    if (!form) return jsonError("Form not found", 404);
    if (!canAccessForm(form, requester)) return jsonError(requester ? "Access denied" : "Please sign in to open this form", requester ? 403 : 401);

    const prefill = requester && form.audience !== "staff" ? await buildPrefillForRequester(form, requester).catch(() => ({})) : {};
    void incrementFormCounter(form.id, "totalViews");
    return NextResponse.json({
      data: {
        form: toPublicSchema(form, Boolean(requester?.isStaff)),
        prefill,
        viewer: { signedIn: Boolean(requester), isStaff: Boolean(requester?.isStaff), name: requester?.name ?? null },
        captchaSiteKey: !requester && process.env.TURNSTILE_SECRET_KEY ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null : null,
      },
    });
  } catch (error) {
    return handleRouteError(error, "Load LIFT form failed");
  }
}
