import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/leads
 * Capture lead from multiple sources
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, industry, serviceType, source } = body;

    // Validate required fields
    if (!name || !email || !company) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, company" },
        { status: 400 }
      );
    }

    // Check for duplicate based on email
    const existingLeadsSnapshot = await db
      .collection("leads")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingLeadsSnapshot.empty) {
      const existingLead = existingLeadsSnapshot.docs[0];
      return NextResponse.json(
        {
          error: "Duplicate lead detected",
          existingLeadId: existingLead.id,
          message: "A lead with this email already exists",
        },
        { status: 409 }
      );
    }

    // Create lead document
    const leadData = {
      name,
      email,
      phone: phone || null,
      company,
      industry: industry || null,
      serviceType: serviceType || null,
      source: source || "website",
      status: "new",
      partnerId: null,
      assignedAt: null,
      tenantId: `tenant_lead_${Date.now()}`,
      capturedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const leadRef = await db.collection("leads").add(leadData);

    // Log audit event
    await db.collection("auditLogs").add({
      userId: "system",
      action: "lead_captured",
      resource: "lead",
      resourceId: leadRef.id,
      details: { email, company, source },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    // Trigger automatic routing
    await routeLead(leadRef.id, leadData);

    return NextResponse.json({
      success: true,
      leadId: leadRef.id,
      message: "Lead captured successfully",
    });
  } catch (error: any) {
    console.error("Error capturing lead:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture lead" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads
 * Get leads (filtered by role)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const industry = searchParams.get("industry");
    const serviceType = searchParams.get("serviceType");

    let query = db.collection("leads").orderBy("capturedAt", "desc");

    // Filter by role
    if (claims.role === "partner_user") {
      // Partners see only their assigned leads
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();
      query = query.where("partnerId", "==", userData?.partnerId) as any;
    }
    // Admins see all leads

    if (status) {
      query = query.where("status", "==", status) as any;
    }

    const leadsSnapshot = await query.limit(100).get();

    let leads = leadsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side filters (Firestore limitations)
    if (industry) {
      leads = leads.filter((lead: any) => lead.industry === industry);
    }

    if (serviceType) {
      leads = leads.filter((lead: any) => lead.serviceType === serviceType);
    }

    return NextResponse.json({ leads });
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

/**
 * Automatic lead routing function
 */
async function routeLead(leadId: string, leadData: any) {
  try {
    // Get routing rules
    const routingRulesSnapshot = await db
      .collection("routingRules")
      .where("isActive", "==", true)
      .get();

    if (routingRulesSnapshot.empty) {
      // No routing rules, assign to default admin queue
      return;
    }

    // Find best match based on industry and service type
    let bestMatch: any = null;
    let bestScore = 0;

    for (const ruleDoc of routingRulesSnapshot.docs) {
      const rule = ruleDoc.data();
      let score = 0;

      // Match industry
      if (rule.industries && rule.industries.includes(leadData.industry)) {
        score += 10;
      }

      // Match service type
      if (rule.serviceTypes && rule.serviceTypes.includes(leadData.serviceType)) {
        score += 10;
      }

      // Check partner capacity
      const partnerLeadsSnapshot = await db
        .collection("leads")
        .where("partnerId", "==", rule.partnerId)
        .where("status", "in", ["new", "contacted", "qualified"])
        .get();

      const currentLoad = partnerLeadsSnapshot.size;
      if (currentLoad < (rule.maxCapacity || 100)) {
        score += 5;
      } else {
        score -= 10; // Penalize overloaded partners
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = rule;
      }
    }

    if (bestMatch) {
      // Assign lead to partner
      await db.collection("leads").doc(leadId).update({
        partnerId: bestMatch.partnerId,
        assignedAt: Timestamp.now(),
        routingScore: bestScore,
        routingReason: `Matched on industry and service type (score: ${bestScore})`,
        updatedAt: Timestamp.now(),
      });

      // Send notification to partner
      const partnerDoc = await db.collection("users").doc(bestMatch.partnerId).get();
      const partnerData = partnerDoc.data();

      if (partnerData?.email) {
        await db.collection("emailQueue").add({
          to: [partnerData.email],
          subject: "New Lead Assigned",
          body: `
            <h2>New Lead Assigned to You</h2>
            <p>A new lead has been automatically assigned to your vertical.</p>
            <p><strong>Company:</strong> ${leadData.company}</p>
            <p><strong>Contact:</strong> ${leadData.name}</p>
            <p><strong>Industry:</strong> ${leadData.industry}</p>
            <p><strong>Service Type:</strong> ${leadData.serviceType}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/partner/leads">View Lead Dashboard</a></p>
          `,
          createdAt: Timestamp.now(),
          status: "pending",
        });
      }

      // Log routing decision
      await db.collection("auditLogs").add({
        userId: "system",
        action: "lead_routed",
        resource: "lead",
        resourceId: leadId,
        details: {
          partnerId: bestMatch.partnerId,
          score: bestScore,
          reason: `Matched on industry and service type`,
        },
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error routing lead:", error);
  }
}
