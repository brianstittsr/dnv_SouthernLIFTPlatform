'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock } from 'lucide-react';

interface TrackerStatus {
  remainingSlots: number;
  claimedSlots: number;
  totalSlots: number;
  discountActive: boolean;
  discountDeadline: string;
}

export function DiscountHero() {
  const [trackerStatus, setTrackerStatus] = useState<TrackerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    const fetchTrackerStatus = async () => {
      try {
        const response = await fetch('/api/consortium/membership-tracker');
        if (response.ok) {
          const data = await response.json();
          setTrackerStatus(data);

          // Calculate days remaining
          const deadline = new Date(data.discountDeadline);
          const now = new Date();
          const diffTime = deadline.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysRemaining(Math.max(0, diffDays));
        }
      } catch (error) {
        console.error('Error fetching tracker status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackerStatus();
    // Refresh every 30 seconds to keep countdown updated
    const interval = setInterval(fetchTrackerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!trackerStatus?.discountActive || loading) {
    return null;
  }

  const percentageClaimed = Math.round((trackerStatus.claimedSlots / trackerStatus.totalSlots) * 100);
  const progressWidth = percentageClaimed;

  return (
    <div className="relative bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-900 shadow-lg">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(0) skewX(-12deg); }
          100% { transform: translateX(400%) skewX(-12deg); }
        }
        .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
      `}</style>
      {/* Animated shimmer strip */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-y-0 -left-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>

      <div className="relative container mx-auto px-4 py-3">
        {/* Single-row announcement bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Left: badge + headline */}
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 bg-slate-900 text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              <Zap className="h-3.5 w-3.5" />
              Founders Offer
            </span>
            <span className="text-slate-900 font-bold text-base sm:text-lg">
              <span className="text-2xl font-extrabold">50% OFF</span> KDM Consortium Membership
            </span>
          </div>

          {/* Center: urgency stats */}
          <div className="flex items-center gap-4 text-slate-900 shrink-0">
            <div className="text-center">
              <div className="text-xl font-extrabold leading-none">{trackerStatus.remainingSlots}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide opacity-75">Spots Left</div>
            </div>
            <div className="h-8 w-px bg-slate-900/20" />
            {daysRemaining !== null && (
              <>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-xl font-extrabold leading-none">
                    <Clock className="h-4 w-4" />
                    {daysRemaining}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide opacity-75">Days Left</div>
                </div>
                <div className="h-8 w-px bg-slate-900/20" />
              </>
            )}
            {/* Progress bar */}
            <div className="hidden md:block w-28">
              <div className="flex justify-between text-[10px] font-semibold opacity-75 mb-1">
                <span>{trackerStatus.claimedSlots} claimed</span>
                <span>{trackerStatus.totalSlots}</span>
              </div>
              <div className="bg-slate-900/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-900 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentageClaimed}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="shrink-0">
            <Button
              asChild
              className="bg-slate-900 text-amber-400 hover:bg-slate-800 font-bold px-6 py-2 text-sm shadow-md border-0 transition-transform hover:scale-105"
            >
              <Link href="/pricing">
                Claim Your Spot →
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
