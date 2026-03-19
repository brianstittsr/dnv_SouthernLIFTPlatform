import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  Lock, 
  Users, 
  TrendingUp,
  ArrowRight,
  Calendar,
  DollarSign,
  Target,
  Award
} from "lucide-react";

export const metadata: Metadata = {
  title: "CMMC Certification & Compliance | KDM & Associates",
  description: "Achieve CMMC compliance and secure DoD contracts. Expert guidance, training, and support for defense contractors navigating cybersecurity requirements.",
  keywords: "CMMC, CMMC certification, DoD compliance, defense contractors, cybersecurity, NIST 800-171, federal contracting, CMMC training",
};

export default function CMMCPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white py-20 md:py-32">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://strategicvalueplus.com/_next/image?url=%2Fcmmc%2Fagefis-qh-mar1Tzo8-unsplash.jpg&w=750&q=75"
            alt="CMMC Cybersecurity"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gray-900/40" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <Badge variant="outline" className="border-white/50 text-white mb-6">
              Cybersecurity Maturity Model Certification
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              CMMC Certification & Compliance
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Navigate DoD cybersecurity requirements with confidence. Achieve CMMC compliance and unlock federal defense contracting opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/cmmc-training">
                  Join CMMC Training Cohort
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

      {/* What is CMMC Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">What is CMMC?</h2>
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                The Cybersecurity Maturity Model Certification (CMMC) is a unified standard for implementing cybersecurity 
                across the Defense Industrial Base (DIB). Required by the Department of Defense (DoD), CMMC ensures that 
                contractors and subcontractors adequately protect Federal Contract Information (FCI) and Controlled Unclassified 
                Information (CUI).
              </p>
              <p className="text-muted-foreground">
                CMMC combines various cybersecurity standards and best practices, including NIST SP 800-171, and maps them 
                to a tiered model that measures cybersecurity maturity. Unlike self-attestation, CMMC requires third-party 
                assessment and certification, making it a mandatory requirement for DoD contracts.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>CMMC Level 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>Foundational</strong> - Protects Federal Contract Information (FCI)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    17 practices focused on basic cyber hygiene
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>CMMC Level 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>Advanced</strong> - Protects Controlled Unclassified Information (CUI)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    110 practices aligned with NIST SP 800-171
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>CMMC Level 3</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>Expert</strong> - Protects CUI with enhanced security
                  </p>
                  <p className="text-sm text-muted-foreground">
                    110+ practices with additional requirements
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Key CMMC Requirements & Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-6 w-6 text-primary" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Limit information system access to authorized users, processes, and devices. Implement 
                    multi-factor authentication and role-based access controls.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-6 w-6 text-primary" />
                    Audit & Accountability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create, protect, and retain system audit logs to enable monitoring, analysis, investigation, 
                    and reporting of unlawful or unauthorized activity.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    Security Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Develop and implement activities to assess, monitor, and report the security state of 
                    organizational systems and environments.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    Awareness & Training
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ensure personnel are trained and aware of cybersecurity risks, threats, and their 
                    responsibilities in protecting organizational information.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Incident Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Establish operational incident-handling capability for organizational systems including 
                    preparation, detection, analysis, containment, and recovery.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    System Integrity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Identify, report, and correct information system flaws in a timely manner. Provide 
                    protection from malicious code and monitor system security alerts.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Benefits of CMMC Certification</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Access DoD Contracts</h3>
                  <p className="text-muted-foreground">
                    CMMC certification is mandatory for DoD contracts. Achieve compliance to bid on and win 
                    lucrative defense contracts worth billions annually.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Enhanced Cybersecurity</h3>
                  <p className="text-muted-foreground">
                    Strengthen your organization's cybersecurity posture, protecting sensitive data from 
                    cyber threats, breaches, and attacks.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Competitive Advantage</h3>
                  <p className="text-muted-foreground">
                    Stand out from competitors who lack certification. Demonstrate commitment to security 
                    and compliance to prime contractors and government agencies.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Customer Trust</h3>
                  <p className="text-muted-foreground">
                    Build trust with customers and partners by demonstrating verified cybersecurity practices 
                    through third-party certification.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Revenue Growth</h3>
                  <p className="text-muted-foreground">
                    Unlock new revenue streams by qualifying for DoD contracts. Many prime contractors require 
                    CMMC certification from their supply chain.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Industry Recognition</h3>
                  <p className="text-muted-foreground">
                    Gain recognition as a trusted defense contractor with verified security practices, 
                    enhancing your reputation in the industry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risks Section */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Risks of Non-Compliance</h2>
              <p className="text-xl text-muted-foreground">
                Failing to achieve CMMC certification carries significant consequences for defense contractors
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Contract Ineligibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Without CMMC certification, you cannot bid on or win DoD contracts that require it. This 
                    eliminates access to billions in federal contracting opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Loss of Existing Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Current DoD contracts may require CMMC certification by specific deadlines. Failure to 
                    comply could result in contract termination or non-renewal.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Supply Chain Exclusion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Prime contractors are required to ensure their subcontractors meet CMMC requirements. 
                    Non-compliance removes you from defense supply chains.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Cybersecurity Vulnerabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Without proper cybersecurity controls, your organization is vulnerable to data breaches, 
                    ransomware, and cyber attacks that can be devastating.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Financial Penalties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Data breaches and non-compliance can result in significant fines, legal fees, remediation 
                    costs, and potential lawsuits from affected parties.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Reputational Damage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Security incidents and non-compliance damage your reputation, eroding customer trust and 
                    making it difficult to win future business.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">CMMC Implementation Timeline</h2>
              <p className="text-xl text-muted-foreground">
                Understanding the typical path to CMMC certification
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Gap Assessment (1-2 months)</h3>
                  <p className="text-muted-foreground mb-2">
                    Conduct a comprehensive gap assessment to identify current cybersecurity posture and 
                    determine what controls need to be implemented.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>4-8 weeks</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Remediation Planning (2-4 weeks)</h3>
                  <p className="text-muted-foreground mb-2">
                    Develop a detailed remediation plan with prioritized actions, resource allocation, 
                    timelines, and budget requirements.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>2-4 weeks</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Implementation (3-9 months)</h3>
                  <p className="text-muted-foreground mb-2">
                    Implement required security controls, policies, procedures, and technical solutions. 
                    This phase varies based on current maturity and target level.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>12-36 weeks (varies by level)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Internal Readiness Assessment (1-2 months)</h3>
                  <p className="text-muted-foreground mb-2">
                    Conduct internal testing and validation to ensure all controls are properly implemented 
                    and documented before formal assessment.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>4-8 weeks</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    5
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Third-Party Assessment (1-2 months)</h3>
                  <p className="text-muted-foreground mb-2">
                    Engage a CMMC Third-Party Assessment Organization (C3PAO) to conduct the formal 
                    certification assessment.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>4-8 weeks</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Certification & Ongoing Compliance</h3>
                  <p className="text-muted-foreground mb-2">
                    Receive CMMC certification valid for three years. Maintain continuous compliance through 
                    monitoring, updates, and annual reviews.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Certification valid for 3 years</span>
                  </div>
                </div>
              </div>
            </div>

            <Card className="mt-12 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Total Timeline: 9-18 Months</h3>
                    <p className="text-muted-foreground">
                      The complete CMMC certification process typically takes 9-18 months from initial assessment 
                      to certification, depending on your organization's current cybersecurity maturity, target 
                      CMMC level, available resources, and complexity of your IT environment.
                    </p>
                  </div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Achieve CMMC Certification?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join our CMMC Training Cohort and get expert guidance through every step of the certification process
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Users className="h-8 w-8 text-white mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Expert Instructors</h3>
                <p className="text-sm text-white/80">
                  Learn from certified CMMC professionals with real-world experience
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <FileCheck className="h-8 w-8 text-white mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Comprehensive Curriculum</h3>
                <p className="text-sm text-white/80">
                  Cover all CMMC domains, practices, and assessment requirements
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Award className="h-8 w-8 text-white mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Certification Support</h3>
                <p className="text-sm text-white/80">
                  Ongoing support through assessment and certification process
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/training">
                  Join CMMC Training Cohort
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                <Link href="/contact">
                  Request Information
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
            <h3 className="text-xl font-semibold mb-6">Related Resources</h3>
            <div className="grid gap-4">
              <Link href="/5-pillars/defense-cmmc" className="p-6 border rounded-lg hover:bg-muted/30 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-2">Defense & CMMC Compliance - 5 Pillars</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Explore how CMMC compliance fits into our comprehensive strategic framework for defense contractors.
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Defense</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">CMMC</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Compliance</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Link>
              <Link href="/consortium" className="p-6 border rounded-lg hover:bg-muted/30 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-2">Join the KDM Consortium</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Connect with other defense contractors, share resources, and access exclusive opportunities through our consortium network.
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Networking</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Collaboration</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Resources</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
