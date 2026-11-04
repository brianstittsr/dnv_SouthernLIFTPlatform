import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";
import { sendEmail } from "@/lib/email";
import { buildTeamMemberReport } from "@/lib/team-member-report";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
import { ADMIN_ONLY_ROLES, archiveGeneratedDocument } from "@/lib/documents/archive";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken.email?.includes("kdm-assoc.com")) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { to } = await req.json();
    if (!to || typeof to !== "string" || !to.includes("@")) {
      return NextResponse.json(
        { error: "Valid recipient email is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const snapshot = await db.collection(COLLECTIONS.TEAM_MEMBERS).get();
    const members: TeamMemberDoc[] = [];
    snapshot.forEach((doc) => {
      members.push({ id: doc.id, ...doc.data() } as TeamMemberDoc);
    });

    const report = buildTeamMemberReport(members);

    // Archive the report in portal Documents (dedupes per day). Best-effort.
    try {
      const today = new Date().toISOString().slice(0, 10);
      const pdf = await renderHtmlToPdf(report.html);
      await archiveGeneratedDocument({
        buffer: pdf,
        fileName: `KDM-Team-Member-Report-${today}.pdf`,
        contentType: "application/pdf",
        category: "team-reports",
        folder: "Team Reports",
        tags: ["Team Report"],
        allowedRoles: ADMIN_ONLY_ROLES,
        uploadedBy: "KDM Platform",
        source: { type: "team-report", id: today },
      });
    } catch (archiveError) {
      console.error("Team report archive failed:", archiveError);
    }

    const result = await sendEmail({
      to,
      subject: "KDM Team Member Type Report",
      html: report.html,
      text: report.text,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      total: report.total,
    });
  } catch (error) {
    console.error("Error sending team member report:", error);
    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500 }
    );
  }
}
