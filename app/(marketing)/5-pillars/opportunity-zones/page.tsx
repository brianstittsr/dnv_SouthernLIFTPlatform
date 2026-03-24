import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Opportunity Zones | 5 Pillars | KDM Consortium",
  description: "KDM links development potential, industrial demand, workforce activation, and investor interest in geographies positioned for revitalization, expansion, and long-term competitiveness.",
};

export default function OpportunityZonesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
            alt="Urban development and city growth"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
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
              Opportunity Zones
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Place-based growth with strategic industrial relevance.
            </p>
            <p className="text-lg text-white/80">
              KDM links development potential, industrial demand, workforce activation, and investor interest in geographies positioned for revitalization, expansion, and long-term competitiveness.
            </p>
          </div>
        </div>
      </section>

      {/* What KDM Brings */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-green-50 border-green-200 mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Shared Promise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-green-900">
                  Turn location advantage into an industrial growth story that partners and investors can act on.
                </p>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold mb-8">What KDM Brings to This Pillar</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
                    alt="City planning and development map"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Place-Based Opportunity Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Project storytelling that ties place, industry, workforce, and infrastructure into one coherent growth thesis.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&q=80"
                    alt="Industrial growth and development"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Industrial Growth Pathways
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Stakeholder alignment support for developers, employers, community leaders, and capital partners.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80"
                    alt="Investment and capital development"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Development and Capital Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Readiness materials that help locations and projects look more credible to outside participants.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80"
                    alt="Urban geography and location strategy"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Why It Matters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Where projects happen matters. Geography shapes supply chains, labor access, infrastructure options, and long-term community outcomes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80"
                    alt="Community developers and stakeholders"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Who It Serves</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Developers, economic development leaders, manufacturers, investors, infrastructure partners, and community stakeholders.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"
                    alt="Development success and growth"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">What Success Looks Like</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Stronger project narratives, clearer site relevance, better stakeholder alignment, and more investable pathways for industrial growth.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Operating Model */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">How KDM Turns Place-Based Potential Into Visible, Investable Opportunities</h2>
            <p className="text-lg text-muted-foreground mb-12">
              This operating model uses language aligned to the consortium's year-round programming and readiness-first positioning.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Strategic Place Thesis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Each geography needs a clear story - why this place, why this project mix, and why the timing supports long-term value creation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Site and Project Visibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Project pages, data rooms, and concise opportunity packaging make locations and development concepts easier to evaluate.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Industrial Relevance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The strongest zone stories connect directly to manufacturing, logistics, supply-chain resilience, workforce pathways, or public-priority outcomes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stakeholder Alignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Developers, community leaders, employers, and capital partners need a common view of goals, milestones, and value creation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Development Pathways</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    KDM supports pathways from concept to packaged opportunity through curation, storytelling, partner outreach, and readiness support.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What Success Looks Like</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    More credible project narratives, stronger collaboration across local and outside partners, and better traction with capital and anchor tenants.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle>Programming and Proof for This Pillar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Project packaging, community and developer alignment sessions, quarterly outcome stories, and track programming keep place-based growth visible.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Turn Location Advantage Into Growth
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Turn location advantage into an industrial growth story that partners and investors can act on.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  Start a Conversation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                <Link href="/5-pillars">
                  Explore the 5 Pillars
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/5-pillars/defense-cmmc" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 1: Government Contracting →</div>
                <div className="text-sm text-muted-foreground">Disciplined pursuit pipeline</div>
              </Link>
              <Link href="/5-pillars/us-manufacturing" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 2: Manufacturing →</div>
                <div className="text-sm text-muted-foreground">Supplier readiness and modernization</div>
              </Link>
              <Link href="/5-pillars/critical-minerals" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 3: Critical Minerals →</div>
                <div className="text-sm text-muted-foreground">Strategic materials partnerships</div>
              </Link>
              <Link href="/5-pillars/access-to-capital" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 5: Access to Capital →</div>
                <div className="text-sm text-muted-foreground">Capital pathways</div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
