import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Shield,
  Target,
  Award,
  Lock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Aerospace & Defense | Industries | KDM & Associates",
  description: "Helping defense contractors and aerospace suppliers achieve CMMC compliance, DoD contract readiness, and defense industrial base participation through the KDM Consortium.",
  keywords: "aerospace defense, CMMC compliance, DoD contracts, defense contractors, aerospace suppliers, cybersecurity, federal contracting",
};

export default function AerospaceDefensePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/industries" className="inline-flex items-center text-white/80 hover:text-white mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Industries
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Plane className="h-10 w-10 text-white" />
              </div>
              <Badge variant="outline" className="border-white/50 text-white">
                CMMC & DoD Focus
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Aerospace & Defense
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Achieving CMMC compliance and DoD contract readiness for defense contractors and aerospace suppliers
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl text-muted-foreground leading-relaxed">
                The Aerospace & Defense vertical is driven by CMMC requirements and DoD positioning. We help defense 
                contractors and aerospace suppliers navigate the complex landscape of cybersecurity compliance, federal 
                contracting requirements, and defense industrial base participation.
              </p>
              <p className="text-muted-foreground">
                With CMMC becoming mandatory for DoD contracts, manufacturers and suppliers must achieve certification 
                to remain competitive. Our consortium provides the expertise, training, and support needed to successfully 
                navigate this critical transition.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-green-600" />
                    Who We Serve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Defense contractors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Aerospace suppliers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">DoD supply chain companies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Federal contract manufacturers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Companies requiring CMMC compliance</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-green-600" />
                    Strategic Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Cybersecurity compliance (CMMC, NIST 800-171)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">DoD contract readiness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Defense industrial base participation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Supply chain security requirements</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How the KDM Consortium Supports Defense Contractors</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-green-600" />
                    CMMC Compliance & Certification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Navigate the CMMC certification process with expert guidance. We provide gap assessments, 
                    remediation planning, implementation support, and preparation for third-party assessment. 
                    Our CMMC Training Cohort ensures your team understands requirements and maintains compliance.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Gap Assessment</Badge>
                    <Badge variant="secondary">CMMC Level 1-3</Badge>
                    <Badge variant="secondary">NIST 800-171</Badge>
                    <Badge variant="secondary">C3PAO Preparation</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-6 w-6 text-green-600" />
                    Cybersecurity Implementation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Implement robust cybersecurity controls that meet DoD requirements. We help you deploy technical 
                    solutions, establish policies and procedures, train personnel, and create the documentation needed 
                    for successful CMMC assessment.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Access Controls</Badge>
                    <Badge variant="secondary">Incident Response</Badge>
                    <Badge variant="secondary">Security Policies</Badge>
                    <Badge variant="secondary">Audit Logging</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>DoD Contract Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Successfully pursue and win DoD contracts with comprehensive support. We help with SAM registration, 
                    CAGE codes, DFARS compliance, proposal development, and connecting with prime contractors seeking 
                    qualified subcontractors.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">SAM.gov</Badge>
                    <Badge variant="secondary">DFARS Compliance</Badge>
                    <Badge variant="secondary">Proposal Support</Badge>
                    <Badge variant="secondary">Prime Matching</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Supply Chain Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Meet supply chain security requirements and position your company as a trusted supplier. We help 
                    you implement supply chain risk management, verify supplier compliance, and demonstrate security 
                    throughout your supply chain.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Supply Chain Risk</Badge>
                    <Badge variant="secondary">Vendor Management</Badge>
                    <Badge variant="secondary">Traceability</Badge>
                    <Badge variant="secondary">Security Verification</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training & Workforce Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Build a cybersecurity-aware workforce through our CMMC Training Cohort and ongoing education programs. 
                    We provide training for all personnel levels, from executives to technical staff, ensuring everyone 
                    understands their role in maintaining compliance.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">CMMC Training</Badge>
                    <Badge variant="secondary">Security Awareness</Badge>
                    <Badge variant="secondary">Technical Training</Badge>
                    <Badge variant="secondary">Executive Briefings</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ongoing Compliance Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    CMMC certification is just the beginning. We provide ongoing support to maintain compliance, 
                    prepare for recertification, respond to incidents, and adapt to evolving requirements. Our 
                    consortium model ensures you have continuous access to expertise and resources.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Continuous Monitoring</Badge>
                    <Badge variant="secondary">Recertification</Badge>
                    <Badge variant="secondary">Incident Response</Badge>
                    <Badge variant="secondary">Compliance Updates</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CMMC Training CTA */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-12 w-12 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Join Our CMMC Training Cohort</h3>
                    <p className="text-muted-foreground mb-6">
                      Get expert guidance through every step of the CMMC certification process. Our comprehensive 
                      training program covers all CMMC levels, domains, and practices with hands-on support from 
                      certified professionals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild>
                        <Link href="/training">
                          Join CMMC Training
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/cmmc">
                          Learn About CMMC
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pillar Connection */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-green-600" />
                  Connected to: Defense & CMMC Compliance Pillar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Aerospace & Defense is directly aligned with our <strong>Defense & CMMC Compliance</strong> pillar, 
                  which focuses on helping manufacturers prepare for CMMC certification, navigate DoD requirements, 
                  and access defense procurement opportunities.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/5-pillars/defense-cmmc">
                    Explore Defense & CMMC Pillar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
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
              Ready to Achieve CMMC Compliance?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the KDM Consortium and access expert guidance, training, and support for DoD contract success
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

      {/* Related Industries */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Explore Other Industries</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/industries/advanced-manufacturing" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Advanced Manufacturing →</div>
                <div className="text-sm text-muted-foreground">Production readiness and federal procurement</div>
              </Link>
              <Link href="/industries/critical-minerals" className="p-4 border rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="font-semibold">Critical Minerals & Natural Resources →</div>
                <div className="text-sm text-muted-foreground">Strategic supply chain positioning</div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
