"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredSvpRole?: string | string[];
  fallbackUrl?: string;
}

/**
 * RequireAuth component - Protects pages that require authentication
 * 
 * Usage:
 * <RequireAuth>
 *   <YourProtectedComponent />
 * </RequireAuth>
 * 
 * With role requirement:
 * <RequireAuth requiredRole="admin">
 *   <AdminOnlyComponent />
 * </RequireAuth>
 * 
 * With SVP role requirement:
 * <RequireAuth requiredSvpRole={["platform_admin", "qa_reviewer"]}>
 *   <QAComponent />
 * </RequireAuth>
 */
export function RequireAuth({
  children,
  requiredRole,
  requiredSvpRole,
  fallbackUrl = "/sign-in",
}: RequireAuthProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      router.push(fallbackUrl);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not authenticated - redirect to sign in
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push(fallbackUrl);
        return;
      }

      setIsAuthenticated(true);

      // If no role requirement, allow access
      if (!requiredRole && !requiredSvpRole) {
        setHasRequiredRole(true);
        setIsLoading(false);
        return;
      }

      // Check user roles from Firestore
      if (!db) {
        setErrorMessage("Database connection error.");
        setIsLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
          setErrorMessage("User profile not found. Please contact support.");
          setHasRequiredRole(false);
          setIsLoading(false);
          return;
        }

        const userData = userDoc.data();
        const userRole = userData.role;
        const userSvpRole = userData.svpRole;

        let roleMatch = true;
        let svpRoleMatch = true;

        // Check standard role
        if (requiredRole) {
          const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
          roleMatch = roles.includes(userRole);
        }

        // Check SVP role
        if (requiredSvpRole) {
          const svpRoles = Array.isArray(requiredSvpRole) ? requiredSvpRole : [requiredSvpRole];
          // Platform admins have access to everything
          svpRoleMatch = userSvpRole === "platform_admin" || svpRoles.includes(userSvpRole);
        }

        if (roleMatch && svpRoleMatch) {
          setHasRequiredRole(true);
        } else {
          setErrorMessage("You don't have permission to access this page.");
          setHasRequiredRole(false);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setErrorMessage("Error verifying permissions. Please try again.");
        setHasRequiredRole(false);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, fallbackUrl, requiredRole, requiredSvpRole]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-yellow-500" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              You need to sign in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(fallbackUrl)} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated but doesn't have required role
  if (!hasRequiredRole) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              {errorMessage || "You don't have permission to access this page."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact your administrator.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={() => router.push("/portal")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated and has required role - render children
  return <>{children}</>;
}

/**
 * RequireSvpAdmin - Shorthand for requiring platform_admin SVP role
 */
export function RequireSvpAdmin({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth requiredSvpRole="platform_admin">
      {children}
    </RequireAuth>
  );
}

/**
 * RequireSvpRole - Shorthand for requiring specific SVP roles
 */
export function RequireSvpRole({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string | string[];
}) {
  return (
    <RequireAuth requiredSvpRole={roles}>
      {children}
    </RequireAuth>
  );
}
