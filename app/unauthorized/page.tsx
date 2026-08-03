import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <ShieldAlert className="h-16 w-16 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-3xl">Access Denied</CardTitle>
          <CardDescription className="text-lg">
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This page requires administrator privileges. If you believe you should have access,
            please contact your system administrator.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg border">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Platform Admin?</strong> If you're the designated platform admin 
              (bstitt@kdm-assoc.com), you can grant yourself admin access at{" "}
              <Link href="/admin-setup" className="text-primary hover:underline font-medium">
                /admin-setup
              </Link>
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Button asChild className="w-full">
              <Link href="/portal/command-center">
                <Home className="h-4 w-4 mr-2" />
                Go to Portal
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
