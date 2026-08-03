import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Building2, Search, Users, ShieldCheck, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "For Government & Prime Buyers | KDM Consortium",
  description:
    "Government agencies and prime contractors can connect with KDM Consortium's network of vetted, procurement-ready small businesses across manufacturing, defense, and critical minerals sectors.",
  alternates: { canonical: "https://kdm-assoc.com/for-buyers" },
  keywords: [
    "government buyers",
    "prime contractors",
    "small business suppliers",
    "procurement-ready suppliers",
    "defense suppliers",
    "manufacturing suppliers",
  ],
};

const pathways = [
  {
    icon: Search,
    title: "Supplier Discovery",
    description:
      "Browse our member directory to find small businesses with relevant capabilities, NAICS codes, and readiness levels. Members self-attest their capabilities; buyers should conduct independent due diligence.",
  },
  {
    icon: Users,
    title: "Teaming Facilitation",
    description:
      "KDM can help connect primes and agencies with teams of small businesses capable of addressing specific requirement sets, including surge manufacturing, defense industrial base, and critical minerals.",
  },
  {
    icon: ShieldCheck,
    title: "Readiness Indicators",
    description:
      "KDM Readiness Badges provide an informational signal of a member's self-reported readiness in areas such as CMMC preparation, quality systems, and capacity. Badges are not government certifications.",
  },
  {
    icon: FileText,
    title: "Capability Statements",
    description:
      "Request capability statements from KDM Consortium members. KDM can facilitate introductions and coordinate briefings between buyers and qualified suppliers.",
  },
];

const sectors = [
  "Defense manufacturing and industrial base",
  "Critical minerals processing and supply chain",
  "Precision machining and fabrication",
  "Electronics and additive manufacturing",
  "Quality assurance and inspection services",
  "Logistics and distribution",
];

export default function ForBuyersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              For Government &amp; Prime Buyers
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Connect with Procurement-Ready Suppliers
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              KDM Consortium maintains a network of small businesses across manufacturing, defense,
              and critical minerals sectors. We facilitate introductions between buyers and
              qualified suppliers.
            </p>
            <Button size="lg" asChild>
              <Link href="/contact">
                Request Supplier Introductions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pathways */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How We Help Buyers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              KDM serves as a facilitator and connector. We do not represent or guarantee any
              member&apos;s capabilities, past performance, or eligibility.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {pathways.map((path) => (
              <Card key={path.title}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <path.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{path.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{path.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Sectors We Cover</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {sectors.map((sector) => (
                <div key={sector} className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                  <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{sector}</span>
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
              or sponsored by any government agency. KDM does not certify, verify, or guarantee the
              capabilities of its consortium members. Buyers must conduct their own due diligence,
              including verification of SAM.gov registrations, past performance, certifications,
              and financial responsibility. KDM Readiness Badges are informational platform
              designations and are not government certifications or endorsements.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Connect?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Contact us to discuss your procurement needs and how KDM Consortium can facilitate
            supplier introductions.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-white/90" asChild>
            <Link href="/contact">
              Contact KDM
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
