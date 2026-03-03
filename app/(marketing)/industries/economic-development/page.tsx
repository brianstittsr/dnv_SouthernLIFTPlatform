import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Users,
  Target,
  Award,
  TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
  title: "Economic Development & Public Sector | Industries | KDM & Associates",
  description: "Partnering with municipalities and economic development organizations to drive regional revitalization through the KDM Consortium.",
  keywords: "economic development, opportunity zones, public-private partnerships, municipal government, workforce development, infrastructure investment, regional revitalization",
};

export default function EconomicDevelopmentPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/industries" className="inline-flex items-center text-white/80 hover:text-white mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Industries
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <Badge variant="outline" className="border-white/50 text-white">
                Institutional Ecosystem
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Economic Development & Public Sector
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Building thriving regional economies through strategic partnerships and coordinated investment
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
                Economic Development & Public Sector represents our institutional ecosystem vertical. We partner with 
                municipalities, economic development organizations, and public agencies to drive regional economic 
                revitalization, build manufacturing ecosystems, and coordinate strategic infrastructure investment.
              </p>
              <p className="text-muted-foreground">
                Our consortium approach brings together public sector entities, private manufacturers, capital partners, 
                and workforce development agencies to create comprehensive economic development strategies that deliver 
                measurable results.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-red-600" />
                    Who We Serve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Municipal governments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Economic development organizations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Opportunity Zone projects</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Public-private partnerships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Workforce development agencies</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-red-600" />
                    Strategic Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Regional economic revitalization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Manufacturing ecosystem building</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Infrastructure investment coordination</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Workforce ecosystem development</span>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How the KDM Consortium Supports Economic Development</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-red-600" />
                    Opportunity Zone Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Maximize the impact of Opportunity Zone designations through strategic project development, investor 
                    attraction, and coordinated public-private investment. We help communities leverage OZ tax incentives 
                    to drive manufacturing growth, infrastructure improvements, and job creation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">OZ Strategy</Badge>
                    <Badge variant="secondary">Investor Matching</Badge>
                    <Badge variant="secondary">Project Development</Badge>
                    <Badge variant="secondary">Tax Incentives</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manufacturing Ecosystem Building</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Create comprehensive manufacturing ecosystems that support business growth and attraction. We help 
                    communities develop the infrastructure, workforce, supplier networks, and support services that 
                    manufacturers need to succeed and expand.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Cluster Development</Badge>
                    <Badge variant="secondary">Business Attraction</Badge>
                    <Badge variant="secondary">Supplier Networks</Badge>
                    <Badge variant="secondary">Support Services</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Public-Private Partnership Structuring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Structure effective public-private partnerships that align incentives, share risks, and deliver results. 
                    Our consortium model facilitates collaboration between government entities, private manufacturers, 
                    capital partners, and community stakeholders.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Partnership Design</Badge>
                    <Badge variant="secondary">Risk Sharing</Badge>
                    <Badge variant="secondary">Stakeholder Alignment</Badge>
                    <Badge variant="secondary">Performance Metrics</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Infrastructure Investment Coordination</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Coordinate infrastructure investments that support manufacturing and economic growth. We help identify 
                    priority projects, secure funding from federal and state sources, and ensure infrastructure development 
                    aligns with business needs and community goals.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Infrastructure Planning</Badge>
                    <Badge variant="secondary">Federal Funding</Badge>
                    <Badge variant="secondary">Project Prioritization</Badge>
                    <Badge variant="secondary">Multi-Stakeholder Coordination</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-red-600" />
                    Workforce Development Coordination
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Build workforce pipelines that meet manufacturer needs and provide career pathways for residents. 
                    We coordinate between educational institutions, training providers, manufacturers, and workforce 
                    agencies to create comprehensive talent development systems.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Talent Pipelines</Badge>
                    <Badge variant="secondary">Training Programs</Badge>
                    <Badge variant="secondary">Education Partnerships</Badge>
                    <Badge variant="secondary">Career Pathways</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Strategy Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Develop comprehensive regional economic development strategies that leverage local assets, address 
                    challenges, and create sustainable growth. We facilitate strategic planning processes that engage 
                    stakeholders and produce actionable roadmaps.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Strategic Planning</Badge>
                    <Badge variant="secondary">Asset Mapping</Badge>
                    <Badge variant="secondary">Stakeholder Engagement</Badge>
                    <Badge variant="secondary">Implementation Support</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Federal Grant & Funding Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Navigate federal funding opportunities including EDA grants, USDA programs, DOT infrastructure funding, 
                    and other resources supporting economic development. We provide grant writing support, application 
                    assistance, and compliance guidance.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">EDA Grants</Badge>
                    <Badge variant="secondary">USDA Programs</Badge>
                    <Badge variant="secondary">Infrastructure Funding</Badge>
                    <Badge variant="secondary">Grant Writing</Badge>
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
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-red-600" />
                  Connected to: Opportunity Zones & Economic Development Pillar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Economic Development & Public Sector is directly aligned with our <strong>Opportunity Zones & Economic Development</strong> pillar, 
                  which focuses on regional economic development, public-private partnerships, infrastructure investment, 
                  and workforce ecosystem coordination.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/5-pillars/opportunity-zones">
                    Explore Opportunity Zones Pillar
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
              Ready to Drive Regional Economic Growth?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Partner with the KDM Consortium to build thriving manufacturing ecosystems and sustainable economic development
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
              <Link href="/industries/capital-financial-services" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Capital & Financial Services →</div>
                <div className="text-sm text-muted-foreground">Strategic funding and investment partnerships</div>
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
