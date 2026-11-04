import { redirect } from "next/navigation";

export default function SamGovOpportunitiesRedirect() {
  redirect("/portal/opportunities?tab=sam");
}
