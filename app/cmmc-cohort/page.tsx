"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  CheckCircle,
  Loader2,
  ShoppingCart,
  CreditCard,
  Lock,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function CMMCCohortPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    notes: "",
  });

  const productDetails = {
    name: "KDM CMMC Level 1 Cohort 2026",
    description: "CMMC Level 1 - 12-Week Readiness & Compliance Cohort (Required Preparation)",
    price: 7500.00,
    quantity: 1,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckout = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company) {
      toast.error("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName: productDetails.name,
          productDescription: productDetails.description,
          amount: productDetails.price,
          quantity: productDetails.quantity,
          customerInfo: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to process checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  const totalAmount = productDetails.price * productDetails.quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/kdm-logo.png"
                alt="KDM & Associates"
                width={120}
                height={40}
                className="object-contain"
              />
              <Separator orientation="vertical" className="h-8" />
              <Image
                src="/VPlus_logo.webp"
                alt="KDM & Associates"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Secure Checkout
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Pay KDM Peach Freestyle Sandbox</h1>
            <p className="text-xl text-muted-foreground">
              Complete your CMMC Level 1 Cohort 2026 registration
            </p>
            <Badge className="mt-4 bg-blue-600">CMMC Level 1 (L1)</Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-12 w-12 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{productDetails.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {productDetails.description}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">
                          ${productDetails.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="py-2">
                      <button className="text-sm text-blue-600 hover:underline">
                        Add promotion code
                      </button>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total due</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${totalAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Contact Information & Payment */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@company.com"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment method</CardTitle>
                  <CardDescription>
                    All transactions are secure and encrypted
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Your Company LLC"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(201) 555-0123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special requirements or questions..."
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Pay with Stripe
                      </>
                    )}
                  </Button>

                  <div className="space-y-2 text-xs text-muted-foreground text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Secure payment powered by Stripe</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Your information is protected and encrypted</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Program Details */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    What's Included in the CMMC Level 1 Cohort
                  </CardTitle>
                  <CardDescription>
                    12-Week Readiness & Compliance Program for CMMC Level 1 (L1) Certification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">12-Week Structured Program</p>
                        <p className="text-sm text-muted-foreground">
                          Guided weekly instruction and accountability
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Expert Guidance</p>
                        <p className="text-sm text-muted-foreground">
                          Access to CMMC compliance specialists
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Team-Based Learning</p>
                        <p className="text-sm text-muted-foreground">
                          Learn alongside peer defense contractors
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Documentation Support</p>
                        <p className="text-sm text-muted-foreground">
                          SSP, POA&M, and evidence pack development
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Pre-Assessment Review</p>
                        <p className="text-sm text-muted-foreground">
                          Validation before C3PAO scheduling
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Ongoing Support</p>
                        <p className="text-sm text-muted-foreground">
                          Continued guidance through certification
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  Important Notice
                </p>
                <p className="text-xs text-amber-800">
                  This cohort provides readiness and preparation support only and does not
                  guarantee certification or replace an official CMMC assessment by an
                  authorized C3PAO.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Questions? Contact us at{" "}
              <a href="mailto:info@kdmassociates.com" className="text-blue-600 hover:underline">
                info@kdmassociates.com
              </a>
            </p>
            <p className="mt-2">© 2026 KDM & Associates. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
