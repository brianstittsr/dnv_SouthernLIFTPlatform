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
    description: "Access platform and basic features",
    features: [
      "Create draft Proof Packs (cannot publish)",
      "View educational content and resources",
      "Register for free events",
      "Limited to 1 Proof Pack draft",
      "No buyer introductions",
      "Community support only",
    ],
    icon: Check,
    color: "text-gray-600",
  },
  {
    id: "diy",
    name: "DIY (Do It Yourself)",
    price: 99,
    description: "Self-service Proof Pack creation",
    features: [
      "Publish up to 3 Proof Packs",
      "Pack Health scoring and gap analysis",
      "Access to QA review queue",
      "Eligible for buyer introductions (if Pack Health ≥70)",
      "Register for paid events (discounted)",
      "Email support (48-hour response)",
    ],
    icon: Zap,
    color: "text-blue-600",
    popular: false,
  },
  {
    id: "dwy",
    name: "DWY (Done With You)",
    price: 299,
    description: "Guided Proof Pack creation with partner support",
    features: [
      "Publish up to 10 Proof Packs",
      "Priority QA review (24-hour turnaround)",
      "Monthly strategy call with consortium partner",
      "Priority buyer introduction matching",
      "Free access to 2 events per year",
      "Priority email support (24-hour response)",
    ],
    icon: Crown,
    color: "text-purple-600",
    popular: true,
  },
  {
    id: "dfy",
    name: "DFY (Done For You)",
    price: 599,
    description: "Full-service Proof Pack creation by consortium partners",
    features: [
      "Unlimited Proof Packs",
      "White-glove QA review (same-day turnaround)",
      "Bi-weekly strategy calls",
      "Dedicated buyer relationship manager",
      "Free access to all events",
      "Phone + email support (4-hour response)",
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
        <h1 className="text-4xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-muted-foreground text-lg">
          Choose the tier that matches your business needs and growth stage
        </p>
      </div>

      {currentTier !== "free" && (
        <Alert className="mb-6">
          <AlertDescription>
            <strong>Current Plan: {SUBSCRIPTION_TIERS.find(t => t.id === currentTier)?.name}</strong>
            {" "}- You can upgrade or downgrade your subscription at any time.
          </AlertDescription>
        </Alert>
      )}

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
                  {loading ? "Processing..." : isCurrentTier ? "Current Plan" : tier.id === "free" ? "Downgrade to Free" : "Upgrade to " + tier.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
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
                Perfect for exploring the platform and creating draft Proof Packs before committing
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">DIY Tier ($99/mo)</h4>
              <p className="text-sm text-muted-foreground">
                Ideal for self-sufficient SMEs ready to publish packs and access buyer introductions
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">DWY Tier ($299/mo)</h4>
              <p className="text-sm text-muted-foreground">
                Best for SMEs seeking consortium partner guidance and priority matching
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">DFY Tier ($599/mo)</h4>
              <p className="text-sm text-muted-foreground">
                Complete white-glove solution with dedicated support and unlimited packs
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Key Differences</CardTitle>
            <CardDescription>
              Compare what matters most across tiers:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Proof Pack Limits</h4>
              <p className="text-sm text-muted-foreground">
                Free: 1 draft only • DIY: 3 published • DWY: 10 published • DFY: Unlimited
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">QA Review Speed</h4>
              <p className="text-sm text-muted-foreground">
                Free: N/A • DIY: Standard queue • DWY: 24-hour • DFY: Same-day
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Buyer Introductions</h4>
              <p className="text-sm text-muted-foreground">
                Free: None • DIY: Eligible if Pack Health ≥70 • DWY: Priority matching • DFY: Dedicated manager
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Support Response Time</h4>
              <p className="text-sm text-muted-foreground">
                Free: Community only • DIY: 48 hours • DWY: 24 hours • DFY: 4 hours (phone + email)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Upgrade Anytime</CardTitle>
          <CardDescription>
            All subscriptions are month-to-month with no long-term commitment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Start with the tier that fits your current needs and upgrade as your business grows. 
            Downgrade anytime if you need to scale back. All your Proof Packs and data remain accessible.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-600" />
            <span>No setup fees or hidden charges</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Cancel anytime, no questions asked</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Prorated billing when you upgrade mid-cycle</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
