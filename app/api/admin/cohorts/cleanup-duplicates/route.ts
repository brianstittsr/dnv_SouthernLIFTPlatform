import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * DELETE /api/admin/cohorts/cleanup-duplicates
 * Remove duplicate cohorts based on title
 */
export async function DELETE(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    // Check custom claims first, then fall back to Firestore user document
    let isAdmin = claims.role === "platform_admin";
    
    if (!isAdmin) {
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();
      isAdmin = userData?.role === "platform_admin" || userData?.svpRole === "platform_admin";
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get all cohorts
    const cohortsSnapshot = await db.collection("cohorts").get();
    const cohorts = cohortsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Group by title
    const cohortsByTitle = new Map<string, any[]>();
    cohorts.forEach(cohort => {
      const title = cohort.title as string;
      if (!cohortsByTitle.has(title)) {
        cohortsByTitle.set(title, []);
      }
      cohortsByTitle.get(title)!.push(cohort);
    });

    // Find duplicates and keep the newest one
    const toDelete: string[] = [];
    cohortsByTitle.forEach((duplicates, title) => {
      if (duplicates.length > 1) {
        // Sort by createdAt, keep the newest
        duplicates.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        
        // Delete all except the first (newest)
        for (let i = 1; i < duplicates.length; i++) {
          toDelete.push(duplicates[i].id);
        }
      }
    });

    // Delete duplicates
    const batch = db.batch();
    toDelete.forEach(id => {
      batch.delete(db.collection("cohorts").doc(id));
    });
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Deleted ${toDelete.length} duplicate cohorts`,
      deletedIds: toDelete,
    });
  } catch (error: any) {
    console.error("Error cleaning up duplicates:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cleanup duplicates" },
      { status: 500 }
    );
  }
}
