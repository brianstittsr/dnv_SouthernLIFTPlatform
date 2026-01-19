"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, CreditCard, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const TIER_INFO: Record<string, { name: string; price: number; description: string }> = {
  diy: { name: "DIY (Do It Yourself)", price: 99, description: "Self-service Proof Pack creation" },
  dwy: { name: "DWY (Done With You)", price: 299, description: "Guided Proof Pack creation with partner support" },
  dfy: { name: "DFY (Done For You)", price: 599, description: "Full-service Proof Pack creation" },
};

function CheckoutForm({ tier, clientSecret }: { tier: string; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const currentUser = auth?.currentUser;
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/portal/subscription/success?tier=${tier}`,
          receipt_email: email,
        },
      });

      if (submitError) {
        setError(submitError.message || "Payment failed");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const tierInfo = TIER_INFO[tier];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Receipt will be sent to this email address
        </p>
      </div>

      <Separator />

      {/* Payment Method */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Payment Method
        </Label>
        <div className="border rounded-lg p-4 bg-background">
          <PaymentElement />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || loading}
      >
        {loading ? (
          "Processing..."
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Subscribe for ${tierInfo.price}/month
          </>
        )}
      </Button>

      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>By subscribing, you authorize KDM Peach Freestyle Sandbox to charge you according to the terms until you cancel.</p>
        <p className="flex items-center justify-center gap-1">
          <Lock className="h-3 w-3" />
          Secure payment powered by Stripe
        </p>
      </div>
    </form>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get("tier") || "";
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tier || !TIER_INFO[tier]) {
      router.push("/portal/subscription");
      return;
    }

    createPaymentIntent();
  }, [tier]);

  const createPaymentIntent = async () => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch("/api/subscription/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (err: any) {
      setError(err.message || "Failed to initialize checkout");
    } finally {
      setLoading(false);
    }
  };

  const tierInfo = TIER_INFO[tier];

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading checkout...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !tierInfo) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error || "Invalid subscription tier"}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/portal/subscription")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subscription Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/portal/subscription")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
          <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
          <p className="text-muted-foreground">
            Subscribe to {tierInfo.name} and unlock premium features
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Summary */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">{tierInfo.name}</p>
                <p className="text-sm text-muted-foreground">{tierInfo.description}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly subscription</span>
                  <span>${tierInfo.price}.00</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total due today</span>
                  <span>${tierInfo.price}.00</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Cancel anytime, no questions asked</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Prorated billing when you upgrade</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Access to all tier features immediately</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Enter your payment information to complete your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#0f172a",
                        colorBackground: "#ffffff",
                        colorText: "#0f172a",
                        colorDanger: "#ef4444",
                        fontFamily: "system-ui, sans-serif",
                        borderRadius: "0.5rem",
                      },
                    },
                  }}
                >
                  <CheckoutForm tier={tier} clientSecret={clientSecret} />
                </Elements>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Initializing payment form...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading checkout...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
