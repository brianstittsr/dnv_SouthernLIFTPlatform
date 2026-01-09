"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Globe, Cpu, FileText, Megaphone, BarChart3, Briefcase, CheckCircle } from "lucide-react";

const services = [
  {
    title: "Digital Solutions",
    tagline: "Modernize your business presence.",
    description:
      "Comprehensive digital transformation services including websites, digital ecosystems, and e-commerce solutions for government contractors.",
    icon: Globe,
    color: "text-primary",
    bgColor: "bg-primary/10",
    href: "/services#digital",
    features: [
      "Professional website design and development",
      "Integrated digital platforms",
      "E-commerce for B2B and B2G transactions",
      "Mobile-responsive solutions",
    ],
  },
  {
    title: "Technology Solutions",
    tagline: "Gain a competitive edge.",
    description:
      "Cutting-edge technology implementations including blockchain, CRM & AI integration, and cybersecurity solutions.",
    icon: Cpu,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    href: "/services#technology",
    features: [
      "Blockchain for supply chain transparency",
      "CRM enhanced with AI capabilities",
      "Federal compliance cybersecurity",
      "Technology integration consulting",
    ],
  },
  {
    title: "Grants & RFPs",
    tagline: "Win more contracts.",
    description:
      "Expert assistance navigating government funding opportunities with proposal management and grant writing services.",
    icon: FileText,
    color: "text-accent",
    bgColor: "bg-accent/10",
    href: "/services#grants",
    features: [
      "Quick Bid/No Bid assessments",
      "End-to-end proposal management",
      "Professional grant writing",
      "Compliance review and submission",
    ],
  },
];

export function ServicesOverview() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">
            Driving Next Level Results
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            With Accredited Subject Matter Experts
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our team offers a range of services to help scale success for MBEs through our digital hub and expert network.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.title} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className={`absolute top-0 left-0 w-full h-1 ${service.bgColor}`} />
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${service.bgColor} flex items-center justify-center mb-4`}>
                  <service.icon className={`h-6 w-6 ${service.color}`} />
                </div>
                <CardTitle className="text-2xl">{service.title}</CardTitle>
                <CardDescription className="text-base font-medium">
                  {service.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 mt-0.5 shrink-0 ${service.color}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="group/btn p-0 h-auto" asChild>
                  <Link href={service.href}>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Ready to grow your government contracting business?
          </p>
          <Button size="lg" asChild>
            <Link href="/contact">
              Schedule an MBE Introductory Session
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
