"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ClientRegistrationModal } from "@/components/client-registration";
import {
  Building2,
  ClipboardCheck,
  Factory,
  Landmark,
  Users,
  ArrowRight,
  CheckCircle,
  FileText,
  Briefcase,
  Handshake,
  Target,
  Award,
  TrendingUp,
  Shield,
  DollarSign,
} from "lucide-react";

const benefits = [
  {
    icon: Building2,
    title: "Government Contracting Expertise",
    description:
      "Navigate federal, state, and local procurement with guidance from seasoned professionals who understand the complexities of government contracting.",
  },
  {
    icon: Factory,
    title: "Manufacturing OEM Access",
    description:
      "Connect with major manufacturing OEMs and prime contractors seeking qualified minority business partners for their supply chains.",
  },
  {
    icon: Landmark,
    title: "Certification Assistance",
    description:
      "Get support obtaining 8(a), HUBZone, WOSB, SDVOSB, MBE, DBE, SBE, and other certifications that open doors to set-aside contracts.",
  },
  {
    icon: ClipboardCheck,
    title: "Proposal Development",
    description:
      "Access professional proposal writing support, capability statement development, and bid preparation services.",
  },
  {
    icon: Users,
    title: "Strategic Teaming",
    description:
      "Partner with established contractors through our teaming arrangement network, increasing your competitive advantage.",
  },
  {
    icon: Shield,
    title: "Compliance & Security",
    description:
      "Navigate CMMC, ITAR, and other security requirements with expert guidance on cybersecurity and compliance standards.",
  },
  {
    icon: DollarSign,
    title: "Financing & Loans",
    description:
      "Access financing options and loan programs to support your business growth and contract fulfillment needs.",
  },
  {
    icon: Target,
    title: "Target Agency Matching",
    description:
      "Get matched with government agencies and opportunities that align with your capabilities and business goals.",
  },
];

const stats = [
  { value: "$2B+", label: "Contract Opportunities Accessed" },
  { value: "500+", label: "Registered Businesses" },
  { value: "85%", label: "Certification Success Rate" },
  { value: "35+", label: "Years Combined Experience" },
];

const processSteps = [
  {
    number: "01",
    title: "Complete Registration",
    description:
      "Fill out our comprehensive client registration form with your business details, capabilities, and goals.",
  },
  {
    number: "02",
    title: "Assessment & Planning",
    description:
      "Our team reviews your information and schedules a consultation to understand your specific needs and opportunities.",
  },
  {
    number: "03",
    title: "Capability Building",
    description:
      "We help you obtain certifications, develop proposals, and prepare for government and OEM contracting opportunities.",
  },
  {
    number: "04",
    title: "Contract Acquisition",
    description:
      "Get matched with relevant opportunities and receive ongoing support throughout the proposal and award process.",
  },
];

