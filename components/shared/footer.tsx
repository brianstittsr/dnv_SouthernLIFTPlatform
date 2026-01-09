import Link from "next/link";
import Image from "next/image";
import { Linkedin, Twitter, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  services: [
    { title: "Digital Solutions", href: "/services#digital" },
    { title: "Technology Solutions", href: "/services#technology" },
    { title: "Grants & RFPs", href: "/services#grants" },
    { title: "Marketing Solutions", href: "/services#marketing" },
    { title: "Operations/Performance", href: "/services#operations" },
    { title: "Contracting Vehicles", href: "/services#contracting" },
  ],
  company: [
    { title: "About Us", href: "/about" },
    { title: "KDM Team", href: "/team" },
    { title: "Our Work", href: "/our-work" },
    { title: "Partners", href: "/partners" },
    { title: "Contact Us", href: "/contact" },
  ],
  resources: [
    { title: "FAQ", href: "/faq" },
    { title: "Events", href: "/events" },
    { title: "Membership", href: "/membership" },
  ],
  legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "FAQs", href: "/faq" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/kdm-logo.png"
                alt="KDM & Associates Logo"
                width={160}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">
              Helping minority-owned businesses win government contracts through 
              strategic teaming, capacity building, and mentorship.
            </p>
            <div className="flex gap-4">
              <Link href="https://www.linkedin.com/company/mbdafpcenter" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="https://www.twitter.com/mbdafpcenter" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://www.facebook.com/mbdafpcenter/" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://www.instagram.com/mbdafpcenter" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
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
                <span>300 New Jersey Avenue NW, Washington, DC 20001</span>
              </li>
              <li>
                <Link href="mailto:info@kdm-assoc.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  info@kdm-assoc.com
                </Link>
              </li>
              <li>
                <Link href="tel:+1-202-469-3423" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" />
                  (202) 469-3423
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} MBDA Federal Procurement Center. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
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
