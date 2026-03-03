import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gem, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Shield,
  Target,
  Award,
  Globe
} from "lucide-react";

export const metadata: Metadata = {
  title: "Critical Minerals & Natural Resources | Industries | KDM & Associates",
  description: "Positioning mining and mineral processing companies within strategic national security supply chains through the KDM Consortium.",
  keywords: "critical minerals, mining, mineral processing, strategic materials, DFC, national security, supply chain security, aerospace materials",
};

export default function CriticalMineralsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/industries" className="inline-flex items-center text-white/80 hover:text-white mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Industries
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Gem className="h-10 w-10 text-white" />
              </div>
              <Badge variant="outline" className="border-white/50 text-white">
                Strategic National Security
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Critical Minerals & Natural Resources
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Securing America's supply chains through strategic mineral sourcing and processing
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
                Critical Minerals & Natural Resources represents a strategic national security vertical. The United States 
                depends on reliable access to critical minerals for aerospace, defense, clean energy, and advanced manufacturing. 
                We help mining and mineral processing companies position themselves within these strategic supply chains.
              </p>
              <p className="text-muted-foreground">
                Our consortium connects mineral suppliers with federal initiatives, defense contractors, and strategic partners 
                while ensuring alignment with national priorities for supply chain security and domestic sourcing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-purple-600" />
                    Who We Serve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Mining companies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Mineral processing firms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Strategic material suppliers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">DFC-aligned companies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Federal mineral initiative participants</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-purple-600" />
                    Strategic Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Supply chain security initiatives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">National strategic mineral prioritization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Aerospace and defense material sourcing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Domestic production prioritization</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Critical Minerals List */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Priority Critical Minerals</h2>
            <Card className="border-purple-200">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-6">
                  The U.S. Geological Survey and Department of Defense have identified critical minerals essential 
                  for national security and economic prosperity. Our consortium focuses on:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3">Rare Earth Elements</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Neodymium</li>
                      <li>• Dysprosium</li>
                      <li>• Praseodymium</li>
                      <li>• Terbium</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Strategic Metals</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Lithium</li>
                      <li>• Cobalt</li>
                      <li>• Nickel</li>
                      <li>• Titanium</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Industrial Minerals</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Graphite</li>
                      <li>• Manganese</li>
                      <li>• Tungsten</li>
                      <li>• Antimony</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How the KDM Consortium Supports Mineral Companies</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-purple-600" />
                    Federal Initiative Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Connect with federal programs supporting domestic mineral production, including DFC (Development 
                    Finance Corporation) initiatives, DoD strategic mineral programs, and Department of Energy critical 
                    materials efforts. We help navigate funding opportunities and partnership requirements.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">DFC Programs</Badge>
                    <Badge variant="secondary">DoD Initiatives</Badge>
                    <Badge variant="secondary">DOE Support</Badge>
                    <Badge variant="secondary">Federal Funding</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Supply Chain Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Position your company within aerospace, defense, and advanced manufacturing supply chains. We facilitate 
                    connections with OEMs, prime contractors, and end users seeking reliable domestic sources for critical 
                    minerals and processed materials.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Aerospace Suppliers</Badge>
                    <Badge variant="secondary">Defense Contractors</Badge>
                    <Badge variant="secondary">OEM Connections</Badge>
                    <Badge variant="secondary">Qualification Support</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing & Value-Added Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Develop capabilities for mineral processing, refining, and value-added manufacturing. We connect 
                    mining operations with processing partners, technology providers, and end users to create integrated 
                    supply chains that maximize value and meet market specifications.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Processing Technology</Badge>
                    <Badge variant="secondary">Refining Capabilities</Badge>
                    <Badge variant="secondary">Quality Standards</Badge>
                    <Badge variant="secondary">Market Specifications</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Environmental & Regulatory Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Navigate complex environmental regulations, permitting requirements, and sustainability expectations. 
                    We provide guidance on compliance, environmental stewardship, and demonstrating responsible mining 
                    practices that meet federal and commercial requirements.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Environmental Permits</Badge>
                    <Badge variant="secondary">Regulatory Compliance</Badge>
                    <Badge variant="secondary">Sustainability</Badge>
                    <Badge variant="secondary">Responsible Mining</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategic Partnerships</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Form strategic partnerships with other consortium members, including manufacturers, technology providers, 
                    and capital partners. Our network approach creates opportunities for joint ventures, offtake agreements, 
                    and collaborative development of mineral resources.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Joint Ventures</Badge>
                    <Badge variant="secondary">Offtake Agreements</Badge>
                    <Badge variant="secondary">Technology Partners</Badge>
                    <Badge variant="secondary">Capital Access</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Intelligence & Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Access market intelligence on critical mineral demand, pricing trends, and strategic priorities. 
                    We help companies develop market strategies, identify opportunities, and position themselves for 
                    long-term success in the evolving critical minerals landscape.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Market Analysis</Badge>
                    <Badge variant="secondary">Demand Forecasting</Badge>
                    <Badge variant="secondary">Strategic Planning</Badge>
                    <Badge variant="secondary">Competitive Intelligence</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Connection */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-purple-600" />
                  Connected to: Critical Minerals Pillar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Critical Minerals & Natural Resources is directly aligned with our <strong>Critical Minerals</strong> pillar, 
                  which focuses on domestic sourcing, strategic partnerships, aerospace and defense supply chain support, 
                  and national security implications.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/5-pillars/critical-minerals">
                    Explore Critical Minerals Pillar
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
              Ready to Secure Your Position in Strategic Supply Chains?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the KDM Consortium and connect with federal initiatives, defense contractors, and strategic partners
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
              <Link href="/industries/advanced-manufacturing" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Advanced Manufacturing →</div>
                <div className="text-sm text-muted-foreground">Production readiness and federal procurement</div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
