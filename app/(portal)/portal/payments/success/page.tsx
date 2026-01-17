"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Home, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { COLLECTIONS, type PaymentPlanDoc } from "@/lib/schema";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("planId");
  const [plan, setPlan] = useState<PaymentPlanDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      if (!planId || !db) {
        setLoading(false);
        return;
      }

      try {
        const planRef = doc(db, COLLECTIONS.PAYMENT_PLANS, planId);
        const planSnap = await getDoc(planRef);
        if (planSnap.exists()) {
          setPlan({ id: planSnap.id, ...planSnap.data() } as PaymentPlanDoc);
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [planId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12 mx-auto px-4">
      <Card className="border-t-4 border-t-green-500">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-green-700">Payment Successful!</CardTitle>
          <CardDescription className="text-lg">
            Thank you for your payment. Your balance has been updated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {plan && (
            <div className="bg-muted p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Entity</span>
                <span className="font-semibold">{plan.entityName}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">${plan.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold text-green-600">${plan.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold">Remaining Balance</span>
                <span className={`text-lg font-bold ${plan.remainingBalance > 0 ? "text-red-500" : "text-green-600"}`}>
                  ${plan.remainingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <p className="text-center text-muted-foreground">
            A receipt has been sent to your email address. You can view your payment history and remaining balances in your portal.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button asChild className="w-full sm:flex-1">
            <Link href="/portal/dashboard">
              <Home className="mr-2 h-4 w-4" /> Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:flex-1">
            <Link href="/portal/payments">
              <CreditCard className="mr-2 h-4 w-4" /> View Payments
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
