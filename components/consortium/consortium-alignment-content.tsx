import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Target, TrendingUp, Award, Shield } from "lucide-react";

export function ConsortiumAlignmentContent() {
  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Executive Summary */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Badge variant="outline" className="mb-4">Executive Summary</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              A Boutique Consortium Model, Not a Mass-Market Platform
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              KDM operates a <strong>selective consortium model</strong> with 12-50 highly curated members focused on delivering specific government contracts. We're not a scalable SaaS platform—we're a high-touch, relationship-driven network that supports manual curation and contract delivery.
            </p>
          </div>
        </section>

        {/* Core Business Model */}
        <section id="how-it-works" className="mb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">How the KDM Consortium Actually Works</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-blue-600" />
                    What We Are
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>A finite group (12-50) of expert companies</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Hand-picked based on expertise and contract fit</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Weekly Friday 3pm consortium meetings to track progress</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Collaborative contract delivery where KDM acts as prime or project manager</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Revenue/equity sharing based on contract roles</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-red-600" />
                    What We're NOT
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <p>A network marketing group or pyramid scheme</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <p>A community of 300+ businesses</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <p>A self-service SaaS platform</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <p>Automated workflows and matchmaking</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-0.5">✗</span>
                    <p>Generic small business support services</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Five Pillars */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Five Strategic Pillars (2026 Focus)</h2>
            
            <div className="grid md:grid-cols-5 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">U.S. Manufacturing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Supplier readiness, modernization, and enterprise alignment</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">Critical Minerals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Strategic materials, resilient supply chains, national capability</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">Defense Contracting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">CMMC focus, opportunity intelligence, compliant submissions</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">Access to Capital</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Capital pathways that help promising projects move</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">Opportunity Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Place-based growth with strategic industrial relevance</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Revenue Model */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Membership & Revenue Model</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Consortium Members
                  </CardTitle>
                  <CardDescription>$1,250/month membership</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-sm">Curated opportunity access</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-sm">Participate in team assembly</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-sm">Access to buyer briefings</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-sm">2 hours concierge support/month</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Contract Partners
                  </CardTitle>
                  <CardDescription>Revenue share model</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-sm">KDM acts as project manager on contracts</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-sm">Revenue share based on contract scope delivery</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-sm">Access to public sector division expertise</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-sm">Defense contracting process support</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Strategic Partnerships */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Key Strategic Partnerships</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">V-Plus Partnership</CardTitle>
                  <CardDescription>Manufacturing Expertise</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Seamless teaming partnership bringing manufacturing expertise to complement KDM's government contracting capabilities.</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-lg">Lockheed Martin</CardTitle>
                  <CardDescription>CMMC Sub-Contractor</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">~$1M+ contract potential for CMMC certification support to help small businesses achieve compliance.</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg">Vulcan</CardTitle>
                  <CardDescription>Critical Minerals</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">$1.4B DOE contract for rare earth and critical minerals supply chain development.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">How We Measure Success</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Right Metrics (Consortium Model)
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Number of qualified consortium applications</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Contract opportunities identified per month</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Contract win rate for consortium</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Total contract value delivered</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Revenue from contract delivery</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Partnership quality (Lockheed, Vulcan, etc.)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Member satisfaction (high-touch service)</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Value Proposition</h3>
                <p className="text-muted-foreground mb-4">
                  KDM operates a selective consortium where expert companies collaborate to win and deliver large government contracts in manufacturing, critical minerals, defense, and energy sectors.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  "We just now need to be able to know that we know from the platform to the performance on the street that we can deliver these five pillars."
                </p>
                <p className="text-sm text-muted-foreground mt-2">— Keith, KDM Founder</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
