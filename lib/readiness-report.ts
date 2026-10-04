import type { TeamMemberDoc } from "@/lib/schema";
import { READINESS_BUCKETS, bucketForScore, READINESS_CONTRACT_READY_THRESHOLD, deriveReadinessStage, STAGE_COLUMNS } from "@/lib/member-readiness";

export interface ReadinessReport {
  html: string;
  text: string;
  total: number;
  counts: Record<string, number>;
  contractReady: number;
  avgScore: number;
  missingCi: number;
  reminded: number;
}

function toMillis(t: unknown): number | undefined {
  if (typeof t === "object" && t !== null && "toDate" in t && typeof (t as { toDate: () => Date }).toDate === "function") {
    return (t as { toDate: () => Date }).toDate().getTime();
  }
  return undefined;
}

/** Escape member-controlled values before HTML interpolation. */
function esc(s: string | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Build a readiness management report from members that carry a persisted
 * `govReadinessScore` (written by the admin readiness scan).
 */
export function buildReadinessReport(members: TeamMemberDoc[]): ReadinessReport {
  const scored = members.filter((m) => m.govReadinessScore);
  const counts: Record<string, number> = {};
  for (const b of READINESS_BUCKETS) counts[b.label] = 0;

  const bucketed: Record<string, TeamMemberDoc[]> = {};
  let totalScore = 0;
  let contractReady = 0;
  let missingCi = 0;
  let reminded = 0;

  const stageLabel = new Map(STAGE_COLUMNS.map((s) => [s.id, s.label]));

  for (const m of scored) {
    const score = m.govReadinessScore!.overallScore;
    const bucket = READINESS_BUCKETS.find((b) => b.id === bucketForScore(score))!;
    counts[bucket.label] += 1;
    (bucketed[bucket.label] ||= []).push(m);
    totalScore += score;
    if (score >= READINESS_CONTRACT_READY_THRESHOLD) contractReady += 1;
    if (!m.companyIntelligence?.legalCompanyName) missingCi += 1;
    if (m.lastReadinessReminderSentAt) reminded += 1;
  }

  const avgScore = scored.length ? Math.round(totalScore / scored.length) : 0;
  const pctReady = scored.length ? Math.round((contractReady / scored.length) * 100) : 0;

  const memberLine = (m: TeamMemberDoc) => {
    const name = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() || m.id;
    const score = m.govReadinessScore!.overallScore;
    const stage = stageLabel.get(deriveReadinessStage(m)) ?? "Profile";
    const gaps = (m.govReadinessScore!.gaps ?? []).slice(0, 2).join("; ") || "none flagged";
    const email = m.emailPrimary || "no email";
    return { name, score, stage, gaps, email, reminded: !!m.lastReadinessReminderSentAt };
  };

  const textParts: string[] = [
    "KDM Consortium — GovCon Readiness Report",
    `Generated: ${new Date().toLocaleDateString()}`,
    `Total scored: ${scored.length} of ${members.length} members`,
    `Average score: ${avgScore}/100`,
    `Contract-ready (>=${READINESS_CONTRACT_READY_THRESHOLD}): ${contractReady} (${pctReady}%)`,
    `Missing Company Intelligence: ${missingCi}`,
    `Reminded (last 90d): ${reminded}`,
    "",
  ];
  for (const b of READINESS_BUCKETS) {
    const list = bucketed[b.label] ?? [];
    textParts.push(`${b.label} — ${list.length}`);
    for (const m of list.sort((a, b2) => a.govReadinessScore!.overallScore - b2.govReadinessScore!.overallScore)) {
      const l = memberLine(m);
      textParts.push(`  - ${l.name} (${l.score}) · ${l.stage} · ${l.email}${l.reminded ? " · reminded" : ""}`);
      textParts.push(`    gaps: ${l.gaps}`);
    }
    textParts.push("");
  }

  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #1a1a2e;">
      <h1 style="color:#002240;">KDM Consortium — GovCon Readiness Report</h1>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      <table style="border-collapse:collapse;margin-bottom:1em;">
        <tr><td style="padding:4px 16px 4px 0;"><strong>Members scored</strong></td><td>${scored.length} of ${members.length}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;"><strong>Average score</strong></td><td>${avgScore}/100</td></tr>
        <tr><td style="padding:4px 16px 4px 0;"><strong>Contract-ready</strong></td><td>${contractReady} (${pctReady}%)</td></tr>
        <tr><td style="padding:4px 16px 4px 0;"><strong>Missing Company Intelligence</strong></td><td>${missingCi}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;"><strong>Reminder sent</strong></td><td>${reminded}</td></tr>
      </table>
      ${READINESS_BUCKETS.map((b) => {
        const list = (bucketed[b.label] ?? []).sort((a, b2) => a.govReadinessScore!.overallScore - b2.govReadinessScore!.overallScore);
        return `
          <h2 style="font-size:1.1em;margin-top:1.5em;">${b.label} — ${list.length}</h2>
          <ul>
            ${list.map((m) => {
              const l = memberLine(m);
              return `<li><strong>${esc(l.name)}</strong> — ${l.score}/100 · ${esc(l.stage)} · ${esc(l.email)}${l.reminded ? " · <em>reminded</em>" : ""}<br/><span style="color:#555;">gaps: ${esc(l.gaps)}</span></li>`;
            }).join("") || "<li><em>none</em></li>"}
          </ul>
        `;
      }).join("")}
      <p style="color:#888;font-size:0.9em;">Scores are computed from member Company Intelligence data. Last scan timestamps are on each member record.</p>
    </div>
  `;

  return { html, text: textParts.join("\n").trim(), total: members.length, counts, contractReady, avgScore, missingCi, reminded };
}
