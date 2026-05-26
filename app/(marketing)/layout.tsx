import { cookies } from "next/headers";
import { ParkedWebsiteGate } from "@/components/marketing/parked-website-gate";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ContactPopup } from "@/components/marketing/contact-popup";
import { DiscountHero } from "@/components/marketing/discount-hero";
import { OrganizationJsonLd, WebsiteJsonLd, LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { getSystemConfig } from "@/lib/config";
import { PARKED_WEBSITE_COOKIE } from "@/lib/parked-website";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, cookieStore] = await Promise.all([getSystemConfig(), cookies()]);

  const publicWebsiteParked = config?.settings?.publicWebsiteParked ?? false;
  const hasBypassCookie = cookieStore.get(PARKED_WEBSITE_COOKIE)?.value === "granted";

  if (publicWebsiteParked && !hasBypassCookie) {
    return <ParkedWebsiteGate />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* SEO: Structured Data */}
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <LocalBusinessJsonLd />

      <DiscountHero />
      <Navbar />
      {/* Main content landmark with skip link target - WCAG 2.4.1 */}
      <main id="main-content" className="flex-1" role="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <ContactPopup />
    </div>
  );
}
