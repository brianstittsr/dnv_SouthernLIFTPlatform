"use client";

import { useEffect, useState } from "react";
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

export default function CheckoutSuccessPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Image src="/kdm-logo.png" alt="KDM & Associates" width={120} height={40} className="object-contain" />
            <Separator orientation="vertical" className="h-8" />
            <Image src="/VPlus_logo.webp" alt="Strategic Value Plus" width={120} height={40} className="object-contain" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Registration Successful!</h1>
            <p className="text-xl text-muted-foreground">Thank you for joining the KDM CMMC Cohort Program</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Your Registration Details
              </CardTitle>
              <CardDescription>A confirmation email has been sent to your inbox</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Confirmation Email Sent</p>
                  <p className="text-sm text-muted-foreground">
                    Check your inbox for registration details and next steps.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Cohort Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    You will receive a calendar invite within 24-48 hours.
                  </p>
                </div>
              </div>
              {sessionId && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Transaction ID: <span className="font-mono">{sessionId}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/"><Button variant="outline" size="lg">Return to Home</Button></Link>
            <Link href="/cmmc-training">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Learn More About CMMC<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
