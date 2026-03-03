import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Defense & CMMC Compliance | 5 Pillars | KDM & Associates",
  description: "Helping manufacturers and suppliers prepare for CMMC compliance, navigate DoD requirements, and access defense procurement opportunities.",
};

export default function DefenseCMMCPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
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
              Defense & CMMC Compliance
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Preparing manufacturers and suppliers for DoD contracting success
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
                The Department of Defense requires rigorous cybersecurity standards through the Cybersecurity Maturity 
                Model Certification (CMMC). KDM & Associates provides comprehensive support to help manufacturers and 
                suppliers achieve compliance and access lucrative defense contracting opportunities.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Prepare for & Achieve CMMC Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our expert-led training programs and consulting services guide you through the entire CMMC 
                    certification process. We help you understand requirements, implement necessary controls, 
                    and prepare for assessment to achieve certification at the appropriate level.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Navigate DoD Contracting Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Defense contracting involves complex requirements beyond CMMC. We help you understand and meet 
                    all DoD procurement standards, including quality systems, supply chain security, and compliance 
                    documentation requirements.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Strengthen Cybersecurity Posture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Beyond compliance, we help you build a robust cybersecurity program that protects your business 
                    and sensitive information. Our approach ensures you're not just checking boxes, but creating 
                    lasting security improvements.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Access Defense Procurement Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    CMMC certification opens doors to defense contracts worth billions of dollars. We connect you 
                    with prime contractors, help you navigate procurement portals, and position you for success in 
                    the defense industrial base.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle>Why CMMC Compliance Matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  <strong>Market Access:</strong> CMMC certification is becoming mandatory for DoD contractors and 
                  subcontractors. Without it, you cannot bid on or perform defense contracts.
                </p>
                <p>
                  <strong>Competitive Advantage:</strong> Early certification positions you ahead of competitors and 
                  demonstrates your commitment to security and quality.
                </p>
                <p>
                  <strong>Risk Mitigation:</strong> Proper cybersecurity controls protect your business from costly 
                  breaches, data loss, and reputational damage.
                </p>
                <p>
                  <strong>Revenue Growth:</strong> Defense contracts provide stable, long-term revenue opportunities 
                  with the world's largest customer - the U.S. Department of Defense.
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
              Get CMMC Certified and DoD Ready
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join our expert-led CMMC training cohorts and access comprehensive defense contracting support
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/training">
                  Enroll in CMMC Training
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                <Link href="/consortium">
                  Join the KDM Consortium
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
              <Link href="/blog/puerto-ricos-strategic-role-federal-opportunities" className="p-6 border rounded-lg hover:bg-muted/30 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-2">Puerto Rico's Strategic Role: Federal Opportunities Emerging from Counter-Cartel Operations</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      As the United States intensifies its efforts to combat drug cartels and transnational organized crime, Puerto Rico is emerging as a critical strategic hub.
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Federal Contracting</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Security</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Infrastructure</span>
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
              <Link href="/5-pillars/access-to-capital" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Pillar 4: Access to Capital →</div>
                <div className="text-sm text-muted-foreground">Strategic funding pathways</div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
