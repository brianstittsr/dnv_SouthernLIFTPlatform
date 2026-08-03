import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Target,
  Users,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle2,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Core Competencies | KDM & Associates",
  description:
    "Discover KDM & Associates' core competencies in government contracting, CMMC certification, federal procurement, and business development.",
};

const competencies = [
  {
    icon: Briefcase,
    title: "Government Contracting",
    description:
      "Deep expertise in federal procurement processes, contract vehicles (GSA Schedule, IDIQ, BPA), and compliance requirements. We guide businesses through every stage of the government contracting lifecycle.",
    highlights: [
      "GSA Schedule Management",
      "IDIQ & BPA Strategies",
      "Proposal Development",
      "Contract Compliance",
    ],
  },
  {
    icon: Shield,
    title: "CMMC Certification & Compliance",
    description:
      "Comprehensive CMMC implementation and certification support for businesses seeking to work with the Department of Defense. We help organizations achieve and maintain compliance.",
    highlights: [
      "CMMC Assessment Prep",
      "Security Implementation",
      "Compliance Documentation",
      "Ongoing Maintenance",
    ],
  },
  {
    icon: Target,
    title: "Strategic Business Development",
    description:
      "Market analysis, opportunity identification, and go-to-market strategies tailored to your business goals. We help you identify and pursue the right opportunities.",
    highlights: [
      "Market Research",
      "Opportunity Identification",
      "Pricing Strategies",
      "Growth Planning",
    ],
  },
  {
    icon: Users,
    title: "Strategic Teaming & Partnerships",
    description:
      "Leverage our extensive network of vetted partners and subcontractors. We facilitate strategic teaming arrangements that strengthen your competitive position.",
    highlights: [
      "Partner Matching",
      "Teaming Agreements",
      "Joint Ventures",
      "Network Access",
    ],
  },
  {
    icon: TrendingUp,
    title: "Capacity Building & Training",
    description:
      "Develop internal capabilities through targeted training, mentorship, and process improvement. We build sustainable competitive advantages within your organization.",
    highlights: [
      "Staff Training",
      "Process Development",
      "System Implementation",
      "Mentorship Programs",
    ],
  },
  {
    icon: Zap,
    title: "Procurement Automation & Technology",
    description:
      "Implement AI-powered tools and automation to streamline procurement processes, improve bid response times, and enhance decision-making.",
    highlights: [
      "RFP Automation",
      "AI-Powered Analysis",
      "Bid Management Systems",
      "Data Analytics",
    ],
  },
];

const differentiators = [
  {
    title: "Minority-Owned Business",
    description:
      "As a certified minority-owned business, we bring authentic understanding of diverse business challenges and opportunities.",
  },
  {
    title: "Hands-On Partnership Approach",
    description:
      "We don't just advise—we work alongside you to implement strategies and achieve measurable results.",
  },
  {
    title: "Proven Track Record",
    description:
      "Years of success helping businesses become more prepared and competitive for government contracting and achieve sustainable growth.",
  },
  {
    title: "Integrated Service Model",
    description:
      "Comprehensive services spanning strategy, compliance, technology, and execution under one roof.",
  },
  {
    title: "Industry-Specific Expertise",
    description:
      "Deep knowledge across manufacturing, IT services, professional services, and specialized sectors.",
  },
  {
    title: "Results-Driven Metrics",
    description:
      "We measure success by your contract wins, revenue growth, and long-term business sustainability.",
  },
];

export default function CoreCompetenciesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Our Expertise
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Core <span className="text-primary">Competencies</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Comprehensive expertise across government contracting, compliance, 
              technology, and business development. We deliver results through 
              integrated, hands-on support.
            </p>
          </div>
        </div>
      </section>

      {/* Core Competencies Grid */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {competencies.map((competency, index) => {
              const Icon = competency.icon;
              return (
                <Card key={index} className="border-2 border-slate-200 hover:border-primary/50 transition-colors">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{competency.title}</h3>
                    <p className="text-muted-foreground mb-6">{competency.description}</p>
                    <div className="space-y-2">
                      {competency.highlights.map((highlight, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Sets Us <span className="text-primary">Apart</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              More than just consultants—we're partners committed to your success
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {differentiators.map((item, index) => (
              <Card key={index} className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Award className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Ready to Leverage Our Expertise?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Let's discuss how our core competencies can help your business 
              achieve its government contracting goals.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-primary font-semibold hover:bg-gray-100 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
