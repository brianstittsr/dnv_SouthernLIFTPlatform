import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * GET /api/billing/payment-plans
 * Get user's active payment plans
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const plansSnapshot = await db
      .collection("paymentPlans")
      .where("userId", "==", decodedToken.uid)
      .where("status", "in", ["active", "overdue"])
      .get();

    const paymentPlans = plansSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ paymentPlans });
  } catch (error: any) {
    console.error("Error fetching payment plans:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment plans" },
      { status: 500 }
    );
  }
}
