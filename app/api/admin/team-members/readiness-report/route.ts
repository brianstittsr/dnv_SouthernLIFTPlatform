import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";
import { sendEmail } from "@/lib/email";
import { buildReadinessReport } from "@/lib/readiness-report";

/**
 * POST /api/admin/team-members/readiness-report
 * Body: { to: string }
 *
 * Emails the GovCon readiness management report (built from each member's
 * persisted govReadinessScore — run a readiness scan first for fresh data).
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decodedToken = await admin.auth().verifyIdToken(authHeader.split("Bearer ")[1]);
    if (!decodedToken.email?.includes("kdm-assoc.com")) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { to } = await req.json();
    if (!to || typeof to !== "string" || !to.includes("@")) {
      return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const snapshot = await db.collection(COLLECTIONS.TEAM_MEMBERS).get();
    const members: TeamMemberDoc[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TeamMemberDoc));

    const scored = members.filter((m) => m.govReadinessScore);
    if (!scored.length) {
      return NextResponse.json(
        { error: "No readiness scores on record — run the readiness scan first" },
        { status: 409 }
      );
    }

    const report = buildReadinessReport(members);

    const result = await sendEmail({
      to,
      subject: `KDM Consortium Readiness Report — ${new Date().toLocaleDateString()}`,
      html: report.html,
      text: report.text,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.messageId, total: report.total });
  } catch (error) {
    console.error("Error sending readiness report:", error);
    return NextResponse.json({ error: "Failed to send report" }, { status: 500 });
  }
}
