import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Factory, Shield, Gem, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Case Studies & Outcomes | KDM Consortium",
  description:
    "Representative examples of KDM Consortium member outcomes across manufacturing readiness, CMMC preparation, and critical minerals supply chain coordination.",
  alternates: { canonical: "https://kdm-assoc.com/case-studies" },
};

const caseStudies = [
  {
    icon: Factory,
    sector: "Manufacturing",
    title: "Small Manufacturer SAM.gov Registration & First Federal Opportunity",
    challenge:
      "A precision machining shop lacked SAM.gov registration and had no federal contracting experience.",
    approach:
      "KDM provided step-by-step SAM.gov registration guidance, identified NAICS-aligned opportunities from public procurement databases, and facilitated a teaming introduction with a prime contractor.",
    outcome:
      "The manufacturer completed SAM.gov registration, submitted their first subcontract response, and was added to a prime's approved supplier list. No contract award was guaranteed or promised.",
    metrics: [
      { label: "SAM.gov Registration", value: "Completed" },
      { label: "Teaming Introductions", value: "2" },
      { label: "Time to First Response", value: "~90 days" },
    ],
  },
  {
    icon: Shield,
    sector: "Defense & CMMC",
    title: "CMMC Level 1 Readiness Gap Assessment",
    challenge:
      "A defense supplier needed to understand CMMC 2.0 Level 1 requirements but did not know where to start.",
    approach:
      "KDM conducted a readiness gap assessment against NIST SP 800-171 Rev 2 basic controls, provided a prioritized implementation roadmap, and connected the supplier with a CMMC Registered Practitioner Organization (RPO) for formal assessment preparation.",
    outcome:
      "The supplier completed their gap assessment, began implementing required controls, and scheduled a formal CMMC assessment with a third-party assessor. KDM did not perform the certified assessment.",
    metrics: [
      { label: "Gap Assessment", value: "Completed" },
      { label: "Controls Identified", value: "17 priority items" },
      { label: "Implementation Roadmap", value: "6-month plan" },
    ],
  },
  {
    icon: Gem,
    sector: "Critical Minerals",
    title: "Critical Minerals Supply Chain Coordination",
    challenge:
      "A processing company sought to connect with downstream manufacturers in the defense industrial base.",
    approach:
      "KDM facilitated introductions between the processor and consortium members in defense manufacturing, coordinated a capability briefing, and supported development of a teaming arrangement for a critical minerals supply opportunity.",
    outcome:
      "The processor established a teaming relationship with two defense manufacturers and began exploring joint pursuit of publicly listed supply opportunities. No award was guaranteed.",
    metrics: [
      { label: "Industry Introductions", value: "4 companies" },
      { label: "Teaming Discussions", value: "2 active" },
      { label: "Capability Briefings", value: "3 conducted" },
    ],
  },
  {
    icon: TrendingUp,
    sector: "Procurement Readiness",
    title: "8(a) Firm Capacity Building and Opportunity Alignment",
    challenge:
      "An 8(a) certified firm had a valid certification but lacked the capture infrastructure to identify and pursue aligned opportunities.",
    approach:
      "KDM provided opportunity intelligence training, set up a capture management workflow using the consortium platform, and coached the firm on proposal development best practices.",
    outcome:
      "The firm established a repeatable capture process, began tracking aligned opportunities from public sources, and improved their proposal response quality. Outcomes are based on self-reported member feedback.",
    metrics: [
      { label: "Capture Process", value: "Established" },
      { label: "Opportunity Tracking", value: "Active" },
      { label: "Member Satisfaction", value: "Self-reported positive" },
    ],
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Case Studies &amp; Outcomes
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Representative Member Outcomes
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Examples of how KDM Consortium support has helped members improve their procurement
              readiness, CMMC preparation, and supply chain coordination.
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-12">
            {caseStudies.map((study, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <study.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary">{study.sector}</Badge>
                  </div>
                  <CardTitle className="text-xl">{study.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Challenge</h4>
                    <p className="text-muted-foreground text-sm">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Approach</h4>
                    <p className="text-muted-foreground text-sm">{study.approach}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Outcome</h4>
                    <p className="text-muted-foreground text-sm">{study.outcome}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    {study.metrics.map((metric) => (
                      <div key={metric.label} className="text-center">
                        <div className="text-lg font-bold text-primary">{metric.value}</div>
                        <div className="text-xs text-muted-foreground">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              These case studies are representative examples based on member self-reported outcomes.
              They are illustrative and do not guarantee similar results for any other participant.
              KDM &amp; Associates does not guarantee contract awards, certifications, or specific
              business outcomes. Past results do not predict future performance. Individual results
              vary based on effort, capability, market conditions, and many other factors.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Start Your Readiness Journey?
          </h2>
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
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
