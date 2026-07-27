import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Manufacturing | 5 Pillars | KDM Consortium",
  description: "KDM helps manufacturers strengthen quality and documentation, modernize operations, package their capabilities credibly, and engage OEM and government buyers with a clearer readiness story.",
};

export default function ManufacturingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80"
            alt="Modern manufacturing facility"
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
                <Factory className="h-10 w-10 text-white" />
              </div>
              <Badge variant="outline" className="border-white/50 text-white">
                Pillar 1
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Manufacturing
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Supplier readiness, modernization, and enterprise alignment.
            </p>
            <p className="text-lg text-white/80">
              KDM helps manufacturers strengthen quality and documentation, modernize operations, package their capabilities credibly, and engage OEM and government buyers with a clearer readiness story.
            </p>
          </div>
        </div>
      </section>

      {/* What KDM Brings */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-blue-50 border-blue-200 mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Shared Promise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-blue-900">
                  Show buyers a supplier story built on readiness, execution, and measurable progress.
                </p>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold mb-8">What KDM Brings to This Pillar</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800&q=80"
                    alt="Quality control and manufacturing processes"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    Quality and Process Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Supplier-readiness packaging built around quality systems, process discipline, and buyer confidence.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"
                    alt="Digital transformation and technology"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    Digital Transformation Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Operational and digital transformation support that turns readiness into visible proof.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80"
                    alt="Business partnership and collaboration"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    OEM Qualification Pathways
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Structured pathways to OEM, prime, and public-sector conversations.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80"
                    alt="Manufacturing importance and industrial strength"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Why It Matters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Manufacturers win more when readiness, evidence, and delivery discipline are easy for buyers to understand.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80"
                    alt="Manufacturing workforce and professionals"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Who It Serves</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Manufacturers, contract manufacturers, industrial technology firms, and supplier partners preparing to scale.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&q=80"
                    alt="Manufacturing success and growth"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">What Success Looks Like</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Stronger capability packaging, better readiness evidence, improved supplier conversations, and faster movement toward enterprise requirements.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 overflow-hidden md:col-span-3 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Federal Procurement Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Align manufacturing capabilities with federal procurement mandates including the Buy American Act, Berry Amendment, Trade Agreements Act (TAA), and Defense Production Act (DPA).
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
            <h2 className="text-3xl font-bold mb-4">How KDM Helps Manufacturers Become Easier to Source and Easier to Trust</h2>
            <p className="text-lg text-muted-foreground mb-12">
              This operating model uses language aligned to the consortium's year-round programming and readiness-first positioning.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Readiness</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Readiness scorecards, evidence checklists, quality-system mapping, and capability proof packs help suppliers show buyers what they can deliver.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operational Excellence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Process visibility, documentation discipline, throughput improvements, and workflow alignment strengthen day-to-day execution.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Digital Transformation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Digital twins, dashboards, cybersecurity-aligned readiness, and analytics help manufacturers convert data into action.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>OEM and Prime Alignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Capability packaging, supplier-readiness sprints, and curated introductions make enterprise conversations more productive.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workforce and Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Capacity planning, partner teaming, and delivery-model design help companies grow without losing control of quality.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What Progress Looks Like</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Readiness milestones, buyer meetings, pilot opportunities, and improved confidence in audits, sourcing reviews, and teaming decisions.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle>Programming and Proof for This Pillar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Readiness sprints, starter kits, operational templates, webinars, and supplier spotlights make manufacturing progress visible to buyers and partners.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Show Buyers Your Supplier Story
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Show buyers a supplier story built on readiness, execution, and measurable progress.
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
              <Link href="/5-pillars/critical-minerals" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 3: Critical Minerals →</div>
                <div className="text-sm text-muted-foreground">Strategic materials partnerships</div>
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
