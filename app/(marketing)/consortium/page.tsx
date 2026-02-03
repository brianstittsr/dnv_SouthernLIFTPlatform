import { Metadata } from "next";
import {
  HeroCarousel,
  FeaturesGrid,
  AudienceCards,
  HowItWorks,
  CTASection,
} from "@/components/consortium";

export const metadata: Metadata = {
  title: "KDM Consortium | Connect Small Businesses with Government Buyers",
  description:
    "Join the KDM Consortium to connect certified small businesses with government procurement opportunities. Access training, networking, and contract support.",
  keywords:
    "government contracting, small business, 8(a), WOSB, SDVOSB, HUBZone, federal contracts, KDM Consortium",
  openGraph: {
    title: "KDM Consortium | Connect Small Businesses with Government Buyers",
    description:
      "Join the KDM Consortium to connect certified small businesses with government procurement opportunities.",
    images: ["/KDM_Consortium_Logo.png"],
  },
};

export default function ConsortiumPage() {
  return (
    <>
      <HeroCarousel />
      <FeaturesGrid />
      <AudienceCards />
      <HowItWorks />
      <CTASection />
    </>
  );
}
