import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gem, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Critical Minerals | 5 Pillars | KDM Consortium",
  description: "KDM frames critical minerals as both a supply-chain issue and a readiness issue, connecting ecosystem partners across sourcing, processing, logistics, manufacturing, and project development.",
};

export default function CriticalMineralsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1920&q=80"
            alt="Mining and mineral resources"
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
                <Gem className="h-10 w-10 text-white" />
              </div>
              <Badge variant="outline" className="border-white/50 text-white">
                Pillar 2
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Critical Minerals
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Strategic materials, resilient supply chains, and national capability.
            </p>
            <p className="text-lg text-white/80">
              KDM frames critical minerals as both a supply-chain issue and a readiness issue, connecting ecosystem partners across sourcing, processing, logistics, manufacturing, and project development.
            </p>
          </div>
        </div>
      </section>

      {/* What KDM Brings */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-purple-50 border-purple-200 mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Shared Promise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-purple-900">
                  Strengthen strategic materials partnerships with better visibility, alignment, and execution pathways.
                </p>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold mb-8">What KDM Brings to This Pillar</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80"
                    alt="Supply chain and logistics network"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                    Supply Chain Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    A strategic ecosystem lens that connects material supply, processing, logistics, manufacturing, and project development.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                    alt="Strategic partnership and collaboration"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                    Strategic Partner Ecosystem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Partner orchestration that helps industrial and capital stakeholders see how opportunities fit together.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80"
                    alt="Project planning and documentation"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                    Project and Sourcing Pathways
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Narrative and proof materials that make complex projects easier to understand.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
                    alt="Critical infrastructure and technology"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Why It Matters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Critical minerals underpin defense systems, energy infrastructure, advanced manufacturing, and long-term industrial resilience.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80"
                    alt="Mining and industrial stakeholders"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Who It Serves</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Mining and processing stakeholders, recyclers, manufacturers, logistics providers, developers, and capital partners.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                    alt="Strategic success and project outcomes"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">What Success Looks Like</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Clearer ecosystem maps, better project packaging, stronger partner alignment, and more credible pathways to downstream demand.
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
            <h2 className="text-3xl font-bold mb-4">How KDM Helps Critical Mineral Ecosystems Move from Discussion to Execution</h2>
            <p className="text-lg text-muted-foreground mb-12">
              This operating model uses language aligned to the consortium's year-round programming and readiness-first positioning.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Supply Chain Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    KDM helps identify where the ecosystem is strong, where dependencies create risk, and where partnerships can close gaps.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Packaging</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Opportunities are translated into clear narratives, capability summaries, and readiness materials that outside partners can evaluate quickly.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Partner Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Industrial buyers, processors, logistics partners, technology providers, and project teams can be convened around shared priorities.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Readiness and Coordination</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Documentation, operating assumptions, compliance signals, and partner roles are clarified early so projects do not stall later.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Downstream Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The goal is not simply extraction or supply, but stronger alignment with manufacturing demand, industrial policy, and long-term market pull.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategic Focus Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Defense relevance, energy resilience, domestic processing, recycling, and supplier ecosystems create multiple lanes for coordinated growth.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle>Programming and Proof for This Pillar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Summit tracks, ecosystem mapping, project spotlights, and recurring thought leadership help strategic materials conversations stay connected to action.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Strengthen Strategic Materials Partnerships
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Strengthen strategic materials partnerships with better visibility, alignment, and execution pathways.
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
                  Explore the Full Pillar
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
              <Link href="/5-pillars/opportunity-zones" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 4: Opportunity Zones →</div>
                <div className="text-sm text-muted-foreground">Place-based growth</div>
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
