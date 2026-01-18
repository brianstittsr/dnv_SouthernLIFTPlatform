import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/introductions
 * Request warm introduction to SME
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
    const { smeId, projectDescription, timeline, budgetRange, preferredContactMethod } = body;

    if (!smeId || !projectDescription) {
      return NextResponse.json(
        { error: "Missing required fields: smeId, projectDescription" },
        { status: 400 }
      );
    }

    // Get buyer info
    const buyerDoc = await db.collection("users").doc(decodedToken.uid).get();
    const buyerData = buyerDoc.data();

    // Get SME info
    const smeSnapshot = await db.collection("users").where("smeId", "==", smeId).limit(1).get();
    if (smeSnapshot.empty) {
      return NextResponse.json({ error: "SME not found" }, { status: 404 });
    }

    const smeDoc = smeSnapshot.docs[0];
    const smeData = smeDoc.data();

    // Create introduction request
    const introductionData = {
      buyerId: decodedToken.uid,
      buyerCompany: buyerData?.companyName || "Unknown",
      buyerEmail: buyerData?.email,
      
      smeId,
      smeUserId: smeDoc.id,
      smeCompany: smeData.companyName,
      smeEmail: smeData.email,
      partnerId: smeData.partnerId || null,
      
      projectDescription,
      timeline: timeline || null,
      budgetRange: budgetRange || null,
      preferredContactMethod: preferredContactMethod || "email",
      
      status: "pending",
      stage: "intro",
      
      requestedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const introRef = await db.collection("introductions").add(introductionData);

    // Send notification to SME
    await db.collection("emailQueue").add({
      to: [smeData.email],
      subject: "New Introduction Request",
      body: `
        <h2>New Introduction Request</h2>
        <p>A buyer is interested in connecting with you!</p>
        <p><strong>Buyer Company:</strong> ${buyerData?.companyName}</p>
        <p><strong>Project:</strong> ${projectDescription}</p>
        <p><strong>Timeline:</strong> ${timeline || "Not specified"}</p>
        <p><strong>Budget Range:</strong> ${budgetRange || "Not specified"}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/introductions/${introRef.id}">View Request</a></p>
      `,
      createdAt: Timestamp.now(),
      status: "pending",
    });

    // Send notification to partner if applicable
    if (smeData.partnerId) {
      const partnerDoc = await db.collection("users").doc(smeData.partnerId).get();
      const partnerData = partnerDoc.data();
      
      if (partnerData?.email) {
        await db.collection("emailQueue").add({
          to: [partnerData.email],
          subject: "Introduction Request for Your Client",
          body: `
            <h2>Introduction Request</h2>
            <p>A buyer has requested an introduction to your client ${smeData.companyName}.</p>
            <p><strong>Buyer:</strong> ${buyerData?.companyName}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/partner/introductions/${introRef.id}">View Details</a></p>
          `,
          createdAt: Timestamp.now(),
          status: "pending",
        });
      }
    }

    // Send confirmation to buyer
    await db.collection("emailQueue").add({
      to: [buyerData?.email],
      subject: "Introduction Request Submitted",
      body: `
        <h2>Introduction Request Submitted</h2>
        <p>Your introduction request to ${smeData.companyName} has been submitted.</p>
        <p>You will be notified when the SME responds.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/buyer/introductions">View My Requests</a></p>
      `,
      createdAt: Timestamp.now(),
      status: "pending",
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "introduction_requested",
      resource: "introduction",
      resourceId: introRef.id,
      details: { smeId, smeCompany: smeData.companyName },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      introductionId: introRef.id,
    });
  } catch (error: any) {
    console.error("Error creating introduction request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create introduction request" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/introductions
 * Get introductions (filtered by role)
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
    const stage = searchParams.get("stage");

    let query = db.collection("introductions").orderBy("requestedAt", "desc");

    // Filter by role
    if (claims.role === "buyer") {
      query = query.where("buyerId", "==", decodedToken.uid) as any;
    } else if (claims.role === "sme_user") {
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();
      query = query.where("smeId", "==", userData?.smeId) as any;
    } else if (claims.role === "partner_user") {
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();
      query = query.where("partnerId", "==", userData?.partnerId) as any;
    }

    if (status) {
      query = query.where("status", "==", status) as any;
    }

    if (stage) {
      query = query.where("stage", "==", stage) as any;
    }

    const introductionsSnapshot = await query.limit(100).get();

    const introductions = introductionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ introductions });
  } catch (error: any) {
    console.error("Error fetching introductions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch introductions" },
      { status: 500 }
    );
  }
}
