"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Zap, Crown, Rocket } from "lucide-react";

const SUBSCRIPTION_TIERS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Get started with basic features",
    features: [
      "Create up to 3 Proof Packs",
      "Basic Pack Health scoring",
      "Community support",
      "Monthly platform updates",
    ],
    icon: Check,
    color: "text-gray-600",
  },
  {
    id: "diy",
    name: "DIY (Do It Yourself)",
    price: 99,
    description: "Self-service tools for independent SMEs",
    features: [
      "Unlimited Proof Packs",
      "Advanced Pack Health scoring",
      "Gap analysis & remediation tracking",
      "Lead matching (view only)",
      "Email support",
      "Training resources",
    ],
    icon: Zap,
    color: "text-blue-600",
    popular: false,
  },
  {
    id: "dwy",
    name: "DWY (Done With You)",
    price: 299,
    description: "Guided support from consortium partners",
    features: [
      "Everything in DIY",
      "Partner introductions (up to 5/month)",
      "Quarterly strategy sessions",
      "Priority email support",
      "Cohort access (discounted)",
      "Revenue attribution tracking",
    ],
    icon: Crown,
    color: "text-purple-600",
    popular: true,
  },
  {
    id: "dfy",
    name: "DFY (Done For You)",
    price: 599,
    description: "Full-service CMMC compliance management",
    features: [
      "Everything in DWY",
      "Unlimited partner introductions",
      "Dedicated account manager",
      "Monthly 1-on-1 sessions",
      "Priority lead routing",
      "Custom compliance roadmap",
      "24/7 priority support",
    ],
    icon: Rocket,
    color: "text-orange-600",
    popular: false,
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>("free");

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentTier(data.subscriptionTier || "free");
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
    }
  };

  const handleSelectTier = async (tierId: string) => {
    if (tierId === currentTier) return;

    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      // If selecting free tier, downgrade immediately
      if (tierId === "free") {
        const response = await fetch("/api/subscription/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tier: "free" }),
        });

        if (!response.ok) throw new Error("Failed to update subscription");

        setCurrentTier("free");
        return;
      }

      // For paid tiers, redirect to Stripe checkout
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: tierId }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message || "Failed to update subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg">
          Select the subscription tier that best fits your needs
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const Icon = tier.icon;
          const isCurrentTier = currentTier === tier.id;

          return (
            <Card
              key={tier.id}
              className={`relative ${
                tier.popular ? "border-primary shadow-lg" : ""
              } ${isCurrentTier ? "ring-2 ring-primary" : ""}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-8 w-8 ${tier.color}`} />
                  {isCurrentTier && (
                    <Badge variant="secondary">Current Plan</Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrentTier ? "outline" : tier.popular ? "default" : "secondary"}
                  onClick={() => handleSelectTier(tier.id)}
                  disabled={loading || isCurrentTier}
                >
                  {isCurrentTier ? "Current Plan" : `Select ${tier.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Need Help Choosing?</CardTitle>
          <CardDescription>
            Not sure which plan is right for you? Here's a quick guide:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Free Tier</h4>
            <p className="text-sm text-muted-foreground">
              Perfect for exploring the platform and creating your first Proof Packs
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">DIY Tier</h4>
            <p className="text-sm text-muted-foreground">
              Ideal for self-sufficient SMEs who want full access to tools and resources
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">DWY Tier</h4>
            <p className="text-sm text-muted-foreground">
              Best for SMEs seeking partner connections and strategic guidance
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">DFY Tier</h4>
            <p className="text-sm text-muted-foreground">
              Complete solution for SMEs who want dedicated support and priority access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
