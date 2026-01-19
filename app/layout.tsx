import type { Metadata } from "next";
import { Manrope, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kdm-assoc.com"),
  title: {
    default: "KDM & Associates | MBDA Federal Procurement Center",
    template: "%s | KDM & Associates",
  },
  description:
    "KDM & Associates, LLC is a business development, government affairs, and public relations firm helping minority-owned businesses win government contracts through strategic teaming, capacity building, and mentorship.",
  keywords: [
    "government contracting",
    "minority business enterprise",
    "MBE",
    "federal procurement",
    "MBDA",
    "8(a) certification",
    "WOSB",
    "SDVOSB",
    "HUBZone",
    "small business",
    "government contracts",
    "supplier diversity",
    "mentor protege",
    "SBA programs",
  ],
  authors: [{ name: "KDM & Associates", url: "https://kdm-assoc.com" }],
  creator: "KDM & Associates",
  publisher: "KDM & Associates",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://kdm-assoc.com",
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
    url: "https://kdm-assoc.com",
    siteName: "KDM & Associates",
    title: "KDM & Associates | MBDA Federal Procurement Center",
    description:
      "KDM & Associates, LLC is a business development, government affairs, and public relations firm helping minority-owned businesses win government contracts through strategic teaming, capacity building, and mentorship.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KDM & Associates - Powering Growth for Emerging Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KDM & Associates | MBDA Federal Procurement Center",
    description:
      "KDM & Associates, LLC is a business development, government affairs, and public relations firm helping minority-owned businesses win government contracts.",
    images: ["/og-image.png"],
    creator: "@mbdafpcenter",
  },
  verification: {
    google: "your-google-verification-code",
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
      </body>
    </html>
  );
}
