import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Factory, 
  Plane, 
  Gem, 
  Building2, 
  DollarSign,
  ArrowRight,
  Users,
  Target,
  TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
  title: "Industries We Serve | KDM & Associates",
  description: "KDM Consortium serves advanced manufacturing, aerospace & defense, critical minerals, economic development, and capital services sectors with strategic growth solutions.",
  keywords: "advanced manufacturing, aerospace defense, CMMC, critical minerals, economic development, opportunity zones, capital services, KDM consortium",
};

const industries = [
  {
    id: "advanced-manufacturing",
    title: "Advanced Manufacturing",
    icon: Factory,
    color: "blue",
    gradient: "from-blue-600 to-blue-700",
    badge: "Primary Focus",
    description: "Supporting small and mid-sized manufacturers with production readiness, federal procurement positioning, and supply chain excellence.",
    includes: [
      "Small & mid-sized manufacturers",
      "Aerospace component manufacturers",
      "Industrial production firms",
      "Supply chain manufacturers",
      "Precision machining & fabrication"
    ],
    alignedTo: [
      "Domestic manufacturing growth",
      "Supplier readiness",
      "Federal procurement positioning"
    ],
    pillar: "U.S. Manufacturing"
  },
  {
    id: "aerospace-defense",
    title: "Aerospace & Defense",
    icon: Plane,
    color: "green",
    gradient: "from-green-600 to-green-700",
    badge: "CMMC & DoD Focus",
    description: "Helping defense contractors and aerospace suppliers achieve CMMC compliance and DoD contract readiness.",
    includes: [
      "Defense contractors",
      "Aerospace suppliers",
      "DoD supply chain companies",
      "Federal contract manufacturers",
      "Companies requiring CMMC compliance"
    ],
    alignedTo: [
      "Cybersecurity compliance",
      "DoD contract readiness",
      "Defense industrial base participation"
    ],
    pillar: "Defense & CMMC"
  },
  {
    id: "critical-minerals",
    title: "Critical Minerals & Natural Resources",
    icon: Gem,
    color: "purple",
    gradient: "from-purple-600 to-purple-700",
    badge: "Strategic National Security",
    description: "Positioning mining and mineral processing companies within strategic national security supply chains.",
    includes: [
      "Mining companies",
      "Mineral processing firms",
      "Strategic material suppliers",
      "DFC-aligned companies",
      "Federal mineral initiative participants"
    ],
    alignedTo: [
      "Supply chain security",
      "National strategic mineral prioritization",
      "Aerospace and defense material sourcing"
    ],
    pillar: "Critical Minerals"
  },
  {
    id: "economic-development",
    title: "Economic Development & Public Sector",
    icon: Building2,
    color: "red",
    gradient: "from-red-600 to-red-700",
    badge: "Institutional Ecosystem",
    description: "Partnering with municipalities and economic development organizations to drive regional revitalization.",
    includes: [
      "Municipal governments",
      "Economic development organizations",
      "Opportunity Zone projects",
      "Public-private partnerships",
      "Workforce development agencies"
    ],
    alignedTo: [
      "Regional economic revitalization",
      "Manufacturing ecosystem building",
      "Infrastructure investment"
    ],
    pillar: "Opportunity Zones"
  },
  {
    id: "capital-financial-services",
    title: "Capital & Financial Services",
    icon: DollarSign,
    color: "orange",
    gradient: "from-orange-600 to-orange-700",
    badge: "Strategic Partners",
    description: "Connecting manufacturers and projects with funding partners and strategic capital deployment opportunities.",
    includes: [
      "Funding partners",
      "Capital finance firms",
      "Investment groups",
      "Public-private financing entities",
      "Revenue-sharing partners"
    ],
    alignedTo: [
      "Consortium funding model",
      "Revenue-sharing partnerships",
      "Strategic capital deployment"
    ],
    pillar: "Access to Capital"
  }
];

export default function IndustriesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="border-white/50 text-white mb-6">
              KDM Consortium Industries
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Industries We Serve
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Strategic growth solutions for manufacturers, defense contractors, and economic development partners across five key industry verticals.
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

      {/* Industry Overview Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-2">5</h3>
                <p className="text-muted-foreground">Industry Verticals</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-2">Integrated</h3>
                <p className="text-muted-foreground">Consortium Approach</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-2">Strategic</h3>
                <p className="text-muted-foreground">Growth Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Industry Verticals</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Each industry vertical is strategically aligned with our Five Pillars framework, providing comprehensive support and consortium benefits.
              </p>
            </div>

            <div className="grid gap-8">
              {industries.map((industry) => (
                <Card key={industry.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-2 bg-gradient-to-r ${industry.gradient}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-16 h-16 rounded-lg bg-${industry.color}-100 flex items-center justify-center flex-shrink-0`}>
                          <industry.icon className={`h-8 w-8 text-${industry.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-2xl">{industry.title}</CardTitle>
                            <Badge variant="secondary">{industry.badge}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{industry.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">Aligned to Pillar:</span>
                            <Link href="/5-pillars" className="text-primary hover:underline">
                              {industry.pillar}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full bg-${industry.color}-600`} />
                          Includes
                        </h4>
                        <ul className="space-y-2">
                          {industry.includes.map((item, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full bg-${industry.color}-600`} />
                          Strategic Alignment
                        </h4>
                        <ul className="space-y-2">
                          {industry.alignedTo.map((item, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                      <Link href={`/industries/${industry.id}`}>
                        Learn More About {industry.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Mapping Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Industry-Pillar Alignment</h2>
              <p className="text-xl text-muted-foreground">
                Each industry vertical maps directly to our Five Pillars strategic framework
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {industries.map((industry) => (
                    <div key={industry.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <industry.icon className={`h-5 w-5 text-${industry.color}-600`} />
                        <span className="font-medium">{industry.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Link href="/5-pillars" className="text-primary hover:underline">
                          {industry.pillar}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="border-white/50 text-white mb-6">
              Limited Consortium Membership Available
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Don't Compete Alone. Win Together.
            </h2>
            <p className="text-xl mb-4 text-white/90">
              Join 100+ manufacturers, defense contractors, and suppliers who've unlocked $50M+ in federal contracts through the KDM Consortium.
            </p>
            <p className="text-lg mb-8 text-white/80">
              Get instant access to CMMC training, federal procurement experts, capital partners, and a network of strategic allies in your industry vertical.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">90%</div>
                <div className="text-sm text-white/90">Members achieve CMMC compliance within 12 months</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">$2.5M</div>
                <div className="text-sm text-white/90">Average federal contract value secured by members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-sm text-white/90">Access to consortium resources and expert support</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8">
                <Link href="/consortium">
                  Join the Consortium Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20 text-lg px-8" asChild>
                <Link href="/training">
                  Start CMMC Training
                </Link>
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-6">
              ✓ No long-term contracts  ✓ Cancel anytime  ✓ ROI guaranteed or money back
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
