import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/cohorts
 * Create CMMC cohort program (instructor only)
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    // Verify instructor role
    if (claims.role !== "cmmc_instructor" && claims.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      startDate,
      duration,
      maxParticipants,
      pricing,
      syllabus,
    } = body;

    if (!title || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, startDate" },
        { status: 400 }
      );
    }

    // Initialize 12-week curriculum structure
    const curriculum = Array.from({ length: 12 }, (_, i) => ({
      week: i + 1,
      title: `Week ${i + 1}`,
      description: "",
      learningObjectives: [],
      materials: [],
      releaseDate: null,
      status: "locked",
    }));

    const cohortData = {
      title,
      description: description || "",
      instructorId: decodedToken.uid,
      
      startDate: Timestamp.fromDate(new Date(startDate)),
      duration: duration || 12,
      endDate: Timestamp.fromDate(
        new Date(new Date(startDate).getTime() + (duration || 12) * 7 * 24 * 60 * 60 * 1000)
      ),
      
      maxParticipants: maxParticipants || 50,
      enrolledCount: 0,
      participants: [],
      
      pricing: {
        fullPayment: pricing?.fullPayment || 0,
        partialPayment: pricing?.partialPayment || null,
      },
      
      syllabus: syllabus || null,
      curriculum,
      
      status: "draft",
      publishedAt: null,
      
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const cohortRef = await db.collection("cohorts").add(cohortData);

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "cohort_created",
      resource: "cohort",
      resourceId: cohortRef.id,
      details: { title },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      cohortId: cohortRef.id,
    });
  } catch (error: any) {
    console.error("Error creating cohort:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create cohort" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cohorts
 * Get cohorts (published for SMEs, all for instructors/admins)
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

    let query = db.collection("cohorts").orderBy("startDate", "desc");

    // SME users see only published cohorts
    if (claims.role === "sme_user") {
      query = query.where("status", "==", "published") as any;
    }
    // Instructors see their own cohorts
    else if (claims.role === "cmmc_instructor") {
      query = query.where("instructorId", "==", decodedToken.uid) as any;
    }
    // Admins see all

    const cohortsSnapshot = await query.limit(50).get();

    const cohorts = cohortsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ cohorts });
  } catch (error: any) {
    console.error("Error fetching cohorts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch cohorts" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cohorts
 * Update cohort (publish, update curriculum, etc.)
 */
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const { cohortId, action, ...updateData } = body;

    if (!cohortId) {
      return NextResponse.json(
        { error: "Missing cohortId" },
        { status: 400 }
      );
    }

    const cohortRef = db.collection("cohorts").doc(cohortId);
    const cohortDoc = await cohortRef.get();

    if (!cohortDoc.exists) {
      return NextResponse.json(
        { error: "Cohort not found" },
        { status: 404 }
      );
    }

    const cohortData = cohortDoc.data();

    // Verify instructor ownership
    if (cohortData?.instructorId !== decodedToken.uid) {
      const claims = decodedToken as any;
      if (claims.role !== "platform_admin") {
        return NextResponse.json(
          { error: "Unauthorized to modify this cohort" },
          { status: 403 }
        );
      }
    }

    const updates: any = {
      updatedAt: Timestamp.now(),
    };

    if (action === "publish") {
      updates.status = "published";
      updates.publishedAt = Timestamp.now();
    } else {
      Object.assign(updates, updateData);
    }

    await cohortRef.update(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating cohort:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update cohort" },
      { status: 500 }
    );
  }
}
