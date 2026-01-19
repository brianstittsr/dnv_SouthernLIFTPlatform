import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  Handshake,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Building2,
  Target,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Explore career opportunities, partnership programs, and business development opportunities with KDM Associates.",
};

const careerOpportunities = [
  {
    id: "quality-consultant",
    title: "Senior Quality Management Consultant",
    department: "Consulting Services",
    location: "Remote / Hybrid",
    type: "Full-time",
    description: "Lead ISO certification and quality management consulting engagements for aerospace and defense clients.",
    requirements: [
      "10+ years in quality management",
      "ISO 9001, AS9100 Lead Auditor certification",
      "Aerospace/defense industry experience",
      "Excellent client communication skills"
    ]
  },
  {
    id: "cmmc-specialist",
    title: "CMMC Compliance Specialist",
    department: "Cybersecurity & Compliance",
    location: "Remote",
    type: "Full-time",
    description: "Guide defense contractors through CMMC certification process and cybersecurity compliance.",
    requirements: [
      "CMMC Registered Practitioner (RP) or Assessor (CCA)",
      "NIST 800-171 expertise",
      "Defense contractor experience",
      "Strong technical and communication skills"
    ]
  },
  {
    id: "business-development",
    title: "Business Development Manager",
    department: "Sales & Marketing",
    location: "Hybrid - Washington DC Area",
    type: "Full-time",
    description: "Drive growth by developing strategic partnerships and expanding our client base in government contracting.",
    requirements: [
      "5+ years in B2B sales or business development",
      "Government contracting knowledge",
      "Strong network in aerospace/defense",
      "Proven track record of revenue growth"
    ]
  }
];

const partnershipPrograms = [
  {
    id: "strategic-partners",
    title: "Strategic Partner Program",
    icon: Handshake,
    description: "Join our network of strategic partners to deliver comprehensive solutions to clients.",
    benefits: [
      "Co-marketing opportunities",
      "Revenue sharing arrangements",
      "Joint solution development",
      "Access to our client network"
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-600/10"
  },
  {
    id: "affiliate-program",
    title: "Affiliate Partner Program",
    icon: Users,
    description: "Earn commissions by referring clients to our certification and compliance services.",
    benefits: [
      "Competitive commission structure",
      "Marketing materials and support",
      "Dedicated partner portal",
      "Regular training and updates"
    ],
    color: "text-purple-600",
    bgColor: "bg-purple-600/10"
  },
  {
    id: "technology-partners",
    title: "Technology Partner Program",
    icon: Building2,
    description: "Integrate your technology solutions with our quality management platforms.",
    benefits: [
      "Technical integration support",
      "Joint go-to-market strategy",
      "Co-development opportunities",
      "Partner certification program"
    ],
    color: "text-green-600",
    bgColor: "bg-green-600/10"
  }
];

export default function OpportunitiesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Opportunities
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Grow Your Career or{" "}
              <span className="text-primary">Partner With Us</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Join our team of quality management experts or become a strategic partner 
              to help manufacturers achieve excellence in quality and compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Career Opportunities */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight">Career Opportunities</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Join a dynamic team dedicated to helping manufacturers achieve quality excellence.
            </p>
          </div>

          <div className="space-y-6">
            {careerOpportunities.map((job) => (
              <Card key={job.id} className="group hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                        {job.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{job.department}</Badge>
                        <Badge variant="outline">{job.location}</Badge>
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {job.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Key Requirements:</h4>
                    <ul className="space-y-2">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <span className="text-sm text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full sm:w-auto" asChild>
                    <Link href={`/contact?job=${job.id}`}>
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-12 border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Don't See the Right Role?</h3>
              <p className="text-muted-foreground mb-6">
                We're always looking for talented professionals. Send us your resume and let us know how you can contribute to our mission.
              </p>
              <Button variant="outline" asChild>
                <Link href="/contact?general-inquiry=true">
                  Submit General Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Partnership Programs */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Handshake className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight">Partnership Programs</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Collaborate with us to deliver exceptional value to manufacturers worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnershipPrograms.map((program) => (
              <Card key={program.id} className="group hover:shadow-xl transition-all">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl ${program.bgColor} flex items-center justify-center mb-4`}>
                    <program.icon className={`h-8 w-8 ${program.color}`} />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {program.title}
                  </CardTitle>
                  <CardDescription>
                    {program.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-sm">Program Benefits:</h4>
                    <ul className="space-y-2">
                      {program.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className={`h-4 w-4 mt-0.5 shrink-0 ${program.color}`} />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/contact?partnership=${program.id}`}>
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

      {/* Why Join KDM */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Why Join KDM Associates?</h2>
              <p className="text-lg text-muted-foreground">
                Be part of a team that's making a real difference in quality management and compliance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <TrendingUp className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Growth & Development</h3>
                  <p className="text-muted-foreground">
                    Continuous learning opportunities, professional certifications, and career advancement paths.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Collaborative Culture</h3>
                  <p className="text-muted-foreground">
                    Work with industry experts in a supportive, team-oriented environment.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Target className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Meaningful Impact</h3>
                  <p className="text-muted-foreground">
                    Help manufacturers achieve quality excellence and contribute to critical industries.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Building2 className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Industry Leadership</h3>
                  <p className="text-muted-foreground">
                    Work with leading organizations in aerospace, defense, and manufacturing sectors.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <Briefcase className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Take the Next Step?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Whether you're looking for a career opportunity or interested in partnering with us, 
            we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/contact">
                Get in Touch
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/about">
                Learn About Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
