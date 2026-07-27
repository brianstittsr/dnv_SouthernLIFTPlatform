import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Government Contracting & Defense Readiness | 5 Pillars | KDM Consortium",
  description: "KDM turns fragmented pursuit activity into a disciplined capture system with weekly triage, objective team assembly, proposal support, and buyer access pathways.",
};

export default function GovernmentContractingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=80"
            alt="Government contracting and business strategy"
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
                <Shield className="h-10 w-10 text-white" />
              </div>
              <Badge variant="outline" className="border-white/50 text-white">
                Pillar 3
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Government Contracting & Defense Readiness
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              From opportunity intelligence to compliant submissions.
            </p>
            <p className="text-lg text-white/80">
              KDM turns fragmented pursuit activity into a disciplined capture system with weekly triage, objective team assembly, proposal support, and buyer access pathways that help qualified teams move with more confidence.
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
                  Build a more disciplined pursuit pipeline with a buyer-ready team model.
                </p>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold mb-8">What KDM Brings to This Pillar</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"
                    alt="Business analysis and opportunity tracking"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    Weekly Opportunity Triage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Curated pursuit briefs drawn from buyer signals, public portals, and partner intelligence.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                    alt="Team collaboration and assembly"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    Best-Fit Team Assembly
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Objective team assembly using capability fit, past performance relevance, compliance posture, and delivery capacity.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80"
                    alt="Document review and proposal development"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    Proposal Factory & Debrief Loop
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Proposal support with compliance-first workflows, review cadence, and buyer-facing discipline.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80"
                    alt="Strategic importance and business value"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Why It Matters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Complex procurements reward preparation, proof, and coordination across multiple specialties.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80"
                    alt="Federal contractors and business professionals"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Who It Serves</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Federal contractors, manufacturers entering government markets, and primes needing qualified teammates.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                    alt="Success and achievement in business"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">What Success Looks Like</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Faster team formation, cleaner compliance matrices, stronger buyer-facing packages, and more on-time submissions.
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
            <h2 className="text-3xl font-bold mb-4">How KDM Turns Contracting Into a Repeatable Win Engine</h2>
            <p className="text-lg text-muted-foreground mb-12">
              This operating model uses language aligned to the consortium's year-round programming and readiness-first positioning.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Public portals, partner intel, OEM signals, and buyer priorities are converted into concise pursuit briefs that members can act on quickly.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Qualification and Fit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Capability briefs, past performance snapshots, compliance badges, and capacity indicators help KDM match the right teams to the right pursuit.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Capture and Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Each pursuit follows a disciplined cadence - intake, outline, compliance matrix, draft reviews, red team, submission, and lessons learned.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Buyer Pathways</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Monthly briefings, quarterly showcases, and targeted introductions create credible visibility without overpromising outcomes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Enablement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    A KDM-branded portal supports profiles, opportunity boards, pursuit workspaces, reminders, and reporting dashboards.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Proof of Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Pipeline health, pursuits launched, submissions supported, debriefs captured, and wins or seats at table make progress visible.
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
                  Monthly buyer briefings, curated showcases, opportunity-of-the-week publishing, and proposal workspaces reinforce a steady pursuit cadence.
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
              Build a More Disciplined Pursuit Pipeline
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Build a more disciplined pursuit pipeline with a buyer-ready team model.
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
              <Link href="/5-pillars/us-manufacturing" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 2: Manufacturing →</div>
                <div className="text-sm text-muted-foreground">Supplier readiness and modernization</div>
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
