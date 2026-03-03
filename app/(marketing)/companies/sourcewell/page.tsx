import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2,
  Users,
  Target,
  TrendingUp,
  FileText,
  Award,
  Globe,
  ShoppingCart
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sourcewell Cooperative Purchasing | KDM & Associates",
  description: "Supporting Sourcewell contract holders and public sector suppliers with procurement readiness, manufacturing excellence, and cooperative purchasing solutions through the KDM Consortium.",
  keywords: "Sourcewell contracts, cooperative purchasing, public procurement, government contracts, municipal purchasing, educational procurement, Sourcewell suppliers",
};

export default function SourcewellPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <Badge variant="outline" className="border-white/50 text-white mb-6">
              Cooperative Purchasing & Public Sector
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Sourcewell Cooperative Purchasing Partnership
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Empowering Sourcewell contract holders and public sector suppliers to deliver excellence in cooperative purchasing
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

      {/* Sourcewell Context Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Supporting Sourcewell's Cooperative Purchasing Mission</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-muted-foreground leading-relaxed mb-4">
                  Sourcewell is a self-supporting government organization that provides cooperative purchasing solutions 
                  to government, education, and nonprofit organizations. The KDM Consortium supports Sourcewell contract 
                  holders and suppliers seeking to participate in this powerful cooperative purchasing network that serves 
                  over 50,000 member organizations.
                </p>
                <p className="text-muted-foreground">
                  Success in the Sourcewell ecosystem requires manufacturing excellence, contract compliance, public sector 
                  expertise, and the ability to serve diverse government and educational customers efficiently. Our consortium 
                  provides comprehensive support to help suppliers excel in this unique marketplace.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-red-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingCart className="h-8 w-8 text-red-600" />
                    <CardTitle>Contract Readiness</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Navigate Sourcewell's solicitation process and maintain contract compliance for cooperative purchasing
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-8 w-8 text-red-600" />
                    <CardTitle>Public Sector Expertise</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Understand the unique needs of government, education, and nonprofit customers across all 50 states
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-8 w-8 text-red-600" />
                    <CardTitle>Manufacturing Scale</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Build capacity to serve Sourcewell's vast network of 50,000+ member organizations efficiently
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How the Five Pillars Support Sourcewell Suppliers</h2>
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
                    Build manufacturing capacity to serve Sourcewell's diverse customer base. We help suppliers optimize 
                    production for government and educational procurement, implement quality systems that meet public sector 
                    standards, and scale operations to handle high-volume cooperative purchasing contracts.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Production Capacity</Badge>
                    <Badge variant="secondary">Quality Systems</Badge>
                    <Badge variant="secondary">Supply Chain</Badge>
                    <Badge variant="secondary">Scalability</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Defense & CMMC Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Many Sourcewell members are government entities with cybersecurity requirements. Our CMMC expertise 
                    helps suppliers demonstrate security compliance, protect sensitive government data, and meet the 
                    evolving cybersecurity standards expected by public sector customers.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Cybersecurity</Badge>
                    <Badge variant="secondary">Data Protection</Badge>
                    <Badge variant="secondary">Government Standards</Badge>
                    <Badge variant="secondary">Compliance</Badge>
                  </div>
                  <Button asChild>
                    <Link href="/cmmc">
                      Learn About CMMC
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
                    Sourcewell members often require American-made products and domestically sourced materials. We help 
                    suppliers establish reliable domestic supply chains, verify material origins, and meet Buy American 
                    requirements common in government and educational procurement.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Domestic Sourcing</Badge>
                    <Badge variant="secondary">Buy American</Badge>
                    <Badge variant="secondary">Material Traceability</Badge>
                    <Badge variant="secondary">Supply Chain Verification</Badge>
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
                    Winning and fulfilling Sourcewell contracts requires working capital and growth investment. We connect 
                    suppliers with capital partners who understand government contracting cycles, provide contract financing, 
                    and support the inventory and capacity needs of cooperative purchasing.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Contract Financing</Badge>
                    <Badge variant="secondary">Working Capital</Badge>
                    <Badge variant="secondary">Inventory Financing</Badge>
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
                    Sourcewell serves communities across America, many in economically distressed areas. We help suppliers 
                    leverage Opportunity Zone benefits, partner with local economic development organizations, and contribute 
                    to regional manufacturing ecosystems that serve public sector customers.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Regional Partnerships</Badge>
                    <Badge variant="secondary">Economic Development</Badge>
                    <Badge variant="secondary">Community Impact</Badge>
                    <Badge variant="secondary">OZ Benefits</Badge>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">KDM Consortium Benefits for Sourcewell Suppliers</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Contract Proposal Support</h3>
                  <p className="text-muted-foreground">
                    Navigate Sourcewell's solicitation process with expert guidance on proposal development, pricing 
                    strategies, and compliance requirements.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Multi-State Compliance</h3>
                  <p className="text-muted-foreground">
                    Understand and meet the varying requirements of government and educational customers across all 50 states.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Supplier Network</h3>
                  <p className="text-muted-foreground">
                    Connect with other Sourcewell suppliers, share best practices, and collaborate on serving public 
                    sector customers effectively.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Growth Resources</h3>
                  <p className="text-muted-foreground">
                    Access capital, technology, and operational support to scale your business and maximize Sourcewell 
                    contract opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Sector Excellence CTA */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Building2 className="h-12 w-12 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Excel in Public Sector Procurement</h3>
                    <p className="text-muted-foreground mb-6">
                      Sourcewell's cooperative purchasing model offers tremendous opportunities for manufacturers who 
                      understand public sector needs. Join our consortium to access the expertise, resources, and network 
                      you need to succeed in government and educational markets.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild>
                        <Link href="/consortium">
                          Join the Consortium
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/contact">
                          Schedule Consultation
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
                    <Building2 className="h-5 w-5 text-red-600" />
                    Economic Development Pillar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Explore our Economic Development & Public Sector pillar for comprehensive guidance on serving 
                    government and institutional customers.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/5-pillars/opportunity-zones">
                      Explore Economic Development
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-red-600" />
                    Economic Development Industry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Learn more about our support for public sector partnerships and regional economic development.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/industries/economic-development">
                      Explore Public Sector Support
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-600" />
                    U.S. Manufacturing Pillar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Build the manufacturing capacity and quality systems needed to serve Sourcewell's vast customer network.
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
                    <FileText className="h-5 w-5 text-red-600" />
                    Blog & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Read our latest insights on government contracting, cooperative purchasing, and public sector procurement.
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
              Ready to Excel in Sourcewell Cooperative Purchasing?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the KDM Consortium and access the expertise, resources, and network you need to succeed in public sector markets
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
