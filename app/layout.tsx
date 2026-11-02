import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { getProgramBranding } from "@/lib/branding";
import "./globals.css";

const branding = getProgramBranding();

const manrope = localFont({
  src: "./fonts/Manrope-Variable.ttf",
  variable: "--font-sans",
  weight: "200 800",
  display: "swap",
});

const dmSans = localFont({
  src: "./fonts/DMSans-Variable.ttf",
  variable: "--font-heading",
  weight: "100 1000",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(branding.siteUrl),
  title: {
    default: branding.siteTitle,
    template: "%s",
  },
  description: branding.siteDescription,
  keywords: branding.siteKeywords,
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
    description: branding.siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Southern University LIFT Center - Rural Business Support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: branding.siteTitle,
    description: branding.siteDescription,
    images: ["/og-image.png"],
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
        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="Ve9uUAN8ih"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
