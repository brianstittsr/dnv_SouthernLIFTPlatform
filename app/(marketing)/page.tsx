import { HeroCarousel } from "@/components/marketing/hero-carousel";
import { ServicesOverview } from "@/components/marketing/services-overview";
import { FivePillarsSection } from "@/components/marketing/five-pillars-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Testimonials } from "@/components/marketing/testimonials";
import { CTASection } from "@/components/marketing/cta-section";

// Temporarily disable ISR to force fresh data for hero slide changes
// export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      {/* <ServicesOverview /> */}
      <FivePillarsSection />
      {/* <AIGeneratorSection /> */}
      <StatsSection />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </>
  );
}
