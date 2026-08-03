import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Factory, Shield, Gem, DollarSign, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Capability Taxonomy | KDM Consortium",
  description:
    "KDM Consortium member capability taxonomy covering manufacturing, defense, critical minerals, capital access, and opportunity zone focus areas.",
  alternates: { canonical: "https://kdm-assoc.com/capabilities" },
};

const taxonomy = [
  {
    icon: Factory,
    pillar: "U.S. Manufacturing",
    color: "text-blue-600",
    categories: [
      { name: "Precision Machining", codes: "NAICS 332710, 332720, 332000" },
      { name: "Fabrication & Welding", codes: "NAICS 332313, 332913" },
      { name: "Additive Manufacturing", codes: "NAICS 332999, 331110" },
      { name: "Electronics Manufacturing", codes: "NAICS 334000, 335000" },
      { name: "Assembly & Integration", codes: "NAICS 336000, 339000" },
      { name: "Quality Assurance & Inspection", codes: "NAICS 541380, 332000" },
    ],
  },
  {
    icon: Shield,
    pillar: "Defense & CMMC",
    color: "text-slate-700",
    categories: [
      { name: "CMMC Level 1 Readiness", codes: "NIST SP 800-171 Rev 2 (Basic)" },
      { name: "CMMC Level 2 Readiness", codes: "NIST SP 800-171 Rev 2 (Advanced)" },
      { name: "Defense Manufacturing", codes: "NAICS 336000, 331000" },
      { name: "Rapid Acquisition Support", codes: "OTA, CSO, Urgent Needs" },
      { name: "Cybersecurity Consulting", codes: "NAICS 541512, 541511" },
      { name: "Supply Chain Security", codes: "NAICS 493110, 541614" },
    ],
  },
  {
    icon: Gem,
    pillar: "Critical Minerals",
    color: "text-purple-600",
    categories: [
      { name: "Mineral Sourcing & Extraction", codes: "NAICS 212200" },
      { name: "Processing & Refining", codes: "NAICS 327000, 331000" },
      { name: "Recycling & Recovery", codes: "NAICS 562920" },
      { name: "Logistics & Distribution", codes: "NAICS 488000, 493110" },
      { name: "Manufacturing Integration", codes: "NAICS 332000, 331000" },
      { name: "Project Development", codes: "NAICS 237200, 541330" },
    ],
  },
  {
    icon: DollarSign,
    pillar: "Access to Capital",
    color: "text-green-600",
    categories: [
      { name: "Working Capital & Factoring", codes: "NAICS 522298" },
      { name: "Equipment Financing", codes: "NAICS 522220" },
      { name: "Grant & RFP Support", codes: "NAICS 541611, 541690" },
      { name: "Bonding & Surety", codes: "NAICS 524130" },
      { name: "Investment Readiness", codes: "NAICS 523900" },
      { name: "Federal Loan Programs", codes: "SBA 7(a), 504, SBIC" },
    ],
  },
  {
    icon: MapPin,
    pillar: "Opportunity Zones",
    color: "text-amber-600",
    categories: [
      { name: "OZ-Located Businesses", codes: "IRS Opportunity Zone Designation" },
      { name: "Real Estate Development", codes: "NAICS 236000, 531000" },
      { name: "Business Relocation Support", codes: "NAICS 541614" },
      { name: "Community Investment", codes: "NAICS 523900, 525990" },
      { name: "Tax Incentive Navigation", codes: "IRC §1400Z-1" },
      { name: "OZ Fund Alignment", codes: "QOF, QZAB" },
    ],
  },
];

export default function CapabilityTaxonomyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Capability Taxonomy
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              KDM Consortium Member Capabilities
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              A structured taxonomy of the capability areas represented across KDM Consortium
              members, organized by the five pillars of focus.
            </p>
          </div>
        </div>
      </section>

      {/* Taxonomy */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {taxonomy.map((pillar) => (
              <div key={pillar.pillar}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <pillar.icon className={`h-5 w-5 ${pillar.color}`} />
                  </div>
                  <h2 className="text-2xl font-bold">{pillar.pillar}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pillar.categories.map((cat) => (
                    <Card key={cat.name}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground">{cat.codes}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              This taxonomy is provided for informational purposes to help consortium members and
              partners understand the range of capabilities available. Inclusion in the taxonomy
              does not constitute a certification, endorsement, or guarantee of any member&apos;s
              capabilities. Buyers should conduct their own due diligence.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Explore the Five Pillars
          </h2>
          <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-white/90" asChild>
            <Link href="/5-pillars">
              View 5 Pillars Overview
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
