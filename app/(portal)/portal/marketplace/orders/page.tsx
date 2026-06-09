"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Button variant="ghost" onClick={() => router.push("/portal/marketplace/directory")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Button>

      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm font-semibold mb-2">Order Details</p>
              <p className="text-sm text-muted-foreground">
                Order ID: #ORD-{Date.now()}
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={() => router.push("/portal/marketplace/directory")}>
                Continue Shopping
              </Button>
              <Button variant="outline" onClick={() => router.push("/portal")}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
