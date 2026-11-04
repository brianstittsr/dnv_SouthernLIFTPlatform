import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, hashIp } from "@/lib/form-builder/server/context";
import { defaultProcessDescription } from "@/lib/interview/prompts";
import { getSessionForInvite } from "@/lib/interview/server/repo";
import { resolveInterviewKey } from "@/lib/interview/server/invites";
import type { PublicInterviewInfo } from "@/lib/interview/types";

/** GET /api/public/interview/[key] - sanitized interview info for the respondent landing page. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    if (!checkRateLimit(`iv-info:${hashIp(request)}`, 60, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const { key } = await params;
    const resolved = await resolveInterviewKey(key);
    if (!resolved) {
      return NextResponse.json({ error: "This interview link is invalid or no longer available" }, { status: 404 });
    }

    const { interview, invite } = resolved;
    let alreadyCompleted = false;
    let inProgress = false;
    if (invite) {
      const session = await getSessionForInvite(invite.id);
      alreadyCompleted = session?.status === "completed";
      inProgress = session?.status === "in_progress";
    }

    const info: PublicInterviewInfo = {
      title: interview.title,
      description: interview.description,
      processDescription: interview.processDescription.trim() || defaultProcessDescription(interview),
      estimatedMinutes: interview.estimatedMinutes,
      mode: interview.mode,
      alreadyCompleted,
      recipientName: invite?.recipientName,
      recipientEmail: invite?.recipientEmail,
    };

    return NextResponse.json({
      data: {
        ...info,
        resumable: inProgress,
        captchaSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null,
      },
    });
  } catch (error) {
    console.error("Interview info failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
