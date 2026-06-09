"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, CreditCard, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

// Mock subscription data - in production this would come from Firestore/Stripe
const MOCK_SUBSCRIPTIONS = [
  {
    id: "sub_123",
    planName: "Consortium Membership - Core Capture",
    status: "active",
    price: 1250,
    interval: "month",
    currentPeriodStart: new Date("2024-06-01"),
    currentPeriodEnd: new Date("2024-07-01"),
    cancelAtPeriodEnd: false,
    stripePriceId: "price_core_capture_monthly",
  },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState(MOCK_SUBSCRIPTIONS);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancelSubscription = async () => {
    if (!cancellingId) return;

    setLoading(true);
    try {
      // Simulate API call to cancel subscription
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update subscription to cancel at period end
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === cancellingId
            ? { ...sub, cancelAtPeriodEnd: true }
            : sub
        )
      );

      toast.success("Subscription will be cancelled at the end of the current billing period");
      setShowCancelDialog(false);
      setCancellingId(null);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    setLoading(true);
    try {
      // Simulate API call to reactivate subscription
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === subscriptionId
            ? { ...sub, cancelAtPeriodEnd: false }
            : sub
        )
      );

      toast.success("Subscription reactivated successfully");
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast.error("Failed to reactivate subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">
          Manage your active subscriptions and billing
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No active subscriptions</h3>
            <p className="text-muted-foreground mb-4">
              Browse the marketplace to find services and subscriptions
            </p>
            <Button onClick={() => (window.location.href = "/portal/marketplace/directory")}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{subscription.planName}</CardTitle>
                    <CardDescription className="mt-1">
                      ${subscription.price.toLocaleString()}/{subscription.interval}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      subscription.cancelAtPeriodEnd
                        ? "destructive"
                        : subscription.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {subscription.cancelAtPeriodEnd
                      ? "Cancelling"
                      : subscription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cancellation Warning */}
                {subscription.cancelAtPeriodEnd && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-semibold">
                          Subscription will be cancelled on{" "}
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                        <p className="text-sm">
                          You will continue to have access until the end of your
                          current billing period. After that date, your subscription
                          will not be renewed.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Subscription Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Current Period:</span>
                      <span className="font-medium">
                        {formatDate(subscription.currentPeriodStart)} -{" "}
                        {formatDate(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Billing:</span>
                      <span className="font-medium">
                        ${subscription.price.toLocaleString()}/{subscription.interval}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium capitalize">
                        {subscription.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {subscription.cancelAtPeriodEnd ? (
                        <X className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-muted-foreground">Auto-renew:</span>
                      <span className="font-medium">
                        {subscription.cancelAtPeriodEnd ? "Disabled" : "Enabled"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  {subscription.cancelAtPeriodEnd ? (
                    <Button
                      variant="outline"
                      onClick={() => handleReactivateSubscription(subscription.id)}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Reactivate Subscription
                    </Button>
                  ) : (
                    <Dialog
                      open={showCancelDialog && cancellingId === subscription.id}
                      onOpenChange={(open) => {
                        setShowCancelDialog(open);
                        if (!open) setCancellingId(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCancellingId(subscription.id);
                            setShowCancelDialog(true);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel Subscription
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Subscription?</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to cancel your{" "}
                            {subscription.planName}? Your subscription will remain
                            active until the end of your current billing period on{" "}
                            {formatDate(subscription.currentPeriodEnd)}. After that
                            date, you will lose access to all subscription benefits.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowCancelDialog(false);
                              setCancellingId(null);
                            }}
                          >
                            Keep Subscription
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleCancelSubscription}
                            disabled={loading}
                          >
                            {loading ? "Cancelling..." : "Cancel Subscription"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => (window.location.href = "/portal/marketplace/directory")}
                  >
                    View Other Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Cancellation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • When you cancel a subscription, it will remain active until the end
            of your current billing period.
          </p>
          <p>
            • You can reactivate your subscription at any time before the
            cancellation date.
          </p>
          <p>
            • After cancellation, you will retain access until the end of the
            billing period you've already paid for.
          </p>
          <p>
            • You can always resubscribe from the marketplace if you change your
            mind.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
