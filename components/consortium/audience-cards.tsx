"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Landmark, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";

const audiences = [
  {
    icon: Building2,
    badge: "For SMEs",
    title: "8(a), WOSB, SDVOSB, HUBZone & Other Certified Businesses",
    description: "If you're a certified small business looking to break into or expand your government contracting portfolio, the KDM Consortium provides the connections, training, and support you need to win contracts.",
    idealFor: [
      "First-time government contractors",
      "Businesses seeking prime contractor partnerships",
      "Companies pursuing CMMC certification",
      "SMEs wanting to expand their federal footprint",
    ],
    ctaText: "Start Your SME Journey",
    ctaLink: "/register?type=sme",
    color: "bg-[#1e3a5f]",
    lightColor: "bg-[#1e3a5f]/10",
    textColor: "text-[#1e3a5f]",
  },
  {
    icon: Landmark,
    badge: "For Buyers",
    title: "Federal, State & Local Government Buyers",
    description: "Streamline your small business sourcing with access to a curated directory of pre-vetted, certified contractors ready to support your mission.",
    idealFor: [
      "Contracting Officers (COs/KOs)",
      "Small Business Specialists",
      "Program Managers",
      "Prime Contractor Subcontracting Managers",
    ],
    ctaText: "Access the Directory",
    ctaLink: "/register?type=buyer",
    color: "bg-[#7c3aed]",
    lightColor: "bg-[#7c3aed]/10",
    textColor: "text-[#7c3aed]",
  },
  {
    icon: GraduationCap,
    badge: "For Instructors",
    title: "CMMC, Compliance & Business Development Instructors",
    description: "Share your expertise and help small businesses succeed in government contracting. Lead cohorts, issue certifications, and earn revenue.",
    idealFor: [
      "CMMC Registered Practitioners",
      "Government Contracting Consultants",
      "Business Development Trainers",
      "Compliance Specialists",
    ],
    ctaText: "Become an Instructor",
    ctaLink: "/contact?subject=instructor",
    color: "bg-[#c9a227]",
    lightColor: "bg-[#c9a227]/10",
    textColor: "text-[#c9a227]",
  },
];

export function AudienceCards() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built for Government Contracting Success
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're a small business, government buyer, or industry expert, the KDM Consortium has the tools you need.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience) => (
            <Card key={audience.title} className="border-2 hover:border-gray-300 transition-colors h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg ${audience.lightColor} flex items-center justify-center`}>
                    <audience.icon className={`h-6 w-6 ${audience.textColor}`} />
                  </div>
                  <Badge variant="outline" className={audience.textColor}>
                    {audience.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-tight">
                  {audience.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <CardDescription className="text-base mb-6">
                  {audience.description}
                </CardDescription>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Ideal For:</p>
                  <ul className="space-y-2">
                    {audience.idealFor.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${audience.textColor}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <Button asChild className={`w-full ${audience.color} hover:opacity-90`}>
                    <Link href={audience.ctaLink}>
                      {audience.ctaText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
