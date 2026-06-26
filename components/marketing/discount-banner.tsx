"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight, Zap, Clock } from "lucide-react";
import { getHomePageSettings } from "@/lib/firebase-home-settings";

export function DiscountBanner() {
  const [settings, setSettings] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("discount-banner-dismissed") === "true";

    const loadSettings = async () => {
      try {
        const data = await getHomePageSettings();
        setSettings(data);
        setIsVisible(data.discountBannerEnabled && !dismissed);
      } catch (error) {
        console.error("Failed to load banner settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    sessionStorage.setItem("discount-banner-dismissed", "true");
  };

  if (isLoading || !isVisible || !settings) {
    return null;
  }

  const bg = settings.discountBannerBackgroundColor || "#c9a227";
  const fg = settings.discountBannerTextColor || "#1e3a5f";
  const hasLink = settings.discountBannerCtaText && settings.discountBannerCtaLink;

  const inner = (
    <div
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: bg, color: fg }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated shimmer sweep */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.8s_ease-in-out_infinite]"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
        }}
      />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 transition-all hover:opacity-60"
        style={{ color: fg }}
        aria-label="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Main content */}
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 px-10 py-2.5 flex-wrap">
        {/* Pulsing badge */}
        <span
          className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse"
          style={{ backgroundColor: fg, color: bg }}
        >
          <Zap className="h-3 w-3" />
          Limited Offer
        </span>

        {/* Message */}
        <span className="text-sm font-semibold leading-snug">
          {settings.discountBannerText}
        </span>

        {/* Urgency hint */}
        <span className="hidden sm:flex items-center gap-1 text-xs font-medium opacity-75">
          <Clock className="h-3 w-3" />
          Offer ends soon
        </span>

        {/* CTA button */}
        {hasLink && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold shadow-md transition-all duration-200"
            style={{
              backgroundColor: fg,
              color: bg,
              transform: hovered ? "scale(1.07)" : "scale(1)",
              boxShadow: hovered
                ? `0 4px 18px ${fg}55`
                : `0 2px 8px ${fg}33`,
            }}
          >
            {settings.discountBannerCtaText}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200"
              style={{ transform: hovered ? "translateX(3px)" : "translateX(0)" }}
            />
          </span>
        )}
      </div>
    </div>
  );

  return hasLink ? (
    <Link href={settings.discountBannerCtaLink} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
