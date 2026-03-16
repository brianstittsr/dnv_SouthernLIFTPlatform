import { Metadata } from "next";
import {
  ConsortiumAlignmentHero,
  ConsortiumAlignmentContent,
  ConsortiumCTA,
} from "@/components/consortium";

export const metadata: Metadata = {
  title: "KDM Consortium | Boutique Network of Expert Companies",
  description:
    "Join our selective consortium of 12-50 expert companies collaborating to win and deliver large government contracts in manufacturing, critical minerals, defense, and energy sectors.",
  keywords:
    "government contracting, consortium, manufacturing, critical minerals, defense contracts, opportunity zones, access to capital, KDM Consortium",
  openGraph: {
    title: "KDM Consortium | Boutique Network of Expert Companies",
    description:
      "A selective consortium where expert companies collaborate to win and deliver large government contracts.",
    images: ["/KDM_Consortium_Logo.png"],
  },
};

export default function ConsortiumPage() {
  return (
    <>
      <ConsortiumAlignmentHero />
      <ConsortiumAlignmentContent />
      <ConsortiumCTA />
    </>
  );
}
