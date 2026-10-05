import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { searchStockImage } from "@/lib/stock-images";

/**
 * POST /api/admin/hero-stock-image
 *
 * Searches Pexels/Unsplash for a landscape image matching a keyword
 * (typically derived from press-release slide content). Falls back to a
 * curated image when no provider keys are configured.
 *
 * Auth: Firebase ID token of a platform admin.
 * Body: { keyword: string }
 */

async function authorizeAdmin(request: NextRequest): Promise<boolean> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  const idToken = authorization.split("Bearer ")[1];
  try {
    const decoded = await auth.verifyIdToken(idToken);
    const claims = decoded as { role?: string; admin?: boolean };
    if (claims.role === "platform_admin" || claims.admin === true) return true;

    if (!db) return false;
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    const userData = userDoc.data();
    return userData?.role === "platform_admin" || userData?.svpRole === "platform_admin";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!(await authorizeAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let keyword = "";
  try {
    const body = await request.json();
    keyword = (body?.keyword || "").toString().trim();
  } catch {
    // fall through
  }

  if (!keyword) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  try {
    const image = await searchStockImage(keyword.slice(0, 120));
    return NextResponse.json({ image });
  } catch (error: any) {
    console.error("Error searching stock image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search stock images" },
      { status: 500 }
    );
  }
}
