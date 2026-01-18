import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/billing/transactions
 * Get user transaction history
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = db
      .collection("transactions")
      .where("userId", "==", decodedToken.uid)
      .orderBy("createdAt", "desc");

    if (type && type !== "all") {
      query = query.where("type", "==", type) as any;
    }

    if (startDate) {
      query = query.where("createdAt", ">=", Timestamp.fromDate(new Date(startDate))) as any;
    }

    if (endDate) {
      query = query.where("createdAt", "<=", Timestamp.fromDate(new Date(endDate))) as any;
    }

    const countSnapshot = await query.get();
    const total = countSnapshot.size;

    const offset = (page - 1) * limit;
    const transactionsSnapshot = await query.limit(limit).offset(offset).get();

    const transactions = transactionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().createdAt?.toDate().toISOString(),
    }));

    return NextResponse.json({
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
