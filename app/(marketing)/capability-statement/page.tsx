import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Download, FileText, Building2, Shield, Gem, Factory } from "lucide-react";

export const metadata: Metadata = {
  title: "Federal Capability Statement | KDM Consortium",
  description:
    "Download the KDM Consortium federal capability statement. Overview of capabilities across manufacturing, defense, critical minerals, capital access, and opportunity zones.",
  alternates: { canonical: "https://kdm-assoc.com/capability-statement" },
};

const capabilities = [
  {
    icon: Factory,
    title: "U.S. Manufacturing",
    items: ["Precision machining", "Fabrication & welding", "Additive manufacturing", "Electronics manufacturing", "Assembly & integration"],
  },
  {
    icon: Shield,
    title: "Defense & CMMC",
    items: ["CMMC Level 1 & 2 readiness", "Defense manufacturing", "Rapid acquisition support", "Cybersecurity consulting", "Supply chain security"],
  },
  {
    icon: Gem,
    title: "Critical Minerals",
    items: ["Sourcing & extraction", "Processing & refining", "Recycling & recovery", "Logistics & distribution", "Project development"],
  },
];

const certifications = [
  "CMMC 2.0 Readiness Support",
  "ISO 9001 Quality Systems Guidance",
  "AS9100 Aerospace Guidance",
  "8(a), WOSB, SDVOSB, HUBZone Navigation",
  "SAM.gov Registration Support",
  "NIST SP 800-171 Implementation Planning",
];

const contractVehicles = [
  "GSA Schedule guidance",
  "OTA (Other Transaction Agreement) teaming",
  "Commercial Solutions Opening (CSO) pathways",
  "Mentor-Protégé program navigation",
  "Subcontracting plan development",
  "Teaming agreement facilitation",
];

export default function CapabilityStatementPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Federal Capability Statement
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              KDM Consortium Capabilities
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              A summary of KDM Consortium member capabilities across manufacturing, defense,
              critical minerals, and federal procurement readiness.
            </p>
            <Button size="lg" asChild>
              <Link href="/contact">
                Request Full Capability Statement
                <Download className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Company Overview</h2>
            <p className="text-muted-foreground mb-4">
              KDM &amp; Associates, LLC operates the Federal Procurement &amp; Industrial Readiness Center
              and the KDM Consortium, a curated network of small businesses, manufacturers, and
              defense industrial base suppliers. KDM provides procurement readiness support,
              teaming facilitation, CMMC readiness guidance, and opportunity intelligence to help
              small businesses become more competitive for federal contracting.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-sm"><strong>CAGE Code:</strong> Available upon request</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm"><strong>UEI:</strong> Available upon request</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm"><strong>Socioeconomic:</strong> Small Business, Minority-Owned</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Factory className="h-5 w-5 text-primary" />
                <span className="text-sm"><strong>NAICS:</strong> 541611, 541512, 541690, 332000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Core Capabilities</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {capabilities.map((cap) => (
                <Card key={cap.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <cap.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{cap.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {cap.items.map((item) => (
                        <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications & Vehicles */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Readiness &amp; Certification Support</h3>
              <ul className="space-y-2">
                {certifications.map((cert) => (
                  <li key={cert} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contract Vehicle Guidance</h3>
              <ul className="space-y-2">
                {contractVehicles.map((vehicle) => (
                  <li key={vehicle} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {vehicle}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              This capability statement is provided for informational purposes. KDM &amp; Associates
              is a private-sector firm and is not affiliated with, endorsed by, or sponsored by any
              government agency. CMMC readiness support does not constitute a certified CMMC
              assessment. Participation in KDM programs does not guarantee contract awards.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Request the Full Capability Statement
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Contact us to receive the complete KDM Consortium capability statement with detailed
            NAICS codes, past performance summaries, and teaming information.
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
