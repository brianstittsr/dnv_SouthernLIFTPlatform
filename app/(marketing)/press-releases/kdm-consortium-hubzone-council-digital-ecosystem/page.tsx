'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, ArrowLeft, Share2, Download, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HeroCarousel, samplePressReleaseSlides } from '@/components/ui/hero-carousel';
import { getCarouselConfig } from '@/lib/carousel-config';

export default function PressReleasePage() {
  const [copied, setCopied] = useState(false);
  const carouselConfig = getCarouselConfig();

  const pressRelease = {
    title: "KDM Consortium and HUBZone Contractors National Council Launch A Whole of Government Team Approach to Build National HUBZone Digital Ecosystem To Accelerate Small Business Success, Strengthen the 2026 National HUBZone Conference, and Drive Long-Term Manufacturing Modernization and Federal Contracting Opportunities",
    subtitle: "Major strategic collaboration establishes centralized digital ecosystem platform to consolidate capabilities, resources, and partnerships across the HUBZone community",
    location: "ALEXANDRIA, Va.",
    releaseDate: new Date('2026-05-26'),
    category: "Partnership" as const,
    tags: ["HUBZone", "Digital Ecosystem", "Small Business", "Federal Contracting", "Manufacturing", "Partnership"],
    contactInfo: {
      name: "Keith Moore",
      title: "CEO, KDM & Associates | Chair, KDM Consortium",
      email: "kmoore@kdm-assoc.com",
      phone: "(609) 206-1440"
    }
  };

  const copyToClipboard = () => {
    const text = `${pressRelease.title}

${pressRelease.location}, ${format(pressRelease.releaseDate, 'MMMM d, yyyy')} — The KDM Consortium and the HUBZone Contractors National Council today announced a major strategic collaboration to launch A Whole of Government Team Approach. The initiative establishes a centralized digital ecosystem platform designed to consolidate capabilities, resources, and partnerships across the HUBZone community — significantly enhancing small business competitiveness in federal contracting while supporting national manufacturing and supply chain resilience priorities.

This new platform will serve as a single, secure hub for company capabilities and past performance data, executive profiles, technology demonstrations, matchmaking and teaming requests, needs assessments, and barrier identification. By replacing fragmented processes with a scalable infrastructure, the ecosystem platform will directly support immediate priorities while laying the foundation for a robust, sustainable national ecosystem.

"The launch of the 5 Pillar focused digital platform and collaboration strategy" said Keith Moore, CEO of KDM & Associates and Chair of the KDM Consortium creates the infrastructure to bring every relevant stakeholder to the table — manufacturers, technology providers, educational institutions, workforce organizations, and strategic partners — empowering HUBZone businesses to thrive and contribute to America's industrial base modernization."

The collaboration is focused on two critical near-term objectives:

• Producing a compelling campaign to grow American small businesses focused on U.S. Manufacturing, Critical Minerals, Defense Contracting, CMMC compliance, Access to Capital, and Opportunity Zones.

• Delivering an impactful 2026 National HUBZone Conference, scheduled for July 21–22 in Chantilly, Virginia, through enhanced matchmaking, industry working groups, technology showcases, and sponsorship opportunities.

Future Vision

Once fully operational, the platform will evolve into the core digital backbone for the integrated KDM Consortium and HUBZone Council ecosystem. It will enable advanced business intelligence, ongoing training and webinar programs, dynamic company directories, and expanded public-private collaboration opportunities.

HUBZone-certified businesses, manufacturers, primes, nonprofits, educational institutions, and community partners are invited to participate in this initiative. Broad engagement will directly strengthen the nation's small business supply chain and elevate the upcoming national conference while accelerating the development of long-term infrastructure to drive job creation and economic growth in historically underutilized areas.

About the KDM Consortium and KDM & Associates

Led by Keith Moore, KDM & Associates is a leader in government affairs, small business advocacy, and federal contracting support. The KDM Consortium functions as a dynamic teaming ecosystem that connects HUBZone and small manufacturers with federal agencies, prime contractors, and critical supply chain opportunities. To become a member of the KDM Consortium, visit www.kdm-assoc.com to sign up.

About the HUBZone Contractors National Council

Founded in 2000, the HUBZone Contractors National Council is a 501(c)(6) nonprofit trade association serving as the unified voice for 4,500 HUBZone-certified small businesses. The Council advocates for policies that expand market access, creates networking and training opportunities, and hosts the annual National HUBZone Conference to drive economic revitalization in historically underutilized communities. To sign up for the HUBZone conference and receive a 15% discount on conference admission, visit www.kdm-assoc.com

Media Contact:

Keith Moore

CEO, KDM & Associates | Chair, KDM Consortium
kmoore@kdm-assoc.com | (609) 206-1440`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(pressRelease.title);
    const body = encodeURIComponent(`I thought you might be interested in this press release from KDM & Associates:\n\n${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <Link href="/press-releases" className="flex items-center text-primary-foreground hover:text-primary-foreground/80 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Press Releases
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="secondary" size="sm" onClick={shareViaEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Carousel - Currently Disabled */}
      <HeroCarousel
        slides={samplePressReleaseSlides}
        enabled={carouselConfig.enabled}
        autoPlay={carouselConfig.autoPlay}
        interval={carouselConfig.interval}
        showDots={carouselConfig.showDots}
        showArrows={carouselConfig.showArrows}
        className="mb-8"
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Information */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="h-4 w-4" />
            <span>{pressRelease.location}</span>
            <span>•</span>
            <Calendar className="h-4 w-4" />
            <span>{format(pressRelease.releaseDate, 'MMMM d, yyyy')}</span>
          </div>
          
          <Badge variant="secondary" className="mb-4">
            {pressRelease.category}
          </Badge>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {pressRelease.title}
          </h1>
          
          {pressRelease.subtitle && (
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {pressRelease.subtitle}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-8">
            {pressRelease.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Press Release Content */}
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <p className="lead text-lg font-medium mb-6">
                The KDM Consortium and the HUBZone Contractors National Council today announced a major strategic collaboration to launch A Whole of Government Team Approach. The initiative establishes a centralized digital ecosystem platform designed to consolidate capabilities, resources, and partnerships across the HUBZone community — significantly enhancing small business competitiveness in federal contracting while supporting national manufacturing and supply chain resilience priorities.
              </p>

              <p className="mb-6">
                This new platform will serve as a single, secure hub for company capabilities and past performance data, executive profiles, technology demonstrations, matchmaking and teaming requests, needs assessments, and barrier identification. By replacing fragmented processes with a scalable infrastructure, the ecosystem platform will directly support immediate priorities while laying the foundation for a robust, sustainable national ecosystem.
              </p>

              <blockquote className="border-l-4 border-primary pl-4 italic my-6">
                <p>"The launch of the 5 Pillar focused digital platform and collaboration strategy" said Keith Moore, CEO of KDM & Associates and Chair of the KDM Consortium creates the infrastructure to bring every relevant stakeholder to the table — manufacturers, technology providers, educational institutions, workforce organizations, and strategic partners — empowering HUBZone businesses to thrive and contribute to America's industrial base modernization."</p>
              </blockquote>

              <p className="mb-6">
                The collaboration is focused on two critical near-term objectives:
              </p>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Producing a compelling campaign to grow American small businesses focused on U.S. Manufacturing, Critical Minerals, Defense Contracting, CMMC compliance, Access to Capital, and Opportunity Zones.</li>
                <li>Delivering an impactful 2026 National HUBZone Conference, scheduled for July 21–22 in Chantilly, Virginia, through enhanced matchmaking, industry working groups, technology showcases, and sponsorship opportunities.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">Future Vision</h2>

              <p className="mb-6">
                Once fully operational, the platform will evolve into the core digital backbone for the integrated KDM Consortium and HUBZone Council ecosystem. It will enable advanced business intelligence, ongoing training and webinar programs, dynamic company directories, and expanded public-private collaboration opportunities.
              </p>

              <p className="mb-6">
                HUBZone-certified businesses, manufacturers, primes, nonprofits, educational institutions, and community partners are invited to participate in this initiative. Broad engagement will directly strengthen the nation's small business supply chain and elevate the upcoming national conference while accelerating the development of long-term infrastructure to drive job creation and economic growth in historically underutilized areas.
              </p>

              <Separator className="my-8" />

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">About the KDM Consortium and KDM & Associates</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Led by Keith Moore, KDM & Associates is a leader in government affairs, small business advocacy, and federal contracting support. The KDM Consortium functions as a dynamic teaming ecosystem that connects HUBZone and small manufacturers with federal agencies, prime contractors, and critical supply chain opportunities. To become a member of the KDM Consortium, visit <a href="https://www.kdm-assoc.com" className="text-primary hover:underline">www.kdm-assoc.com</a> to sign up.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">About the HUBZone Contractors National Council</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Founded in 2000, the HUBZone Contractors National Council is a 501(c)(6) nonprofit trade association serving as the unified voice for 4,500 HUBZone-certified small businesses. The Council advocates for policies that expand market access, creates networking and training opportunities, and hosts the annual National HUBZone Conference to drive economic revitalization in historically underutilized communities. To sign up for the HUBZone conference and receive a 15% discount on conference admission, visit <a href="https://www.kdm-assoc.com" className="text-primary hover:underline">www.kdm-assoc.com</a>
                  </p>
                </div>
              </div>

              <Separator className="my-8" />

              <div>
                <h3 className="text-xl font-bold mb-4">Media Contact</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold">{pressRelease.contactInfo.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">{pressRelease.contactInfo.title}</p>
                  <div className="flex flex-col sm:flex-row gap-2 text-sm">
                    <a href={`mailto:${pressRelease.contactInfo.email}`} className="flex items-center text-primary hover:underline">
                      <Mail className="mr-1 h-3 w-3" />
                      {pressRelease.contactInfo.email}
                    </a>
                    {pressRelease.contactInfo.phone && (
                      <a href={`tel:${pressRelease.contactInfo.phone}`} className="flex items-center text-primary hover:underline">
                        <Phone className="mr-1 h-3 w-3" />
                        {pressRelease.contactInfo.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground mt-8">
                <p>Sent from my iPad</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={copyToClipboard} className="flex-1 sm:flex-none">
            {copied ? (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Copy Press Release
              </>
            )}
          </Button>
          <Button variant="outline" onClick={shareViaEmail} className="flex-1 sm:flex-none">
            <Mail className="mr-2 h-4 w-4" />
            Share via Email
          </Button>
        </div>
      </div>
    </div>
  );
}
