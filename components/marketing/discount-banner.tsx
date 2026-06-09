"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHomePageSettings } from "@/lib/firebase-home-settings";

export function DiscountBanner() {
  const [settings, setSettings] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getHomePageSettings();
        setSettings(data);
        setIsVisible(data.discountBannerEnabled);
      } catch (error) {
        console.error("Failed to load banner settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in session storage
    sessionStorage.setItem("discount-banner-dismissed", "true");
  };

  // Check if banner was previously dismissed
  useEffect(() => {
    if (sessionStorage.getItem("discount-banner-dismissed") === "true") {
      setIsVisible(false);
    }
  }, []);

  if (isLoading || !isVisible || !settings) {
    return null;
  }

  return (
    <div
      className="relative w-full py-3 px-4 text-center"
      style={{
        backgroundColor: settings.discountBannerBackgroundColor || "#dc2626",
        color: settings.discountBannerTextColor || "#ffffff",
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        style={{ color: settings.discountBannerTextColor || "#ffffff" }}
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <span className="text-sm font-medium">{settings.discountBannerText}</span>
        {settings.discountBannerCtaText && settings.discountBannerCtaLink && (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="text-xs h-7"
            style={{
              borderColor: settings.discountBannerTextColor || "#ffffff",
              color: settings.discountBannerTextColor || "#ffffff",
              backgroundColor: "transparent",
            }}
          >
            <Link href={settings.discountBannerCtaLink}>
              {settings.discountBannerCtaText}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
