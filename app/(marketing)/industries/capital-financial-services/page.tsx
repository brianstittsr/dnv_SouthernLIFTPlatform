import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  TrendingUp,
  Target,
  Award,
  Handshake
} from "lucide-react";

export const metadata: Metadata = {
  title: "Capital & Financial Services | Industries | KDM & Associates",
  description: "Connecting manufacturers and projects with funding partners and strategic capital deployment opportunities through the KDM Consortium.",
  keywords: "capital services, funding partners, investment, equipment financing, working capital, revenue sharing, public-private financing, manufacturing capital",
};

export default function CapitalFinancialServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/industries" className="inline-flex items-center text-white/80 hover:text-white mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Industries
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <DollarSign className="h-10 w-10 text-white" />
              </div>
              <Badge variant="outline" className="border-white/50 text-white">
                Strategic Partners
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Capital & Financial Services
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Strategic funding partnerships that fuel manufacturing growth and economic development
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
                Capital & Financial Services represents our support vertical, connecting manufacturers and economic 
                development projects with funding partners and strategic capital deployment opportunities. We bring 
                together capital providers who understand manufacturing and are aligned with our consortium's mission.
              </p>
              <p className="text-muted-foreground">
                Our approach goes beyond traditional lending by creating strategic partnerships that align capital 
                deployment with business growth, consortium participation, and long-term value creation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-orange-600" />
                    Who We Serve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Funding partners</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Capital finance firms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Investment groups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Public-private financing entities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Revenue-sharing partners</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                    Strategic Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Consortium funding model</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Revenue-sharing partnerships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Strategic capital deployment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Manufacturing sector expertise</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Capital Solutions Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Capital Solutions We Facilitate</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                    Equipment Financing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Connect manufacturers with equipment financing partners who understand manufacturing operations and 
                    can provide flexible terms for machinery, technology upgrades, and production capacity expansion. 
                    Our partners offer competitive rates and structures aligned with manufacturing cash flows.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Machinery Financing</Badge>
                    <Badge variant="secondary">Technology Upgrades</Badge>
                    <Badge variant="secondary">Flexible Terms</Badge>
                    <Badge variant="secondary">Sale-Leaseback</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Working Capital Solutions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Provide access to working capital that supports operations, inventory management, and contract 
                    fulfillment. Our capital partners offer lines of credit, invoice factoring, purchase order financing, 
                    and other solutions tailored to manufacturing needs.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Lines of Credit</Badge>
                    <Badge variant="secondary">Invoice Factoring</Badge>
                    <Badge variant="secondary">PO Financing</Badge>
                    <Badge variant="secondary">Inventory Financing</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Capital & Expansion Funding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Support business expansion through growth capital that funds facility expansion, new product lines, 
                    market entry, and strategic acquisitions. Our investment partners seek long-term value creation 
                    aligned with consortium participation and strategic growth.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Expansion Capital</Badge>
                    <Badge variant="secondary">Strategic Investment</Badge>
                    <Badge variant="secondary">Acquisition Financing</Badge>
                    <Badge variant="secondary">Market Entry</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-6 w-6 text-orange-600" />
                    Public-Private Financing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Structure innovative public-private financing models that leverage government incentives, tax credits, 
                    and public investment alongside private capital. These hybrid structures support economic development 
                    projects, infrastructure investment, and regional manufacturing initiatives.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Tax Credit Financing</Badge>
                    <Badge variant="secondary">Opportunity Zones</Badge>
                    <Badge variant="secondary">Economic Development</Badge>
                    <Badge variant="secondary">Infrastructure Funding</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue-Sharing Partnerships</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Create revenue-sharing arrangements where capital partners participate in consortium-driven opportunities 
                    and share in the success of member companies. This alignment of interests ensures capital partners are 
                    invested in long-term success rather than just loan repayment.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Revenue Sharing</Badge>
                    <Badge variant="secondary">Success-Based Returns</Badge>
                    <Badge variant="secondary">Partnership Models</Badge>
                    <Badge variant="secondary">Aligned Incentives</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Grant & Incentive Maximization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Help manufacturers and economic development projects access and maximize federal and state grants, 
                    tax incentives, and other non-dilutive funding sources. We coordinate with capital partners to 
                    structure financing that leverages these resources effectively.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Federal Grants</Badge>
                    <Badge variant="secondary">State Incentives</Badge>
                    <Badge variant="secondary">Tax Credits</Badge>
                    <Badge variant="secondary">Non-Dilutive Funding</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition for Capital Partners */}
      <section className="py-16 bg-orange-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Why Capital Partners Join Our Consortium</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Deal Flow Access</h3>
                  <p className="text-muted-foreground">
                    Access vetted manufacturing companies and economic development projects with strong fundamentals 
                    and growth potential through consortium membership.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Risk Mitigation</h3>
                  <p className="text-muted-foreground">
                    Reduce risk through consortium support, shared intelligence, and coordinated assistance that 
                    helps portfolio companies succeed.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Strategic Alignment</h3>
                  <p className="text-muted-foreground">
                    Participate in strategic initiatives aligned with federal priorities, domestic manufacturing 
                    growth, and national security objectives.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Revenue Participation</h3>
                  <p className="text-muted-foreground">
                    Share in consortium-driven revenue opportunities through innovative partnership structures 
                    beyond traditional lending returns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Connection */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-orange-600" />
                  Connected to: Access to Capital Pillar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Capital & Financial Services is directly aligned with our <strong>Access to Capital</strong> pillar, 
                  which focuses on providing pathways to funding partners, strategic capital alignment, public-private 
                  financing models, and consortium-driven revenue opportunities.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/5-pillars/access-to-capital">
                    Explore Access to Capital Pillar
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
              Ready to Partner with Strategic Capital Providers?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the KDM Consortium and access funding partners who understand manufacturing and share your growth vision
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
              <Link href="/industries/advanced-manufacturing" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Advanced Manufacturing →</div>
                <div className="text-sm text-muted-foreground">Production readiness and federal procurement</div>
              </Link>
              <Link href="/industries/economic-development" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Economic Development & Public Sector →</div>
                <div className="text-sm text-muted-foreground">Regional revitalization and partnerships</div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
