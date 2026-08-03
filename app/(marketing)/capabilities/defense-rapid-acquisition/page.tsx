import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Clock, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Defense & Rapid Acquisition | KDM Consortium",
  description:
    "KDM Consortium connects defense industrial base suppliers with rapid acquisition pathways, CMMC readiness support, and teaming opportunities for urgent national security requirements.",
  keywords: [
    "defense rapid acquisition",
    "defense industrial base",
    "CMMC readiness",
    "DoD contracting",
    "rapid acquisition authority",
    "OTA contracting",
    "defense procurement",
  ],
  alternates: { canonical: "https://kdm-assoc.com/capabilities/defense-rapid-acquisition" },
};

const capabilities = [
  {
    icon: Shield,
    title: "CMMC Readiness Support",
    description:
      "Guidance on CMMC 2.0 Level 1 and Level 2 assessment preparation, including NIST SP 800-171 implementation planning, gap analysis, and documentation support. KDM does not perform certified CMMC assessments.",
  },
  {
    icon: Zap,
    title: "Rapid Acquisition Pathways",
    description:
      "Support for suppliers pursuing opportunities under rapid acquisition authorities, including OTA (Other Transaction Agreements), Commercial Solutions Opening (CSO), and urgent needs procurement.",
  },
  {
    icon: Clock,
    title: "Urgent Needs Teaming",
    description:
      "Connect with consortium members to form teaming arrangements for urgent defense requirements, including surge capacity, critical minerals processing, and defense manufacturing.",
  },
];

const focusAreas = [
  "Defense manufacturing and industrial base expansion",
  "Critical minerals processing and supply chain security",
  "Cybersecurity readiness (CMMC 2.0 Level 1 & Level 2)",
  "Rapid prototyping and urgent needs response",
  "OTA and commercial solutions procurement pathways",
  "Surge manufacturing capacity for defense priorities",
];

export default function DefenseRapidAcquisitionPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Defense &amp; Rapid Acquisition
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Defense Industrial Base Readiness
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mb-8">
              KDM Consortium supports defense suppliers in navigating rapid acquisition pathways,
              achieving CMMC readiness, and forming teaming arrangements for urgent national
              security requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/contact">
                  Discuss Defense Readiness
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/20 hover:bg-white/10">
                <Link href="/5-pillars/defense-cmmc">
                  CMMC Readiness Overview
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What We Support</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              KDM provides readiness support, opportunity awareness, and teaming facilitation for
              defense suppliers. We do not represent or guarantee contract awards.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {capabilities.map((cap) => (
              <Card key={cap.title}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <cap.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{cap.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{cap.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Focus Areas</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {focusAreas.map((area) => (
                <div key={area} className="flex items-start gap-3 p-4 bg-background rounded-lg border">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              KDM &amp; Associates is a private-sector firm and is not affiliated with, endorsed by,
              or sponsored by the Department of Defense, any military service, or any government
              agency. CMMC readiness support does not constitute a certified CMMC assessment.
              Participation in KDM programs does not guarantee contract awards.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Strengthen Your Defense Readiness?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Schedule an introductory session to discuss how KDM Consortium can support your
            defense industrial base readiness journey.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-white/90" asChild>
            <Link href="/contact">
              Schedule Introductory Session
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Back Link */}
      <div className="container py-8">
        <Button variant="ghost" asChild>
          <Link href="/5-pillars">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to 5 Pillars
          </Link>
        </Button>
      </div>
    </div>
  );
}
