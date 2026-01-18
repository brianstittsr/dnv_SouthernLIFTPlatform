"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SMESubscriptionPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main subscription page
    router.push("/portal/subscription");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-96">
      <p className="text-muted-foreground">Redirecting to subscription page...</p>
    </div>
  );
}
