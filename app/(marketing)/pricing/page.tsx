"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { PRODUCTS, type Product } from "@/lib/types/cart";
import {
  Check,
  Star,
  Zap,
  Shield,
  Users,
  Calendar,
  FileText,
  Target,
  Building2,
  ArrowRight,
  Loader2,
  GraduationCap,
  Award,
  Briefcase,
  Globe,
  TrendingUp,
  Clock,
  MessageSquare,
  BookOpen,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PRICING_TIERS = [
  {
    id: "kdm-consortium",
    name: "KDM Consortium Membership",
    description: "Join our exclusive network of government contractors and suppliers",
    monthlyPrice: 625,
    annualPrice: 6750, // ~10% discount
    popular: true,
    features: [
      "Curated federal opportunity alerts",
      "Team assembly & partner matching",
      "Proposal development support",
      "Monthly buyer briefings",
      "Resource library access",
      "Member directory listing",
      "KDM Readiness Badge display",
      "2 hours concierge support/month",
      "Priority pursuit notifications",
      "Private workspace access",
      "Networking events access",
      "CMMC readiness assessment",
    ],
    icon: Star,
    cta: "Join the Consortium",
  },
  {
    id: "founders",
    name: "KDM Founders Membership",
    description: "One-time founding member payment - Founding Member recognition and founder privileges",
    price: 625,
    isOneTime: true,
    popular: false,
    features: [
      "Founding Member recognition & badge",
      "Consortium membership benefits for the founding period",
      "Priority notification of publicly announced opportunities",
      "Founding member badge & recognition",
      "Exclusive founding member events",
      "Priority support & concierge service",
      "Direct access to KDM leadership",
      "Lifetime price guarantee",
      "Strategic partner introductions",
      "Custom opportunity matching",
      "Alumni network access",
      "Legacy benefits for future growth",
    ],
    icon: Crown,
    cta: "Claim Founders Spot",
  },
  {
    id: "cmmc-cohort",
    name: "CMMC Cohort Training",
    description: "Intensive 12-week program for CMMC 2.0 Level 2 assessment readiness",
    price: 7500,
    isOneTime: true,
    popular: false,
    features: [
      "12-week guided readiness program",
      "Expert-led training sessions",
      "CMMC 2.0 Level 2 preparation",
      "Documentation templates & tools",
      "Mock assessments & gap analysis",
      "1-on-1 mentor sessions (4 hours)",
      "Access to certified RPOs",
      "Ongoing alumni support group",
      "Assessment preparation support",
      "Compliance roadmap development",
      "Policy & procedure creation",
      "C3PAO referral network",
    ],
    icon: GraduationCap,
    cta: "Register for Cohort",
    href: "/portal/admin/cohorts",
  },
];

const MEMBERSHIP_BENEFITS = [
  {
    icon: Target,
    title: "Curated Opportunities",
    description: "Get matched with curated government contracting opportunities aligned with your capabilities.",
  },
  {
    icon: Users,
    title: "Team Assembly",
    description: "Connect with complementary businesses to form capable, opportunity-aligned pursuit teams.",
  },
  {
    icon: FileText,
    title: "Proposal Support",
    description: "Access templates, tools, and expert guidance for responsive, compliant, and competitive proposals.",
  },
  {
    icon: Calendar,
    title: "Buyer Briefings",
    description: "Participate in educational briefings, industry days, and public outreach sessions with government and prime-contractor representatives.",
  },
  {
    icon: Shield,
    title: "Compliance Ready",
    description: "CMMC readiness assessment and guidance for cybersecurity compliance. A KDM Readiness Badge is an informational platform designation and is not a government certification, contracting-officer determination, security clearance, CMMC assessment result, or endorsement.",
  },
  {
    icon: Zap,
    title: "Advance Market Intelligence",
    description: "Receive timely alerts based on publicly available procurement forecasts, agency notices, industry outreach, and published opportunity data.",
  },
  {
    icon: Globe,
    title: "Network Access",
    description: "Connect with 500+ directory-listed contractors, suppliers, and government buyers.",
  },
  {
    icon: TrendingUp,
    title: "Growth Resources",
    description: "Training, webinars, and resources to grow your government contracting business.",
  },
];

const CMMC_BENEFITS = [
  {
    icon: Award,
    title: "Assessment Ready",
    description: "Complete preparation for CMMC 2.0 Level 2 assessment.",
  },
  {
    icon: Clock,
    title: "12-Week Program",
    description: "Structured timeline with milestones to keep you on track for assessment readiness.",
  },
  {
    icon: Users,
    title: "Expert Mentorship",
    description: "Learn from certified CMMC professionals and former assessors.",
  },
  {
    icon: MessageSquare,
    title: "Alumni Network",
    description: "Join graduates who share best practices and contracting opportunities.",
  },
  {
    icon: BookOpen,
    title: "Documentation Kit",
    description: "Pre-built templates for policies, procedures, and compliance documentation.",
  },
  {
    icon: Shield,
    title: "C3PAO Referrals",
    description: "Access to our network of Certified Third Party Assessment Organizations.",
  },
];

interface MembershipTrackerStatus {
  totalSlots: number;
  remainingSlots: number;
  claimedSlots: number;
  discountActive: boolean;
  discountDeadline: string;
  discountPercentage: number;
}

interface SpecialOffer {
  id: string;
  name: string;
  price: number;
  priceType: 'monthly' | 'annual' | 'one-time' | 'training';
  description?: string;
  specialTag?: string;
  features?: string[];
  productType?: 'founders' | 'consortium' | 'cmmc-cohort';
  cta?: string;
  validUntil?: string;
}

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [trackerStatus, setTrackerStatus] = useState<MembershipTrackerStatus | null>(null);
  const [trackerLoading, setTrackerLoading] = useState(true);
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [specialOffersLoading, setSpecialOffersLoading] = useState(true);

  // Fetch membership tracker status on component mount
  useEffect(() => {
    const fetchTrackerStatus = async () => {
      try {
        const response = await fetch("/api/consortium/membership-tracker");
        if (response.ok) {
          const data = await response.json();
          setTrackerStatus(data);
        }
      } catch (error) {
        console.error("Error fetching tracker status:", error);
      } finally {
        setTrackerLoading(false);
      }
    };

    fetchTrackerStatus();
  }, []);

  // Fetch dynamic special offers managed from the admin panel
  useEffect(() => {
    const fetchSpecialOffers = async () => {
      try {
        const response = await fetch("/api/pricing/special-offers");
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const result = await response.json();
        setSpecialOffers(result.data || []);
      } catch (error) {
        console.error("Error fetching special offers:", error);
      } finally {
        setSpecialOffersLoading(false);
      }
    };

    fetchSpecialOffers();
  }, []);

  const buildSpecialOfferProduct = (offer: SpecialOffer): Product => {
    const baseProduct = PRODUCTS[offer.productType || 'founders'];
    return {
      ...baseProduct,
      id: `${baseProduct.id}-${offer.id}`,
      name: offer.name || baseProduct.name,
      description: offer.description || baseProduct.description,
      price: offer.price || baseProduct.price,
      features: offer.features?.length ? offer.features : baseProduct.features,
      billingPeriod: offer.priceType === 'monthly' || offer.priceType === 'annual'
        ? offer.priceType
        : 'one-time',
    };
  };

  const handleSelectPlan = async (tierId: string) => {
    const tier = PRICING_TIERS.find((t) => t.id === tierId);
    
    if (tierId === "cmmc-cohort" && tier?.href) {
      router.push(tier.href);
      return;
    }

    setLoading(tierId);

    try {
      // Redirect to Stripe checkout for KDM Consortium membership
      router.push("/portal/payment");
    } catch (error) {
      console.error("Error selecting plan:", error);
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 border-none">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Invest in Your Success
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto mb-8">
            Join the KDM Consortium to access exclusive government contracting opportunities, 
            or accelerate your CMMC assessment readiness with our intensive cohort program.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {PRICING_TIERS.map((tier) => {
              const TierIcon = tier.icon;

              return (
                <Card
                  key={tier.id}
                  className={`relative flex flex-col h-full ${
                    tier.popular
                      ? "border-2 border-primary shadow-xl scale-[1.02]"
                      : "border border-border"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                      <TierIcon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="min-h-[48px] mt-2">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="text-center mb-6">
                      {tier.isOneTime ? (
                        <>
                          <div className="text-4xl font-bold">
                            {formatPrice(tier.price!)}
                          </div>
                          <div className="text-muted-foreground">
                            one-time payment
                          </div>
                        </>
                      ) : (
                        <>
                          {tier.id === "kdm-consortium" && trackerStatus?.discountActive && (
                            <div className="mb-2">
                              <div className="text-sm line-through text-muted-foreground">
                                {formatPrice(tier.monthlyPrice!)}
                              </div>
                              <Badge className="bg-red-500 text-white text-xs mb-2">
                                50% OFF - Limited Time
                              </Badge>
                            </div>
                          )}
                          <div className="text-4xl font-bold">
                            {tier.id === "kdm-consortium" && trackerStatus?.discountActive
                              ? formatPrice(Math.floor(tier.monthlyPrice! / 2))
                              : formatPrice(tier.monthlyPrice!)}
                          </div>
                          <div className="text-muted-foreground">per month</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            or {tier.id === "kdm-consortium" && trackerStatus?.discountActive
                              ? formatPrice(Math.floor(tier.annualPrice! / 2))
                              : formatPrice(tier.annualPrice!)} billed annually
                            <Badge className="ml-2 bg-green-500 text-white text-xs">
                              {tier.id === "kdm-consortium" && trackerStatus?.discountActive
                                ? "50% + 10% = 55% OFF"
                                : "Save 10%"}
                            </Badge>
                          </div>
                          {tier.id === "kdm-consortium" && trackerStatus && (
                            <div className="text-xs text-amber-600 mt-2 font-semibold">
                              {trackerStatus.discountActive
                                ? `Only ${trackerStatus.remainingSlots} slots remaining (${trackerStatus.claimedSlots}/${trackerStatus.totalSlots} claimed)`
                                : "Discount period ended"}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <ul className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-4">
                    {tier.id === "kdm-consortium" ? (
                      <AddToCartButton
                        product={PRODUCTS.consortium}
                        variant={tier.popular ? "default" : "outline"}
                        size="lg"
                        className="w-full"
                      >
                        {tier.cta} <ArrowRight className="ml-2 h-4 w-4" />
                      </AddToCartButton>
                    ) : tier.id === "founders" ? (
                      <AddToCartButton
                        product={PRODUCTS.founders}
                        variant="default"
                        size="lg"
                        className="w-full bg-amber-600 hover:bg-amber-700"
                      >
                        {tier.cta} <ArrowRight className="ml-2 h-4 w-4" />
                      </AddToCartButton>
                    ) : tier.id === "cmmc-cohort" ? (
                      <AddToCartButton
                        product={PRODUCTS["cmmc-cohort"]}
                        variant={tier.popular ? "default" : "outline"}
                        size="lg"
                        className="w-full"
                      >
                        {tier.cta} <ArrowRight className="ml-2 h-4 w-4" />
                      </AddToCartButton>
                    ) : (
                      <Button
                        className="w-full"
                        size="lg"
                        variant={tier.popular ? "default" : "outline"}
                        onClick={() => handleSelectPlan(tier.id)}
                        disabled={loading === tier.id}
                      >
                        {loading === tier.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {tier.cta} <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Special Offers Section (admin togglable) */}
      {!specialOffersLoading && specialOffers.length > 0 && (
        <section className="py-10 -mt-6">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge className="mb-2 bg-amber-500 text-white hover:bg-amber-600 border-none">
                Limited Time
              </Badge>
              <h2 className="text-3xl font-bold mb-2">Special Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Exclusive offers available for a limited time. Toggle these on or off from the admin panel.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {specialOffers.map((offer) => {
                const product = buildSpecialOfferProduct(offer);
                const isRecurring = product.billingPeriod === 'monthly' || product.billingPeriod === 'annual';
                return (
                  <Card
                    key={offer.id}
                    className="relative flex flex-col h-full border-2 border-amber-400 shadow-xl"
                  >
                    {offer.specialTag && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-amber-500 text-white px-4 py-1 border-none">
                          {offer.specialTag}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4 pt-8">
                      <div className="mx-auto mb-4 p-3 rounded-full bg-amber-100 w-fit">
                        <Star className="h-8 w-8 text-amber-600" />
                      </div>
                      <CardTitle className="text-2xl">{offer.name}</CardTitle>
                      <CardDescription className="min-h-[48px] mt-2">
                        {offer.description || product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold">
                          {formatPrice(product.price)}
                        </div>
                        <div className="text-muted-foreground">
                          {isRecurring ? `per ${product.billingPeriod}` : 'one-time payment'}
                        </div>
                        {offer.validUntil && (
                          <div className="text-xs text-amber-700 mt-2 font-semibold flex items-center justify-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Offer ends {format(new Date(offer.validUntil), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                      <Separator className="my-6" />
                      <ul className="space-y-3">
                        {(offer.features?.length ? offer.features : product.features).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-4">
                      <AddToCartButton
                        product={product}
                        variant="default"
                        size="lg"
                        className="w-full bg-amber-600 hover:bg-amber-700"
                      >
                        {offer.cta || 'Claim Offer'} <ArrowRight className="ml-2 h-4 w-4" />
                      </AddToCartButton>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Membership Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              KDM Consortium
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Why Join the Consortium?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              For just $625/month, get access to everything you need to compete 
              and win in the federal contracting marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {MEMBERSHIP_BENEFITS.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={index} className="text-center p-6 bg-background rounded-lg shadow-sm">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                    <BenefitIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CMMC Cohort Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              CMMC Assessment Readiness
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Accelerate Your CMMC Journey
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our intensive 12-week CMMC Cohort program prepares you for certification 
              with expert guidance, proven methodologies, and ongoing support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {CMMC_BENEFITS.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={index} className="text-center p-6 bg-muted/30 rounded-lg">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                    <BenefitIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">
                What is included in the KDM Consortium membership?
              </h3>
              <p className="text-muted-foreground">
                Full access to our opportunity intelligence platform, team assembly tools, 
                proposal support resources, monthly educational briefings with government and 
                prime-contractor representatives, KDM Readiness Badge display, and 2 hours of concierge 
                support per month.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">
                Can I cancel my membership anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your monthly membership at any time. Your access 
                will continue until the end of your current billing period. Annual 
                memberships are non-refundable but provide a 10% savings.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">
                What is the CMMC Cohort program?
              </h3>
              <p className="text-muted-foreground">
                A 12-week intensive program designed to prepare your organization for 
                CMMC 2.0 Level 2 certification. Includes expert-led training, 
                documentation templates, mock assessments, and 1-on-1 mentorship.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">
                Do I need to be a Consortium member to join the CMMC Cohort?
              </h3>
              <p className="text-muted-foreground">
                No, the CMMC Cohort is available to all businesses. However, Consortium 
                members receive a 20% discount on the Cohort fee.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">
                What happens after I complete the CMMC Cohort?
              </h3>
              <p className="text-muted-foreground">
                Upon completion, you will receive a Certificate of Completion and be 
                connected with our network of C3PAOs (Certified Third Party Assessment 
                Organizations) to schedule your official CMMC assessment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Accelerate Your Growth?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Whether you are looking to join our exclusive contracting network or 
            achieve CMMC assessment readiness, we have the program to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AddToCartButton
              product={PRODUCTS.consortium}
              variant="secondary"
              size="lg"
            >
              Join the Consortium
            </AddToCartButton>
            <AddToCartButton
              product={PRODUCTS.founders}
              variant="default"
              size="lg"
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              Claim Founders Spot
            </AddToCartButton>
            <AddToCartButton
              product={PRODUCTS["cmmc-cohort"]}
              variant="default"
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              Register for Cohort
            </AddToCartButton>
          </div>
        </div>
      </section>
    </div>
  );
}
