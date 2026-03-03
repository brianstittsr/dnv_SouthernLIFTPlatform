import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "U.S. Manufacturing | 5 Pillars | KDM & Associates",
  description: "Strengthening domestic manufacturing capacity through support for small and mid-sized manufacturers, production readiness, and strategic connections.",
};

export default function USManufacturingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
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
              U.S. Manufacturing
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Strengthening domestic manufacturing capacity and competitiveness
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
                American manufacturing is the backbone of our economy and national security. KDM & Associates 
                is committed to strengthening domestic manufacturing capacity by providing comprehensive support 
                to small and mid-sized manufacturers across the country.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    Supporting Small & Mid-Sized Manufacturers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We provide tailored support to help small and mid-sized manufacturers scale their operations, 
                    improve efficiency, and compete in both commercial and government markets. Our expertise helps 
                    manufacturers navigate complex procurement processes and access new opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    Increasing Production Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Through strategic assessments and capacity building, we help manufacturers enhance their 
                    production capabilities, implement quality management systems, and meet the rigorous standards 
                    required for federal contracts and defense work.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    Connecting Suppliers to OEMs & Federal Buyers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We bridge the gap between suppliers and Original Equipment Manufacturers (OEMs), as well as 
                    federal procurement officers. Our extensive network and matchmaking capabilities create valuable 
                    partnerships that drive growth and opportunity.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    Workforce Alignment for Advanced Manufacturing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We help manufacturers develop and align their workforce with the skills needed for advanced 
                    manufacturing technologies, ensuring they have the talent pipeline to support growth and innovation 
                    in an evolving industry landscape.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle>Why U.S. Manufacturing Matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  <strong>Economic Security:</strong> Domestic manufacturing creates jobs, drives innovation, and 
                  strengthens local economies across America.
                </p>
                <p>
                  <strong>National Security:</strong> A robust manufacturing base is essential for defense readiness 
                  and reducing dependence on foreign supply chains.
                </p>
                <p>
                  <strong>Supply Chain Resilience:</strong> Recent global disruptions have highlighted the critical 
                  importance of domestic manufacturing capacity and supply chain independence.
                </p>
                <p>
                  <strong>Innovation Leadership:</strong> American manufacturers are at the forefront of advanced 
                  manufacturing technologies, from automation to additive manufacturing.
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
              Ready to Strengthen Your Manufacturing Capabilities?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the KDM Consortium to access comprehensive manufacturing support and connect with federal opportunities
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

      {/* Related Resources */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Related Resources from Our Blog</h3>
            <div className="grid gap-4">
              <Link href="/blog/us-manufacturing-environmental-progress" className="p-6 border rounded-lg hover:bg-muted/30 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-2">U.S. Manufacturing & Environmental Progress: A New Era of Innovation and Sustainability</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      The U.S. manufacturing sector is undergoing a transformative shift, driven by technological innovation, environmental imperatives, and evolving consumer expectations.
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Manufacturing</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Sustainability</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Innovation</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Link>
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
              <Link href="/5-pillars/critical-minerals" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 2: Critical Minerals →</div>
                <div className="text-sm text-muted-foreground">Strategic supply chain positioning</div>
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
