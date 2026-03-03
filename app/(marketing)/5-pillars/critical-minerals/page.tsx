import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gem, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Critical Minerals | 5 Pillars | KDM & Associates",
  description: "Positioning U.S. supply chains around domestic sourcing, strategic partnerships, and national security priorities for critical minerals.",
};

export default function CriticalMineralsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
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
            <p className="text-xl md:text-2xl text-white/90">
              Positioning U.S. supply chains for strategic independence and national security
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Critical minerals are essential to modern technology, defense systems, and clean energy. KDM & Associates 
                helps position U.S. supply chains to reduce foreign dependence and strengthen national security through 
                strategic mineral sourcing and partnerships.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                    Domestic Sourcing & Prioritization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We help companies identify and develop domestic sources of critical minerals, reducing reliance on 
                    foreign suppliers and strengthening supply chain resilience. Our expertise includes mapping domestic 
                    capabilities and connecting suppliers with end users.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                    Strategic Mineral Partnerships
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Through alignment with Development Finance Corporation (DFC) initiatives and other strategic 
                    partnerships, we facilitate access to critical mineral resources while ensuring compliance with 
                    federal requirements and national security priorities.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                    Aerospace & Defense Supply Chain Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We provide specialized support for aerospace and defense contractors requiring critical minerals 
                    for advanced systems. Our network ensures access to qualified suppliers who meet stringent 
                    quality and security standards.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                    National Security Implications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Understanding the national security dimensions of critical mineral supply chains is essential. 
                    We help companies navigate security requirements, comply with regulations, and contribute to 
                    strengthening America's strategic position.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle>Why Critical Minerals Matter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  <strong>Defense Systems:</strong> Critical minerals are essential components in advanced weapons systems, 
                  communications equipment, and defense technologies.
                </p>
                <p>
                  <strong>Technology Innovation:</strong> From semiconductors to batteries, critical minerals enable the 
                  technologies that drive modern innovation and competitiveness.
                </p>
                <p>
                  <strong>Energy Independence:</strong> Clean energy technologies, including solar panels, wind turbines, 
                  and electric vehicles, depend on reliable access to critical minerals.
                </p>
                <p>
                  <strong>Supply Chain Security:</strong> Reducing dependence on potentially adversarial nations for 
                  critical minerals is a strategic imperative for national security.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Strengthen Your Critical Mineral Supply Chain
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the KDM Consortium to access strategic partnerships and navigate critical mineral sourcing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/consortium">
                  Join the KDM Consortium
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                <Link href="/training">
                  Explore CMMC Training
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
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/5-pillars/us-manufacturing" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 1: U.S. Manufacturing →</div>
                <div className="text-sm text-muted-foreground">Strengthening domestic capacity</div>
              </Link>
              <Link href="/5-pillars/defense-cmmc" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 3: Defense & CMMC →</div>
                <div className="text-sm text-muted-foreground">DoD compliance and cybersecurity</div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
