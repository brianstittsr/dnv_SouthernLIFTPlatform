import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { buildWorksheetDocx } from "@/lib/onboarding/worksheet-docx";
import { parseWorksheetText } from "@/lib/onboarding/worksheet";

export const runtime = "nodejs";

const FILE_NAME = "LIFT-Client-Onboarding-Worksheet.docx";

/**
 * GET /api/onboarding/worksheet
 * Generates the branded .docx worksheet — content controls, per-step pages,
 * NAICS appendix — mirroring the LIFT client onboarding fields.
 */
export async function GET() {
  const buffer = await buildWorksheetDocx();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${FILE_NAME}"`,
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Extracts text from a .docx (word/document.xml), one paragraph per line.
 * Content controls are resolved first: checkbox controls become "[x]"/"[ ]"
 * markers (their state lives in attributes, not text); dropdown and
 * plain-text controls yield their selected/entered text.
 */
async function docxToText(bytes: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  const xml = await zip.file("word/document.xml")?.async("string");
  if (!xml) throw new Error("Not a Word document");

  const resolved = xml.replace(/<w:sdt\b[^>]*>[\s\S]*?<\/w:sdt>/g, (block) => {
    const isCheckbox = /<w14:checkbox|<w:checkBox/.test(block);
    if (isCheckbox) {
      const checked = /<w14:checked w14:val="1"|<w:checked w:val="(?:1|true|on)"/.test(block);
      return checked ? "[x] " : "[ ] ";
    }
    const content = block.match(/<w:sdtContent>[\s\S]*?<\/w:sdtContent>/)?.[0] ?? "";
    return content.replace(/<[^>]+>/g, "");
  });

  return resolved
    .split(/<\/w:p>/)
    .map((para) => para.replace(/<[^>]+>/g, ""))
    .map((para) =>
      para
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code))),
    )
    .join("\n");
}

const saveSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  /** Wizard step to resume at (clamped by the wizard to the last step). */
  step: z.number().int().min(0).max(50).optional(),
});

/**
 * POST /api/onboarding/worksheet
 *
 * Two modes:
 * - multipart "file": parses an uploaded completed worksheet and returns
 *   the extracted answers (nothing is saved yet — the client runs a
 *   field-by-field QC pass first).
 * - JSON { answers, step? }: writes the verified answers into the signed-in
 *   user's onboardingDraft — the wizard restores them on next visit.
 */
export async function POST(req: NextRequest) {
  try {
    if (!db || !auth) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(authHeader.split("Bearer ")[1]);
    const uid = decodedToken.uid;
    const userRef = db.collection("users").doc(uid);

    const contentType = req.headers.get("content-type") ?? "";

    // Mode 2: save verified answers into the onboarding draft.
    if (contentType.includes("application/json")) {
      const parsed = saveSchema.safeParse(await req.json().catch(() => ({})));
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
      }
      const { answers, step = 0 } = parsed.data;
      const snap = await userRef.get();
      const existing = (snap.data()?.onboardingDraft?.sme ?? {}) as Record<string, unknown>;
      await userRef.set(
        {
          onboardingDraft: {
            userType: "sme",
            step,
            sme: { ...existing, ...answers },
            updatedAt: Timestamp.now(),
          },
        },
        { merge: true },
      );
      return NextResponse.json({ data: { saved: true, fields: Object.keys(answers).length } });
    }

    // Mode 1: parse the uploaded document, return answers for QC.
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (2 MB max)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const header = new Uint8Array(bytes.slice(0, 4));
    const isZip = header[0] === 0x50 && header[1] === 0x4b; // "PK"

    let text: string;
    if (isZip) {
      text = await docxToText(bytes);
    } else {
      // Plain text / markdown / Word-HTML (.doc): strip tags crudely.
      text = new TextDecoder().decode(bytes).replace(/<[^>]+>/g, " ");
    }

    const answers = parseWorksheetText(text);
    const filled = Object.keys(answers);
    if (filled.length === 0) {
      return NextResponse.json(
        { error: "No answers could be read from that file. Download the worksheet and fill in the fields after each colon." },
        { status: 422 },
      );
    }

    return NextResponse.json({ data: { answers, fieldsFilled: filled.length } });
  } catch (error) {
    console.error("Error handling onboarding worksheet:", error);
    return NextResponse.json({ error: "Failed to process the worksheet" }, { status: 500 });
  }
}
