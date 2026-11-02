import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/courses
 * Create CMMC course program (instructor only)
 */
export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
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

    const courseData = {
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

    const courseRef = await db.collection("courses").add(courseData);

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "course_created",
      resource: "course",
      resourceId: courseRef.id,
      details: { title },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      courseId: courseRef.id,
    });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/courses
 * Get courses (published for SMEs, all for instructors/admins)
 */
export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    let query = db.collection("courses").orderBy("startDate", "desc");

    // SME users see only published courses
    if (claims.role === "sme_user") {
      query = query.where("status", "==", "published") as any;
    }
    // Instructors see their own courses
    else if (claims.role === "cmmc_instructor") {
      query = query.where("instructorId", "==", decodedToken.uid) as any;
    }
    // Admins see all

    const coursesSnapshot = await query.limit(50).get();

    const courses = coursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses
 * Update course (publish, update curriculum, etc.)
 */
export async function PUT(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const { courseId, action, ...updateData } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Missing courseId" },
        { status: 400 }
      );
    }

    const courseRef = db.collection("courses").doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = courseDoc.data();

    // Verify instructor ownership
    if (courseData?.instructorId !== decodedToken.uid) {
      const claims = decodedToken as any;
      if (claims.role !== "platform_admin") {
        return NextResponse.json(
          { error: "Unauthorized to modify this course" },
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

    await courseRef.update(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update course" },
      { status: 500 }
    );
  }
}
