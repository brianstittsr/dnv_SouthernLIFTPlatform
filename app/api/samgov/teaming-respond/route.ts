import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, type AiTeamingRecommendationDoc } from "@/lib/schema";

/**
 * POST /api/samgov/teaming-respond
 * Body: { recommendationId: string, status: "interested" | "not-interested" }
 *
 * Lets a member respond to an AI teaming recommendation. The caller must be
 * either the requester (forMemberId) or the recommended partner — the update
 * marks their side contacted with the given status. Moves the write off the
 * client so Firestore rules can keep this collection admin-write only.
 */
export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await auth.verifyIdToken(authorization.split("Bearer ")[1]);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { recommendationId, status } = await request.json().catch(() => ({}));
  if (!recommendationId || (status !== "interested" && status !== "not-interested")) {
    return NextResponse.json({ error: "recommendationId and a valid status are required" }, { status: 400 });
  }

  const recRef = db.collection(COLLECTIONS.AI_TEAMMING_RECOMMENDATIONS).doc(recommendationId);
  const recSnap = await recRef.get();
  if (!recSnap.exists) {
    return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
  }

  const rec = recSnap.data() as AiTeamingRecommendationDoc;
  const isRequester = rec.forMemberId === uid;
  const isPartner = rec.recommendations?.some((r) => r.memberId === uid);
  if (!isRequester && !isPartner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = Timestamp.now();
  const updatedRecs = rec.recommendations.map((r) =>
    r.memberId === uid || isRequester
      ? {
          ...r,
          contacted: true,
          contactStatus: status,
          ...(isRequester ? { requesterRespondedAt: now } : { partnerRespondedAt: now }),
        }
      : r
  );

  await recRef.update({ recommendations: updatedRecs, updatedAt: now });
  return NextResponse.json({ success: true });
}
