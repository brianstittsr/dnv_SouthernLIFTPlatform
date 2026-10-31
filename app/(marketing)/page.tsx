import { HeroCarousel } from "@/components/marketing/hero-carousel";
import { LiftServicesSection } from "@/components/marketing/lift-services-section";
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
      <LiftServicesSection />
      <StatsSection />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </>
  );
}
