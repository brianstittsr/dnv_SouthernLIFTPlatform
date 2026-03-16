import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Access to Capital | 5 Pillars | KDM Consortium",
  description: "KDM helps members and partners package opportunities, communicate readiness, and connect projects with sponsors, investors, lenders, and growth-oriented ecosystem partners.",
};

export default function AccessToCapitalPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white py-20 md:py-32">
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
                Pillar 5
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Access to Capital
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Capital pathways that help promising projects move.
            </p>
            <p className="text-lg text-white/80">
              KDM helps members and partners package opportunities, communicate readiness, and connect projects with sponsors, investors, lenders, and growth-oriented ecosystem partners.
            </p>
          </div>
        </div>
      </section>

      {/* What KDM Brings */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-amber-50 border-amber-200 mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Shared Promise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-amber-900">
                  Package opportunities with the clarity, proof, and structure capital partners expect.
                </p>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold mb-8">What KDM Brings to This Pillar</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-amber-600" />
                    Readiness and Capital Pathway
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Packaging that translates capability and activity into capital-ready narratives, scorecards, and next-step materials.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-amber-600" />
                    Sponsor and Investor Lanes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Structured exposure for sponsors, investors, lenders, and ecosystem partners through recurring programs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-amber-600" />
                    Quarterly Outcomes Reporting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Proof-oriented reporting that helps conversations start with evidence instead of vague claims.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Why It Matters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Even strong opportunities lose momentum when the capital story, diligence materials, or execution path are not clear.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Who It Serves</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sponsors, investors, lenders, member companies, developers, and partners seeking structured opportunities with proof behind them.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">What Success Looks Like</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Better diligence readiness, clearer project packaging, stronger alignment between capital providers and operators, and more credible next-step conversations.
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
            <h2 className="text-3xl font-bold mb-4">How KDM Helps Capital Conversations Start with Readiness Instead of Guesswork</h2>
            <p className="text-lg text-muted-foreground mb-12">
              This operating model uses language aligned to the consortium's year-round programming and readiness-first positioning.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Capital Readiness</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Projects need clear operating assumptions, milestones, use of funds, and evidence of readiness before serious capital conversations begin.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Funding Lanes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Different opportunities call for different lanes - sponsor visibility, lender conversations, partner capital, or staged pathways to growth.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Offer Packaging</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Narratives, dashboards, scorecards, and concise briefs help stakeholders understand what the opportunity is and why it is ready now.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reporting and Proof</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Quarterly outcomes reporting, sprint deliverables, attendance data, and engagement metrics create proof that the ecosystem is active.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ecosystem Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Summits, webinars, clinics, sponsor spotlights, and targeted outreach give capital partners structured ways to see opportunity flow.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Capital Conversation CTA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The goal is not generic fundraising language, but better packaging and better alignment so the right conversations happen sooner.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle>Programming and Proof for This Pillar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Quarterly outcomes reporting, sponsor spotlights, readiness assessments, webinars, and clinic sessions help capital partners see the opportunity flow.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Package Opportunities with Clarity and Proof
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Package opportunities with the clarity, proof, and structure capital partners expect.
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
              <Link href="/5-pillars/critical-minerals" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 3: Critical Minerals →</div>
                <div className="text-sm text-muted-foreground">Strategic materials partnerships</div>
              </Link>
              <Link href="/5-pillars/opportunity-zones" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 4: Opportunity Zones →</div>
                <div className="text-sm text-muted-foreground">Place-based growth</div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
