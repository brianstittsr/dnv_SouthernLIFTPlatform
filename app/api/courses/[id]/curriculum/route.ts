import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * PUT /api/courses/[id]/curriculum
 * Upload curriculum materials for a week (instructor only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { week, title, description, learningObjectives, materials, releaseDate } = body;

    if (!week || week < 1 || week > 12) {
      return NextResponse.json(
        { error: "Invalid week number (must be 1-12)" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const courseRef = db.collection("courses").doc(id);
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
      return NextResponse.json(
        { error: "Unauthorized to modify this course" },
        { status: 403 }
      );
    }

    // Update curriculum for specific week
    const curriculum = courseData?.curriculum || [];
    const weekIndex = week - 1;

    if (weekIndex >= curriculum.length) {
      return NextResponse.json(
        { error: "Week not found in curriculum" },
        { status: 404 }
      );
    }

    curriculum[weekIndex] = {
      ...curriculum[weekIndex],
      week,
      title: title || curriculum[weekIndex].title,
      description: description || curriculum[weekIndex].description,
      learningObjectives: learningObjectives || curriculum[weekIndex].learningObjectives,
      materials: materials || curriculum[weekIndex].materials,
      releaseDate: releaseDate ? Timestamp.fromDate(new Date(releaseDate)) : curriculum[weekIndex].releaseDate,
      status: curriculum[weekIndex].status,
    };

    await courseRef.update({
      curriculum,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating curriculum:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update curriculum" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]/curriculum
 * Release curriculum module (automated or manual)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    await auth.verifyIdToken(token);

    const body = await req.json();
    const { week } = body;

    if (!week || week < 1 || week > 12) {
      return NextResponse.json(
        { error: "Invalid week number" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const courseRef = db.collection("courses").doc(id);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = courseDoc.data();
    const curriculum = courseData?.curriculum || [];
    const weekIndex = week - 1;

    // Update module status to available
    curriculum[weekIndex].status = "available";

    await courseRef.update({
      curriculum,
      updatedAt: Timestamp.now(),
    });

    // Notify all participants
    const participants = courseData?.participants || [];
    
    for (const participantId of participants) {
      const userDoc = await db.collection("users").doc(participantId).get();
      const userData = userDoc.data();

      if (userData?.email) {
        await db.collection("emailQueue").add({
          to: [userData.email],
          subject: `New Content Released: Week ${week}`,
          body: `
            <h2>New Content Available!</h2>
            <p>Week ${week} materials for ${courseData?.title} are now available.</p>
            <p><strong>Module:</strong> ${curriculum[weekIndex].title}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/courses/${id}">Access Content</a></p>
          `,
          createdAt: Timestamp.now(),
          status: "pending",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Week ${week} released successfully`,
    });
  } catch (error: any) {
    console.error("Error releasing curriculum:", error);
    return NextResponse.json(
      { error: error.message || "Failed to release curriculum" },
      { status: 500 }
    );
  }
}
