import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { COLLECTIONS } from "@/lib/schema";
import { getRequester, jsonError, requireDb, serializeFirestore } from "@/lib/form-builder/server/context";
import { canAccessForm, getFormBySlug } from "@/lib/form-builder/server/forms-repo";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";

type Params = { params: Promise<{ slug: string }> };

const draftSchema = z.object({
  values: z.record(z.string(), z.unknown()),
  stepIndex: z.number().int().min(0).max(500),
});

/** Draft id: one draft per signed-in user per form. */
const draftId = (slug: string, uid: string) => `${slug}__${uid}`;

/** Removes values that should never be saved in drafts (signatures). */
function sanitizeDraftValues(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => !(value && typeof value === "object" && "mode" in (value as object))));
}

/** GET /api/lift/forms/by-slug/[slug]/drafts - the signed-in user's saved draft. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);
    const snapshot = await requireDb().collection(COLLECTIONS.LIFT_FORM_DRAFTS).doc(draftId(slug, requester.uid)).get();
    return NextResponse.json({ data: snapshot.exists ? serializeFirestore(snapshot.data()) : null });
  } catch (error) {
    return handleRouteError(error, "Load LIFT draft failed");
  }
}

/** PUT /api/lift/forms/by-slug/[slug]/drafts - save progress for the signed-in user. */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);
    const form = await getFormBySlug(slug);
    if (!form || !canAccessForm(form, requester)) return jsonError("Form not found", 404);
    const parsed = draftSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Invalid draft", 400);
    if (JSON.stringify(parsed.data.values).length > 500_000) return jsonError("Draft is too large", 413);
    await requireDb()
      .collection(COLLECTIONS.LIFT_FORM_DRAFTS)
      .doc(draftId(slug, requester.uid))
      .set({ formSlug: slug, uid: requester.uid, values: sanitizeDraftValues(parsed.data.values), stepIndex: parsed.data.stepIndex, updatedAt: Timestamp.now() });
    return NextResponse.json({ data: { saved: true } });
  } catch (error) {
    return handleRouteError(error, "Save LIFT draft failed");
  }
}

/** DELETE /api/lift/forms/by-slug/[slug]/drafts - discard the draft (called after submit). */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);
    await requireDb().collection(COLLECTIONS.LIFT_FORM_DRAFTS).doc(draftId(slug, requester.uid)).delete();
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return handleRouteError(error, "Delete LIFT draft failed");
  }
}
