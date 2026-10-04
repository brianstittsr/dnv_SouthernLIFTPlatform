import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";
import { computeMemberReadiness, isReminderDue, bucketForScore, type CompanyIntelligence } from "@/lib/member-readiness";
import { sendTemplatedEmail } from "@/lib/email";

/**
 * POST /api/admin/team-members/readiness-scan
 * Body: { sendReminders?: boolean }
 *
 * Scans every teamMembers doc for GovCon readiness — maps the member's
 * companyIntelligence block (merged with the linked users doc matched by
 * email) into the readiness scoring engine, persists the score on the
 * member doc, and optionally emails a reminder to members whose profile
 * is incomplete or below the contract-ready threshold (14-day cooldown).
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://portal.kdm-assoc.com";
const REMINDER_COOLDOWN_DAYS = 14;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken.email?.includes("kdm-assoc.com")) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const sendReminders = body?.sendReminders === true;

    const [memberSnap, userSnap] = await Promise.all([
      db.collection(COLLECTIONS.TEAM_MEMBERS).get(),
      db.collection(COLLECTIONS.USERS).get(),
    ]);

    // Index users by email → companyIntelligence; also track which emails have a portal account
    const userCiByEmail = new Map<string, CompanyIntelligence>();
    const accountEmails = new Set<string>();
    userSnap.docs.forEach((d) => {
      const data = d.data();
      const email = (data.email as string | undefined)?.trim().toLowerCase();
      if (!email) return;
      accountEmails.add(email);
      if (data.companyIntelligence) {
        userCiByEmail.set(email, data.companyIntelligence as CompanyIntelligence);
      }
    });

    const now = Timestamp.now();
    const batch = db.batch();

    const results = {
      scanned: 0,
      byBucket: { critical: 0, needs_improvement: 0, adequate: 0, good: 0, excellent: 0 },
      contractReady: 0,
      incomplete: [] as { id: string; name: string; email?: string; score: number; gaps: string[] }[],
      reminded: 0,
      reminderSkippedCooldown: 0,
      noEmail: 0,
      errors: [] as string[],
    };

    const members: { doc: FirebaseFirestore.QueryDocumentSnapshot; member: TeamMemberDoc; score: ReturnType<typeof computeMemberReadiness> }[] = [];

    for (const docSnap of memberSnap.docs) {
      const member = { id: docSnap.id, ...docSnap.data() } as TeamMemberDoc;
      const userCi = member.emailPrimary ? userCiByEmail.get(member.emailPrimary.trim().toLowerCase()) : undefined;
      const score = computeMemberReadiness(member, userCi);
      members.push({ doc: docSnap, member, score });

      results.scanned += 1;
      results.byBucket[bucketForScore(score.overallScore)] += 1;
      if (score.overallScore >= 60) results.contractReady += 1;

      batch.set(
        docSnap.ref,
        {
          govReadinessScore: {
            overallScore: score.overallScore,
            breakdown: score.breakdown,
            gaps: score.gaps,
            remediationRecommendations: score.remediationRecommendations,
            lastCalculated: now,
          },
          govReadinessLastScannedAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

      const needsAttention = !member.companyIntelligence?.legalCompanyName || score.overallScore < 60;
      if (needsAttention) {
        results.incomplete.push({
          id: member.id,
          name: [member.firstName, member.lastName].filter(Boolean).join(" ") || member.id,
          email: member.emailPrimary,
          score: score.overallScore,
          gaps: score.gaps.slice(0, 3),
        });
      }
    }

    // Reminders — throttled email + flag
    if (sendReminders) {
      for (const { doc: docSnap, member, score } of members) {
        const needsAttention = !member.companyIntelligence?.legalCompanyName || score.overallScore < 60;
        if (!needsAttention) continue;

        if (!member.emailPrimary) {
          results.noEmail += 1;
          continue;
        }
        if (!isReminderDue(member, score, REMINDER_COOLDOWN_DAYS)) {
          results.reminderSkippedCooldown += 1;
          continue;
        }

        const isNewMember = !member.companyIntelligence?.legalCompanyName;
        // Members with a portal account go to their profile; everyone else gets
        // the public onboarding wizard (no login required)
        const emailKey = member.emailPrimary.trim().toLowerCase();
        const profileUrl = accountEmails.has(emailKey)
          ? `${APP_URL}/portal/profile`
          : `${APP_URL}/onboarding/client?email=${encodeURIComponent(member.emailPrimary)}&member=${encodeURIComponent(member.id)}`;
        try {
          const emailResult = await sendTemplatedEmail("profileReminder", member.emailPrimary, {
            name: member.firstName || member.emailPrimary,
            score: score.overallScore,
            gaps: score.remediationRecommendations.slice(0, 3),
            profileUrl,
            isNewMember,
          });
          if (!emailResult.success) {
            results.errors.push(`Reminder failed for ${member.emailPrimary}: ${emailResult.error || "unknown"}`);
            continue;
          }
          batch.set(
            docSnap.ref,
            { lastReadinessReminderSentAt: now, readinessReminderCount: (member.readinessReminderCount ?? 0) + 1, updatedAt: now },
            { merge: true }
          );
          results.reminded += 1;
        } catch (error: unknown) {
          results.errors.push(`Reminder failed for ${member.emailPrimary}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    await batch.commit();
    return NextResponse.json(results);
  } catch (error) {
    console.error("Readiness scan error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Readiness scan failed" },
      { status: 500 }
    );
  }
}
