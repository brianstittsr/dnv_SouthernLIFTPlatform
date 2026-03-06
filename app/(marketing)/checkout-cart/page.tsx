"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingCart, ArrowLeft, CreditCard } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CheckoutCartPage() {
  const router = useRouter();
  const { items, total, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process checkout");
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-4xl">
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Add some products to your cart to get started
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/consortium">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  View Consortium
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/cmmc-training">View CMMC Training</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
                </CardTitle>
                <CardDescription>Review your selected products</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id}>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.product.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {item.product.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-primary">✓</span>
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        {item.product.features.length > 4 && (
                          <p className="text-sm text-muted-foreground">
                            + {item.product.features.length - 4} more features
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold">
                          {formatPrice(item.product.price)}
                        </div>
                        {item.product.billingPeriod && item.product.billingPeriod !== 'one-time' && (
                          <div className="text-sm text-muted-foreground">
                            per {item.product.billingPeriod === 'monthly' ? 'month' : 'year'}
                          </div>
                        )}
                        {item.product.billingPeriod === 'one-time' && (
                          <div className="text-sm text-muted-foreground">one-time payment</div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.product.name}</span>
                      <span className="font-medium">{formatPrice(item.product.price)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Secure payment processing powered by Stripe
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : "Proceed to Checkout"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                  disabled={isProcessing}
                >
                  Clear Cart
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
