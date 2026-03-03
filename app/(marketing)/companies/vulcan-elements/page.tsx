import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gem, 
  ArrowRight, 
  CheckCircle2,
  Shield,
  Target,
  TrendingUp,
  FileText,
  Award,
  Globe,
  Plane
} from "lucide-react";

export const metadata: Metadata = {
  title: "Vulcan Elements Critical Minerals Partnership | KDM & Associates",
  description: "Supporting Vulcan Elements and critical mineral suppliers with strategic positioning, aerospace supply chain integration, and national security alignment through the KDM Consortium.",
  keywords: "Vulcan Elements, critical minerals, rare earth elements, strategic materials, aerospace materials, defense supply chain, mineral processing, national security",
};

export default function VulcanElementsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Gem className="h-10 w-10 text-white" />
              </div>
            </div>
            <Badge variant="outline" className="border-white/50 text-white mb-6">
              Critical Minerals & Strategic Materials
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Vulcan Elements Strategic Partnership
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Positioning critical mineral suppliers within aerospace, defense, and strategic national security supply chains
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/consortium">
                  Join KDM Consortium
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

      {/* Vulcan Elements Context Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Supporting Critical Mineral Supply Chain Security</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-muted-foreground leading-relaxed mb-4">
                  Vulcan Elements represents the critical importance of domestic mineral sourcing and processing for 
                  national security and economic prosperity. The KDM Consortium supports critical mineral suppliers like 
                  Vulcan Elements in positioning themselves within strategic supply chains for aerospace, defense, clean 
                  energy, and advanced manufacturing.
                </p>
                <p className="text-muted-foreground">
                  The United States has identified critical minerals as essential to national security, with rare earth 
                  elements, lithium, cobalt, and other strategic materials vital for defense systems, aerospace applications, 
                  and emerging technologies. Our consortium connects mineral suppliers with federal initiatives, defense 
                  contractors, and strategic partners to build resilient domestic supply chains.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-purple-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-8 w-8 text-purple-600" />
                    <CardTitle>National Security</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Align with federal initiatives prioritizing domestic critical mineral production and supply chain security
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Plane className="h-8 w-8 text-purple-600" />
                    <CardTitle>Aerospace Integration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Connect with aerospace manufacturers requiring reliable sources of aerospace-grade strategic materials
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <CardTitle>Strategic Positioning</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Position your company as a trusted domestic supplier for defense and strategic technology applications
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Five Pillars Context */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How the Five Pillars Support Critical Mineral Suppliers</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                    Critical Minerals & Natural Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Our Critical Minerals pillar directly supports companies like Vulcan Elements in navigating federal 
                    initiatives (DFC, DoD, DOE), connecting with aerospace and defense supply chains, establishing processing 
                    capabilities, and demonstrating responsible mining practices. We help position mineral suppliers within 
                    strategic national security frameworks and commercial aerospace applications.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">DFC Programs</Badge>
                    <Badge variant="secondary">DoD Initiatives</Badge>
                    <Badge variant="secondary">Supply Chain Security</Badge>
                    <Badge variant="secondary">Strategic Positioning</Badge>
                  </div>
                  <Button asChild>
                    <Link href="/5-pillars/critical-minerals">
                      Explore Critical Minerals Pillar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    U.S. Manufacturing & Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Raw mineral extraction is only the first step. We help critical mineral suppliers develop processing 
                    capabilities, refining operations, and value-added manufacturing that transforms raw materials into 
                    aerospace-grade products. This includes quality certifications, material specifications, and production 
                    readiness for defense and commercial applications.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Mineral Processing</Badge>
                    <Badge variant="secondary">Refining Operations</Badge>
                    <Badge variant="secondary">Quality Standards</Badge>
                    <Badge variant="secondary">Material Specifications</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-green-600" />
                    Defense & Aerospace Supply Chain
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Defense contractors and aerospace manufacturers require secure, traceable sources for critical materials. 
                    We help mineral suppliers meet defense supply chain requirements, demonstrate material traceability, 
                    implement cybersecurity controls for sensitive supply chain data, and position themselves as trusted 
                    suppliers for defense applications.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Defense Qualification</Badge>
                    <Badge variant="secondary">Material Traceability</Badge>
                    <Badge variant="secondary">Supply Chain Security</Badge>
                    <Badge variant="secondary">CMMC Compliance</Badge>
                  </div>
                  <Button asChild>
                    <Link href="/industries/aerospace-defense">
                      Explore Aerospace & Defense
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-orange-600" />
                    Access to Capital
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Mining and mineral processing require significant capital investment. We connect critical mineral 
                    suppliers with strategic capital partners, federal funding programs (DFC, DOE), and investors who 
                    understand the long-term value of domestic mineral supply chains. This includes project financing, 
                    equipment investment, and expansion capital.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Project Financing</Badge>
                    <Badge variant="secondary">DFC Funding</Badge>
                    <Badge variant="secondary">Strategic Investment</Badge>
                    <Badge variant="secondary">Equipment Capital</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-red-600" />
                    Opportunity Zones & Regional Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Many critical mineral resources are located in economically distressed regions. We help mineral suppliers 
                    leverage Opportunity Zone benefits, partner with local economic development organizations, build workforce 
                    pipelines, and create regional economic impact that strengthens community support for mining operations.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">OZ Benefits</Badge>
                    <Badge variant="secondary">Regional Partnerships</Badge>
                    <Badge variant="secondary">Workforce Development</Badge>
                    <Badge variant="secondary">Community Engagement</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Minerals Focus */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Priority Critical Minerals for Aerospace & Defense</h2>
            <Card className="border-purple-200 mb-8">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-6">
                  The U.S. Geological Survey and Department of Defense have identified critical minerals essential for 
                  aerospace, defense, and advanced technology applications. Our consortium focuses on connecting suppliers 
                  of these strategic materials with end users:
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-700">Rare Earth Elements</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Neodymium (magnets, guidance systems)</li>
                      <li>• Dysprosium (defense electronics)</li>
                      <li>• Praseodymium (aerospace alloys)</li>
                      <li>• Terbium (precision optics)</li>
                      <li>• Yttrium (aerospace coatings)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-700">Strategic Metals</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Lithium (batteries, aerospace)</li>
                      <li>• Cobalt (superalloys, batteries)</li>
                      <li>• Nickel (aerospace alloys)</li>
                      <li>• Titanium (airframes, engines)</li>
                      <li>• Aluminum (aerospace structures)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-700">Industrial Minerals</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Graphite (composites, batteries)</li>
                      <li>• Manganese (steel alloys)</li>
                      <li>• Tungsten (armor, tooling)</li>
                      <li>• Antimony (flame retardants)</li>
                      <li>• Beryllium (aerospace alloys)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* KDM Consortium Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">KDM Consortium Benefits for Critical Mineral Suppliers</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Plane className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Aerospace Connections</h3>
                  <p className="text-muted-foreground">
                    Direct connections to Boeing, other aerospace OEMs, and defense contractors seeking reliable domestic 
                    sources for critical materials.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Federal Initiative Access</h3>
                  <p className="text-muted-foreground">
                    Navigate DFC programs, DoD strategic mineral initiatives, DOE funding, and other federal support for 
                    domestic mineral production.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Supply Chain Integration</h3>
                  <p className="text-muted-foreground">
                    Position your company within strategic supply chains for aerospace, defense, clean energy, and advanced 
                    manufacturing applications.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Strategic Partnerships</h3>
                  <p className="text-muted-foreground">
                    Form partnerships with processors, manufacturers, technology providers, and capital partners through 
                    our consortium network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Critical Minerals CTA */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Gem className="h-12 w-12 text-purple-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Position Your Company in Strategic Supply Chains</h3>
                    <p className="text-muted-foreground mb-6">
                      Critical minerals are essential to national security and economic prosperity. Join our consortium to 
                      connect with aerospace manufacturers, defense contractors, federal initiatives, and strategic partners 
                      who value domestic mineral sourcing.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild>
                        <Link href="/consortium">
                          Join the Consortium
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/industries/critical-minerals">
                          Learn About Critical Minerals
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Related Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gem className="h-5 w-5 text-purple-600" />
                    Critical Minerals Pillar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Explore our comprehensive Critical Minerals pillar for detailed guidance on strategic positioning and 
                    supply chain integration.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/5-pillars/critical-minerals">
                      Explore Critical Minerals Pillar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    Critical Minerals Industry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Learn more about our support for mining companies, mineral processors, and strategic material suppliers.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/industries/critical-minerals">
                      Explore Critical Minerals Industry
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-purple-600" />
                    Aerospace & Defense Industry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Connect with aerospace and defense supply chains that require reliable sources of strategic materials.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/industries/aerospace-defense">
                      Explore Aerospace & Defense
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Blog & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Read our latest insights on critical minerals, supply chain security, and strategic material sourcing.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/blog">
                      Visit Blog
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
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
              Join the KDM Consortium and connect with aerospace manufacturers, defense contractors, and federal initiatives 
              that value domestic critical mineral sourcing
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
    </div>
  );
}
