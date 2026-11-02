/**
 * Smoke test for the LIFT reporting pipeline (no Firestore writes):
 * collectPlatformDataPack + collectClientDataPack + generateNarrative.
 * Run: npx tsx --env-file=.env.local scripts/test-reports.ts
 */
import { collectClientDataPack, collectPlatformDataPack } from "../lib/reports/data-collector";
import { generateNarrative, headlineMetrics, resolvePeriod } from "../lib/reports/generate";
import { requireDb } from "../lib/form-builder/server/context";
import { COLLECTIONS } from "../lib/schema";

async function main() {
  const period = resolvePeriod({ type: "monthly_internal" });
  console.log(`period: ${period.label} (${period.start?.toISOString()} → ${period.end?.toISOString()})`);

  const pack = await collectPlatformDataPack(period);
  const clients = pack.clients as Record<string, unknown>;
  const submissions = pack.submissions as Record<string, unknown>;
  const platform = pack.platform as Record<string, unknown>;
  console.log(`clients.total=${clients.total} newInPeriod=${clients.newInPeriod}`);
  console.log(`byReferredByOrg=${JSON.stringify(clients.byReferredByOrg)}`);
  console.log(`byReferralSource=${JSON.stringify(clients.byReferralSource)}`);
  console.log(`byParish=${JSON.stringify(clients.byParish)}`);
  console.log(`submissions.inPeriod=${submissions.inPeriod} total=${submissions.total}`);
  console.log(`usersTotal=${platform.usersTotal} roles=${JSON.stringify(platform.usersByRole)}`);
  console.log(`pack bytes=${JSON.stringify(pack).length}`);

  const metrics = headlineMetrics("monthly_internal", pack);
  console.log(`headline metrics: ${metrics.length} rows`);
  for (const m of metrics.slice(0, 4)) console.log(`  ${m.label}: ${m.value}`);

  const generated = await generateNarrative({ type: "monthly_internal", period, pack });
  console.log(`narrative source=${generated.source} model=${generated.model ?? "-"} tokens=${generated.tokensUsed ?? "-"}`);
  console.log(`summary(${generated.narrative.executiveSummary.length} chars): ${generated.narrative.executiveSummary.slice(0, 300)}`);
  console.log(`gaps=${generated.narrative.gapsAndRisks.length} recs=${generated.narrative.recommendations.length}`);

  // Client deep-dive pack if any client exists
  const clientSnap = await requireDb().collection(COLLECTIONS.LIFT_CLIENTS).limit(1).get();
  if (!clientSnap.empty) {
    const clientId = clientSnap.docs[0].id;
    const clientPack = await collectClientDataPack(clientId, resolvePeriod({ type: "client_deepdive" }));
    const client = clientPack.client as Record<string, unknown>;
    console.log(`\nclient deep-dive: ${client.legalName} (${clientId})`);
    console.log(`  submissions=${(clientPack.submissions as unknown[]).length} sessions=${(clientPack.sessions as unknown[]).length} attachments=${clientPack.attachmentCount} excerpts=${(clientPack.attachmentExcerpts as unknown[]).length}`);
    console.log(`  pack bytes=${JSON.stringify(clientPack).length}`);
    const hasEmail = JSON.stringify(clientPack).includes("@") && /"[^"]*@[^"]*"/.test(JSON.stringify({ c: client }));
    console.log(`  client-PII-check (contactEmail absent): ${!("contactEmail" in client)} | ownerUid absent: ${!("ownerUid" in client)}`);
    void hasEmail;
  } else {
    console.log("\nno liftClients yet — deep-dive pack skipped");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
