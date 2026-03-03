import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Opportunity Zones & Economic Development | 5 Pillars | KDM & Associates",
  description: "Driving regional economic development through public-private partnerships, infrastructure investment, and workforce ecosystem coordination.",
};

export default function OpportunityZonesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/5-pillars" className="inline-flex items-center text-white/80 hover:text-white mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to 5 Pillars
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <Badge variant="outline" className="border-white/50 text-white">
                Pillar 5
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Opportunity Zones & Economic Development
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Driving regional economic growth and sustainable community development
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
                Economic development is about more than individual business success—it's about building thriving communities 
                and regions. KDM & Associates leverages Opportunity Zones and other economic development tools to drive 
                regional growth, create jobs, and build sustainable economic ecosystems.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-red-600" />
                    Regional Economic Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We work with communities, businesses, and government entities to develop comprehensive regional 
                    economic development strategies. Our approach focuses on leveraging local assets, attracting 
                    investment, and creating sustainable job growth in targeted industries.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-red-600" />
                    Public-Private Partnerships
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Effective economic development requires collaboration between public and private sectors. We facilitate 
                    partnerships that align government resources and incentives with private sector investment and expertise 
                    to maximize impact and create shared value.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-red-600" />
                    Infrastructure Investment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Strategic infrastructure investments are essential for economic growth. We help identify and pursue 
                    infrastructure projects that support manufacturing, logistics, and business development while leveraging 
                    federal and state funding programs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-red-600" />
                    Workforce Ecosystem Coordination
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    A skilled workforce is the foundation of economic prosperity. We coordinate with educational institutions, 
                    training providers, and employers to develop workforce pipelines that meet industry needs and provide 
                    pathways to good-paying careers.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle>Why Opportunity Zones & Economic Development Matter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  <strong>Community Revitalization:</strong> Opportunity Zones and economic development initiatives bring 
                  investment and jobs to underserved communities, creating pathways to prosperity for residents.
                </p>
                <p>
                  <strong>Tax Incentives:</strong> Opportunity Zone investments offer significant tax benefits that can 
                  improve project economics and attract capital to development projects.
                </p>
                <p>
                  <strong>Regional Competitiveness:</strong> Strong regional economies attract businesses, talent, and 
                  investment, creating a virtuous cycle of growth and opportunity.
                </p>
                <p>
                  <strong>Sustainable Growth:</strong> Coordinated economic development creates lasting benefits through 
                  infrastructure improvements, workforce development, and business ecosystem building.
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
              Partner in Regional Economic Development
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the KDM Consortium to participate in economic development initiatives and access regional opportunities
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

      {/* Related Resources */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Related Resources from Our Blog</h3>
            <div className="grid gap-4">
              <Link href="/blog/puerto-ricos-agricultural-sector-2025" className="p-6 border rounded-lg hover:bg-muted/30 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-2">Puerto Rico's Agricultural Sector in 2025: A Strategic Pivot Toward Resilience and Innovation</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Exploring regional economic development through agricultural transformation, public-private partnerships, and strategic investments.
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Economic Development</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Infrastructure</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Innovation</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Link>
              <Link href="/blog/puerto-ricos-strategic-role-federal-opportunities" className="p-6 border rounded-lg hover:bg-muted/30 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-2">Puerto Rico's Strategic Role: Federal Opportunities Emerging from Counter-Cartel Operations</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      How federal investments in security infrastructure are creating economic development opportunities and public-private partnerships.
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Federal Investment</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Infrastructure</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Economic Development</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Link>
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
              <Link href="/5-pillars/access-to-capital" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 4: Access to Capital →</div>
                <div className="text-sm text-muted-foreground">Strategic funding pathways</div>
              </Link>
              <Link href="/5-pillars/us-manufacturing" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 1: U.S. Manufacturing →</div>
                <div className="text-sm text-muted-foreground">Strengthening domestic capacity</div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