export default function ClientRegistrationResourcesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              Resources / Client Registration
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Start Your Journey with{" "}
              <span className="text-primary">KDM & Associates</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Filling out our client registration form is the first step toward
              securing government contracts and manufacturing OEM partnerships.
              Let us help you navigate the path to success.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setIsModalOpen(true)}>
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Schedule a Call</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
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

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Why Work with KDM & Associates?
            </h2>
            <p className="text-muted-foreground text-lg">
              We provide comprehensive support to help minority-owned and
              small businesses succeed in government contracting and
              manufacturing supply chains.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="h-full">
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
              Our Process
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Your Path to Contracting Success
            </h2>
            <p className="text-muted-foreground text-lg">
              We guide you through every step of becoming a successful
              government contractor and manufacturing partner.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <Card key={index} className="relative h-full">
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
                Who Can Register
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Are You Eligible to Work with Us?
              </h2>
              <p className="text-muted-foreground mb-6">
                KDM & Associates works with a diverse range of businesses
                seeking to enter or expand in government contracting and
                manufacturing supply chains.
              </p>
              <ul className="space-y-4">
                {[
                  "Minority-owned businesses (MBE)",
                  "Women-owned businesses (WBE/WOSB)",
                  "Veteran-owned businesses (VOSB/SDVOSB)",
                  "8(a) certified or eligible firms",
                  "HUBZone qualified businesses",
                  "Small disadvantaged businesses",
                  "Emerging small businesses",
                  "Manufacturing and technology companies",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Industries We Serve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "Manufacturing",
                    "Technology",
                    "Construction",
                    "Professional Services",
                    "Logistics",
                    "Healthcare",
                    "Engineering",
                    "Defense",
                  ].map((industry, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {industry}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Take the First Step?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Complete our client registration form to get started. This is your
              gateway to government contracts, manufacturing OEM partnerships,
              and the support you need to grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setIsModalOpen(true)}>
                <ClipboardCheck className="mr-2 h-5 w-5" />
                Complete Registration Form
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
              >
                <Link href="/contact">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Talk to an Expert First
                </Link>
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-6">
              The registration form takes approximately 5-10 minutes to
              complete. All information is kept confidential.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">
              Success Stories
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Businesses Like Yours Are Succeeding
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "KDM & Associates helped us navigate the complex 8(a) certification process and secure our first federal contract within 6 months.",
                author: "Operations Director",
                company: "Mid-Sized Manufacturing Firm",
              },
              {
                quote:
                  "Their teaming arrangement program connected us with a prime contractor that has resulted in over $5M in subcontracts.",
                author: "CEO",
                company: "Technology Solutions Provider",
              },
              {
                quote:
                  "From SAM registration to proposal writing, KDM guided us every step of the way to winning our first government contract.",
                author: "President",
                company: "Minority-Owned Construction Company",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Award
                        key={star}
                        className="h-4 w-4 text-primary fill-primary"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-auto">
                    <p className="font-medium text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            {[
              {
                question: "What information do I need to provide?",
                answer:
                  "The registration form collects your ownership details, professional background, company information, business identifiers (NAICS codes, CAGE codes, SAM registration), and your specific needs and interests. This helps us understand your business and match you with the right opportunities.",
              },
              {
                question: "Do I need to have NAICS codes and certifications?",
                answer:
                  "You'll need at least one NAICS code to register. If you don't have certifications yet, that's okay—we can help you determine which certifications (8(a), HUBZone, WOSB, SDVOSB, MBE, DBE, SBE) would benefit your business and guide you through the process.",
              },
              {
                question: "How long does the registration process take?",
                answer:
                  "The registration form takes approximately 5-10 minutes to complete. After submission, our team typically reviews and responds within 2-3 business days.",
              },
              {
                question: "What happens after I register?",
                answer:
                  "Once registered, you'll be contacted by a KDM representative to schedule an initial consultation. We'll assess your current capabilities, discuss your goals, and create a customized action plan based on your needs.",
              },
              {
                question: "Can I specify which government agencies I want to work with?",
                answer:
                  "Yes. During registration, you can select target government agencies you're interested in working with, including DoD, VA, DHS, HHS, DOE, DOT, and others. This helps us match you with relevant opportunities.",
              },
              {
                question: "Do you help with financing and loans?",
                answer:
                  "Yes. We can connect you with financing options and loan programs to support your business growth and contract fulfillment needs. This is one of the services you can indicate interest in during registration.",
              },
              {
                question: "Can I connect with manufacturing OEMs?",
                answer:
                  "Yes. During registration, you can specify OEM manufacturers you're interested in working with. We help connect qualified minority businesses with major OEMs and prime contractors seeking supply chain partners.",
              },
              {
                question: "Is there a cost to register?",
                answer:
                  "No, client registration is free. We evaluate your business needs and provide recommendations at no cost. Some services may have fees, which are always discussed transparently before any engagement.",
              },
            ].map((faq, index) => (
              <Card key={index}>
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
                  Your Government Contracting Journey Starts Here
                </h2>
                <p className="text-lg opacity-90 mb-8">
                  Don't miss out on billions in contract opportunities. Register
                  today and take the first step toward growing your business
                  through government and manufacturing partnerships.
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => setIsModalOpen(true)}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Start Your Registration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Registration Modal */}
      <ClientRegistrationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          // Show success message or redirect
        }}
      />
    </>
  );
}
