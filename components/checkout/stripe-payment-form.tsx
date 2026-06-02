"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Lock, User, Mail } from "lucide-react";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  productName: string;
  priceId?: string | null;
  isRecurring?: boolean;
  userEmail?: string;
}

function CheckoutForm({ 
  amount, 
  productName,
  subscriptionId,
  isRecurring,
  userEmail,
}: { 
  amount: number; 
  productName: string;
  subscriptionId?: string | null;
  isRecurring?: boolean;
  userEmail?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isElementsReady, setIsElementsReady] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: userEmail || "",
    password: "",
    confirmPassword: "",
  });

  // Determine if this is a SetupIntent (subscription) or PaymentIntent (one-time)
  const isSetupIntent = subscriptionId?.startsWith('seti_') || false;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Valid email is required");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!stripe || !elements) {
      toast.error("Payment system is still loading. Please wait a moment and try again.");
      return;
    }

    if (!isElementsReady) {
      toast.error("Payment form is still initializing. Please wait...");
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error("Card element not found. Please refresh and try again.");
        setIsProcessing(false);
        return;
      }

      let confirmError: { message?: string } | null = null;
      let intentId: string | null = null;

      // Validate client secret format - must contain _secret_ to be a valid client secret
      if (!subscriptionId || !subscriptionId.includes('_secret_')) {
        toast.error("Invalid payment session. Please go back and try again.");
        console.error("Invalid client secret - missing _secret_ segment:", subscriptionId?.substring(0, 30));
        setIsProcessing(false);
        return;
      }

      // Use appropriate confirmation method based on intent type
      if (isSetupIntent) {
        // SetupIntent for subscription payments
        console.log("Using confirmCardSetup for SetupIntent:", subscriptionId?.substring(0, 25));
        const { error, setupIntent } = await stripe.confirmCardSetup(
          subscriptionId!,
          { payment_method: { card: cardElement, billing_details: { email: formData.email, name: `${formData.firstName} ${formData.lastName}` } } }
        );
        confirmError = error || null;
        if (setupIntent?.status === "succeeded" && setupIntent.payment_method) {
          intentId = setupIntent.id;
          const subResponse = await fetch("/api/checkout/confirm-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              setupIntentId: setupIntent.id,
              paymentMethodId: setupIntent.payment_method,
              email: formData.email,
            }),
          });
          if (!subResponse.ok) {
            const subError = await subResponse.json();
            console.error("Subscription creation failed:", subError);
            throw new Error(subError.error || "Payment processing failed. Please try again.");
          }
        }
      } else {
        // PaymentIntent for one-time payments (e.g., CMMC cohort)
        console.log("Using confirmCardPayment for PaymentIntent:", subscriptionId?.substring(0, 25));
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          subscriptionId!,
          { payment_method: { card: cardElement, billing_details: { email: formData.email, name: `${formData.firstName} ${formData.lastName}` } } }
        );
        confirmError = error || null;
        if (paymentIntent?.status === "succeeded") {
          intentId = paymentIntent.id;
        }
      }

      if (confirmError) {
        console.error("Stripe error:", confirmError);
        toast.error(confirmError.message || "Payment failed. Please check your card details and try again.");
        setIsProcessing(false);
      } else if (intentId) {
        try {
          const signupResponse = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              membershipType: "kdm-consortium",
              paymentIntentId: intentId,
            }),
          });

          let userId: string | null = null;
          if (signupResponse.ok) {
            const signupData = await signupResponse.json();
            userId = signupData.userId;
          } else {
            const error = await signupResponse.json();
            throw new Error(error.error || "Failed to create account");
          }

          await fetch("/api/checkout/record-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentIntentId: intentId,
              userId,
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              amount,
              currency: "usd",
              productName,
              status: "succeeded",
              membershipType: "kdm-consortium",
            }),
          });

          const emailResult = await fetch("/api/checkout/send-confirmation-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              paymentIntentId: intentId,
              amount,
              productName,
            }),
          });
          
          if (!emailResult.ok) {
            console.warn("Confirmation email failed to send - user account was still created");
          }

          toast.success("Account created and payment successful!");
          router.push(`/checkout-success?session_id=${intentId}`);
        } catch (signupError) {
          console.error("Account creation error:", signupError);
          toast.error(signupError instanceof Error ? signupError.message : "Failed to create account");
          router.push(`/checkout-success?session_id=${intentId}`);
        }
      } else {
        console.error("No intent ID returned from Stripe");
        toast.error("Payment failed. No transaction details received.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(`Payment error: ${errorMessage}. Please try again or contact support.`);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Registration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create Your KDM Consortium Account
          </CardTitle>
          <CardDescription>
            Set up your account to access exclusive member benefits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isProcessing}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
              <p className="text-xs text-muted-foreground">Min. 8 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-900">
              ✓ You will be tagged as a <strong>KDM {productName.includes("CMMC") ? "CMMC Cohort Member" : "Consortium Member"}</strong> upon successful payment
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
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
              <strong>Secure Payment:</strong> Enter your credit or debit card details below. Your card will be charged ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} per month for your KDM Consortium Membership.
            </p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <CardElement
              onReady={() => setIsElementsReady(true)}
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#1f2937",
                    fontFamily: "system-ui, sans-serif",
                    "::placeholder": { color: "#9ca3af" },
                    iconColor: "#2563eb",
                  },
                  invalid: { color: "#ef4444", iconColor: "#ef4444" },
                },
                hidePostalCode: false,
              }}
            />
          </div>
          {!isElementsReady && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading card form...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={!stripe || !isElementsReady || isProcessing || !subscriptionId}
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
            Create Account & Pay ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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

export function StripePaymentForm({ 
  clientSecret, 
  amount, 
  productName,
  priceId,
  isRecurring,
  userEmail,
}: PaymentFormProps) {
  // Validate clientSecret
  if (!clientSecret) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium mb-2">Payment System Error</p>
        <p className="text-red-600 text-sm mb-4">
          Unable to initialize payment form. The payment session may have expired.
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        amount={amount} 
        productName={productName}
        subscriptionId={clientSecret}
        isRecurring={isRecurring}
        userEmail={userEmail}
      />
    </Elements>
  );
}
