import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      paymentIntentId,
      userId,
      email,
      firstName,
      lastName,
      amount,
      currency,
      productName,
      status,
      membershipType,
    } = body;

    if (!paymentIntentId || !email || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: paymentIntentId, email, amount" },
        { status: 400 }
      );
    }

    const transactionData = {
      id: paymentIntentId,
      paymentIntentId,
      userId: userId || null,
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      amount,
      currency: currency || "usd",
      productName: productName || "KDM Consortium Membership",
      status: status || "succeeded",
      membershipType: membershipType || "kdm-consortium",
      
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await db.collection("transactions").doc(paymentIntentId).set(transactionData);

    if (membershipType === "kdm-consortium") {
      await db.collection("consortiumMembers").doc(paymentIntentId).set({
        id: paymentIntentId,
        paymentIntentId,
        userId: userId || null,
        email,
        firstName,
        lastName,
        membershipStatus: "active",
        joinedAt: Timestamp.now(),
        transactionId: paymentIntentId,
      });
    }

    return NextResponse.json({
      message: "Transaction recorded successfully",
      transactionId: paymentIntentId,
    });
  } catch (error) {
    console.error("Error recording transaction:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record transaction" },
      { status: 500 }
    );
  }
}
