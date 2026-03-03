import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  ArrowRight, 
  Shield,
  CheckCircle2,
  Building2,
  Users,
  Target,
  TrendingUp,
  FileText,
  Award
} from "lucide-react";

export const metadata: Metadata = {
  title: "Boeing Supply Chain Partnership | KDM & Associates",
  description: "Supporting Boeing suppliers with CMMC compliance, aerospace manufacturing readiness, and defense supply chain integration through the KDM Consortium.",
  keywords: "Boeing suppliers, aerospace manufacturing, CMMC compliance, defense supply chain, Boeing partnership, aerospace suppliers, DoD contracts",
};

export default function BoeingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Plane className="h-10 w-10 text-white" />
              </div>
            </div>
            <Badge variant="outline" className="border-white/50 text-white mb-6">
              Aerospace & Defense Supply Chain
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Boeing Supply Chain Partnership
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Empowering Boeing suppliers to achieve CMMC compliance, manufacturing excellence, and defense supply chain readiness
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

      {/* Boeing Context Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Supporting Boeing's Supply Chain Excellence</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-muted-foreground leading-relaxed mb-4">
                  Boeing, as a leading aerospace manufacturer and defense contractor, requires its suppliers to meet 
                  rigorous standards for quality, cybersecurity, and operational excellence. The KDM Consortium provides 
                  comprehensive support to help Boeing suppliers navigate these requirements and strengthen their position 
                  in the aerospace and defense supply chain.
                </p>
                <p className="text-muted-foreground">
                  With CMMC becoming mandatory for defense contractors and increasing cybersecurity requirements across 
                  the aerospace industry, Boeing suppliers must demonstrate compliance, manufacturing readiness, and 
                  supply chain reliability to maintain and grow their business relationships.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-blue-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <CardTitle>CMMC Compliance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Achieve CMMC certification required for Boeing defense contracts and DoD supply chain participation
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-8 w-8 text-blue-600" />
                    <CardTitle>Manufacturing Readiness</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Meet Boeing's quality standards, production capacity requirements, and aerospace certifications
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <CardTitle>Supply Chain Integration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Strengthen your position as a reliable Boeing supplier through consortium support and resources
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How the Five Pillars Support Boeing Suppliers</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    U.S. Manufacturing Excellence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Strengthen your manufacturing capabilities to meet Boeing's exacting standards. We help suppliers 
                    achieve aerospace certifications (AS9100), implement quality management systems, optimize production 
                    processes, and build capacity to handle Boeing's volume and complexity requirements.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">AS9100 Certification</Badge>
                    <Badge variant="secondary">Quality Systems</Badge>
                    <Badge variant="secondary">Lean Manufacturing</Badge>
                    <Badge variant="secondary">Capacity Planning</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-green-600" />
                    Defense & CMMC Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Navigate CMMC requirements for Boeing defense contracts. Our comprehensive CMMC Training Cohort and 
                    compliance support help you achieve certification, implement cybersecurity controls, and maintain 
                    ongoing compliance with DoD requirements that Boeing must flow down to suppliers.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">CMMC Level 1-3</Badge>
                    <Badge variant="secondary">NIST 800-171</Badge>
                    <Badge variant="secondary">DFARS Compliance</Badge>
                    <Badge variant="secondary">Supply Chain Security</Badge>
                  </div>
                  <Button asChild>
                    <Link href="/training">
                      Join CMMC Training Cohort
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                    Critical Minerals & Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Boeing requires reliable sources for aerospace-grade materials and critical minerals. We connect 
                    material suppliers with Boeing's supply chain, ensure traceability and quality standards, and help 
                    navigate strategic material sourcing requirements for aerospace and defense applications.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Aerospace Materials</Badge>
                    <Badge variant="secondary">Material Traceability</Badge>
                    <Badge variant="secondary">Quality Standards</Badge>
                    <Badge variant="secondary">Strategic Sourcing</Badge>
                  </div>
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
                    Growing your business to meet Boeing's requirements often requires capital investment. We connect 
                    suppliers with funding partners who understand aerospace manufacturing and can provide equipment 
                    financing, working capital for Boeing contracts, and growth capital for capacity expansion.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Equipment Financing</Badge>
                    <Badge variant="secondary">Contract Financing</Badge>
                    <Badge variant="secondary">Working Capital</Badge>
                    <Badge variant="secondary">Growth Capital</Badge>
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
                    Boeing values suppliers who contribute to regional economic development and workforce ecosystems. 
                    We help suppliers leverage Opportunity Zone benefits, participate in regional manufacturing clusters, 
                    and build workforce pipelines that support long-term aerospace manufacturing growth.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Regional Clusters</Badge>
                    <Badge variant="secondary">Workforce Development</Badge>
                    <Badge variant="secondary">OZ Benefits</Badge>
                    <Badge variant="secondary">Economic Impact</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* KDM Consortium Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">KDM Consortium Benefits for Boeing Suppliers</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Supplier Network</h3>
                  <p className="text-muted-foreground">
                    Connect with other Boeing suppliers, share best practices, and collaborate on supply chain challenges 
                    through our consortium network.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">CMMC Expertise</h3>
                  <p className="text-muted-foreground">
                    Access expert guidance through our CMMC Training Cohort and ongoing compliance support to meet 
                    Boeing's cybersecurity requirements.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Quality & Certification Support</h3>
                  <p className="text-muted-foreground">
                    Navigate AS9100, NADCAP, and other aerospace certifications required for Boeing supply chain participation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Growth Resources</h3>
                  <p className="text-muted-foreground">
                    Access capital partners, technology providers, and business development resources to scale your 
                    operations and grow with Boeing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CMMC Training CTA */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-12 w-12 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">CMMC Compliance for Boeing Defense Contracts</h3>
                    <p className="text-muted-foreground mb-6">
                      Boeing defense contracts require CMMC certification. Join our comprehensive CMMC Training Cohort 
                      to achieve compliance and maintain your position in Boeing's defense supply chain.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild>
                        <Link href="/training">
                          Join CMMC Training Cohort
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/cmmc">
                          Learn About CMMC
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
                    <FileText className="h-5 w-5 text-blue-600" />
                    Defense & CMMC Pillar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Explore our comprehensive Defense & CMMC Compliance pillar for detailed guidance on cybersecurity 
                    requirements and DoD contracting.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/5-pillars/defense-cmmc">
                      Explore Defense & CMMC Pillar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-blue-600" />
                    Aerospace & Defense Industry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Learn more about our comprehensive support for aerospace and defense contractors and suppliers.
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
                    <Building2 className="h-5 w-5 text-blue-600" />
                    U.S. Manufacturing Pillar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Strengthen your manufacturing capabilities with our U.S. Manufacturing pillar resources and support.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/5-pillars/us-manufacturing">
                      Explore Manufacturing Pillar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Blog & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Read our latest insights on aerospace manufacturing, CMMC compliance, and defense contracting.
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
              Ready to Strengthen Your Position as a Boeing Supplier?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the KDM Consortium and access the expertise, resources, and network you need to excel in Boeing's supply chain
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
