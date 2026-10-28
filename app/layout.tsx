import type { Metadata } from "next";
import { Manrope, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { getProgramBranding } from "@/lib/branding";
import "./globals.css";

const branding = getProgramBranding();

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const KDM_KEYWORDS = [
  "government contracting",
  "federal procurement",
  "federal procurement center",
  "8(a) certification",
  "WOSB",
  "SDVOSB",
  "HUBZone",
  "small business government contracts",
  "mentor protege",
  "SBA programs",
  "CMMC assessment readiness",
  "CMMC Level 1 readiness",
  "defense contracting",
  "defense manufacturing consulting",
  "U.S. manufacturing reshoring",
  "critical minerals supply chain",
  "rare earth elements",
  "opportunity zones",
  "access to capital small business",
  "government manufacturing consulting",
  "federal manufacturing contracts",
  "supply chain resilience",
  "cybersecurity maturity model",
  "defense industrial base",
  "small business defense contracts",
  "manufacturing compliance",
  "KDM Consortium",
  "supplier success workshops",
];

const KDM_DESCRIPTION =
  "KDM & Associates, LLC is a business development, government affairs, and public relations firm helping businesses become more prepared and competitive for government contracting through strategic teaming, capacity building, and mentorship.";

export const metadata: Metadata = {
  metadataBase: new URL(branding.siteUrl),
  title: {
    default: branding.siteTitle,
    template: "%s",
  },
  description: branding.isLift ? branding.siteDescription : KDM_DESCRIPTION,
  keywords: branding.isLift ? branding.siteKeywords : KDM_KEYWORDS,
  authors: [{ name: branding.siteName, url: branding.siteUrl }],
  creator: branding.siteName,
  publisher: branding.siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: branding.siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: branding.siteUrl,
    siteName: branding.siteName,
    title: branding.siteTitle,
    description: branding.isLift ? branding.siteDescription : KDM_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: branding.isLift
          ? "Southern University LIFT Center - Rural Business Support"
          : "KDM & Associates - Powering Growth for Competitive Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: branding.siteTitle,
    description: branding.isLift ? branding.siteDescription : KDM_DESCRIPTION,
    images: ["/og-image.png"],
    ...(branding.isLift ? {} : { creator: "@kdmassoc" }),
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Skip to main content link for keyboard users - WCAG 2.4.1 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${manrope.variable} ${dmSans.variable} font-sans antialiased`}>
        {/* Skip to main content link - WCAG 2.4.1 Bypass Blocks */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
