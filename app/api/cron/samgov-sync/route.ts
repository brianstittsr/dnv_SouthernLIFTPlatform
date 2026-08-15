import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { isSamGovConfigured, searchSamGovOpportunities, type SamGovOpportunity } from "@/lib/samgov-service";
import { scoreOpportunitiesForMember, recommendTeamingPartner, type MemberProfileSummary, type TeamingCandidate } from "@/lib/samgov-ai";
import { createUserNotification } from "@/lib/notifications-store";
import { sendTemplatedEmail } from "@/lib/email";

/**
 * GET /api/cron/samgov-sync
 *
 * Daily cron job that:
 * 1. Runs one broad SAM.gov opportunity search via the Cgray proxy.
 * 2. AI-ranks the results against every onboarded member's profile and
 *    stores their top matches in samgovOpportunities.
 * 3. Hides previously-delivered opportunities once their response deadline
 *    has passed (never deletes — admin history is preserved).
 * 4. Sends in-app + email notifications for newly-delivered matches.
 * 5. Runs AI teaming-partner recommendations for each member's top match
 *    and notifies both the requester and the recommended partner.
 *
 * Protected by CRON_SECRET environment variable (same pattern as
 * /api/cron/stripe-sync).
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://portal.kdm-assoc.com";
const MATCH_SCORE_THRESHOLD = 55;
const TEAMING_SCORE_THRESHOLD = 50;
const MAX_MATCHES_PER_MEMBER = 5;

interface EligibleMember {
  userId: string;
  email?: string;
  name: string;
  companyName?: string;
  companyDescription?: string;
  naicsCodes?: string[];
  certifications?: string[];
}

function toProfileSummary(member: EligibleMember): MemberProfileSummary {
  return {
    userId: member.userId,
    name: member.name,
    companyName: member.companyName,
    companyDescription: member.companyDescription,
    naicsCodes: member.naicsCodes,
    certifications: member.certifications,
  };
}

function parseDeadline(raw: string | undefined): Timestamp | null {
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return Timestamp.fromDate(date);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
  }

  const results = {
    samgovConfigured: false,
    eligibleMembers: 0,
    opportunitiesFetched: 0,
    newMatchesDelivered: 0,
    membersNotified: 0,
    opportunitiesHidden: 0,
    teamingRecommendationsCreated: 0,
    errors: [] as string[],
  };

  try {
    // ─── 1. Verify SAM.gov integration is configured ─────────────────────
    results.samgovConfigured = await isSamGovConfigured();
    if (!results.samgovConfigured) {
      return NextResponse.json({
        ...results,
        message: "SAM.gov integration is not configured in Settings > Integrations. Skipping sync.",
      });
    }

    // ─── 2. Load eligible members (active + onboarding complete + admin-approved) ─
    const usersSnap = await db
      .collection(COLLECTIONS.USERS)
      .where("companyIntelligenceComplete", "==", true)
      .where("onboardingReviewStatus", "==", "approved")
      .get();

    const eligibleMembers: EligibleMember[] = usersSnap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        userId: docSnap.id,
        email: data.email || undefined,
        name: [data.firstName, data.lastName].filter(Boolean).join(" ") || data.companyName || "Member",
        companyName: data.companyName || data.company || data.legalCompanyName || undefined,
        companyDescription: data.companyDescription || undefined,
        naicsCodes: Array.isArray(data.naicsCodes) ? data.naicsCodes : undefined,
        certifications: Array.isArray(data.certifications) ? data.certifications : undefined,
      };
    });
    results.eligibleMembers = eligibleMembers.length;

    if (eligibleMembers.length === 0) {
      return NextResponse.json({ ...results, message: "No onboarded members found." });
    }

    // ─── 3. One broad SAM.gov search ─────────────────────────────────────
    const since = new Date();
    since.setDate(since.getDate() - 3);
    const fromStr = `${since.toISOString().slice(0, 10)}-00:00`;

    let opportunities: SamGovOpportunity[] = [];
    try {
      const searchResponse = await searchSamGovOpportunities({
        is_active: true,
        notice_type: "p,o,k,r,s",
        size: 100,
        "modified_date.from": fromStr,
      });
      opportunities = searchResponse.opportunitiesData || [];
    } catch (error: any) {
      results.errors.push(`SAM.gov search failed: ${error.message}`);
      return NextResponse.json(results, { status: 502 });
    }
    results.opportunitiesFetched = opportunities.length;

    if (opportunities.length === 0) {
      return NextResponse.json({ ...results, message: "No opportunities returned by SAM.gov search." });
    }

    // ─── 4. AI-rank per member, upsert top matches ───────────────────────
    const memberDigests: Record<string, { name: string; email?: string; portalUrl: string; opps: { title: string; agency?: string; matchScore: number; responseDeadline?: string; uiLink?: string }[] }> = {};
    const memberTopMatch: Record<string, { opportunity: SamGovOpportunity; matchScore: number; matchReasons: string[] }> = {};

    for (const member of eligibleMembers) {
      try {
        const matches = await scoreOpportunitiesForMember(toProfileSummary(member), opportunities, MAX_MATCHES_PER_MEMBER);
        const relevant = matches.filter((m) => m.matchScore >= MATCH_SCORE_THRESHOLD);

        for (const match of relevant) {
          const opportunity = opportunities.find((o) => (o.noticeId || o.id) === match.noticeId);
          if (!opportunity) continue;

          const noticeId = String(opportunity.noticeId || opportunity.id);
          const docId = `${member.userId}_${noticeId}`;
          const docRef = db.collection(COLLECTIONS.SAMGOV_OPPORTUNITIES).doc(docId);
          const existing = await docRef.get();
          const isNew = !existing.exists;

          await docRef.set(
            {
              userId: member.userId,
              noticeId,
              title: opportunity.title,
              solicitationNumber: opportunity.solicitationNumber || null,
              agency: opportunity.organizationHierarchy || null,
              organizationHierarchy: opportunity.organizationHierarchy || null,
              noticeType: opportunity.type || null,
              naicsCode: opportunity.naicsCode || null,
              classificationCode: opportunity.classificationCode || null,
              typeOfSetAsideDescription: opportunity.typeOfSetAsideDescription || null,
              postedDate: opportunity.postedDate || null,
              responseDeadline: parseDeadline(opportunity.responseDeadLine as string | undefined),
              uiLink: opportunity.uiLink || null,
              description: typeof opportunity.description === "string" ? opportunity.description.slice(0, 2000) : null,
              matchScore: match.matchScore,
              matchReasons: match.matchReasons || [],
              hidden: false,
              deliveredAt: existing.exists ? existing.data()?.deliveredAt || Timestamp.now() : Timestamp.now(),
              createdAt: existing.exists ? existing.data()?.createdAt || Timestamp.now() : Timestamp.now(),
              updatedAt: Timestamp.now(),
            },
            { merge: true }
          );

          if (isNew) {
            results.newMatchesDelivered += 1;
            if (!memberDigests[member.userId]) {
              memberDigests[member.userId] = {
                name: member.name,
                email: member.email,
                portalUrl: `${APP_URL}/portal/samgov-opportunities`,
                opps: [],
              };
            }
            memberDigests[member.userId].opps.push({
              title: opportunity.title,
              agency: opportunity.organizationHierarchy,
              matchScore: match.matchScore,
              responseDeadline: opportunity.responseDeadLine as string | undefined,
              uiLink: opportunity.uiLink,
            });
          }

          // Track this member's single best match for the teaming pass below
          const current = memberTopMatch[member.userId];
          if (!current || match.matchScore > current.matchScore) {
            memberTopMatch[member.userId] = { opportunity, matchScore: match.matchScore, matchReasons: match.matchReasons };
          }
        }
      } catch (error: any) {
        results.errors.push(`Scoring failed for member ${member.userId}: ${error.message}`);
      }
    }

    // ─── 5. Notify members with new matches (in-app + email) ────────────
    for (const [userId, digest] of Object.entries(memberDigests)) {
      try {
        await createUserNotification({
          userId,
          type: "samgov_opportunity",
          title: `${digest.opps.length} New SAM.gov Opportunit${digest.opps.length === 1 ? "y" : "ies"}`,
          message: `Our AI matched ${digest.opps.length} federal opportunit${digest.opps.length === 1 ? "y" : "ies"} to your profile.`,
          link: "/portal/samgov-opportunities",
        });

        if (digest.email) {
          await sendTemplatedEmail("samgovOpportunityDigest", digest.email, {
            name: digest.name,
            opportunities: digest.opps,
            portalUrl: digest.portalUrl,
          });
        }
        results.membersNotified += 1;
      } catch (error: any) {
        results.errors.push(`Notification failed for member ${userId}: ${error.message}`);
      }
    }

    // ─── 6. Hide opportunities whose response deadline has passed ───────
    try {
      const activeSnap = await db.collection(COLLECTIONS.SAMGOV_OPPORTUNITIES).where("hidden", "==", false).get();
      const now = Timestamp.now();
      const batch = db.batch();
      let hiddenCount = 0;
      activeSnap.docs.forEach((docSnap) => {
        const deadline = docSnap.data().responseDeadline as Timestamp | null;
        if (deadline && deadline.toMillis() < now.toMillis()) {
          batch.update(docSnap.ref, { hidden: true, hiddenAt: now });
          hiddenCount += 1;
        }
      });
      if (hiddenCount > 0) await batch.commit();
      results.opportunitiesHidden = hiddenCount;
    } catch (error: any) {
      results.errors.push(`Hiding expired opportunities failed: ${error.message}`);
    }

    // ─── 7. AI teaming-partner recommendations ───────────────────────────
    const memberByUserId = new Map(eligibleMembers.map((m) => [m.userId, m]));

    for (const [requesterId, top] of Object.entries(memberTopMatch)) {
      try {
        const requester = memberByUserId.get(requesterId);
        if (!requester) continue;

        const noticeId = String(top.opportunity.noticeId || top.opportunity.id);
        const recDocId = `${requesterId}_${noticeId}`;
        const recDocRef = db.collection(COLLECTIONS.AI_TEAMMING_RECOMMENDATIONS).doc(recDocId);
        const existingRec = await recDocRef.get();
        if (existingRec.exists) continue; // already generated for this pairing

        const candidates: TeamingCandidate[] = eligibleMembers
          .filter((m) => m.userId !== requesterId)
          .map((m) => ({
            memberId: m.userId,
            companyName: m.companyName || m.name,
            companyDescription: m.companyDescription,
            naicsCodes: m.naicsCodes,
            certifications: m.certifications,
          }));

        if (candidates.length === 0) continue;

        const recommendation = await recommendTeamingPartner(
          toProfileSummary(requester),
          {
            title: top.opportunity.title,
            naicsCode: top.opportunity.naicsCode,
            description: typeof top.opportunity.description === "string" ? top.opportunity.description : undefined,
          },
          candidates
        );

        if (!recommendation || recommendation.matchScore < TEAMING_SCORE_THRESHOLD) continue;

        const partner = memberByUserId.get(recommendation.memberId);
        if (!partner) continue;

        const now = Timestamp.now();
        await recDocRef.set({
          opportunityId: noticeId,
          forMemberId: requesterId,
          sourceType: "samgov",
          opportunityTitle: top.opportunity.title,
          naicsCodes: top.opportunity.naicsCode ? [top.opportunity.naicsCode] : [],
          requiredCapabilities: [],
          requiredCertifications: [],
          recommendations: [
            {
              memberId: recommendation.memberId,
              companyName: recommendation.companyName,
              matchScore: recommendation.matchScore,
              matchReasons: recommendation.matchReasons,
              complementaryCapabilities: recommendation.complementaryCapabilities,
              relevantCertifications: recommendation.relevantCertifications,
              pastPerformanceRelevance: recommendation.pastPerformanceRelevance,
              geographicFit: true,
              sizeFit: true,
              availabilityFit: true,
              contacted: false,
              contactStatus: "pending",
              requesterNotifiedAt: now,
              partnerNotifiedAt: now,
            },
          ],
          suggestedTeamStructure: [],
          status: "active",
          generatedAt: now,
          expiresAt: top.opportunity.responseDeadLine ? parseDeadline(top.opportunity.responseDeadLine as string) : null,
          createdAt: now,
          updatedAt: now,
        });

        // Notify both members
        const portalUrl = `${APP_URL}/portal/samgov-opportunities/teaming`;
        await createUserNotification({
          userId: requesterId,
          type: "samgov_teaming",
          title: "AI Teaming Recommendation",
          message: `We recommend partnering with ${recommendation.companyName} on "${top.opportunity.title}".`,
          link: "/portal/samgov-opportunities/teaming",
        });
        await createUserNotification({
          userId: recommendation.memberId,
          type: "samgov_teaming",
          title: "AI Teaming Recommendation",
          message: `${requester.companyName || requester.name} may be a great teaming partner on "${top.opportunity.title}".`,
          link: "/portal/samgov-opportunities/teaming",
        });

        if (requester.email) {
          await sendTemplatedEmail("teamingRecommendation", requester.email, {
            name: requester.name,
            partnerCompanyName: recommendation.companyName,
            opportunityTitle: top.opportunity.title,
            matchScore: recommendation.matchScore,
            matchReasons: recommendation.matchReasons,
            portalUrl,
          });
        }
        if (partner.email) {
          await sendTemplatedEmail("teamingRecommendation", partner.email, {
            name: partner.name,
            partnerCompanyName: requester.companyName || requester.name,
            opportunityTitle: top.opportunity.title,
            matchScore: recommendation.matchScore,
            matchReasons: recommendation.matchReasons,
            portalUrl,
          });
        }

        results.teamingRecommendationsCreated += 1;
      } catch (error: any) {
        results.errors.push(`Teaming recommendation failed for member ${requesterId}: ${error.message}`);
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("samgov-sync cron error:", error);
    results.errors.push(error.message || "Unknown error");
    return NextResponse.json(results, { status: 500 });
  }
}
