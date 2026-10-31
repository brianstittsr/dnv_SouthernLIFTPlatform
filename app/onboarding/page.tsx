import { redirect } from "next/navigation";

/** /onboarding has no standalone page — send visitors to client onboarding. */
export default function OnboardingIndexPage() {
  redirect("/onboarding/client");
}
