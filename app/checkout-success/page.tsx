"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Mail,
  Calendar,
  Shield,
  ArrowRight,
  Users,
  Loader2,
} from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const product = searchParams.get("product");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Processing your registration...</p>
        </div>
      </div>
    );
  }

  const isCMMCCohort = product === 'cmmc-cohort';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Image src="/kdm-logo.png" alt="KDM & Associates" width={120} height={40} className="object-contain" />
            <Separator orientation="vertical" className="h-8" />
            <Image src="/VPlus_logo.webp" alt="KDM & Associates" width={120} height={40} className="object-contain" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-xl text-muted-foreground">
              {isCMMCCohort 
                ? "Thank you for joining the KDM CMMC Cohort 2026" 
                : "Thank you for your purchase"}
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                {isCMMCCohort ? "Your Registration Details" : "Order Confirmation"}
              </CardTitle>
              <CardDescription>A confirmation email has been sent to your inbox</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Confirmation Email Sent</p>
                  <p className="text-sm text-muted-foreground">
                    Check your inbox for {isCMMCCohort ? "registration details and next steps" : "your receipt and order details"}.
                  </p>
                </div>
              </div>
              
              {isCMMCCohort && (
                <>
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Cohort Start Date</p>
                      <p className="text-sm text-muted-foreground">
                        You will receive a calendar invite within 24-48 hours with the program schedule.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Welcome Package</p>
                      <p className="text-sm text-muted-foreground">
                        Access to the cohort portal and materials will be provided before the start date.
                      </p>
                    </div>
                  </div>
                </>
              )}
              
              {sessionId && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Transaction ID: <span className="font-mono">{sessionId}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {isCMMCCohort && (
            <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Confirmation Email (Within 1 hour)</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive a detailed confirmation with payment receipt and program overview.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Portal Access (Within 24-48 hours)</p>
                    <p className="text-sm text-muted-foreground">
                      Access credentials to the cohort learning portal and pre-program materials.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Kickoff Meeting (Before program start)</p>
                    <p className="text-sm text-muted-foreground">
                      Calendar invite for the cohort orientation and program kickoff session.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" size="lg">Return to Home</Button>
            </Link>
            {isCMMCCohort && (
              <Link href="/cmmc-training">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Learn More About CMMC
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Questions? Contact us at{" "}
              <a href="mailto:info@kdmassociates.com" className="text-blue-600 hover:underline">
                info@kdmassociates.com
              </a>
            </p>
            <p className="mt-2">© 2026 KDM & Associates. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
