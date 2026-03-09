"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        checkAdminStatus();
      } else {
        setChecking(false);
      }
    });

    return () => unsubscribe?.();
  }, []);

  async function checkAdminStatus() {
    setChecking(true);
    try {
      const user = auth?.currentUser;
      if (!user) {
        setChecking(false);
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/admin/setup-svp-admin", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Failed to check admin status");
    } finally {
      setChecking(false);
    }
  }

  async function setupAdmin() {
    setLoading(true);
    try {
      const user = auth?.currentUser;
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/admin/setup-svp-admin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSetupComplete(true);
        toast.success("Admin role granted successfully!");
        
        // Wait 2 seconds then prompt to sign out
        setTimeout(() => {
          if (confirm("Admin role granted! You need to sign out and sign back in for changes to take effect. Sign out now?")) {
            auth?.signOut().then(() => {
              router.push("/sign-in");
            });
          }
        }, 2000);
      } else {
        toast.error(data.error || "Failed to setup admin role");
      }
    } catch (error) {
      console.error("Error setting up admin:", error);
      toast.error("Failed to setup admin role");
    } finally {
      setLoading(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Setup
          </h1>
          <p className="text-muted-foreground mt-2">
            Grant administrator privileges to access admin features
          </p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You must be signed in to grant admin access.
          </AlertDescription>
        </Alert>

        <Button onClick={() => router.push("/sign-in")} className="w-full">
          Go to Sign In
        </Button>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Admin Setup
        </h1>
        <p className="text-muted-foreground mt-2">
          Grant administrator privileges to access admin features
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
          <CardDescription>Your account information and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{userInfo?.email || currentUser?.email || "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Role:</span>
              <span className="text-sm">{userInfo?.role || "None"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Platform Admin:</span>
              <span className="flex items-center gap-1">
                {userInfo?.isPlatformAdmin ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Yes</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">No</span>
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Can Setup Admin:</span>
              <span className="flex items-center gap-1">
                {userInfo?.canSetup ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Yes</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">No</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {setupComplete && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Admin role has been granted! Please sign out and sign back in for changes to take effect.
              </AlertDescription>
            </Alert>
          )}

          {!userInfo?.canSetup && (
            <Alert>
              <AlertDescription>
                Only the designated platform admin email (bstitt@strategicvalueplus.com) can grant admin access.
                Please contact the platform administrator or sign in with the correct account.
              </AlertDescription>
            </Alert>
          )}

          {userInfo?.isPlatformAdmin && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                You already have admin privileges! You can access all admin features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={setupAdmin}
          disabled={loading || !userInfo?.canSetup || userInfo?.isPlatformAdmin || setupComplete}
          className="flex-1"
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {setupComplete ? "Setup Complete" : "Grant Admin Access"}
        </Button>
        <Button variant="outline" onClick={checkAdminStatus} disabled={checking}>
          {checking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Refresh Status
        </Button>
      </div>

      {userInfo?.isPlatformAdmin && (
        <Button 
          onClick={() => router.push("/portal")} 
          variant="default"
          className="w-full"
        >
          Go to Portal
        </Button>
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">What happens when you grant admin access?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Your account will be assigned the "platform_admin" role</li>
            <li>You'll gain access to all admin features (Image Manager, User Management, etc.)</li>
            <li>Custom claims will be set in Firebase Authentication</li>
            <li>An audit log entry will be created</li>
            <li>You must sign out and sign back in for changes to take effect</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
