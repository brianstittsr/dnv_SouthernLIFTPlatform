import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const TRACKER_DOC_ID = "consortium-membership-tracker";
const TRACKER_COLLECTION = "settings";
const INITIAL_SLOTS = 50;
const DISCOUNT_DEADLINE = new Date("2026-04-30");

interface MembershipTracker {
  totalSlots: number;
  remainingSlots: number;
  claimedSlots: number;
  discountDeadline: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Initialize tracker if it doesn't exist
async function initializeTracker(): Promise<MembershipTracker> {
  const trackerRef = db.collection(TRACKER_COLLECTION).doc(TRACKER_DOC_ID);
  const trackerDoc = await trackerRef.get();

  if (!trackerDoc.exists) {
    const initialData: MembershipTracker = {
      totalSlots: INITIAL_SLOTS,
      remainingSlots: INITIAL_SLOTS,
      claimedSlots: 0,
      discountDeadline: Timestamp.fromDate(DISCOUNT_DEADLINE),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await trackerRef.set(initialData);
    return initialData;
  }

  return trackerDoc.data() as MembershipTracker;
}

// GET: Check current membership tracker status
export async function GET() {
  try {
    const tracker = await initializeTracker();
    const now = new Date();
    const isDiscountActive = now < DISCOUNT_DEADLINE && tracker.remainingSlots > 0;

    return NextResponse.json({
      totalSlots: tracker.totalSlots,
      remainingSlots: tracker.remainingSlots,
      claimedSlots: tracker.claimedSlots,
      discountActive: isDiscountActive,
      discountDeadline: DISCOUNT_DEADLINE.toISOString(),
      discountPercentage: isDiscountActive ? 50 : 0,
    });
  } catch (error) {
    console.error("Error fetching membership tracker:", error);
    return NextResponse.json(
      { error: "Failed to fetch membership tracker" },
      { status: 500 }
    );
  }
}

// POST: Claim a discount slot (called during checkout)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const trackerRef = db.collection(TRACKER_COLLECTION).doc(TRACKER_DOC_ID);
    const tracker = await initializeTracker();
    const now = new Date();

    // Check if discount is still available
    if (now > DISCOUNT_DEADLINE) {
      return NextResponse.json(
        { error: "Discount period has ended", discountAvailable: false },
        { status: 400 }
      );
    }

    if (tracker.remainingSlots <= 0) {
      return NextResponse.json(
        { error: "No discount slots remaining", discountAvailable: false },
        { status: 400 }
      );
    }

    // Decrement remaining slots
    await trackerRef.update({
      remainingSlots: tracker.remainingSlots - 1,
      claimedSlots: tracker.claimedSlots + 1,
      updatedAt: Timestamp.now(),
    });

    // Record the discount claim
    await db
      .collection(TRACKER_COLLECTION)
      .doc(TRACKER_DOC_ID)
      .collection("claims")
      .doc(userId)
      .set({
        userId,
        claimedAt: Timestamp.now(),
        discountPercentage: 50,
      });

    return NextResponse.json({
      success: true,
      remainingSlots: tracker.remainingSlots - 1,
      discountApplied: true,
    });
  } catch (error) {
    console.error("Error claiming discount slot:", error);
    return NextResponse.json(
      { error: "Failed to claim discount slot" },
      { status: 500 }
    );
  }
}
