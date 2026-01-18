import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/subscription/update
 * Update subscription tier (for downgrades to free)
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const { tier } = body;

    await db.collection("users").doc(decodedToken.uid).update({
      subscriptionTier: tier,
      subscriptionStatus: "active",
      updatedAt: Timestamp.now(),
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "subscription_updated",
      resource: "subscription",
      resourceId: decodedToken.uid,
      details: { tier },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update subscription" },
      { status: 500 }
    );
  }
}
