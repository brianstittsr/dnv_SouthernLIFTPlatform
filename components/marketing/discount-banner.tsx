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

  const bg = settings.discountBannerBackgroundColor || "#f5a800";
  const fg = settings.discountBannerTextColor || "#ffffff";
  const hasLink = settings.discountBannerCtaText && settings.discountBannerCtaLink;

  const inner = (
    <div
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: bg, color: fg, borderBottom: "2px solid rgba(0,0,0,0.15)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated shimmer sweep */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.8s_ease-in-out_infinite]"
        style={{
          background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)",
        }}
      />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-1.5 transition-all hover:bg-black/20"
        style={{ color: fg }}
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Main content */}
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-4 px-10 py-3 flex-wrap">
        {/* Pulsing badge */}
        <span
          className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest animate-pulse shadow-md"
          style={{ backgroundColor: "#1e3a5f", color: "#f5a800", border: "1.5px solid rgba(255,255,255,0.4)" }}
        >
          <Zap className="h-3.5 w-3.5" />
          Limited Offer
        </span>

        {/* Message */}
        <span className="text-sm font-extrabold leading-snug drop-shadow-sm" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}>
          {settings.discountBannerText}
        </span>

        {/* Urgency hint */}
        <span className="hidden sm:flex items-center gap-1 text-xs font-bold" style={{ color: "rgba(0,0,0,0.65)" }}>
          <Clock className="h-3.5 w-3.5" />
          Offer ends soon
        </span>

        {/* CTA button */}
        {hasLink && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-black shadow-lg transition-all duration-200 border-2"
            style={{
              backgroundColor: hovered ? "#1e3a5f" : "#ffffff",
              color: hovered ? "#f5a800" : "#1e3a5f",
              borderColor: hovered ? "#f5a800" : "#1e3a5f",
              transform: hovered ? "scale(1.07)" : "scale(1)",
              boxShadow: hovered
                ? "0 6px 24px rgba(0,0,0,0.35)"
                : "0 3px 12px rgba(0,0,0,0.25)",
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
