import { redirect } from "next/navigation";

export default function SamGovTeamingRedirect() {
  redirect("/portal/opportunities?tab=sam-teaming");
}
