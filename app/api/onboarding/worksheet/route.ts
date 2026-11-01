import { NextRequest, NextResponse } from "next/server";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import JSZip from "jszip";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { parseWorksheetText, WORKSHEET_SECTIONS } from "@/lib/onboarding/worksheet";

export const runtime = "nodejs";

const FILE_NAME = "LIFT-Client-Onboarding-Worksheet.docx";

/**
 * GET /api/onboarding/worksheet
 * Generates a Word worksheet mirroring the LIFT client onboarding fields so
 * clients can gather answers offline and paste them into the wizard.
 */
export async function GET() {
  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: "LIFT Client Onboarding Worksheet", bold: true })],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Southern University MBDA LIFT Rural Business Center — gather your answers here, then either copy and paste them into the onboarding wizard or upload this completed document and we'll fill the fields for you.",
          italics: true,
          color: "555555",
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Type each answer on the same line after the colon. Leave anything you don't know blank.",
          color: "555555",
        }),
      ],
    }),
  ];

  WORKSHEET_SECTIONS.forEach((section, index) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360 },
        children: [new TextRun({ text: `${index + 1}. ${section.title}`, bold: true })],
      }),
    );
    for (const field of section.fields) {
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: `${field.label}: `, bold: true }),
            new TextRun({
              text: field.hint ? `(${field.hint}) ________________________________` : "________________________________",
              color: "777777",
            }),
          ],
        }),
      );
    }
  });

  children.push(
    new Paragraph({
      spacing: { before: 360 },
      children: [
        new TextRun({ text: "END OF WORKSHEET", bold: true, color: "999999" }),
      ],
    }),
  );

  const doc = new Document({
    creator: "Southern University LIFT Center",
    title: "LIFT Client Onboarding Worksheet",
    sections: [{ children }],
  });
  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${FILE_NAME}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Extracts text runs from a .docx (word/document.xml), one paragraph per line. */
async function docxToText(bytes: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  const xml = await zip.file("word/document.xml")?.async("string");
  if (!xml) throw new Error("Not a Word document");
  return xml
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

/**
 * POST /api/onboarding/worksheet
 * Parses an uploaded completed worksheet and stores the answers as the
 * signed-in user's onboardingDraft — the wizard restores it on next visit.
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

    // Merge over any existing draft so unanswered fields keep prior values.
    const userRef = db.collection("users").doc(uid);
    const snap = await userRef.get();
    const existing = (snap.data()?.onboardingDraft?.sme ?? {}) as Record<string, unknown>;
    await userRef.set(
      {
        onboardingDraft: {
          userType: "sme",
          step: 0,
          sme: { ...existing, ...answers },
          updatedAt: Timestamp.now(),
        },
      },
      { merge: true },
    );

    return NextResponse.json({ data: { fieldsFilled: filled.length, keys: filled } });
  } catch (error) {
    console.error("Error parsing onboarding worksheet:", error);
    return NextResponse.json({ error: "Failed to read the worksheet" }, { status: 500 });
  }
}
