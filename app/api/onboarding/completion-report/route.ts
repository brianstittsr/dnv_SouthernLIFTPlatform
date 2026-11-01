import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/email";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
import {
  analyzeServiceGaps,
  buildEmailHtml,
  buildReportHtml,
  recommendAdditionalServices,
} from "@/lib/onboarding/completion-report";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({ sme: z.record(z.string(), z.unknown()) });

const RECIPIENTS = (process.env.LIFT_REPORT_RECIPIENTS ??
  "bstitt@strategicvalueplus.com,mhundal@kdm-assoc.com")
  .split(",")
  .map((r) => r.trim())
  .filter(Boolean);

/**
 * POST /api/onboarding/completion-report
 * Emails a PDF profile + out-of-scope service-gap report to LIFT staff
 * after a client finishes onboarding. Best-effort from the client; any
 * failure here must not block onboarding completion.
 */
export async function POST(req: NextRequest) {
  try {
    if (!auth) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(authHeader.split("Bearer ")[1]);
    if (!decodedToken.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const sme = parsed.data.sme;

    const gaps = analyzeServiceGaps(sme);
    const aiRecs = await recommendAdditionalServices(sme, gaps);
    const pdf = await renderHtmlToPdf(buildReportHtml(sme, gaps, aiRecs));

    const company = typeof sme.companyName === "string" && sme.companyName.trim()
      ? sme.companyName.trim()
      : "New client";
    const result = await sendEmail({
      to: RECIPIENTS,
      subject: `LIFT onboarding complete: ${company}`,
      html: buildEmailHtml(sme, gaps, aiRecs),
      text: `${company} completed LIFT onboarding. Identified services: ${gaps.map((g) => g.service).join(", ") || "none"}. See attached PDF.`,
      attachments: [
        {
          filename: `LIFT-Onboarding-Report-${company.replace(/[^a-z0-9]+/gi, "-")}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Email failed" }, { status: 502 });
    }
    return NextResponse.json({ data: { sent: true, gaps: gaps.length, recommendations: aiRecs.length } });
  } catch (error) {
    console.error("Error sending LIFT onboarding completion report:", error);
    return NextResponse.json({ error: "Failed to send report" }, { status: 500 });
  }
}
