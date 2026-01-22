import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Target,
  Award,
  TrendingUp,
  Zap,
  Lock,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CMMC Training - KDM - E3W | Strategic Value Plus",
  description: "Join the next CMMC training cohort. Team-based approach to cybersecurity compliance for DoD contractors. Achieve CMMC certification in 90-180 days.",
  keywords: ["CMMC training", "CMMC certification", "DoD compliance", "cybersecurity training", "NIST 800-171", "defense contractors"],
};

export default function CMMCTrainingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="text-lg px-6 py-2">
              <Shield className="h-5 w-5 mr-2 inline" />
              Phase 1 Enforcement Active - November 2025
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Register for the Next
              <span className="block text-yellow-400 mt-2">CMMC Training Cohort</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Don't lose your DoD contracts. Join the KDM Consortium's proven team-based approach to achieve CMMC certification in 90-180 days—before your competitors do.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold text-lg px-8 py-6">
                <Award className="h-5 w-5 mr-2" />
                Register for Next Cohort
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Clock className="h-5 w-5 mr-2" />
                Free Readiness Assessment
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>90-180 Day Timeline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Team-Based Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Expert Guidance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CMMC Cohort Program Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Users className="h-4 w-4 mr-2 inline" />
                CMMC Cohort Program
              </Badge>
              <h2 className="text-4xl font-bold mb-4">
                Team-Based Approach to Cybersecurity Compliance
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The KDM Consortium brings a proven team-based methodology to CMMC compliance through structured cohorts, powered by Strategic Value Plus Solutions, LLC (V+)
              </p>
            </div>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      The Defense Contracting Landscape Has Changed
                    </h3>
                    <div className="space-y-4 text-lg">
                      <p className="font-semibold text-red-700">
                        With Department of Defense CMMC Program enforcement effective November 10, 2025, Phase 1 enforcement is now active.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                          <div>
                            <strong>Immediate Risk:</strong> Contract disqualification without proper SPRS scores
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <strong>Compliance Required:</strong> Level 1 and Level 2 requirements now in effect for DoD contractors
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg border-2 border-red-200">
                    <h4 className="font-bold text-xl mb-4 text-red-700">Critical Warning</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Without current SPRS scores, validated readiness documentation, and auditable evidence, organizations face <strong>immediate ineligibility for contract awards</strong> and increased risk to existing business relationships.
                    </p>
                    <Button className="w-full mt-6 bg-red-600 hover:bg-red-700">
                      <Zap className="h-4 w-4 mr-2" />
                      Act Now - Register Today
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Critical Compliance Timeline */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="destructive" className="mb-4">
                <Clock className="h-4 w-4 mr-2 inline" />
                Time-Sensitive
              </Badge>
              <h2 className="text-4xl font-bold mb-4">Critical Compliance Timeline</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The CMMC rollout follows a strict four-phase enforcement schedule. <strong>Organizations must act now.</strong>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Phase 1 */}
              <Card className="border-2 border-red-500 bg-red-50">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive" className="text-lg px-4 py-1">Phase 1</Badge>
                    <Badge variant="outline" className="text-sm">NOW ACTIVE</Badge>
                  </div>
                  <CardTitle className="text-2xl">November 2025 - November 2026</CardTitle>
                  <CardDescription className="text-base font-semibold text-red-700">
                    Initial Enforcement In Effect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    DoD may require CMMC Level 1 (Self-Assessment) or Level 2 (Self/C3PAO) in solicitations. <strong>SPRS score and CMMC UID become mandatory for eligibility.</strong>
                  </p>
                </CardContent>
              </Card>

              {/* Phase 2 */}
              <Card className="border-2 border-orange-500 bg-orange-50">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-orange-600 text-lg px-4 py-1">Phase 2</Badge>
                    <Badge variant="outline" className="text-sm">UPCOMING</Badge>
                  </div>
                  <CardTitle className="text-2xl">2026 - 2027</CardTitle>
                  <CardDescription className="text-base font-semibold text-orange-700">
                    Certification Requirement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Third-party C3PAO audits become standard for most Level 2 contracts. <strong>Self-assessments no longer sufficient</strong> for medium and high-risk contracts.
                  </p>
                </CardContent>
              </Card>

              {/* Phase 3 */}
              <Card className="border-2 border-yellow-500 bg-yellow-50">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-yellow-600 text-lg px-4 py-1">Phase 3</Badge>
                    <Badge variant="outline" className="text-sm">2027-2028</Badge>
                  </div>
                  <CardTitle className="text-2xl">2027 - 2028</CardTitle>
                  <CardDescription className="text-base font-semibold text-yellow-700">
                    Enhanced Requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Level 3 (DIBCAC) controls added for highest-risk programs. Prime contractors enforce <strong>stricter subcontractor flow-down requirements</strong> across the supply chain.
                  </p>
                </CardContent>
              </Card>

              {/* Phase 4 */}
              <Card className="border-2 border-blue-500 bg-blue-50">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-600 text-lg px-4 py-1">Phase 4</Badge>
                    <Badge variant="outline" className="text-sm">2028+</Badge>
                  </div>
                  <CardTitle className="text-2xl">2028 - Onward</CardTitle>
                  <CardDescription className="text-base font-semibold text-blue-700">
                    Full Enforcement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Complete CMMC compliance mandatory across all DoD contracts. <strong>Non-compliant organizations are excluded</strong> from defense industrial base opportunities.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8 border-2 border-red-600 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-red-700 mb-2">Critical Warning</h3>
                    <p className="text-gray-700 text-lg">
                      The enforcement timeline is accelerating. Organizations that wait until later phases will face <strong>compressed implementation schedules, higher costs, and increased risk of non-compliance penalties.</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-12 py-6">
                <Zap className="h-5 w-5 mr-2" />
                Register for Next CMMC Cohort - Don't Wait
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Turnkey Compliance Process */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Target className="h-4 w-4 mr-2 inline" />
                Proven Process
              </Badge>
              <h2 className="text-4xl font-bold mb-4">Turnkey Compliance for Defense Contractors</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                KDM & Associates is a trusted partner of Strategic Value Plus Solutions, LLC (V+), leveraging the power of the <strong>CMMC Accelerator</strong> to deliver the Cohort Program — a turnkey solution purpose-built for small and mid-sized contractors.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Step 1 */}
              <Card className="border-2 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      1
                    </div>
                    <Badge variant="secondary">Week 1-2</Badge>
                  </div>
                  <CardTitle className="text-xl">Readiness Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Identify gaps, risks, required controls, and missing documentation. Get a clear roadmap of what needs to be done.
                  </p>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-2 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      2
                    </div>
                    <Badge variant="secondary">Week 3-8</Badge>
                  </div>
                  <CardTitle className="text-xl">Remediation & Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fix gaps, implement controls, build the evidence pack, and train your team. We guide you through every step.
                  </p>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-2 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      3
                    </div>
                    <Badge variant="secondary">Week 9-10</Badge>
                  </div>
                  <CardTitle className="text-xl">SSP & POA&M Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create mandatory documents showing your system boundaries and remediation plan. Required for certification.
                  </p>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="border-2 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      4
                    </div>
                    <Badge variant="secondary">Week 11-12</Badge>
                  </div>
                  <CardTitle className="text-xl">Pre-Assessment Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Validate evidence before scheduling a C3PAO (Certified Third-Party Assessment Organization). Ensure you're ready.
                  </p>
                </CardContent>
              </Card>

              {/* Step 5 */}
              <Card className="border-2 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      5
                    </div>
                    <Badge variant="secondary">Week 13-16</Badge>
                  </div>
                  <CardTitle className="text-xl">Formal CMMC Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    An independent assessor reviews practices, documentation, and evidence. Professional audit conducted by certified C3PAO.
                  </p>
                </CardContent>
              </Card>

              {/* Step 6 */}
              <Card className="border-2 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      6
                    </div>
                    <Badge className="bg-green-600">Final Step</Badge>
                  </div>
                  <CardTitle className="text-xl">Certification Decision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Pass, remediate, or re-test depending on findings. Achieve official CMMC certification and protect your contracts.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-12 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-500">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <h3 className="text-2xl font-bold">Proven Timeline</h3>
                </div>
                <p className="text-xl text-gray-700 mb-6">
                  Manufacturers who follow a structured approach often achieve compliance in <strong className="text-green-700">90–180 days</strong>.
                </p>
                <div className="space-y-2 text-lg">
                  <p className="font-semibold text-blue-700">Protect your contracts. Protect your future.</p>
                  <p className="text-gray-700">
                    Join us for a clear, practical roadmap to CMMC readiness and certification.
                  </p>
                </div>
                <Button size="lg" className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-12 py-6">
                  <Award className="h-5 w-5 mr-2" />
                  Register for the Next CMMC Cohort
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <BookOpen className="h-4 w-4 mr-2 inline" />
                Frequently Asked Questions
              </Badge>
              <h2 className="text-4xl font-bold mb-4">Common CMMC Questions Answered</h2>
              <p className="text-xl text-muted-foreground">
                Get clarity on the most important aspects of CMMC compliance
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-white border-2 rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  Do we really need CMMC certification if we're only a subcontractor and not a prime?
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-700 pt-4">
                  <p className="mb-4">
                    <strong>Yes, absolutely.</strong> Prime contractors are required to flow down CMMC requirements to all subcontractors who handle Controlled Unclassified Information (CUI) or Federal Contract Information (FCI).
                  </p>
                  <p>
                    Without CMMC certification, you risk losing existing subcontracts and being excluded from future opportunities. Many primes are already requiring proof of CMMC compliance before awarding subcontracts. <strong>Don't wait until you lose business—get certified now.</strong>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-white border-2 rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  How long does it take to become CMMC audit-ready?
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-700 pt-4">
                  <p className="mb-4">
                    <strong>Typically 90-180 days</strong> with a structured approach like the KDM CMMC Cohort Program. The timeline depends on your current security posture, size of your organization, and resources dedicated to the effort.
                  </p>
                  <p className="mb-4">
                    Organizations that try to do it alone often take 12-18 months or longer. Our cohort-based approach accelerates the process through:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Expert guidance at every step</li>
                    <li>Pre-built templates and documentation</li>
                    <li>Peer learning from other contractors</li>
                    <li>Weekly accountability and progress tracking</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-white border-2 rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  What's the difference between a readiness assessment and the formal CMMC certification audit?
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-700 pt-4">
                  <p className="mb-4">
                    A <strong>readiness assessment</strong> is an internal evaluation conducted by your team or a consultant (like KDM) to identify gaps and prepare for certification. It's not official and doesn't result in certification.
                  </p>
                  <p className="mb-4">
                    The <strong>formal CMMC certification audit</strong> is conducted by an independent, accredited C3PAO (Certified Third-Party Assessment Organization). This is the official audit that results in your CMMC certification if you pass.
                  </p>
                  <p>
                    <strong>Think of it like this:</strong> The readiness assessment is your practice test. The formal audit is the real exam. Our cohort program ensures you're fully prepared before scheduling the formal audit, <strong>saving you time and money by avoiding failed audits.</strong>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-white border-2 rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  Is CMMC a one-time certification or an ongoing requirement?
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-700 pt-4">
                  <p className="mb-4">
                    CMMC certification is <strong>valid for 3 years</strong>, but maintaining compliance is an ongoing effort. You must:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Continuously maintain your security controls</li>
                    <li>Update documentation as your systems change</li>
                    <li>Conduct regular internal assessments</li>
                    <li>Report any security incidents</li>
                    <li>Recertify every 3 years</li>
                  </ul>
                  <p>
                    The KDM Cohort Program doesn't just get you certified—we teach you how to <strong>maintain compliance cost-effectively</strong> so recertification is straightforward. Many of our clients find the second certification much easier than the first.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-white border-2 rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  Will CMMC become the standard for cybersecurity beyond the Department of Defense?
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-700 pt-4">
                  <p className="mb-4">
                    <strong>Nearly every indicator suggests yes.</strong> CMMC requirements are already influencing cybersecurity expectations across:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Federal agencies</strong> beyond DoD</li>
                    <li><strong>Tier-1 OEMs</strong> in aerospace and defense</li>
                    <li><strong>Cyber insurance providers</strong> requiring CMMC-level controls</li>
                    <li><strong>Commercial supply chains</strong> adopting similar frameworks</li>
                    <li><strong>Critical infrastructure sectors</strong> using CMMC as a baseline</li>
                  </ul>
                  <p className="font-semibold text-blue-700">
                    Manufacturers who invest now will be positioned ahead of competitors as security becomes a procurement requirement—not an option.
                  </p>
                  <p className="mt-4">
                    <strong>Bottom line:</strong> CMMC certification isn't just about DoD contracts anymore. It's becoming the gold standard for cybersecurity maturity across industries. <strong>Get ahead of the curve.</strong>
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Award className="h-4 w-4 mr-2 inline" />
                Why Choose KDM & Associates
              </Badge>
              <h2 className="text-4xl font-bold mb-4">Proven Results for Defense Contractors</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <CardTitle className="text-xl">Whole of Government Approach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic mb-4">
                    "KDM & Associates understands the unique challenges facing DoD contractors and utilizes the Singularity-IT Governance platform to deliver measurable results quickly through their comprehensive whole-of-government approach."
                  </p>
                  <Button variant="link" className="p-0">Read more →</Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <CardTitle className="text-xl">Team-Based Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic mb-4">
                    "The Cohort Program brings organizations together in a collaborative environment, allowing them to share best practices, learn from each other's experiences, and achieve compliance faster as a group."
                  </p>
                  <Button variant="link" className="p-0">Read more →</Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <CardTitle className="text-xl">Purpose-Built for SMBs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic mb-4">
                    "Specifically designed for small and mid-sized defense contractors who need fast, reliable compliance without massive consulting fees or lengthy implementation cycles."
                  </p>
                  <Button variant="link" className="p-0">Read more →</Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <CardTitle className="text-xl">Expert Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic mb-4">
                    "Receive hands-on support from compliance experts who understand the intricacies of CMMC, DFARS, and NIST 800-171 requirements for defense contractors."
                  </p>
                  <Button variant="link" className="p-0">Read more →</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="text-lg px-6 py-2">
              <Lock className="h-5 w-5 mr-2 inline" />
              Contact the KDM Consortium CMMC Team Today
            </Badge>
            <h2 className="text-5xl font-bold leading-tight">
              Don't Wait. Start Your
              <span className="block text-yellow-400 mt-2">Compliance Journey Now.</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Contact our team today to schedule your <strong>free readiness assessment</strong> and learn how the KDM CMMC Accelerator can accelerate your path to DoD cyber compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold text-xl px-12 py-7">
                <Award className="h-6 w-6 mr-2" />
                Register for the Next CMMC Cohort
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-xl px-12 py-7">
                <FileText className="h-6 w-6 mr-2" />
                Schedule Free Assessment
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-4xl font-bold text-yellow-400 mb-2">90-180</div>
                <div className="text-lg">Days to Certification</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-4xl font-bold text-yellow-400 mb-2">100%</div>
                <div className="text-lg">Expert Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
                <div className="text-lg">Platform Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
