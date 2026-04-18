"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Users, Calendar, TrendingUp, RefreshCw } from "lucide-react";

const TRACKER_DOC_ID = "consortium-membership-tracker";
const TRACKER_COLLECTION = "settings";

interface MembershipTracker {
  totalSlots: number;
  remainingSlots: number;
  claimedSlots: number;
  discountDeadline: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function MembershipTrackerAdminPage() {
  const [tracker, setTracker] = useState<MembershipTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [totalSlots, setTotalSlots] = useState(50);
  const [claimedSlots, setClaimedSlots] = useState(0);
  const [discountDeadline, setDiscountDeadline] = useState("");

  useEffect(() => {
    loadTracker();
  }, []);

  const loadTracker = async () => {
    if (!db) {
      toast.error("Database not initialized");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const trackerRef = doc(db, TRACKER_COLLECTION, TRACKER_DOC_ID);
      const trackerSnap = await getDoc(trackerRef);

      if (trackerSnap.exists()) {
        const data = trackerSnap.data() as MembershipTracker;
        setTracker(data);
        setTotalSlots(data.totalSlots);
        setClaimedSlots(data.claimedSlots);
        if (data.discountDeadline) {
          const date = data.discountDeadline.toDate();
          setDiscountDeadline(date.toISOString().split("T")[0]);
        }
      } else {
        // Initialize with defaults
        setTracker({
          totalSlots: 50,
          remainingSlots: 50,
          claimedSlots: 0,
          discountDeadline: Timestamp.fromDate(new Date("2026-04-30")),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        setDiscountDeadline("2026-04-30");
      }
    } catch (error) {
      console.error("Error loading tracker:", error);
      toast.error("Failed to load membership tracker");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!db) {
      toast.error("Database not initialized");
      return;
    }

    try {
      setSaving(true);

      const remainingSlots = Math.max(0, totalSlots - claimedSlots);

      const trackerData = {
        totalSlots,
        remainingSlots,
        claimedSlots,
        discountDeadline: discountDeadline 
          ? Timestamp.fromDate(new Date(discountDeadline))
          : Timestamp.fromDate(new Date("2026-04-30")),
        updatedAt: Timestamp.now(),
      };

      const trackerRef = doc(db, TRACKER_COLLECTION, TRACKER_DOC_ID);
      await updateDoc(trackerRef, trackerData);

      toast.success("Membership tracker updated successfully");
      
      // Update local state
      setTracker(prev => prev ? { ...prev, ...trackerData } : null);
    } catch (error) {
      console.error("Error saving tracker:", error);
      toast.error("Failed to update membership tracker");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!db) return;
    
    if (!confirm("Are you sure you want to reset the tracker to initial state (50 slots, 0 claimed)?")) {
      return;
    }

    try {
      setSaving(true);
      
      const trackerData = {
        totalSlots: 50,
        remainingSlots: 50,
        claimedSlots: 0,
        discountDeadline: Timestamp.fromDate(new Date("2026-04-30")),
        updatedAt: Timestamp.now(),
      };

      const trackerRef = doc(db, TRACKER_COLLECTION, TRACKER_DOC_ID);
      await updateDoc(trackerRef, trackerData);

      setTotalSlots(50);
      setClaimedSlots(0);
      setDiscountDeadline("2026-04-30");
      setTracker(prev => prev ? { ...prev, ...trackerData } : null);
      
      toast.success("Tracker reset to initial state");
    } catch (error) {
      console.error("Error resetting tracker:", error);
      toast.error("Failed to reset tracker");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const remainingSlots = Math.max(0, totalSlots - claimedSlots);
  const isDiscountActive = new Date(discountDeadline) > new Date() && remainingSlots > 0;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Founders Offer Membership Tracker</h1>
        <p className="text-muted-foreground">
          Manage the KDM Consortium founders offer slot counter displayed on the pricing page
        </p>
      </div>

      {/* Current Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Status
          </CardTitle>
          <CardDescription>
            Real-time view of the founders offer slot availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">{totalSlots}</div>
              <div className="text-sm text-muted-foreground">Total Slots</div>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{remainingSlots}</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
            <div className="p-4 bg-amber-100 rounded-lg">
              <div className="text-3xl font-bold text-amber-600">{claimedSlots}</div>
              <div className="text-sm text-muted-foreground">Claimed</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge className={isDiscountActive ? "bg-green-500" : "bg-red-500"}>
              {isDiscountActive ? "Discount Active" : "Discount Inactive"}
            </Badge>
            {isDiscountActive && (
              <span className="text-sm text-muted-foreground">
                Offer ends {new Date(discountDeadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Slot Count
          </CardTitle>
          <CardDescription>
            Update the total slots and claimed count for the founders offer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalSlots">Total Slots</Label>
              <Input
                id="totalSlots"
                type="number"
                min={1}
                value={totalSlots}
                onChange={(e) => setTotalSlots(Math.max(1, parseInt(e.target.value) || 0))}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of founders offer slots available
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="claimedSlots">Claimed Slots</Label>
              <Input
                id="claimedSlots"
                type="number"
                min={0}
                max={totalSlots}
                value={claimedSlots}
                onChange={(e) => setClaimedSlots(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <p className="text-xs text-muted-foreground">
                Number of slots already claimed (set to 6 for 44 remaining)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountDeadline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Discount Deadline
            </Label>
            <Input
              id="discountDeadline"
              type="date"
              value={discountDeadline}
              onChange={(e) => setDiscountDeadline(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The offer will automatically expire after this date
            </p>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Preview (shown on pricing page):</h4>
            <p className="text-sm text-amber-600 font-semibold">
              {isDiscountActive 
                ? `Only ${remainingSlots} slots remaining (${claimedSlots}/${totalSlots} claimed)`
                : "Discount period ended"
              }
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Update Tracker
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
            >
              Reset to 50
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
