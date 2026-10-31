import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Handshake,
  Users,
  ArrowRight,
  CheckCircle,
  MapPin,
  Landmark,
  Factory,
  GraduationCap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Partners | Southern University MBDA LIFT Rural Business Center",
  description:
    "Partner with the Southern University LIFT Center — lenders, resource organizations, procurement partners, and industry allies serving rural Louisiana small businesses.",
  alternates: { canonical: "https://lift.southern.edu/partners" },
};

const partnerBenefits = [
  {
    icon: MapPin,
    title: "Reach Rural Louisiana",
    description: "Connect with small businesses across all 64 parishes — an audience most organizations struggle to reach."
  },
  {
    icon: Users,
    title: "Warm Referrals",
    description: "Advisors refer LIFT clients to the right partner at the right moment in their service plan."
  },
  {
    icon: GraduationCap,
    title: "Shared Programming",
    description: "Co-host workshops and training that put your expertise in front of rural business owners."
  },
  {
    icon: Handshake,
    title: "Mission Alignment",
    description: "Join an MBDA-funded initiative creating measurable economic outcomes in rural communities."
  }
];

const partnerTypes = [
  {
    icon: Landmark,
    title: "Capital & Lending Partners",
    description: "CDFIs, banks, credit unions, and loan programs that can fund capital-ready LIFT clients.",
    features: [
      "Client referrals for loan-ready businesses",
      "Participation in capital readiness workshops",
      "Visibility into client financial preparation",
      "Community Reinvestment Act alignment"
    ]
  },
  {
    icon: Factory,
    title: "Industry & Supply Chain Partners",
    description: "OEMs, prime contractors, and manufacturers seeking suppliers or offering expertise.",
    features: [
      "Access to rural manufacturers in the advanced manufacturing program",
      "Supply chain connections in agriculture, energy, and defense",
      "Speaking and mentoring opportunities",
      "Site visits and lab collaboration"
    ]
  },
  {
    icon: Users,
    title: "Resource & Ecosystem Partners",
    description: "Organizations that serve small businesses — chambers, SBDCs, universities, extension programs, and nonprofits.",
    features: [
      "Two-way referrals for client needs we can't meet",
      "Co-hosted workshops and community events",
      "Shared outreach to rural parishes",
      "Complementary, non-duplicative services"
    ]
  }
];

export default function PartnersPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Partner With LIFT
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Help Rural Louisiana{" "}
              <span className="text-primary">Businesses Grow</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              The LIFT Center works with lenders, industry, and resource
              organizations to bring rural small businesses the expertise and
              connections they can&apos;t find on their own.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/contact">
                Start a Partnership Conversation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Partner Benefits */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Partner With the Center?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              LIFT is an MBDA-funded program with a built-in pipeline of rural
              businesses that need exactly what partners offer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnerBenefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Partner Categories
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Three ways organizations plug into the LIFT program.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((type) => (
              <Card key={type.title} className="h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <type.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {type.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How Partnership Works
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Connect</h3>
                <p className="text-sm text-muted-foreground">
                  Reach out through our contact page and tell us how your organization serves small businesses.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Align</h3>
                <p className="text-sm text-muted-foreground">
                  Meet the LIFT team to map where your services fit client service plans, workshops, or referrals.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Serve</h3>
                <p className="text-sm text-muted-foreground">
                  Start working with rural businesses through referrals, co-hosted events, or direct engagement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <Handshake className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Let&apos;s Work Together
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Partner with the Southern University LIFT Center and help rural
            Louisiana businesses access the resources they need to grow.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 text-lg px-8 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/contact">
              Contact the Center
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
