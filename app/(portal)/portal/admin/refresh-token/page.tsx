"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function RefreshTokenPage() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  const handleRefreshToken = async () => {
    try {
      setRefreshing(true);
      setError(null);
      setSuccess(false);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      // Force refresh the ID token
      const newToken = await currentUser.getIdToken(true);
      
      // Decode the token to show claims
      const tokenResult = await currentUser.getIdTokenResult(true);
      
      setTokenInfo({
        email: currentUser.email,
        uid: currentUser.uid,
        claims: tokenResult.claims,
      });

      setSuccess(true);
      toast.success("Token refreshed successfully! Your permissions are now up to date.");

      // Reload the page after 2 seconds to apply new token
      setTimeout(() => {
        window.location.href = "/portal/admin/users";
      }, 2000);
    } catch (err: any) {
      console.error("Token refresh error:", err);
      setError(err.message || "Failed to refresh token");
      toast.error("Failed to refresh token");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Refresh Firebase Auth Token</CardTitle>
          <CardDescription>
            Force refresh your Firebase Authentication token to get updated custom claims and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Token refreshed successfully! Redirecting to User Management...
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you're seeing 403 Forbidden errors when accessing admin pages, your Firebase Auth token
              may not have the latest custom claims. Click the button below to force refresh your token.
            </p>

            <Button 
              onClick={handleRefreshToken} 
              disabled={refreshing || success}
              className="w-full"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing Token...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Token Refreshed!
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Token
                </>
              )}
            </Button>

            {tokenInfo && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Current Token Info:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Email:</strong> {tokenInfo.email}</p>
                  <p><strong>UID:</strong> {tokenInfo.uid}</p>
                  <p><strong>Role:</strong> {tokenInfo.claims.role || "none"}</p>
                  <div>
                    <strong>All Claims:</strong>
                    <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                      {JSON.stringify(tokenInfo.claims, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
