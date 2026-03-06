"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackUrl?: string;
}

export function AuthGuard({ 
  children, 
  requireAdmin = false,
  fallbackUrl = "/sign-in" 
}: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth not initialized");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push(`${fallbackUrl}?redirect=${window.location.pathname}`);
        return;
      }

      setIsAuthenticated(true);

      // If admin is required, check user role
      if (requireAdmin) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          const isAdmin = 
            idTokenResult.claims.role === "admin" ||
            idTokenResult.claims.svpRole === "platform_admin";

          if (!isAdmin) {
            setIsAuthorized(false);
            setIsLoading(false);
            router.push("/unauthorized");
            return;
          }

          setIsAuthorized(true);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAuthorized(false);
          setIsLoading(false);
          router.push("/unauthorized");
          return;
        }
      } else {
        setIsAuthorized(true);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, requireAdmin, fallbackUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && !isAuthorized)) {
    return null;
  }

  return <>{children}</>;
}
