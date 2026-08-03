"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Search, MessageSquare, GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"buyer" | "supplier" | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      if (db) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserType(userData.userType);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Welcome to the KDM Consortium!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your membership is now active. You're among an exclusive group of{" "}
          {userType === "buyer" ? "procurement professionals" : "verified suppliers"}{" "}
          positioned to compete effectively for federal contracts.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <Search className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold">
                Browse {userType === "buyer" ? "Suppliers" : "Opportunities"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start exploring matches now
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold">Connect Directly</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Message potential partners
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <GraduationCap className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold">Access Training</h3>
              <p className="text-sm text-muted-foreground mt-1">
                CMMC & procurement resources
              </p>
            </CardContent>
          </Card>
        </div>

        <Button size="lg" asChild>
          <Link href="/portal/dashboard">
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>

        <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="font-semibold mb-2">What's Next?</p>
          <ul className="text-left space-y-1 max-w-md mx-auto">
            <li>• Complete your full profile to increase visibility</li>
            <li>• {userType === "buyer" ? "Browse supplier profiles" : "Set up opportunity alerts"}</li>
            <li>• Join our next member networking event</li>
            <li>• Schedule your onboarding call with your account manager</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
