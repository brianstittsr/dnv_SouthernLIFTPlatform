import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/leads/[id]
 * Get single lead
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const leadDoc = await db.collection("leads").doc(params.id).get();

    if (!leadDoc.exists) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const leadData = leadDoc.data();

    // Get activities
    const activitiesSnapshot = await db
      .collection("leads")
      .doc(params.id)
      .collection("activities")
      .orderBy("activityDate", "desc")
      .get();

    const activities = activitiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      id: leadDoc.id,
      ...leadData,
      activities,
    });
  } catch (error: any) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/leads/[id]
 * Update lead (status, assignment, notes)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const { status, partnerId, notes, followUpDate } = body;

    const leadRef = db.collection("leads").doc(params.id);
    const leadDoc = await leadRef.get();

    if (!leadDoc.exists) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: Timestamp.now(),
      updatedBy: decodedToken.uid,
    };

    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (followUpDate !== undefined) {
      updateData.followUpDate = followUpDate
        ? Timestamp.fromDate(new Date(followUpDate))
        : null;
    }

    // Handle partner reassignment
    if (partnerId !== undefined) {
      const oldPartnerId = leadDoc.data()?.partnerId;
      updateData.partnerId = partnerId;
      updateData.assignedAt = Timestamp.now();

      // Check for service overlap
      if (partnerId) {
        await checkServiceOverlap(params.id, partnerId, leadDoc.data()?.company);
      }

      // Notify new partner
      if (partnerId && partnerId !== oldPartnerId) {
        const partnerDoc = await db.collection("users").doc(partnerId).get();
        const partnerData = partnerDoc.data();

        if (partnerData?.email) {
          await db.collection("emailQueue").add({
            to: [partnerData.email],
            subject: "Lead Assigned to You",
            body: `
              <h2>Lead Assigned</h2>
              <p>A lead has been assigned to you.</p>
              <p><strong>Company:</strong> ${leadDoc.data()?.company}</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/partner/leads/${params.id}">View Lead</a></p>
            `,
            createdAt: Timestamp.now(),
            status: "pending",
          });
        }
      }

      // Log reassignment
      await db.collection("auditLogs").add({
        userId: decodedToken.uid,
        action: "lead_reassigned",
        resource: "lead",
        resourceId: params.id,
        details: { oldPartnerId, newPartnerId: partnerId },
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
    }

    await leadRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update lead" },
      { status: 500 }
    );
  }
}

/**
 * Check for service overlap
 */
async function checkServiceOverlap(
  leadId: string,
  newPartnerId: string,
  company: string
) {
  try {
    // Check if this company has other active leads with different partners
    const existingLeadsSnapshot = await db
      .collection("leads")
      .where("company", "==", company)
      .where("status", "in", ["contacted", "qualified", "converted"])
      .get();

    const overlaps = existingLeadsSnapshot.docs.filter(
      (doc) => doc.id !== leadId && doc.data().partnerId !== newPartnerId
    );

    if (overlaps.length > 0) {
      // Create overlap record
      await db.collection("serviceOverlaps").add({
        leadId,
        company,
        newPartnerId,
        existingPartnerIds: overlaps.map((doc) => doc.data().partnerId),
        status: "detected",
        detectedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      });

      // Notify all involved partners
      const partnerIds = [
        newPartnerId,
        ...overlaps.map((doc) => doc.data().partnerId),
      ];

      for (const partnerId of partnerIds) {
        const partnerDoc = await db.collection("users").doc(partnerId).get();
        const partnerData = partnerDoc.data();

        if (partnerData?.email) {
          await db.collection("emailQueue").add({
            to: [partnerData.email],
            subject: "Service Overlap Detected",
            body: `
              <h2>Service Overlap Alert</h2>
              <p>Multiple partners are assigned to the same company: ${company}</p>
              <p>Please coordinate to avoid duplicate services.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/partner/overlaps">View Overlaps</a></p>
            `,
            createdAt: Timestamp.now(),
            status: "pending",
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking service overlap:", error);
  }
}
