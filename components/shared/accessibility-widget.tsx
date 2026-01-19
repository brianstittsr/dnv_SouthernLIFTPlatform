"use client";

import { useEffect } from "react";
import Script from "next/script";

interface AccessibilityWidgetProps {
  // UserWay account ID - get this from your UserWay dashboard
  accountId?: string;
}

let hasWarned = false;

export function AccessibilityWidget({ accountId }: AccessibilityWidgetProps) {
  // If no account ID provided, use a placeholder that can be configured later
  const userWayAccountId = accountId || process.env.NEXT_PUBLIC_USERWAY_ACCOUNT_ID;

  if (!userWayAccountId) {
    // In development, show a console warning (only once)
    if (process.env.NODE_ENV === "development" && !hasWarned) {
      console.warn(
        "UserWay account ID not configured. Set NEXT_PUBLIC_USERWAY_ACCOUNT_ID in your environment variables."
      );
      hasWarned = true;
    }
    return null;
  }

  return (
    <Script
      id="userway-widget"
      strategy="lazyOnload"
      src="https://cdn.userway.org/widget.js"
      data-account={userWayAccountId}
    />
  );
}
