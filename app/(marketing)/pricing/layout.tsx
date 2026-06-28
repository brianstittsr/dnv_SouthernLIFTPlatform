import { Metadata } from "next";

export const metadata: Metadata = {
  title: "KDM Consortium Membership Pricing | $625/month | KDM & Associates",
  description:
    "Join the KDM Consortium for $625/month — access exclusive federal contracting opportunities, CMMC readiness, proposal support, teaming, and monthly government buyer briefings. HubZone Conference promotional rate.",
  keywords: [
    "KDM Consortium membership price",
    "government contracting membership",
    "CMMC cohort training cost",
    "federal contracting program pricing",
    "small business government contracting subscription",
    "HUBZone membership",
    "KDM Associates pricing",
    "federal procurement program",
  ],
  alternates: { canonical: "https://kdm-assoc.com/pricing" },
  openGraph: {
    title: "KDM Consortium Membership — $625/month | KDM & Associates",
    description:
      "Join the KDM Consortium for $625/month. Get curated federal opportunities, CMMC support, teaming tools, and monthly government buyer briefings. Offer ends at the HubZone Conference.",
    url: "https://kdm-assoc.com/pricing",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KDM Consortium Membership Pricing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KDM Consortium — $625/month | Join Now",
    description:
      "Exclusive government contracting membership at $625/month. Federal opportunities, CMMC support, and teaming — offer ends at the HubZone Conference.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
