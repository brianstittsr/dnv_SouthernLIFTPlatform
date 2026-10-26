import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/schema";
import { getRequester, jsonError, requireDb, serializeFirestore } from "@/lib/form-builder/server/context";
import { listForms } from "@/lib/form-builder/server/forms-repo";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";

/** GET /api/lift/my-forms - published forms available to the signed-in user, with their submission history. */
export async function GET() {
  try {
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);
    const [forms, submissions] = await Promise.all([
      listForms(),
      requireDb().collection(COLLECTIONS.LIFT_FORM_SUBMISSIONS).where("submittedByUid", "==", requester.uid).limit(200).get(),
    ]);
    const mine = submissions.docs.map((doc) => serializeFirestore(doc.data()) as { id: string; formSlug: string; createdAt: string; status: string });
    const data = forms
      .filter((form) => form.status === "published" && (form.audience !== "staff" || requester.isStaff))
      .map((form) => {
        const history = mine.filter((item) => item.formSlug === form.slug).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return {
          slug: form.slug,
          title: form.title,
          description: form.description,
          category: form.category,
          lifecycleRef: form.lifecycleRef ?? null,
          audience: form.audience,
          submissions: history.map(({ id, createdAt, status }) => ({ id, createdAt, status })),
        };
      });
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, "List my LIFT forms failed");
  }
}
