import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { isSamGovConfigured, searchSamGovOpportunities, type SamGovOpportunity } from "@/lib/samgov-service";
import { scoreOpportunitiesForMember, recommendTeamingPartner, type MemberProfileSummary, type TeamingCandidate } from "@/lib/samgov-ai";
import { createUserNotification } from "@/lib/notifications-store";
import { sendTemplatedEmail } from "@/lib/email";

/**
 * Shared SAM.gov sync pipeline, used by both the daily cron
 * (/api/cron/samgov-sync) and the admin manual trigger
 * (/api/admin/samgov/sync-now).
 *
 * - Concurrency: a lock doc in samgovSyncRuns prevents overlapping runs.
 *   A lock older than LOCK_TTL_MS is treated as stale (crashed run) and
 *   reclaimed automatically — self-healing after a timeout.
 * - Observability: every run writes a samgovSyncRuns doc with status,
 *   trigger source, and full result metrics.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://portal.kdm-assoc.com";
const MATCH_SCORE_THRESHOLD = 55;
const TEAMING_SCORE_THRESHOLD = 50;
const MAX_MATCHES_PER_MEMBER = 5;
const LOCK_TTL_MS = 10 * 60 * 1000; // 10 min — a run older than this is presumed dead
const LOCK_DOC_ID = "_lock";

export interface SamGovSyncResults {
  triggeredBy: string;
  samgovConfigured: boolean;
  eligibleMembers: number;
  opportunitiesFetched: number;
  newMatchesDelivered: number;
  membersNotified: number;
  opportunitiesHidden: number;
  teamingRecommendationsCreated: number;
  errors: string[];
  message?: string;
}

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

function errMsg(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Acquire the sync lock via a transaction. Returns false when another live
 * run holds it; stale locks (crashed/timed-out runs) are reclaimed.
 */
async function acquireLock(): Promise<boolean> {
  if (!db) return false;
  const lockRef = db.collection(COLLECTIONS.SAMGOV_SYNC_RUNS).doc(LOCK_DOC_ID);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(lockRef);
    const lockedAt = snap.data()?.lockedAt as Timestamp | undefined;
    const stale = !lockedAt || Date.now() - lockedAt.toMillis() > LOCK_TTL_MS;
    if (snap.exists && !stale) return false;
    tx.set(lockRef, { lockedAt: Timestamp.now() });
    return true;
  });
}

async function releaseLock(): Promise<void> {
  if (!db) return;
  await db.collection(COLLECTIONS.SAMGOV_SYNC_RUNS).doc(LOCK_DOC_ID).delete().catch(() => {});
}

export async function runSamGovSync(triggeredBy: "cron" | "admin"): Promise<SamGovSyncResults> {
  const results: SamGovSyncResults = {
    triggeredBy,
    samgovConfigured: false,
    eligibleMembers: 0,
    opportunitiesFetched: 0,
    newMatchesDelivered: 0,
    membersNotified: 0,
    opportunitiesHidden: 0,
    teamingRecommendationsCreated: 0,
    errors: [],
  };

  if (!db) {
    results.errors.push("Database not initialized");
    return results;
  }

  if (!(await acquireLock())) {
    results.message = "Another sync run is already in progress.";
    return results;
  }

  const runRef = db.collection(COLLECTIONS.SAMGOV_SYNC_RUNS).doc();
  await runRef.set({ triggeredBy, status: "running", startedAt: Timestamp.now() }).catch(() => {});

  try {
    // ─── 1. Verify SAM.gov integration is configured ─────────────────────
    results.samgovConfigured = await isSamGovConfigured();
    if (!results.samgovConfigured) {
      results.message = "SAM.gov integration is not configured in Settings > Integrations. Skipping sync.";
      return results;
    }

    // ─── 2. Load eligible members (complete profile + push enabled) ──────
    // Any member with a completed profile is eligible. Members can opt out
    // via the "SAM.gov opportunity matching" toggle on their opportunities
    // page (samgovOpportunitiesEnabled === false).
    const usersSnap = await db
      .collection(COLLECTIONS.USERS)
      .where("companyIntelligenceComplete", "==", true)
      .get();

    const eligibleMembers: EligibleMember[] = usersSnap.docs
      .filter((docSnap) => docSnap.data().samgovOpportunitiesEnabled !== false)
      .map((docSnap) => {
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
      results.message = "No onboarded members found.";
      return results;
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
    } catch (error: unknown) {
      results.errors.push(`SAM.gov search failed: ${errMsg(error)}`);
      return results;
    }
    results.opportunitiesFetched = opportunities.length;

    if (opportunities.length === 0) {
      results.message = "No opportunities returned by SAM.gov search.";
      return results;
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
          // The proxy's uiLink is unreliable — always build the canonical URL.
          const uiLink =
            typeof opportunity.uiLink === "string" && opportunity.uiLink.includes("sam.gov/opp/")
              ? opportunity.uiLink
              : `https://sam.gov/opp/${noticeId}/view`;
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
              uiLink,
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
              uiLink,
            });
          }

          // Track this member's single best match for the teaming pass below
          const current = memberTopMatch[member.userId];
          if (!current || match.matchScore > current.matchScore) {
            memberTopMatch[member.userId] = { opportunity, matchScore: match.matchScore, matchReasons: match.matchReasons };
          }
        }
      } catch (error: unknown) {
        results.errors.push(`Scoring failed for member ${member.userId}: ${errMsg(error)}`);
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
      } catch (error: unknown) {
        results.errors.push(`Notification failed for member ${userId}: ${errMsg(error)}`);
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
    } catch (error: unknown) {
      results.errors.push(`Hiding expired opportunities failed: ${errMsg(error)}`);
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
          partnerIds: [recommendation.memberId],
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
      } catch (error: unknown) {
        results.errors.push(`Teaming recommendation failed for member ${requesterId}: ${errMsg(error)}`);
      }
    }

    return results;
  } catch (error: unknown) {
    console.error("samgov-sync error:", error);
    results.errors.push(errMsg(error) || "Unknown error");
    return results;
  } finally {
    const hasErrors = results.errors.length > 0;
    await runRef
      .set(
        {
          status: hasErrors ? "completed_with_errors" : "completed",
          finishedAt: Timestamp.now(),
          results,
        },
        { merge: true }
      )
      .catch(() => {});
    await releaseLock();
  }
}
