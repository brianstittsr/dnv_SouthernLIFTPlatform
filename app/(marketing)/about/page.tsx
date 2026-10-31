import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Eye,
  Heart,
  Users,
  Award,
  Building2,
  ArrowRight,
  Factory,
  Handshake,
  GraduationCap,
  Landmark,
  ClipboardList,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About the Center | Southern University MBDA LIFT Rural Business Center",
  description:
    "The Southern University MBDA LIFT Rural Business Center provides no-cost technical assistance, training, capital readiness, and government contracting support to rural Louisiana small businesses — funded in part by the U.S. Department of Commerce MBDA.",
  keywords: [
    "Southern University LIFT Center",
    "MBDA LIFT Rural Business Center",
    "rural Louisiana small business",
    "small business technical assistance Louisiana",
    "Baton Rouge small business help",
    "HBCU Rural Business Center",
  ],
  alternates: { canonical: "https://lift.southern.edu/about" },
  openGraph: {
    title: "About the Southern University LIFT Center",
    description:
      "No-cost advising, training, and contracting readiness for rural Louisiana small businesses — an MBDA Rural Business Center at Southern University.",
    url: "https://lift.southern.edu/about",
    type: "website",
  },
};

const values = [
  {
    icon: Heart,
    title: "No-Cost Access",
    description:
      "Every LIFT service — advising, workshops, readiness reviews — is free to eligible rural businesses, thanks to federal funding.",
  },
  {
    icon: Target,
    title: "Rural First",
    description:
      "The center exists for rural Louisiana. Our services are designed for businesses far from big-city resources.",
  },
  {
    icon: Award,
    title: "Measurable Outcomes",
    description:
      "We track what matters — jobs, revenue, capital accessed, and contracts pursued — at 6- and 12-month check-ins.",
  },
  {
    icon: Users,
    title: "Partner Powered",
    description:
      "Lenders, agencies, universities, and industry partners extend what a small rural center can deliver.",
  },
];

const serviceAreas = [
  {
    icon: ClipboardList,
    title: "Business Advising & Technical Assistance",
    description:
      "One-on-one advising, business planning, operations, marketing, and a personalized service plan built around your goals.",
  },
  {
    icon: GraduationCap,
    title: "Training & Workshops",
    description:
      "No-cost workshops and virtual training on starting, financing, and growing a business — plus our advanced manufacturing program.",
  },
  {
    icon: Landmark,
    title: "Capital & Contracting Readiness",
    description:
      "Financial readiness, loan packaging, SAM.gov guidance, capability statements, and proposal development support.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              About the Center
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Lifting Rural Louisiana{" "}
              <span className="text-primary">Businesses</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              The Southern University MBDA LIFT Rural Business Center delivers
              no-cost advising, training, and readiness support to small
              businesses across rural Louisiana.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  To help rural Louisiana small businesses start, stabilize, and
                  grow — through hands-on technical assistance, practical
                  training, capital readiness, and government contracting
                  support delivered at no cost.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/20">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
                  <Eye className="h-6 w-6 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground">
                  Thriving rural communities where small businesses create jobs,
                  keep wealth local, and plug into supply chains in agriculture,
                  energy, defense, and advanced manufacturing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About the Program */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                A Federal Investment in Rural Louisiana
              </h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground text-lg leading-relaxed">
                The LIFT Rural Business Center is funded in part by a $1.275
                million cooperative agreement from the U.S. Department of
                Commerce, Minority Business Development Agency (MBDA) — one of
                only three HBCU Rural Business Center awards nationwide.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mt-6">
                Housed at Southern University and A&amp;M College in Baton Rouge,
                the center serves rural small businesses across Louisiana
                through the 2026–2029 program period. Southern&apos;s role as an
                HBCU with deep community roots makes it a natural home for a
                program built on trust, access, and follow-through.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mt-6">
                Beyond general business support, the center operates an
                advanced manufacturing initiative anchored by a metal additive
                manufacturing lab — helping rural manufacturers make, repair,
                and test parts for agriculture, energy, and defense supply
                chains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
                What We Do
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Three Connected Service Areas
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Every LIFT client gets a personalized service plan drawing on
                all three areas — not a menu of disconnected offerings.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {serviceAreas.map((area) => (
                <Card key={area.title} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <area.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{area.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {area.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Manufacturing Callout */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Factory className="h-12 w-12 mx-auto mb-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-6">
              Advanced Manufacturing Initiative
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Rural manufacturers get hands-on support through the center&apos;s
              metal additive manufacturing lab — producing, repairing, and
              testing parts while connecting to agriculture, energy, and
              defense supply chains. It&apos;s workforce development and supply
              chain readiness in one program.
            </p>
          </div>
        </div>
      </section>

      {/* Equal Opportunity Statement */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-6">
              Open to All Eligible Rural Businesses
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The LIFT Center serves eligible rural Louisiana small businesses
              without discrimination on the basis of race, color, national
              origin, sex, religion, age, disability, veteran status, or any
              other protected class. Program participation does not guarantee
              funding, certification, or contract awards.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How We Work
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The commitments behind every client relationship.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <Building2 className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Work with the Center?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Start with a short intake interview. A LIFT advisor will review
            your goals and help you build a plan — at no cost.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 text-lg px-8 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/sign-up">
              Start the Intake Interview
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
