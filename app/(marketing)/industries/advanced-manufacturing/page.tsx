import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Factory, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Target,
  TrendingUp,
  Users,
  Award
} from "lucide-react";

export const metadata: Metadata = {
  title: "Advanced Manufacturing | Industries | KDM & Associates",
  description: "Supporting small and mid-sized manufacturers with production readiness, federal procurement positioning, and supply chain excellence through the KDM Consortium.",
  keywords: "advanced manufacturing, small manufacturers, aerospace components, supply chain, precision machining, federal procurement, manufacturing consortium",
};

export default function AdvancedManufacturingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/industries" className="inline-flex items-center text-white/80 hover:text-white mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Industries
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Factory className="h-10 w-10 text-white" />
              </div>
              <Badge variant="outline" className="border-white/50 text-white">
                Primary Focus Vertical
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Advanced Manufacturing
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Empowering small and mid-sized manufacturers to compete, grow, and succeed in federal procurement and commercial markets
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Advanced Manufacturing is the cornerstone of the KDM Consortium. We focus on strengthening domestic 
                manufacturing capacity by supporting small and mid-sized manufacturers, increasing production readiness, 
                and connecting suppliers to OEMs and federal buyers.
              </p>
              <p className="text-muted-foreground">
                Our comprehensive approach addresses the unique challenges facing today's manufacturers—from workforce 
                development and technology adoption to supply chain optimization and federal procurement access.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    Who We Serve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Small & mid-sized manufacturers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Aerospace component manufacturers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Industrial production firms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Supply chain manufacturers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Precision machining & fabrication companies</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                    Strategic Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Domestic manufacturing growth initiatives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Supplier readiness programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Federal procurement positioning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Workforce alignment for advanced manufacturing</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How the KDM Consortium Supports Manufacturers</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Production Readiness & Capacity Building</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    We help manufacturers assess and enhance their production capabilities to meet the demands of 
                    federal contracts and large OEM relationships. This includes equipment upgrades, process optimization, 
                    quality management systems, and capacity expansion planning.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">ISO Certification</Badge>
                    <Badge variant="secondary">Lean Manufacturing</Badge>
                    <Badge variant="secondary">Quality Systems</Badge>
                    <Badge variant="secondary">Capacity Planning</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Federal Procurement Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Navigate the complex world of federal contracting with expert guidance. We help manufacturers 
                    register in SAM.gov, obtain necessary certifications (8(a), HUBZone, WOSB), develop capability 
                    statements, and connect with prime contractors and federal buyers.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">SAM Registration</Badge>
                    <Badge variant="secondary">8(a) Certification</Badge>
                    <Badge variant="secondary">Prime Contractor Matching</Badge>
                    <Badge variant="secondary">Bid Support</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Supply Chain Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Connect with OEMs, prime contractors, and other manufacturers through our consortium network. 
                    We facilitate introductions, support supplier qualification processes, and help manufacturers 
                    position themselves as reliable supply chain partners.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">OEM Connections</Badge>
                    <Badge variant="secondary">Supplier Qualification</Badge>
                    <Badge variant="secondary">Partnership Development</Badge>
                    <Badge variant="secondary">Supply Chain Mapping</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technology & Innovation Adoption</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Stay competitive through technology adoption and innovation. We provide guidance on Industry 4.0 
                    technologies, automation, digital transformation, and sustainable manufacturing practices that 
                    improve efficiency and market positioning.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Industry 4.0</Badge>
                    <Badge variant="secondary">Automation</Badge>
                    <Badge variant="secondary">Digital Twins</Badge>
                    <Badge variant="secondary">Sustainable Manufacturing</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workforce Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Address workforce challenges through strategic partnerships with training providers, educational 
                    institutions, and workforce development agencies. We help manufacturers build talent pipelines 
                    and develop skilled workers for advanced manufacturing roles.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Skills Training</Badge>
                    <Badge variant="secondary">Apprenticeships</Badge>
                    <Badge variant="secondary">Talent Pipeline</Badge>
                    <Badge variant="secondary">Workforce Planning</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access to Capital</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Connect with funding partners and capital sources to support growth, equipment purchases, and 
                    working capital needs. Our consortium model includes strategic capital partners who understand 
                    manufacturing and can provide flexible financing solutions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Equipment Financing</Badge>
                    <Badge variant="secondary">Working Capital</Badge>
                    <Badge variant="secondary">Growth Capital</Badge>
                    <Badge variant="secondary">Grant Opportunities</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Connection */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-blue-600" />
                  Connected to: U.S. Manufacturing Pillar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Advanced Manufacturing is directly aligned with our <strong>U.S. Manufacturing</strong> pillar, 
                  which focuses on strengthening domestic manufacturing capacity through supplier readiness, 
                  production excellence, and federal procurement positioning.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/5-pillars/us-manufacturing">
                    Explore U.S. Manufacturing Pillar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Strengthen Your Manufacturing Business?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the KDM Consortium and access the resources, connections, and support you need to compete and grow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/consortium">
                  Join the Consortium
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                <Link href="/contact">
                  Schedule Consultation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Industries */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Explore Other Industries</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/industries/aerospace-defense" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Aerospace & Defense →</div>
                <div className="text-sm text-muted-foreground">CMMC compliance and DoD contracting</div>
              </Link>
              <Link href="/industries/critical-minerals" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Critical Minerals & Natural Resources →</div>
                <div className="text-sm text-muted-foreground">Strategic supply chain positioning</div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
