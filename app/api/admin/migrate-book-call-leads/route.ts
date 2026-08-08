import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

/**
 * POST /api/admin/migrate-book-call-leads
 * Migrates existing bookCallLeads entries into subscriptionLeads collection
 * so they appear in the Lead Management page for tracking and follow-up.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const claims = decodedToken as { role?: string; admin?: boolean };
    let isAdmin = claims.role === "platform_admin" || claims.admin === true;

    if (!isAdmin) {
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();
      isAdmin = userData?.role === "platform_admin" || userData?.svpRole === "platform_admin";
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const snapshot = await db.collection(COLLECTIONS.BOOK_CALL_LEADS).get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, migrated: 0, message: "No book call leads to migrate" });
    }

    const existingLeadsSnap = await db
      .collection(COLLECTIONS.SUBSCRIPTION_LEADS)
      .where("source", "==", "book_call")
      .get();

    const existingEmails = new Set<string>();
    existingLeadsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.email) existingEmails.add(data.email);
    });

    const batch = db.batch();
    let migrated = 0;
    let skipped = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (existingEmails.has(data.email)) {
        skipped++;
        return;
      }

      const createdAt = data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString();
      const updatedAt = data.updatedAt?.toDate?.()?.toISOString() || createdAt;

      const leadRef = db.collection(COLLECTIONS.SUBSCRIPTION_LEADS).doc();

      batch.set(leadRef, {
        userId: `book_call_${doc.id}`,
        email: data.email || "",
        companyName: data.company || "Unknown",
        industry: "Unknown",
        userType: "sme",
        roleTag: "Unknown",
        tier: "dwy",
        tierName: "DWY (Done With You)",
        price: 299,
        subscriptionStatus: "pending",
        contactInfo: {
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          phone: data.phone || null,
          jobTitle: data.jobTitle || null,
        },
        status: data.status || "new",
        source: "book_call",
        priority: "medium",
        svpSync: {
          syncStatus: "pending",
        },
        followUp: {
          emailsSent: 0,
          notes: [],
        },
        createdAt,
        updatedAt,
      });

      migrated++;
    });

    if (migrated > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      migrated,
      skipped,
      total: snapshot.size,
      message: `Migrated ${migrated} leads (${skipped} already existed)`,
    });
  } catch (error) {
    console.error("Error migrating book call leads:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to migrate leads" },
      { status: 500 }
    );
  }
}
