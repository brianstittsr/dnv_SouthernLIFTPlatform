"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getProgramBranding } from "@/lib/branding";

const services = [
  "One-on-One Business Advising",
  "Workshops & Training",
  "Capital & Financing Readiness",
  "Government Contracting Readiness",
  "Advanced Manufacturing Program",
  "Digital & AI Adoption",
  "Partnership Inquiry",
  "Other",
];

const businessTypes = [
  "Rural Small Business",
  "Start-Up / Pre-Venture",
  "Manufacturer",
  "Minority-Owned Business",
  "Women-Owned Business",
  "Veteran-Owned Business",
  "Other",
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smsConsentTransactional, setSmsConsentTransactional] = useState(false);
  const [smsConsentMarketing, setSmsConsentMarketing] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [service, setService] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Show confirmation dialog
    setPendingFormData(formData);
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    if (!pendingFormData) return;
    
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: pendingFormData.get("firstName"),
          lastName: pendingFormData.get("lastName"),
          email: pendingFormData.get("email"),
          phone: pendingFormData.get("phone") || undefined,
          company: pendingFormData.get("company"),
          jobTitle: pendingFormData.get("title") || undefined,
          businessType: businessType,
          industry: pendingFormData.get("industry") || undefined,
          service: service,
          message: pendingFormData.get("message") || undefined,
          newsletter: pendingFormData.get("newsletter") === "on",
          smsConsentTransactional,
          smsConsentMarketing,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      toast.success("Thank you for your inquiry!", {
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.reset();
      setBusinessType("");
      setService("");
      setSmsConsentTransactional(false);
      setSmsConsentMarketing(false);
      setPendingFormData(null);
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Failed to submit form", {
        description: "Please try again or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Get in Touch
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Talk to the{" "}
              <span className="text-primary">LIFT Center</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300">
              Questions about eligibility, services, or partnerships? Reach
              out — or jump straight to the intake interview and an advisor
              will follow up with you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and a member of the LIFT Center
                    team will get back to you within two business days.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" name="firstName" required placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" name="lastName" required placeholder="Smith" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" name="email" type="email" required placeholder="john@company.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name *</Label>
                        <Input id="company" name="company" required placeholder="Your Company Inc." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input id="title" name="title" placeholder="VP Operations" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type *</Label>
                        <Select value={businessType} onValueChange={setBusinessType} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry/NAICS</Label>
                        <Input id="industry" name="industry" placeholder="e.g., IT Services, Construction" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service">Service of Interest *</Label>
                      <Select value={service} onValueChange={setService} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Tell us about your goals</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="What challenges are you facing? What outcomes are you hoping to achieve?"
                        rows={4}
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox id="newsletter" name="newsletter" />
                      <Label htmlFor="newsletter" className="text-sm font-normal">
                        Subscribe to our newsletter for government contracting insights and updates
                      </Label>
                    </div>

                    {/* SMS Opt-In Checkboxes */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="sms-consent-transactional"
                            checked={smsConsentTransactional}
                            onCheckedChange={(checked) => setSmsConsentTransactional(checked === true)}
                          />
                          <Label htmlFor="sms-consent-transactional" className="text-sm font-normal">
                            I consent to receive non-marketing text messages from the Southern University LIFT Center about appointment reminders and service inquiries. Message frequency may vary, message &amp; data rates may apply. I am 18 or older. Text HELP for assistance, reply STOP to opt out.
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="sms-consent-marketing"
                            checked={smsConsentMarketing}
                            onCheckedChange={(checked) => setSmsConsentMarketing(checked === true)}
                          />
                          <Label htmlFor="sms-consent-marketing" className="text-sm font-normal">
                            I consent to receive marketing text messages about LIFT Center workshops, events, and program updates at the phone number provided. Message frequency may vary. Message &amp; data rates may apply. I am 18 or older. Text HELP for assistance, reply STOP to opt out.
                          </Label>
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        "Submitting..."
                      ) : (
                        <>
                          Send Message
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Quick Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <Link href={`mailto:${getProgramBranding().contactEmail}`} className="text-gray-600 hover:text-primary transition-colors">
                        {getProgramBranding().contactEmail}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <Link
                        href={`tel:${getProgramBranding().contactPhone.replace(/[^0-9+]/g, "")}`}
                        className="text-muted-foreground hover:text-primary"
                      >
                        {getProgramBranding().contactPhone}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">Southern University and A&amp;M College<br />Baton Rouge, LA</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-muted-foreground">Mon-Fri: 8am - 5pm CST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Start Intake */}
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle>Ready to Enroll?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    The fastest way to get help is the online intake interview
                    — about 15 minutes, and an advisor follows up with you.
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/sign-up">
                      Start the Intake Interview
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* What to Expect */}
              <Card>
                <CardHeader>
                  <CardTitle>What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">Response within two business days</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">All services at no cost</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">A dedicated LIFT advisor</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">Serving all 64 Louisiana parishes</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Please verify your information before submitting. We&apos;ll send a confirmation to your email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm">
                <strong>Name:</strong> {pendingFormData?.get("firstName")?.toString()} {pendingFormData?.get("lastName")?.toString()}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {pendingFormData?.get("email")?.toString()}
              </p>
              <p className="text-sm">
                <strong>Company:</strong> {pendingFormData?.get("company")?.toString()}
              </p>
              <p className="text-sm">
                <strong>Service:</strong> {service}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPendingFormData(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={confirmSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
