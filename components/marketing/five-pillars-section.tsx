import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Factory, Gem, MapPin, DollarSign, ArrowRight } from "lucide-react";

const pillars = [
  {
    id: 1,
    title: "Government Contracting",
    slug: "defense-cmmc",
    description: "From opportunity intelligence to compliant submissions. Build a disciplined pursuit pipeline with buyer-ready team models.",
    icon: Shield,
    color: "blue",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
  },
  {
    id: 2,
    title: "Manufacturing",
    slug: "us-manufacturing",
    description: "Supplier readiness, modernization, and enterprise alignment. Show buyers a supplier story built on execution and progress.",
    icon: Factory,
    color: "blue",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  },
  {
    id: 3,
    title: "Critical Minerals",
    slug: "critical-minerals",
    description: "Strategic materials, resilient supply chains, and national capability. Strengthen partnerships with better visibility and alignment.",
    icon: Gem,
    color: "purple",
    image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80",
  },
  {
    id: 4,
    title: "Opportunity Zones",
    slug: "opportunity-zones",
    description: "Place-based growth with strategic industrial relevance. Turn location advantage into an investable growth story.",
    icon: MapPin,
    color: "green",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  },
  {
    id: 5,
    title: "Access to Capital",
    slug: "access-to-capital",
    description: "Capital pathways that help promising projects move. Package opportunities with clarity, proof, and structure.",
    icon: DollarSign,
    color: "amber",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  },
];

export function FivePillarsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our 5 Pillars of Strategic Growth
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            KDM Consortium delivers readiness-first support across five interconnected pillars, 
            helping members turn capability into credible opportunity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card 
                key={pillar.id} 
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={pillar.image}
                    alt={pillar.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-${pillar.color}-600 flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm">Pillar {pillar.id}</span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{pillar.title}</CardTitle>
                  <CardDescription className="text-base">
                    {pillar.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/5-pillars/${pillar.slug}`}>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/5-pillars">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Explore All 5 Pillars
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
