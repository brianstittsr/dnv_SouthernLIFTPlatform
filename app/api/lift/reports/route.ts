import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, type LiftReportDoc } from "@/lib/schema";
import { requireDb, serializeFirestore, stripUndefined, writeAudit } from "@/lib/form-builder/server/context";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";
import { collectClientDataPack, collectPlatformDataPack } from "@/lib/reports/data-collector";
import { generateNarrative, headlineMetrics, reportTitle, resolvePeriod, REPORT_TYPES } from "@/lib/reports/generate";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Stored shape — createdAt is an admin Timestamp; the client-facing LiftReportDoc type uses the client SDK Timestamp. */
type StoredReport = Omit<LiftReportDoc, "id" | "createdAt"> & { createdAt: Timestamp };

const createSchema = z.object({
  type: z.enum(REPORT_TYPES),
  year: z.number().int().min(2020).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  half: z.number().int().min(1).max(2).optional(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  prompt: z.string().trim().max(2000).optional(),
  liftClientId: z.string().trim().min(1).max(120).optional(),
});

/** GET /api/lift/reports - list saved reports (admin only; data packs omitted). */
export async function GET() {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const snapshot = await requireDb().collection(COLLECTIONS.LIFT_REPORTS).orderBy("createdAt", "desc").limit(200).get();
    const data = snapshot.docs.map((doc) => {
      const { dataPack: _pack, ...summary } = serializeFirestore(doc.data() as LiftReportDoc);
      void _pack;
      return { ...summary, id: doc.id };
    });
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, "List LIFT reports failed");
  }
}

/** POST /api/lift/reports - collect the data pack, generate the narrative, save the report (admin only). */
export async function POST(request: NextRequest) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const body = createSchema.safeParse(await request.json());
    if (!body.success) return NextResponse.json({ error: "Invalid report request" }, { status: 400 });
    const input = body.data;
    if (input.type === "freeform" && !input.prompt) {
      return NextResponse.json({ error: "Describe what the analysis should focus on" }, { status: 400 });
    }
    if (input.type === "client_deepdive" && !input.liftClientId) {
      return NextResponse.json({ error: "Choose a client for the deep dive" }, { status: 400 });
    }

    const period = resolvePeriod(input);
    let pack: Record<string, unknown>;
    let clientName: string | undefined;
    if (input.type === "client_deepdive") {
      pack = await collectClientDataPack(input.liftClientId!, period);
      clientName = String((pack.client as Record<string, unknown>).legalName ?? input.liftClientId);
    } else {
      pack = await collectPlatformDataPack(period);
    }

    const generated = await generateNarrative({ type: input.type, period, pack, prompt: input.prompt, clientName });
    const report = stripUndefined<StoredReport>({
      type: input.type,
      title: reportTitle(input.type, period, clientName),
      periodStart: period.start?.toISOString().slice(0, 10),
      periodEnd: period.end?.toISOString().slice(0, 10),
      periodLabel: period.label,
      liftClientId: input.liftClientId,
      clientName,
      prompt: input.prompt,
      metrics: headlineMetrics(input.type, pack),
      narrative: generated.narrative,
      dataPack: pack,
      source: generated.source,
      model: generated.model,
      tokensUsed: generated.tokensUsed,
      createdByUid: requester.uid,
      createdByName: requester.name,
      createdAt: Timestamp.now(),
    });
    const ref = await requireDb().collection(COLLECTIONS.LIFT_REPORTS).add(report);
    await writeAudit("report.generated", ref.id, requester, { type: input.type, period: period.label, source: generated.source, tokensUsed: generated.tokensUsed });
    return NextResponse.json({ data: serializeFirestore({ ...report, id: ref.id }) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Generate LIFT report failed");
  }
}
