"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Check, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import { UserType, BUYER_PRICING, SUPPLIER_PRICING } from "@/lib/types/consortium";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      setUserId(user.uid);

      if (db) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserType(userData.userType as UserType);

          if (!userData.profileComplete) {
            router.push("/portal/dashboard");
          }

          if (userData.paymentComplete) {
            router.push("/portal/dashboard");
          }
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleCheckout = async (plan: "monthly" | "annual") => {
    if (!userId || !userType) {
      toast.error("User information not found");
      return;
    }

    setCheckoutLoading(plan);

    try {
      const user = auth?.currentUser;
      if (!user) {
        throw new Error("Not authenticated");
      }

      const token = await user.getIdToken();

      const response = await fetch("/api/stripe/consortium-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, userType }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Stripe not loaded");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
      setCheckoutLoading(null);
    }
  };

  if (loading || !userType) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pricing = userType === "buyer" ? BUYER_PRICING : SUPPLIER_PRICING;
  const monthlySavings = userType === "buyer" ? 718 : 478;

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="max-w-lg mx-auto text-center mb-8">
        <Badge className="mb-2 bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Profile Complete
        </Badge>
        <h1 className="text-3xl font-bold">Activate Your Membership</h1>
        <p className="text-muted-foreground mt-2">
          Subscribe to unlock full platform access and start connecting
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="relative">
          <CardHeader>
            <CardTitle>Monthly</CardTitle>
            <CardDescription>Flexible, cancel anytime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              ${pricing.monthly}
              <span className="text-lg font-normal text-muted-foreground">/month</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                Full platform access
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                Unlimited profile views
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                Direct messaging
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                RFP/opportunity alerts
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                CMMC training resources
              </li>
            </ul>
            <Button
              className="w-full mt-6"
              onClick={() => handleCheckout("monthly")}
              disabled={!!checkoutLoading}
            >
              {checkoutLoading === "monthly" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Subscribe Monthly"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="relative border-primary shadow-lg">
          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white">
            Best Value - Save 20%
          </Badge>
          <CardHeader className="pt-8">
            <CardTitle>Annual</CardTitle>
            <CardDescription>Commit to growth, maximize savings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              ${pricing.annual}
              <span className="text-lg font-normal text-muted-foreground">/year</span>
            </div>
            <div className="text-sm text-green-600 mt-1 font-semibold">
              Save ${monthlySavings} per year
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                Everything in Monthly
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                Priority search ranking
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                Dedicated account manager
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                Early access to new features
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                Quarterly strategy sessions
              </li>
            </ul>
            <Button
              className="w-full mt-6"
              variant="default"
              onClick={() => handleCheckout("annual")}
              disabled={!!checkoutLoading}
            >
              {checkoutLoading === "annual" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Subscribe Annual"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>All plans include a 30-day money-back guarantee</p>
        <p className="mt-1">Secure payment processing by Stripe</p>
      </div>
    </div>
  );
}
