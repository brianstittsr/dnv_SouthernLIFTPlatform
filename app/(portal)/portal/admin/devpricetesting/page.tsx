"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { PRODUCTS } from "@/lib/types/cart";
import {
  Check,
  Star,
  Crown,
  GraduationCap,
  FlaskConical,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DEV_PRICING_TIERS = [
  {
    product: PRODUCTS["test-product"],
    icon: FlaskConical,
    cta: "Buy Test Product — $1",
    badgeLabel: "TEST ONLY",
    badgeClass: "bg-red-500 text-white",
    cardClass: "border-2 border-red-400 shadow-xl",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    product: PRODUCTS.consortium,
    icon: Star,
    cta: "Join the Consortium",
    badgeLabel: "Most Popular",
    badgeClass: "bg-primary text-primary-foreground",
    cardClass: "border-2 border-primary shadow-xl",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    product: PRODUCTS.founders,
    icon: Crown,
    cta: "Claim Founders Spot",
    badgeLabel: "One-Time",
    badgeClass: "bg-amber-500 text-white",
    cardClass: "border border-border",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    product: PRODUCTS["cmmc-cohort"],
    icon: GraduationCap,
    cta: "Register for Cohort",
    badgeLabel: "Training",
    badgeClass: "bg-blue-500 text-white",
    cardClass: "border border-border",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);

export default function DevPriceTestingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin-only warning banner */}
      <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-semibold tracking-wide">
        🔒 ADMIN ONLY — DEV / STRIPE TESTING PAGE — NOT VISIBLE TO PUBLIC USERS
      </div>

      {/* Header */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-14">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-red-500 text-white border-none">
            Dev Testing Environment
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Pricing — Dev Test Page
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Duplicate of the public{" "}
            <Link href="/pricing" className="underline text-amber-400 hover:text-amber-300">
              /pricing
            </Link>{" "}
            page. Use the <strong className="text-red-400">TEST PRODUCT ($1)</strong> to
            verify Stripe checkout, webhooks, and payment flows end-to-end without
            charging real amounts.
          </p>
        </div>
      </section>

      {/* Alert */}
      <div className="container mx-auto px-4 pt-8 max-w-7xl">
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Admin Use Only</AlertTitle>
          <AlertDescription className="text-red-700">
            This page is only accessible to admins via{" "}
            <code className="bg-red-100 px-1 rounded text-xs">/portal/admin/devpricetesting</code>.
            The TEST PRODUCT ($1) is a real Stripe charge — use your Stripe test-mode keys when
            testing, or be aware a $1 charge will be made in live mode.
          </AlertDescription>
        </Alert>
      </div>

      {/* Pricing Cards */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {DEV_PRICING_TIERS.map((tier) => {
              const TierIcon = tier.icon;
              const { product } = tier;

              return (
                <Card key={product.id} className={`relative flex flex-col h-full ${tier.cardClass}`}>
                  {/* Badge */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className={`px-3 py-0.5 text-xs ${tier.badgeClass}`}>
                      {tier.badgeLabel}
                    </Badge>
                  </div>

                  <CardHeader className="text-center pb-4 pt-6">
                    <div className={`mx-auto mb-3 p-3 rounded-full w-fit ${tier.iconBg}`}>
                      <TierIcon className={`h-7 w-7 ${tier.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <CardDescription className="min-h-[48px] mt-1 text-xs">
                      {product.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    {/* Price display */}
                    <div className="text-center mb-5">
                      <div className="text-4xl font-bold">
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {product.billingPeriod === "monthly"
                          ? "per month"
                          : product.billingPeriod === "annual"
                          ? "per year"
                          : "one-time payment"}
                      </div>
                      {product.type === "test-product" && (
                        <Badge className="mt-2 bg-red-100 text-red-700 border border-red-300 text-xs">
                          Stripe Test Charge
                        </Badge>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <ul className="space-y-2">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-xs">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-4">
                    <AddToCartButton
                      product={product}
                      variant="default"
                      size="lg"
                      className={`w-full ${
                        product.type === "test-product"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : product.type === "founders"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : product.type === "cmmc-cohort"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : ""
                      }`}
                      redirectToCart={true}
                    >
                      {tier.cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </AddToCartButton>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stripe info footer */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-xl font-bold mb-3">How to use this page</h2>
          <div className="space-y-2 text-sm text-muted-foreground text-left max-w-xl mx-auto">
            <p>
              1. Click <strong>Buy Test Product — $1</strong> to add it to cart and proceed through checkout.
            </p>
            <p>
              2. Use Stripe test card <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">4242 4242 4242 4242</code>, any future expiry, any CVC to simulate a successful payment.
            </p>
            <p>
              3. Use <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">4000 0000 0000 9995</code> to simulate a declined card.
            </p>
            <p>
              4. Verify the Stripe webhook fires at <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">/api/stripe/webhook</code> and the payment appears in your Stripe dashboard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
