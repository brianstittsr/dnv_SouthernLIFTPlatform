import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Handshake,
  Users,
  Building2,
  ArrowRight,
  CheckCircle,
  Target,
  Globe,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Join the KDM & Associates partner network. We connect solution providers with MBEs to drive mutual success in government contracting.",
};

const partnerBenefits = [
  {
    icon: Users,
    title: "Access to MBE Network",
    description: "Connect with our extensive network of minority-owned businesses seeking solutions and services."
  },
  {
    icon: Target,
    title: "Targeted Opportunities",
    description: "Get matched with MBEs whose needs align with your expertise and service offerings."
  },
  {
    icon: Globe,
    title: "Expanded Reach",
    description: "Extend your market presence through our digital ecosystem and community portals."
  },
  {
    icon: Award,
    title: "Credibility & Trust",
    description: "Benefit from association with the MBDA Federal Procurement Center network."
  }
];

const partnerTypes = [
  {
    title: "Solution Providers",
    description: "Technology vendors, consultants, and service providers who can support MBE growth.",
    features: [
      "Technology and software solutions",
      "Business consulting services",
      "Financial and accounting services",
      "Legal and compliance support",
      "Marketing and branding agencies"
    ]
  },
  {
    title: "Prime Contractors",
    description: "Large contractors seeking qualified MBE subcontractors and teaming partners.",
    features: [
      "Access to pre-vetted MBE firms",
      "Streamlined teaming arrangements",
      "Mentor-protégé opportunities",
      "Joint venture facilitation",
      "Subcontracting support"
    ]
  },
  {
    title: "Resource Partners",
    description: "Organizations providing resources, training, and support to small businesses.",
    features: [
      "Training and education providers",
      "Certification assistance organizations",
      "Capital and financing sources",
      "Industry associations",
      "Government agencies"
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
              Partner Network
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Become a KDM &{" "}
              <span className="text-primary">Associates Partner</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Join our exclusive digital community where business solution providers 
              contribute to and support MBEs on their journey to sustainability and success.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/contact">
                Become a Partner
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
              Why Partner With Us?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join a network dedicated to empowering minority-owned businesses and 
              creating mutual success in government contracting.
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
              We work with a diverse range of partners to provide comprehensive 
              support for MBEs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((type) => (
              <Card key={type.title} className="h-full">
                <CardHeader>
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
                <h3 className="font-semibold mb-2">Apply</h3>
                <p className="text-sm text-muted-foreground">
                  Submit your partnership application with details about your organization and offerings.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Onboard</h3>
                <p className="text-sm text-muted-foreground">
                  Complete our partner onboarding process and get listed in our partner directory.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Connect</h3>
                <p className="text-sm text-muted-foreground">
                  Start connecting with MBEs and contributing to their success in government contracting.
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
            Ready to Join Our Network?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Partner with KDM & Associates and help drive success for minority-owned 
            businesses in government contracting.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 text-lg px-8 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/contact">
              Apply to Become a Partner
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
