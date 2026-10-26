import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRequester, hashIp, jsonError } from "@/lib/form-builder/server/context";
import { canAccessForm, getFormBySlug } from "@/lib/form-builder/server/forms-repo";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";
import { storeUpload } from "@/lib/form-builder/server/uploads";

/** POST /api/lift/forms/by-slug/[slug]/uploads - upload one file (multipart "file") for a form answer. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const requester = await getRequester();
    const ipHash = hashIp(request);
    if (!checkRateLimit(`upload:${requester?.uid ?? ipHash}`, requester ? 60 : 15, 10 * 60 * 1000)) {
      return jsonError("Too many uploads. Please wait a few minutes and try again.", 429);
    }

    const form = await getFormBySlug(slug);
    if (!form) return jsonError("Form not found", 404);
    if (!canAccessForm(form, requester)) return jsonError("Access denied", requester ? 403 : 401);
    if (!form.fields.some((field) => field.type === "file_upload")) return jsonError("This form does not accept files", 400);

    const formData = await request.formData().catch(() => null);
    const file = formData?.get("file");
    if (!(file instanceof File)) return jsonError("No file provided", 400);

    try {
      const upload = await storeUpload({ file, formSlug: slug, requester, ipHash });
      return NextResponse.json({ data: upload }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      if (message === "File storage is not configured") throw error;
      return jsonError(message, 400);
    }
  } catch (error) {
    return handleRouteError(error, "LIFT form upload failed");
  }
}
