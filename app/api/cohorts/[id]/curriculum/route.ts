import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * PUT /api/cohorts/[id]/curriculum
 * Upload curriculum materials for a week (instructor only)
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
    const { week, title, description, learningObjectives, materials, releaseDate } = body;

    if (!week || week < 1 || week > 12) {
      return NextResponse.json(
        { error: "Invalid week number (must be 1-12)" },
        { status: 400 }
      );
    }

    const cohortRef = db.collection("cohorts").doc(params.id);
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
      return NextResponse.json(
        { error: "Unauthorized to modify this cohort" },
        { status: 403 }
      );
    }

    // Update curriculum for specific week
    const curriculum = cohortData?.curriculum || [];
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

    await cohortRef.update({
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
 * POST /api/cohorts/[id]/curriculum
 * Release curriculum module (automated or manual)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const cohortRef = db.collection("cohorts").doc(params.id);
    const cohortDoc = await cohortRef.get();

    if (!cohortDoc.exists) {
      return NextResponse.json(
        { error: "Cohort not found" },
        { status: 404 }
      );
    }

    const cohortData = cohortDoc.data();
    const curriculum = cohortData?.curriculum || [];
    const weekIndex = week - 1;

    // Update module status to available
    curriculum[weekIndex].status = "available";

    await cohortRef.update({
      curriculum,
      updatedAt: Timestamp.now(),
    });

    // Notify all participants
    const participants = cohortData?.participants || [];
    
    for (const participantId of participants) {
      const userDoc = await db.collection("users").doc(participantId).get();
      const userData = userDoc.data();

      if (userData?.email) {
        await db.collection("emailQueue").add({
          to: [userData.email],
          subject: `New Content Released: Week ${week}`,
          body: `
            <h2>New Content Available!</h2>
            <p>Week ${week} materials for ${cohortData?.title} are now available.</p>
            <p><strong>Module:</strong> ${curriculum[weekIndex].title}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/cohorts/${params.id}">Access Content</a></p>
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
