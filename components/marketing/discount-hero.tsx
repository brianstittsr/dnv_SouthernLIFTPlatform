'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, TrendingUp } from 'lucide-react';

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
    <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white border-b border-slate-500">
      <div className="container mx-auto px-4 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left Column - Message */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-6 w-6" />
              <Badge className="bg-white/20 text-white border-white/30 text-sm">
                Limited Time Offer
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 leading-tight">
              50% OFF KDM Consortium Membership
            </h2>
            <p className="text-sm text-white/80 mb-4 max-w-2xl">
              Join the first 50 members and get 50% off. Limited time offer before April 30th.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <Button
                asChild
                size="sm"
                className="bg-white text-slate-700 hover:bg-gray-100 font-semibold"
              >
                <Link href="/pricing">
                  Claim Discount
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                <Link href="/5-pillars">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Countdown Stats */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-white/5 rounded p-2 border border-white/10">
                <div className="text-lg font-bold">{trackerStatus.remainingSlots}</div>
                <div className="text-xs text-white/70">Slots Left</div>
              </div>
              <div className="bg-white/5 rounded p-2 border border-white/10">
                <div className="text-lg font-bold">{trackerStatus.claimedSlots}</div>
                <div className="text-xs text-white/70">Claimed</div>
              </div>
              {daysRemaining !== null && (
                <div className="bg-white/5 rounded p-2 border border-white/10">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-lg font-bold">{daysRemaining}</span>
                  </div>
                  <div className="text-xs text-white/70">Days</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Visual Progress */}
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center">
            <div className="w-full max-w-xs">
              {/* Circular Progress */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeDasharray={`${(percentageClaimed / 100) * 2 * Math.PI * 90} ${2 * Math.PI * 90}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold">{percentageClaimed}%</div>
                  <div className="text-xs text-white/70">Claimed</div>
                </div>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-full">
                <div className="bg-white/20 rounded-full h-2 overflow-hidden border border-white/20">
                  <div
                    className="bg-white h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>0</span>
                  <span>50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
