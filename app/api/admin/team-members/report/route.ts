import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";
import { sendEmail } from "@/lib/email";
import { buildTeamMemberReport } from "@/lib/team-member-report";

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
