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
    <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Column - Message */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-6 w-6" />
              <Badge className="bg-white/20 text-white border-white/30 text-sm">
                Limited Time Offer
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              50% OFF KDM Consortium Membership
            </h2>
            <p className="text-lg text-white/90 mb-6 max-w-2xl">
              Join the first 50 members and get 50% off your annual membership. 
              Access exclusive government contracting opportunities, team assembly, 
              and expert guidance at half price.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                asChild
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 font-bold"
              >
                <Link href="/pricing">
                  Claim Your Discount
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/5-pillars">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Countdown Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold">{trackerStatus.remainingSlots}</div>
                <div className="text-sm text-white/80">Slots Left</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold">{trackerStatus.claimedSlots}</div>
                <div className="text-sm text-white/80">Already Claimed</div>
              </div>
              {daysRemaining !== null && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-1">
                    <Clock className="h-5 w-5" />
                    <span className="text-2xl sm:text-3xl font-bold">{daysRemaining}</span>
                  </div>
                  <div className="text-sm text-white/80">Days Left</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Visual Progress */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-xs">
              {/* Circular Progress */}
              <div className="relative w-48 h-48 mx-auto mb-6">
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
                  <div className="text-4xl font-bold">{percentageClaimed}%</div>
                  <div className="text-sm text-white/80">Claimed</div>
                </div>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-full">
                <div className="bg-white/20 rounded-full h-3 overflow-hidden border border-white/30">
                  <div
                    className="bg-white h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/70 mt-2">
                  <span>0</span>
                  <span>50</span>
                </div>
              </div>

              {/* Urgency Message */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">Filling Fast!</span>
                </div>
                <p className="text-sm text-white/80">
                  {trackerStatus.remainingSlots <= 10
                    ? 'Only a few spots left - join now!'
                    : trackerStatus.remainingSlots <= 25
                      ? 'More than half claimed - secure yours today!'
                      : 'Join before April 30th'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
