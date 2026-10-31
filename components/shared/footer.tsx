import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getProgramBranding } from "@/lib/branding";

const liftFooterLinks = {
  programs: [
    { title: "Events & Training", href: "/events" },
    { title: "Workshop Registration", href: "/forms/workshop-registration" },
    { title: "Proposal Accelerator", href: "/opportunities" },
    { title: "Resources", href: "/resources" },
  ],
  center: [
    { title: "About the Center", href: "/about" },
    { title: "LIFT Blog", href: "/blog" },
    { title: "News", href: "/news" },
    { title: "Partners", href: "/partners" },
    { title: "FAQ", href: "/faq" },
    { title: "Contact", href: "/contact" },
  ],
  legal: [
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms of Service", href: "/terms-of-service" },
    { title: "Accessibility", href: "/accessibility" },
  ],
};

export function Footer() {
  const branding = getProgramBranding();
  return (
    <footer className="bg-black text-white">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white">{branding.siteName}</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">{branding.footerTagline}</p>
          </div>

          {/* Programs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Programs</h3>
            <ul className="space-y-2">
              {liftFooterLinks.programs.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Center */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">The Center</h3>
            <ul className="space-y-2">
              {liftFooterLinks.center.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{branding.contactAddress}</span>
              </li>
              <li>
                <Link href={`mailto:${branding.contactEmail}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  {branding.contactEmail}
                </Link>
              </li>
              <li>
                <Link href={`tel:${branding.contactPhone}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" />
                  {branding.contactPhone}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* MBDA funding acknowledgment */}
        {branding.fundingAcknowledgment && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 max-w-4xl">
              {branding.fundingAcknowledgment} The LIFT Center does not guarantee
              eligibility, funding, certification, or contract awards.
            </p>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} {branding.copyrightName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {liftFooterLinks.legal.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
