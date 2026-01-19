import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Award,
  FileCheck,
  Lock,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Products & Solutions",
  description:
    "Discover KDM Associates' comprehensive quality management products and solutions including ISO certification tools, CMMC compliance platforms, and quality system software.",
};

const products = [
  {
    id: "iso-certification-toolkit",
    title: "ISO Certification Toolkit",
    icon: Award,
    description: "Complete toolkit for achieving ISO 9001, AS9100, and ISO 13485 certification with confidence.",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    features: [
      "Pre-built quality management system templates",
      "Gap analysis and readiness assessment tools",
      "Audit preparation checklists and guides",
      "Document control and management system",
      "Compliance tracking dashboard"
    ],
    cta: "Explore ISO Toolkit"
  },
  {
    id: "cmmc-compliance-platform",
    title: "CMMC Compliance Platform",
    icon: Shield,
    description: "Streamline your CMMC Level 1 & 2 compliance journey with our comprehensive platform.",
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
    features: [
      "CMMC practice implementation guides",
      "Security control mapping and tracking",
      "Evidence collection and documentation",
      "Assessment readiness scoring",
      "Continuous compliance monitoring"
    ],
    cta: "Get CMMC Ready"
  },
  {
    id: "quality-management-software",
    title: "Quality Management Software",
    icon: FileCheck,
    description: "Cloud-based QMS software designed for aerospace and defense manufacturers.",
    color: "text-green-600",
    bgColor: "bg-green-600/10",
    features: [
      "Document and record management",
      "Corrective and preventive action (CAPA)",
      "Internal audit management",
      "Training and competency tracking",
      "Supplier quality management"
    ],
    cta: "Start Free Trial"
  },
  {
    id: "cybersecurity-assessment",
    title: "Cybersecurity Assessment Suite",
    icon: Lock,
    description: "Comprehensive cybersecurity assessment and remediation tools for defense contractors.",
    color: "text-red-600",
    bgColor: "bg-red-600/10",
    features: [
      "NIST 800-171 compliance assessment",
      "Vulnerability scanning and reporting",
      "Risk assessment and mitigation planning",
      "Security policy templates",
      "Incident response planning tools"
    ],
    cta: "Assess Your Security"
  },
  {
    id: "supplier-qualification",
    title: "Supplier Qualification System",
    icon: Zap,
    description: "Streamline supplier evaluation, approval, and performance monitoring.",
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
    features: [
      "Supplier assessment questionnaires",
      "Performance scorecards and metrics",
      "Audit scheduling and tracking",
      "Risk-based supplier categorization",
      "Automated approval workflows"
    ],
    cta: "Qualify Suppliers"
  }
];

export default function ProductsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Products & Solutions
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Powerful Tools for{" "}
              <span className="text-primary">Quality Excellence</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Transform your quality management and compliance processes with our proven 
              software solutions and toolkits designed specifically for aerospace, defense, 
              and manufacturing industries.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Complete Solutions for Every Need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From ISO certification to CMMC compliance, we provide the tools and 
              platforms you need to achieve and maintain excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {products.map((product) => (
              <Card key={product.id} id={product.id} className="relative overflow-hidden group hover:shadow-xl transition-all">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${product.bgColor}`} />
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl ${product.bgColor} flex items-center justify-center mb-4`}>
                    <product.icon className={`h-8 w-8 ${product.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{product.title}</CardTitle>
                  <CardDescription className="text-base">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle className={`h-5 w-5 mt-0.5 shrink-0 ${product.color}`} />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/contact?product={product.id}">
                      {product.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Products */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why Choose KDM Products?
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Industry Expertise</h3>
                  <p className="text-sm text-muted-foreground">
                    Built by quality professionals with 25+ years of aerospace and defense experience
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Fast Implementation</h3>
                  <p className="text-sm text-muted-foreground">
                    Get up and running quickly with pre-configured templates and guided workflows
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Proven Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Hundreds of successful certifications and compliance achievements
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
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Transform Your Quality Management?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Schedule a demo to see how our products can help you achieve certification 
            faster and maintain compliance with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/contact">
                Schedule a Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/services">
                View Services
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
