import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Cpu,
  FileText,
  Megaphone,
  BarChart3,
  Briefcase,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "KDM & Associates offers comprehensive services including digital solutions, technology integration, grants & RFPs, marketing, operations, and contracting vehicles for MBEs.",
};

const services = [
  {
    id: "digital-solutions",
    title: "Digital Solutions",
    icon: Globe,
    description: "Comprehensive digital transformation services to modernize your business presence and operations.",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    offerings: [
      {
        name: "Websites",
        description: "Professional website design and development tailored for government contractors"
      },
      {
        name: "Digital Ecosystems",
        description: "Integrated digital platforms connecting your business operations"
      },
      {
        name: "E-commerce",
        description: "Online commerce solutions for B2B and B2G transactions"
      }
    ]
  },
  {
    id: "technology-solutions",
    title: "Technology Solutions",
    icon: Cpu,
    description: "Cutting-edge technology implementations to give your business a competitive edge.",
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
    offerings: [
      {
        name: "Blockchain",
        description: "Secure, transparent blockchain solutions for supply chain and contracts"
      },
      {
        name: "CRM & AI Integration",
        description: "Customer relationship management enhanced with artificial intelligence"
      },
      {
        name: "Cybersecurity",
        description: "Comprehensive security solutions meeting federal compliance requirements"
      }
    ]
  },
  {
    id: "grants-nofo-rfps",
    title: "Grants-NOFO-RFPs",
    icon: FileText,
    description: "Expert assistance navigating the complex world of government funding opportunities.",
    color: "text-green-600",
    bgColor: "bg-green-600/10",
    offerings: [
      {
        name: "Quick Bid/No Bid",
        description: "Rapid assessment of opportunity fit and win probability"
      },
      {
        name: "Proposal Management",
        description: "End-to-end proposal development and submission management"
      },
      {
        name: "Proposal & Grant Writing",
        description: "Professional writing services for winning proposals and grant applications"
      }
    ]
  },
  {
    id: "marketing-solutions",
    title: "Marketing Solutions",
    icon: Megaphone,
    description: "Strategic marketing services to increase your visibility and market reach.",
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
    offerings: [
      {
        name: "Import & Export",
        description: "International trade marketing and market entry strategies"
      },
      {
        name: "Content Creation",
        description: "Professional content development for all marketing channels"
      },
      {
        name: "PR/News Distribution",
        description: "Public relations and media outreach services"
      }
    ]
  },
  {
    id: "operations-performance",
    title: "Operations/Performance",
    icon: BarChart3,
    description: "Optimize your business operations for peak performance and growth.",
    color: "text-teal-600",
    bgColor: "bg-teal-600/10",
    offerings: [
      {
        name: "Business Assessments",
        description: "Comprehensive evaluation of your business capabilities and readiness"
      },
      {
        name: "Capital Readiness",
        description: "Financial preparation and access to capital resources"
      },
      {
        name: "Strategic Business Plans",
        description: "Development of actionable strategic plans for growth"
      }
    ]
  },
  {
    id: "contracting-vehicles",
    title: "Contracting Vehicles",
    icon: Briefcase,
    description: "Navigate government contracting pathways and certification requirements.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-600/10",
    offerings: [
      {
        name: "Certifications",
        description: "Guidance on obtaining 8(a), WOSB, SDVOSB, HUBZone and other certifications"
      },
      {
        name: "Mentor-Protégé & JVs",
        description: "Strategic partnership development and joint venture formation"
      },
      {
        name: "SBA Programs",
        description: "Navigation of Small Business Administration programs and benefits"
      }
    ]
  }
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Our Services
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Driving Next Level{" "}
              <span className="text-primary">Results</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              With Accredited Subject Matter Experts, we offer a comprehensive range of services 
              to help MBEs build, grow, and scale their government contracting business.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} id={service.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <div className={`absolute top-0 left-0 w-full h-1 ${service.bgColor}`} />
                <CardHeader>
                  <div className={`w-14 h-14 rounded-lg ${service.bgColor} flex items-center justify-center mb-4`}>
                    <service.icon className={`h-7 w-7 ${service.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {service.offerings.map((offering) => (
                      <li key={offering.name} className="flex items-start gap-3">
                        <CheckCircle className={`h-5 w-5 mt-0.5 shrink-0 ${service.color}`} />
                        <div>
                          <p className="font-medium">{offering.name}</p>
                          <p className="text-sm text-muted-foreground">{offering.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Schedule an MBE introductory session to discuss how our services can help 
            your business win government contracts.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 text-lg px-8 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/contact">
              Schedule MBE Session
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
