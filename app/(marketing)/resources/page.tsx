import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ClipboardCheck,
  Factory,
  Landmark,
  Users,
  ArrowRight,
  CheckCircle,
  FileText,
  Handshake,
  Target,
  GraduationCap,
  Bot,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Resources & Services | Southern University MBDA LIFT Rural Business Center",
  description:
    "No-cost resources for rural Louisiana small businesses: advising, workshops, capital readiness, government contracting support, and advanced manufacturing assistance.",
  alternates: { canonical: "https://lift.southern.edu/resources" },
};

const benefits = [
  {
    icon: Users,
    title: "One-on-One Advising",
    description:
      "A dedicated LIFT advisor works with you on business planning, operations, marketing, and growth — at no cost.",
  },
  {
    icon: GraduationCap,
    title: "Workshops & Training",
    description:
      "Practical workshops and virtual sessions on starting, financing, and growing your rural business.",
  },
  {
    icon: Landmark,
    title: "Capital Readiness",
    description:
      "Financial readiness reviews, loan packaging support, and connections to CDFIs and other capital sources.",
  },
  {
    icon: ClipboardCheck,
    title: "Contracting Readiness",
    description:
      "SAM.gov registration guidance, capability statements, and proposal support so you can pursue public-sector work.",
  },
  {
    icon: Factory,
    title: "Advanced Manufacturing",
    description:
      "Hands-on support through the center's metal additive manufacturing lab for rural manufacturers.",
  },
  {
    icon: Bot,
    title: "Digital & AI Adoption",
    description:
      "Practical help adopting digital tools and realistic AI uses that save time without big budgets.",
  },
];

const stats = [
  { value: "$1.275M", label: "MBDA Cooperative Agreement" },
  { value: "64", label: "Louisiana Parishes Served" },
  { value: "3", label: "Program Years (2026–2029)" },
  { value: "1 of 3", label: "HBCU Rural Centers Nationwide" },
];

const processSteps = [
  {
    number: "01",
    title: "Intake Interview",
    description:
      "Start with our AI-guided intake interview — about 15 minutes. It tells us about your business, goals, and needs.",
  },
  {
    number: "02",
    title: "Enrollment",
    description:
      "Confirm rural eligibility, sign the MBDA Letter of Engagement, and complete a short baseline survey.",
  },
  {
    number: "03",
    title: "Service Plan",
    description:
      "Meet your LIFT advisor and work a personalized plan — advising, workshops, capital, and contracting support.",
  },
  {
    number: "04",
    title: "Outcome Check-Ins",
    description:
      "Check in at 6 and 12 months to track jobs, revenue, capital, and contracts — and adjust your plan as you grow.",
  },
];

const eligibility = [
  "Your business is located in a rural Louisiana parish",
  "You own or are starting a small business",
  "You're willing to complete the intake and enrollment forms",
  "You can commit to periodic advisor check-ins",
];

const faqs = [
  {
    question: "Does the program really cost nothing?",
    answer:
      "Yes. LIFT services are funded by an MBDA cooperative agreement — advising, workshops, readiness reviews, and the intake process are all free to eligible rural businesses.",
  },
  {
    question: "How do I know if my business counts as rural?",
    answer:
      "Rural eligibility is confirmed during enrollment. Most businesses outside Louisiana's major metro cores qualify — if you're unsure, start the intake interview and we'll verify for you.",
  },
  {
    question: "What do I need to get started?",
    answer:
      "Just complete the online intake interview — about 15 minutes. After that, enrollment involves a short eligibility confirmation, the MBDA Letter of Engagement, and a baseline survey.",
  },
  {
    question: "Do I have to want a government contract to join?",
    answer:
      "No. Government contracting is one readiness area among many. Your service plan is built around your goals — whether that's financing, marketing, operations, or contracting.",
  },
  {
    question: "What is the advanced manufacturing program?",
    answer:
      "Rural manufacturers get hands-on access to the center's metal additive manufacturing lab — making, repairing, and testing parts for agriculture, energy, and defense supply chains.",
  },
  {
    question: "Will my information stay private?",
    answer:
      "Your information is used to deliver program services and required MBDA outcome reporting. It is never sold. Outcome reporting to MBDA is aggregated and follows federal data requirements.",
  },
];

export default function ResourcesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge
              variant="outline"
              className="mb-6 border-primary/50 text-primary"
            >
              Resources &amp; Services
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Free Resources for{" "}
              <span className="text-primary">Rural Business Growth</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Everything the Southern University LIFT Center offers rural
              Louisiana small businesses — advising, training, capital
              readiness, and contracting support at no cost.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Start the Intake Interview
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact the Center</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">
              What the Center Offers
            </h2>
            <p className="text-muted-foreground text-lg">
              Six connected service areas, all delivered at no cost to
              eligible rural Louisiana businesses.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">
              How It Works
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Your Path Through the Program
            </h2>
            <p className="text-muted-foreground text-lg">
              From first contact to measurable outcomes — here&apos;s the
              journey every LIFT client takes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <Card key={step.number} className="relative h-full">
                <CardHeader>
                  <div className="text-4xl font-bold text-primary/20 mb-4">
                    {step.number}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardContent>
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                Who Can Join
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Is Your Business Eligible?
              </h2>
              <p className="text-muted-foreground mb-6">
                The LIFT Center serves rural Louisiana small businesses — from
                main-street shops to manufacturers. You&apos;re likely eligible
                if:
              </p>
              <ul className="space-y-4">
                {eligibility.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Where We Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Based at Southern University in Baton Rouge, the center
                  serves rural small businesses across all 64 Louisiana
                  parishes — with services delivered on campus, in communities,
                  and virtually.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "Advising statewide",
                    "Baton Rouge workshops",
                    "Virtual training",
                    "Manufacturing lab",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {faq.answer}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-primary text-white border-none">
            <CardContent className="py-12 px-6 md:px-12 text-center">
              <div className="max-w-2xl mx-auto">
                <Handshake className="h-12 w-12 mx-auto mb-6 opacity-80" />
                <h2 className="text-3xl font-bold mb-4">
                  Your Growth Plan Starts Here
                </h2>
                <p className="text-lg opacity-90 mb-8">
                  The intake interview takes about 15 minutes — and it&apos;s
                  the only thing standing between you and a free, personalized
                  service plan.
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                >
                  <Link href="/sign-up">
                    <FileText className="mr-2 h-5 w-5" />
                    Start the Intake Interview
                  </Link>
                </Button>
                <p className="text-sm opacity-70 mt-6">
                  Funded in part by the U.S. Department of Commerce, Minority
                  Business Development Agency (MBDA).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
