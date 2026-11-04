import { redirect } from "next/navigation";

export default function SamSearchRedirect() {
  redirect("/portal/opportunities?tab=search");
}
