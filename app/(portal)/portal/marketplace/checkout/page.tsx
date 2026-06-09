"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Lock, CheckCircle, AlertCircle, Package, DollarSign } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS, type MarketPlaceOrderDoc } from "@/lib/schema";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    line1: profile.company || "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const handlePayment = async () => {
    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!auth?.currentUser || !db) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;

      // Create order document
      const orderData: Omit<MarketPlaceOrderDoc, "id"> = {
        orderNumber,
        buyerId: auth.currentUser.uid,
        buyerEmail: profile.email,
        buyerName: `${profile.firstName} ${profile.lastName}`,
        buyerCompany: profile.company,
        totalAmount: getTotalPrice(),
        currency: "USD",
        paymentMethod: paymentMethod === "card" ? "stripe" : "invoice",
        paymentStatus: "completed",
        billingAddress: {
          line1: billingAddress.line1,
          line2: billingAddress.line2,
          city: billingAddress.city,
          state: billingAddress.state,
          zip: billingAddress.zip,
          country: billingAddress.country,
        },
        items: items.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          price: item.price,
          priceUnit: item.priceUnit,
          quantity: item.quantity,
          seller: item.seller,
          sellerId: item.sellerId,
        })),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Save order to Firestore
      const orderRef = await addDoc(
        collection(db, COLLECTIONS.MARKETPLACE_ORDERS),
        orderData
      );

      console.log("Order created with ID:", orderRef.id);

      // Clear cart after successful payment
      clearCart();

      toast.success("Payment successful! Your order has been processed.");
      router.push(`/portal/marketplace/orders?orderId=${orderRef.id}`);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add items to your cart before checkout
            </p>
            <Button onClick={() => router.push("/portal/marketplace/directory")}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Button>

      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Enter your billing details for this purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    defaultValue={profile.firstName}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    defaultValue={profile.lastName}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  defaultValue={profile.email}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  defaultValue={profile.company}
                  placeholder="Acme Inc"
                />
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
              <CardDescription>
                Where should we send the invoice?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={billingAddress.line1}
                  onChange={(e) =>
                    setBillingAddress({ ...billingAddress, line1: e.target.value })
                  }
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
                <Input
                  id="address2"
                  value={billingAddress.line2}
                  onChange={(e) =>
                    setBillingAddress({ ...billingAddress, line2: e.target.value })
                  }
                  placeholder="Apt 4B"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={billingAddress.city}
                    onChange={(e) =>
                      setBillingAddress({ ...billingAddress, city: e.target.value })
                    }
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={billingAddress.state}
                    onChange={(e) =>
                      setBillingAddress({ ...billingAddress, state: e.target.value })
                    }
                    placeholder="NY"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={billingAddress.zip}
                    onChange={(e) =>
                      setBillingAddress({ ...billingAddress, zip: e.target.value })
                    }
                    placeholder="10001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Secure payment powered by Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className="flex-1"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Credit Card
                </Button>
                <Button
                  variant={paymentMethod === "invoice" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("invoice")}
                  className="flex-1"
                >
                  Invoice
                </Button>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      value={cardDetails.name}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={cardDetails.number}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, number: e.target.value })
                      }
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        value={cardDetails.expiry}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, expiry: e.target.value })
                        }
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, cvv: e.target.value })
                        }
                        placeholder="123"
                        maxLength={4}
                        type="password"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>
                </div>
              )}

              {paymentMethod === "invoice" && (
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    You will receive an invoice via email within 24 hours. Payment is due within 30 days.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Invoice Details</p>
                    <p className="text-sm text-muted-foreground">
                      Invoice will be sent to: {profile.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Payment terms: Net 30
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal cursor-pointer"
                  >
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    By completing this purchase, you agree to our terms of service
                    and privacy policy. You will be charged the total amount shown
                    below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""} in cart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  {/* Item Image */}
                  {item.image ? (
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.seller}</p>
                    <Badge variant="outline" className="mt-1 text-xs capitalize">
                      {item.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${getTotalPrice().toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={loading || !agreeToTerms}
              >
                {loading ? "Processing..." : `Pay $${getTotalPrice().toLocaleString()}`}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secure checkout powered by Stripe</span>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Info */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                  <DollarSign className="h-4 w-4" />
                  <span>KDM Consortium Revenue Share</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  A portion of this purchase supports the KDM Consortium platform,
                  enabling continued development of tools and resources for government
                  contractors.
                </p>
                <Separator className="bg-blue-200 dark:bg-blue-800" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Instant access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Email confirmation</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
