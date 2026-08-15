import type { TeamMemberDoc } from "@/lib/schema";

export interface MemberTypeReport {
  html: string;
  text: string;
  total: number;
  counts: Record<string, number>;
}

/**
 * Build a human-readable report of team members grouped by their `role`.
 */
export function buildTeamMemberReport(members: TeamMemberDoc[]): MemberTypeReport {
  const byRole: Record<string, TeamMemberDoc[]> = {};

  for (const member of members) {
    const role = member.role || "unknown";
    if (!byRole[role]) byRole[role] = [];
    byRole[role].push(member);
  }

  const counts: Record<string, number> = {};
  for (const [role, roleMembers] of Object.entries(byRole)) {
    counts[role] = roleMembers.length;
  }

  const sortedRoles = Object.keys(byRole).sort((a, b) => a.localeCompare(b));

  const textParts: string[] = [`Team Member Type Report`, `Total: ${members.length} members`, ""];
  for (const role of sortedRoles) {
    textParts.push(`${role} (${byRole[role].length})`);
    const sortedMembers = [...byRole[role]].sort((a, b) =>
      (a.lastName || "").localeCompare(b.lastName || "")
    );
    for (const member of sortedMembers) {
      const email = member.emailPrimary || member.emailSecondary || "no email";
      textParts.push(`  - ${member.firstName} ${member.lastName} <${email}>`);
    }
    textParts.push("");
  }
  const text = textParts.join("\n").trim();

  const html = `
    <div style="font-family: sans-serif; line-height: 1.5;">
      <h1>Team Member Type Report</h1>
      <p><strong>Total members:</strong> ${members.length}</p>
      ${sortedRoles
        .map(
          (role) => `
            <h2>${role} (${byRole[role].length})</h2>
            <ul>
              ${[...byRole[role]]
                .sort((a, b) => (a.lastName || "").localeCompare(b.lastName || ""))
                .map((member) => {
                  const email = member.emailPrimary || member.emailSecondary || "no email";
                  return `<li>${member.firstName} ${member.lastName} — ${email}</li>`;
                })
                .join("")}
            </ul>
          `
        )
        .join("")}
    </div>
  `;

  return { html, text, total: members.length, counts };
}
