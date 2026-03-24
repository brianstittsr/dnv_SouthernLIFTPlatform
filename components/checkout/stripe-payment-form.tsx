"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  productName: string;
}

function CheckoutForm({ amount, productName }: { amount: number; productName: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-success?product=cmmc-cohort`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        router.push(`/checkout-success?session_id=${paymentIntent.id}&product=cmmc-cohort`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Choose your payment method - Credit card or Buy now, pay later options available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900">
              <strong>Payment Options:</strong> We accept credit cards, digital wallets (Apple Pay, Amazon Pay, Link), buy now, pay later (Afterpay, Klarna), bank transfers, and ACH direct debit.
            </p>
          </div>
          <PaymentElement 
            options={{
              layout: "tabs",
              paymentMethodOrder: [
                "card",
                "amazon_pay",
                "apple_pay",
                "link",
                "afterpay_clearpay",
                "klarna",
                "us_bank_account",
                "bank_transfer",
                "bancontact",
                "eps",
              ],
              wallets: {
                applePay: "auto",
                googlePay: "never",
              },
              fields: {
                billingDetails: "auto",
              },
            }}
          />
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Pay ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </>
        )}
      </Button>

      <div className="text-center space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Lock className="h-4 w-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </form>
  );
}

export function StripePaymentForm({ clientSecret, amount, productName }: PaymentFormProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#2563eb",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#ef4444",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm amount={amount} productName={productName} />
    </Elements>
  );
}
