"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CreditCard, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  DollarSign
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS, type PaymentPlanDoc } from "@/lib/schema";
import { format } from "date-fns";
import { toast } from "sonner";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("planId");
  
  const [plan, setPlan] = useState<PaymentPlanDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payAmount, setPayAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (planId) {
      fetchPlan();
    } else {
      setError("No payment plan specified. Please check your link.");
      setLoading(false);
    }
  }, [planId]);

  const fetchPlan = async () => {
    if (!db || !planId) return;
    try {
      setLoading(true);
      const planRef = doc(db, COLLECTIONS.PAYMENT_PLANS, planId);
      const planSnap = await getDoc(planRef);
      
      if (planSnap.exists()) {
        const data = { id: planSnap.id, ...planSnap.data() } as PaymentPlanDoc;
        setPlan(data);
        setPayAmount(data.remainingBalance.toFixed(2));
      } else {
        setError("Payment plan not found. It may have been completed or cancelled.");
      }
    } catch (err) {
      console.error("Error fetching plan:", err);
      setError("Failed to load payment details.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!plan || !payAmount) return;
    
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (amount > plan.remainingBalance) {
      toast.error(`Amount exceeds remaining balance of $${plan.remainingBalance.toFixed(2)}`);
      return;
    }

    setProcessing(true);
    try {
      if (!db) throw new Error("Database not initialized");
      // Fetch user info for the session
      const userRef = doc(db, COLLECTIONS.USERS, plan.userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const response = await fetch("/api/payments/partial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: plan.entityType,
          entityId: plan.entityId,
          entityName: plan.entityName,
          totalAmount: Math.round(plan.totalAmount * 100),
          paymentAmount: Math.round(amount * 100),
          userId: plan.userId,
          userName: userData?.name || "",
          userEmail: userData?.email || "",
          paymentPlanId: plan.id,
          successUrl: `${window.location.origin}/portal/payments/success?planId=${plan.id}`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to initiate payment");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-2xl py-10 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/portal")}>
          Return to Portal
        </Button>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="container max-w-2xl py-10">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Payment Balance</CardTitle>
              <CardDescription>Settle your remaining balance for {plan.entityName}</CardDescription>
            </div>
            <Badge variant={plan.remainingBalance > 0 ? "destructive" : "secondary"}>
              {plan.remainingBalance > 0 ? "Balance Due" : "Completed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Total Cost</Label>
              <p className="text-xl font-bold">${plan.totalAmount.toFixed(2)}</p>
            </div>
            <div className="space-y-1 text-right">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Amount Paid</Label>
              <p className="text-xl font-bold text-green-600">${plan.paidAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border border-dashed flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Final Due Date</p>
                <p className="text-xs text-muted-foreground">
                  {format(plan.dueDate instanceof Timestamp ? plan.dueDate.toDate() : new Date(plan.dueDate), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-red-500">Remaining</p>
              <p className="text-lg font-bold text-red-500">${plan.remainingBalance.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payAmount">Payment Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="payAmount"
                  type="number"
                  step="0.01"
                  className="pl-9 text-lg font-medium"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  disabled={processing || plan.remainingBalance <= 0}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                You can pay the full amount or make a smaller installment.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 bg-muted/20 border-t pt-6">
          <Button 
            className="w-full text-lg h-12" 
            size="lg" 
            disabled={processing || plan.remainingBalance <= 0 || !payAmount}
            onClick={handlePayment}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay ${parseFloat(payAmount || "0").toFixed(2)} Now
              </>
            )}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => router.push("/portal")}>
            Cancel and Return
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-500" /> 
          Secure payment powered by Stripe. Your data is encrypted.
        </p>
      </div>
    </div>
  );
}

export default function PayRemainingBalancePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <PaymentContent />
    </Suspense>
  );
}
