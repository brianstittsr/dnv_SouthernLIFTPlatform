import { db } from "../lib/firebase-admin";

async function main() {
  const snap = await db.collection("platformSettings").doc("global").get();
  const d = (snap.data() ?? {}) as Record<string, any>;
  const s = d.integrations?.samgov;
  console.log(
    JSON.stringify({
      samgovConfigured: Boolean(s?.apiKey && s?.serverUrl),
      serverUrl: s?.serverUrl ?? null,
      hasApiKey: Boolean(s?.apiKey),
      llmKeyConfigured: Boolean(d.llmConfig?.apiKey),
    }),
  );
  const eligible = await db.collection("users").where("companyIntelligenceComplete", "==", true).count().get();
  const onboarded = await db.collection("users").where("isOnboardingComplete", "==", true).count().get();
  const matches = await db.collection("samgovOpportunities").count().get();
  const runs = await db.collection("samgovSyncRuns").orderBy("startedAt", "desc").limit(3).get();
  console.log(JSON.stringify({
    eligible_companyIntelligenceComplete: eligible.data().count,
    onboarded_isOnboardingComplete: onboarded.data().count,
    samgovOpportunityDocs: matches.data().count,
    lastRuns: runs.docs.map((r) => ({ status: r.data().status, triggeredBy: r.data().triggeredBy, startedAt: r.data().startedAt?.toDate?.()?.toISOString?.(), results: r.data().results ? { fetched: r.data().results.opportunitiesFetched, delivered: r.data().results.newMatchesDelivered, eligible: r.data().results.eligibleMembers, errors: r.data().results.errors?.slice(0, 2) } : undefined, message: r.data().results?.message })),
  }, null, 1));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
