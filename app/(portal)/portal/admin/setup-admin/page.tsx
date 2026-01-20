"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SetupAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/setup-svp-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to check admin status");
      }

      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || "Failed to check status");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    try {
      setSetupLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/setup-svp-admin", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to setup admin");
      }

      const data = await response.json();
      toast.success("Platform admin setup complete!");
      
      // Force token refresh
      await currentUser.getIdToken(true);
      
      // Wait a moment then check status again
      setTimeout(() => {
        checkStatus();
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Failed to setup admin");
      toast.error(err.message || "Failed to setup admin");
    } finally {
      setSetupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Platform Admin Setup</h1>
            <p className="text-muted-foreground">
              Configure platform administrator access
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>Your current platform access level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Email</span>
                <span className="text-sm text-muted-foreground">{status?.email}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Current Role</span>
                <Badge variant={status?.role === "platform_admin" ? "default" : "secondary"}>
                  {status?.role || "None"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Platform Admin</span>
                {status?.isPlatformAdmin ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not Active</Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Can Setup</span>
                {status?.canSetup ? (
                  <Badge variant="default">Yes</Badge>
                ) : (
                  <Badge variant="destructive">No</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {status?.isPlatformAdmin ? (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">You are already a platform admin!</p>
                <p className="text-sm">You have full access to all SVP admin features.</p>
                <Button 
                  onClick={() => router.push("/portal/admin/svp-dashboard")}
                  className="mt-2"
                >
                  Go to Admin Dashboard
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : status?.canSetup ? (
          <Card>
            <CardHeader>
              <CardTitle>Setup Platform Admin</CardTitle>
              <CardDescription>
                Click the button below to grant yourself platform admin access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">This will grant you:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Full access to all admin features</li>
                      <li>User management capabilities</li>
                      <li>System settings control</li>
                      <li>Analytics and audit log access</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleSetup}
                  disabled={setupLoading}
                  size="lg"
                  className="w-full"
                >
                  {setupLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Setup Platform Admin
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  After setup, you'll need to sign out and sign back in for changes to take effect
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Access Denied</p>
              <p className="text-sm">
                Only the designated platform admin email can run this setup.
                Please contact your system administrator.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground">
            If you're experiencing issues with admin access, please ensure you're signed in 
            with the correct email address ({status?.canSetup ? "bstitt@strategicvalueplus.com" : "designated admin email"}).
          </p>
        </div>
      </div>
    </div>
  );
}
