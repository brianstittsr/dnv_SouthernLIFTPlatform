import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Users, 
  Target, 
  TrendingUp, 
  Award, 
  Shield,
  Store,
  Brain,
  FileSearch,
  Handshake,
  Zap,
  Globe,
  Building2,
  BarChart3,
  Lock
} from "lucide-react";
import Image from "next/image";

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

        {/* Member Benefits Section */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Member Benefits</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Compete Effectively
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Powerful tools and features designed to help consortium members identify opportunities, 
                form capable, opportunity-aligned teams, and perform successfully on contracts.
              </p>
            </div>

            {/* Marketplace Benefit */}
            <div className="grid md:grid-cols-2 gap-8 mb-12 items-center">
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"
                  alt="Business professionals collaborating"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Store className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold">KDM Marketplace</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Showcase your products and services to KDM OEMs, suppliers, and fellow consortium members. 
                  A discovery-only marketplace for B2B government contracting.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Create listings for products, services, and capabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Target visibility: Public, Consortium-only, or OEM-only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Receive and manage buyer inquiries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Track views and engagement analytics</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* AI Contracting Tools */}
            <div className="grid md:grid-cols-2 gap-8 mb-12 items-center">
              <div className="order-2 md:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold">AI-Powered Contracting Tools</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Leverage artificial intelligence to identify the right opportunities and make 
                  data-driven bid/no-bid decisions faster.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>AI-enhanced bid/no-bid analysis with win probability scoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Automated RFP processing and requirement extraction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Smart opportunity matching based on your NAICS and capabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Contract floor analysis and pipeline forecasting</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden order-1 md:order-2">
                <Image
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
                  alt="AI and data analytics visualization"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* AI Teaming & Matching */}
            <div className="grid md:grid-cols-2 gap-8 mb-12 items-center">
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                  alt="Team collaboration in modern office"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Handshake className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold">AI Teaming & Partner Matching</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Find the perfect teammates to strengthen your proposals and win larger contracts 
                  through intelligent partner identification.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>AI-powered matching of consortium members by capability gaps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Compatibility scoring based on past performance & certifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Automated teaming recommendations for active pursuits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Partner identification for specific contract requirements</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Government Contracting Tools */}
            <div className="grid md:grid-cols-2 gap-8 mb-12 items-center">
              <div className="order-2 md:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <FileSearch className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold">KDM Government Contracting Tools</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Comprehensive tools for federal procurement research, compliance, and submission 
                  management.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Integrated SAM.gov, USASpending, and agency opportunity feeds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>CMMC readiness assessment and certification tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Past performance documentation and management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Push vs. Pull opportunity matching models</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden order-1 md:order-2">
                <Image
                  src="https://images.pexels.com/photos/7172858/pexels-photo-7172858.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Government documents and compliance"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Enhanced User Profile */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80"
                  alt="Professional business profile"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold">Enhanced Member Profiles</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Rich profiles that showcase your capabilities, certifications, and past performance 
                  to attract teaming partners and buyers.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Complete company profile with NAICS codes and certifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Past performance portfolio with contract history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Consortium pillar focus alignment (Manufacturing, Defense, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Public visibility with controlled access tiers</span>
                  </li>
                </ul>
              </div>
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
