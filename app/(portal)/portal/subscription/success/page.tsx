"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const TIER_INFO: Record<string, { name: string; price: number }> = {
  diy: { name: "DIY (Do It Yourself)", price: 99 },
  dwy: { name: "DWY (Done With You)", price: 299 },
  dfy: { name: "DFY (Done For You)", price: 599 },
};

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get("tier") || "";
  const [updating, setUpdating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    updateSubscription();
  }, []);

  const updateSubscription = async () => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch("/api/subscription/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        throw new Error("Failed to update subscription");
      }

      setUpdating(false);
    } catch (err: any) {
      setError(err.message || "Failed to update subscription");
      setUpdating(false);
    }
  };

  const tierInfo = TIER_INFO[tier];

  if (updating) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-semibold mb-2">Processing your subscription...</p>
              <p className="text-muted-foreground">Please wait while we activate your account</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/portal/subscription")}>
            Back to Subscription Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Subscription Activated!</CardTitle>
            <CardDescription className="text-base">
              Welcome to {tierInfo?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold">{tierInfo?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">${tierInfo?.price}/month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Active
                </span>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>What's next?</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Your subscription is now active and all features are unlocked</li>
                  <li>• A receipt has been sent to your email</li>
                  <li>• You can manage your subscription anytime from your profile</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => router.push("/portal/proof-packs")}
              >
                Create Proof Pack
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/portal/subscription")}
              >
                View Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-semibold mb-2">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
