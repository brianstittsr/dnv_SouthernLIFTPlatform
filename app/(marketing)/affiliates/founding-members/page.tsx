"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  ArrowRight,
  Handshake,
  Users,
  Target,
  DollarSign,
  Award,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const benefits = [
  {
    icon: Handshake,
    title: "Founder-First Status",
    description: "Reserved affiliate designation for KDM Consortium founding members.",
  },
  {
    icon: Users,
    title: "Trusted Network",
    description: "Connect with other founders, government buyers, and vetted suppliers.",
  },
  {
    icon: Target,
    title: "Qualified Referrals",
    description: "Receive introductions matched to your expertise and capability areas.",
  },
  {
    icon: DollarSign,
    title: "Revenue Sharing",
    description: "Participate in KDM contract delivery and partner referral programs.",
  },
  {
    icon: Award,
    title: "Visibility",
    description: "Featured placement in the affiliate directory and consortium materials.",
  },
  {
    icon: Sparkles,
    title: "Exclusive Events",
    description: "Access founder-only briefings, networking sessions, and buyer meetings.",
  },
];

const expertiseOptions = [
  { id: "manufacturing", label: "Manufacturing Operations" },
  { id: "quality", label: "Quality & ISO" },
  { id: "technology", label: "Technology & AI" },
  { id: "finance", label: "Finance & Accounting" },
  { id: "sales", label: "Sales & Marketing" },
  { id: "hr", label: "HR & Workforce" },
  { id: "supply-chain", label: "Supply Chain" },
  { id: "international", label: "International Business" },
  { id: "compliance", label: "CMMC & Compliance" },
  { id: "contracts", label: "Government Contracts" },
];

const commitments = [
  "Attend at least 2 affiliate networking meetings per month",
  "Complete at least 4 One-to-One meetings with other affiliates monthly",
  "Actively identify and refer qualified leads to the KDM network",
  "Respond to referral requests within 24-48 hours",
  "Maintain professional standards and represent KDM values",
];

export default function FoundingMemberAffiliatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    jobTitle: "",
    expertise: [] as string[],
    valueProposition: "",
    acknowledgesCommitments: false,
  });

  const toggleExpertise = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(id)
        ? prev.expertise.filter((item) => item !== id)
        : [...prev.expertise, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.companyName ||
      formData.expertise.length === 0 ||
      !formData.acknowledgesCommitments
    ) {
      setError("Please fill in all required fields and agree to the commitments.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/affiliates/founding-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80')] bg-cover bg-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-amber-400/50 text-amber-400">
              Founding Member Exclusive
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Become a KDM Affiliate as a{" "}
              <span className="text-amber-400">Founding Member</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Leverage your consortium membership to unlock affiliate status, gain access to
              exclusive referrals, and grow your government contracting opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8"
                asChild
              >
                <a href="#apply">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white bg-transparent hover:bg-white/10 px-8"
                asChild
              >
                <Link href="/affiliates">Learn About Affiliates</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Founding Members Join as Affiliates</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your early commitment to the KDM Consortium comes with exclusive affiliate benefits.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {submitted ? (
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-green-800 dark:text-green-200">
                    Application Received
                  </h2>
                  <p className="text-green-700 dark:text-green-300 mb-6">
                    Thank you for applying to become a KDM Affiliate as a Founding Member. Our team
                    will review your submission and contact you within 2 business days.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                      <Link href="/portal">Go to Portal</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/affiliates">Back to Affiliates</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Founding Member Affiliate Application</CardTitle>
                  <CardDescription>
                    Complete the form below to register as a KDM Affiliate. Fields marked with * are
                    required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          placeholder="Jane"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jane@company.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(202) 469-3423"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) =>
                            setFormData({ ...formData, companyName: e.target.value })
                          }
                          placeholder="Your company name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={formData.jobTitle}
                          onChange={(e) =>
                            setFormData({ ...formData, jobTitle: e.target.value })
                          }
                          placeholder="e.g., VP of Operations"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Areas of Expertise *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {expertiseOptions.map((option) => (
                          <div key={option.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={option.id}
                              checked={formData.expertise.includes(option.id)}
                              onCheckedChange={() => toggleExpertise(option.id)}
                            />
                            <Label
                              htmlFor={option.id}
                              className="text-sm font-normal leading-tight cursor-pointer"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valueProposition">Value Proposition / Bio</Label>
                      <Textarea
                        id="valueProposition"
                        value={formData.valueProposition}
                        onChange={(e) =>
                          setFormData({ ...formData, valueProposition: e.target.value })
                        }
                        placeholder="Describe the problems you solve, your ideal client, and what makes your expertise valuable to government contractors..."
                        rows={4}
                      />
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold">Affiliate Commitments</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {commitments.map((commitment) => (
                          <li key={commitment} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{commitment}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-start space-x-2 pt-2">
                        <Checkbox
                          id="acknowledge"
                          checked={formData.acknowledgesCommitments}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              acknowledgesCommitments: checked as boolean,
                            })
                          }
                        />
                        <Label htmlFor="acknowledge" className="text-sm font-normal leading-tight cursor-pointer">
                          I am a KDM Consortium Founding Member and I agree to the affiliate
                          commitments above. *
                        </Label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Affiliate Application"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  question: "Who can apply on this page?",
                  answer:
                    "This page is reserved for KDM Consortium Founding Members who want to also join the KDM Affiliate Network.",
                },
                {
                  question: "Is there a cost to become an affiliate?",
                  answer:
                    "Founding Members can apply for affiliate status at no additional cost as part of their founding membership benefits.",
                },
                {
                  question: "What happens after I apply?",
                  answer:
                    "Our team reviews your application, verifies your founding membership, and contacts you with onboarding next steps within 2 business days.",
                },
                {
                  question: "Can I update my application?",
                  answer:
                    "Once submitted, reach out to kmoore@kdm-assoc.com with any updates or questions about your application.",
                },
              ].map((faq) => (
                <div key={faq.question} className="border rounded-lg p-6 bg-white">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
