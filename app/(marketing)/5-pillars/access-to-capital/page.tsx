import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Access to Capital | 5 Pillars | KDM & Associates",
  description: "Providing pathways to funding partners, strategic capital alignment, and consortium-driven revenue opportunities for manufacturers.",
};

export default function AccessToCapitalPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/5-pillars" className="inline-flex items-center text-white/80 hover:text-white mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to 5 Pillars
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <DollarSign className="h-10 w-10 text-white" />
              </div>
              <Badge variant="outline" className="border-white/50 text-white">
                Pillar 4
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Access to Capital
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Providing pathways to strategic funding and growth capital
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Access to capital is often the critical factor that determines whether manufacturers can scale operations, 
                invest in new equipment, or pursue growth opportunities. KDM & Associates connects businesses with funding 
                partners and creates pathways to strategic capital that fuels sustainable growth.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-orange-600" />
                    Funding Partners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We maintain relationships with a diverse network of funding sources including traditional lenders, 
                    private equity firms, venture capital, and government financing programs. Our connections help you 
                    find the right capital partner for your specific needs and growth stage.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-orange-600" />
                    Strategic Capital Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Not all capital is created equal. We help you identify funding sources that align with your strategic 
                    goals, timeline, and growth trajectory. Whether you need working capital, equipment financing, or 
                    expansion funding, we match you with appropriate partners.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-orange-600" />
                    Public-Private Financing Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We help you navigate and access innovative public-private financing structures, including SBA programs, 
                    state economic development incentives, opportunity zone investments, and federal grant programs that 
                    can provide favorable terms and reduce capital costs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-orange-600" />
                    Consortium-Driven Revenue Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    As a KDM Consortium member, you gain access to collaborative contracting opportunities that can 
                    generate revenue and improve cash flow. These opportunities can strengthen your financial position 
                    and make you more attractive to capital providers.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-orange-50 border-orange-200">
              <CardHeader>
                <CardTitle>Why Access to Capital Matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  <strong>Growth Enablement:</strong> Capital provides the resources needed to scale operations, invest 
                  in new technology, and pursue market opportunities that drive business growth.
                </p>
                <p>
                  <strong>Competitive Positioning:</strong> Access to capital allows you to respond quickly to market 
                  opportunities, invest in capabilities that differentiate you from competitors, and weather economic cycles.
                </p>
                <p>
                  <strong>Contract Performance:</strong> Many government and commercial contracts require working capital 
                  to manage cash flow during performance. Adequate capital ensures you can take on and successfully 
                  complete larger contracts.
                </p>
                <p>
                  <strong>Innovation Investment:</strong> Capital enables investment in research and development, new 
                  product development, and process improvements that keep you competitive in evolving markets.
                </p>
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
              Unlock Strategic Capital for Your Business
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the KDM Consortium to access funding partners and revenue opportunities that fuel growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/consortium">
                  Join the KDM Consortium
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                <Link href="/training">
                  Explore CMMC Training
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation to Other Pillars */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Explore Other Pillars</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/5-pillars/defense-cmmc" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 3: Defense & CMMC →</div>
                <div className="text-sm text-muted-foreground">DoD compliance and cybersecurity</div>
              </Link>
              <Link href="/5-pillars/opportunity-zones" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 5: Opportunity Zones →</div>
                <div className="text-sm text-muted-foreground">Economic development and partnerships</div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
