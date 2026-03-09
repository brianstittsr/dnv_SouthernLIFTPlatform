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
      router.push(fallbackUrl);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("AuthGuard: No user logged in, redirecting to sign-in");
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push(`${fallbackUrl}?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      console.log("AuthGuard: User authenticated:", user.email);
      setIsAuthenticated(true);

      // If admin is required, check user role
      if (requireAdmin) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          const isAdmin = 
            idTokenResult.claims.role === "admin" ||
            idTokenResult.claims.role === "platform_admin" ||
            idTokenResult.claims.svpRole === "platform_admin";

          console.log("AuthGuard: Admin check -", {
            email: user.email,
            claims: idTokenResult.claims,
            isAdmin
          });

          if (!isAdmin) {
            console.warn("AuthGuard: User lacks admin privileges, redirecting to unauthorized");
            setIsAuthorized(false);
            setIsLoading(false);
            router.push("/unauthorized");
            return;
          }

          console.log("AuthGuard: Admin access granted");
          setIsAuthorized(true);
        } catch (error) {
          console.error("AuthGuard: Error checking admin status:", error);
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
