import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Gem, Shield, DollarSign, MapPin, ArrowRight } from "lucide-react";

const glowStyles = `
  @keyframes pillarGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.2);
    }
  }
  
  .pillar-card {
    transition: all 0.3s ease;
  }
  
  .pillar-card:hover {
    animation: pillarGlow 2s ease-in-out infinite;
    transform: translateY(-4px);
  }
  
  .pillar-card.blue:hover {
    box-shadow: 0 0 30px rgba(37, 99, 235, 0.5), 0 0 60px rgba(37, 99, 235, 0.2);
  }
  
  .pillar-card.purple:hover {
    box-shadow: 0 0 30px rgba(147, 51, 234, 0.5), 0 0 60px rgba(147, 51, 234, 0.2);
  }
  
  .pillar-card.green:hover {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.5), 0 0 60px rgba(34, 197, 94, 0.2);
  }
  
  .pillar-card.orange:hover {
    box-shadow: 0 0 30px rgba(234, 88, 12, 0.5), 0 0 60px rgba(234, 88, 12, 0.2);
  }
  
  .pillar-card.red:hover {
    box-shadow: 0 0 30px rgba(220, 38, 38, 0.5), 0 0 60px rgba(220, 38, 38, 0.2);
  }
`;

export const metadata: Metadata = {
  title: "5 Pillars of Strategic Growth | KDM & Associates",
  description: "Discover KDM's comprehensive approach to strengthening U.S. manufacturing, critical minerals, defense compliance, capital access, and economic development.",
  keywords: "U.S. manufacturing, critical minerals, CMMC compliance, defense contracting, access to capital, opportunity zones, economic development",
};

const pillars = [
  {
    id: "us-manufacturing",
    title: "U.S. Manufacturing",
    icon: Factory,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Strengthening domestic manufacturing capacity and supply chain resilience",
    highlights: [
      "Supporting small and mid-sized manufacturers",
      "Increasing production readiness",
      "Connecting suppliers to OEMs and federal buyers",
      "Workforce alignment for advanced manufacturing",
      "Enhancing competitiveness in global markets",
    ],
  },
  {
    id: "critical-minerals",
    title: "Critical Minerals",
    icon: Gem,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Positioning U.S. supply chains strategically",
    highlights: [
      "Domestic sourcing and prioritization",
      "Strategic mineral partnerships (including DFC alignment)",
      "Aerospace and defense supply chain support",
      "National security implications",
    ],
  },
  {
    id: "defense-cmmc",
    title: "Defense & CMMC Compliance",
    icon: Shield,
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Helping manufacturers navigate DoD requirements",
    highlights: [
      "Prepare for and achieve CMMC compliance",
      "Navigate DoD contracting requirements",
      "Strengthen cybersecurity posture",
      "Access defense procurement opportunities",
    ],
  },
  {
    id: "access-to-capital",
    title: "Access to Capital",
    icon: DollarSign,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "Providing pathways to strategic funding",
    highlights: [
      "Funding partners",
      "Strategic capital alignment",
      "Public-private financing models",
      "Consortium-driven revenue opportunities",
    ],
  },
  {
    id: "opportunity-zones",
    title: "Opportunity Zones & Economic Development",
    icon: MapPin,
    color: "text-red-600",
    bgColor: "bg-red-50",
    description: "Driving regional economic growth",
    highlights: [
      "Regional economic development",
      "Public-private partnerships",
      "Infrastructure investment",
      "Workforce ecosystem coordination",
    ],
  },
];

export default function FivePillarsPage() {
  const getColorClass = (color: string) => {
    if (color.includes('blue')) return 'blue';
    if (color.includes('purple')) return 'purple';
    if (color.includes('green')) return 'green';
    if (color.includes('orange')) return 'orange';
    if (color.includes('red')) return 'red';
    return 'blue';
  };

  return (
    <div className="min-h-screen">
      <style>{glowStyles}</style>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f] text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-white/50 text-white">
              Strategic Framework
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              The 5 Pillars of Strategic Growth
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              KDM & Associates' comprehensive approach to strengthening American manufacturing, 
              supply chains, and economic development
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Building a Stronger Future</h2>
            <p className="text-lg text-muted-foreground">
              Our 5 Pillars framework addresses the critical needs of American manufacturers and suppliers, 
              providing integrated support across manufacturing capacity, supply chain resilience, defense readiness, 
              capital access, and economic development. Each pillar reinforces the others, creating a comprehensive 
              ecosystem for sustainable growth.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {pillars.map((pillar, index) => (
              <Card key={pillar.id} className={`pillar-card ${getColorClass(pillar.color)} h-full flex flex-col`}>
                <CardHeader>
                  <div className={`w-16 h-16 rounded-lg ${pillar.bgColor} flex items-center justify-center mb-4`}>
                    <pillar.icon className={`h-8 w-8 ${pillar.color}`} />
                  </div>
                  <CardTitle className="text-2xl mb-2">
                    {index + 1}. {pillar.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {pillar.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 mb-6 flex-1">
                    {pillar.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className={`mt-1 ${pillar.color}`}>•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full">
                    <Link href={`/5-pillars/${pillar.id}`}>
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="border-white/50 text-white mb-6">
              Exclusive Consortium Access
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your Competition Is Already Here. Are You?
            </h2>
            <p className="text-xl mb-4 text-white/90">
              100+ manufacturers are leveraging all 5 pillars to compete effectively for federal contracts, achieve CMMC readiness, and scale their operations.
            </p>
            <p className="text-lg mb-8 text-white/80">
              Stop navigating complex federal requirements alone. Get expert guidance across manufacturing, CMMC, capital access, and more.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">5X</div>
                <div className="text-sm text-white/90">Faster CMMC certification vs. going solo</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">$50M+</div>
                <div className="text-sm text-white/90">In federal contracts secured by consortium members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">100+</div>
                <div className="text-sm text-white/90">Strategic partners across all 5 pillars</div>
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
                <Link href="/cmmc-training">
                  Get CMMC Certified
                </Link>
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-6">
              ✓ Immediate access to all 5 pillars  ✓ Expert-led CMMC training  ✓ Capital partner network
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
