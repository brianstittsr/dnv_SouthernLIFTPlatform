import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/form-builder/server/context";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";
import { interviewConfigSchema } from "@/lib/interview/types";
import { suggestPrompt } from "@/lib/interview/server/engine";

/** POST /api/lift/interviews/suggest-prompt - AI-generate a system prompt from setup fields (admin). */
export async function POST(request: NextRequest) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    if (!checkRateLimit(`suggest-prompt:${requester.uid}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many generations — please wait a few minutes" }, { status: 429 });
    }
    const parsed = interviewConfigSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid interview configuration" }, { status: 400 });
    return NextResponse.json({ data: await suggestPrompt(parsed.data) });
  } catch (error) {
    return handleRouteError(error, "Suggest prompt failed");
  }
}
