import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/auth/server-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const docRef = db.collection(COLLECTIONS.WEBINARS).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Webinar not found" }, { status: 404 });
    }

    const data = docSnap.data();
    const webinar = {
      id: docSnap.id,
      ...data,
      createdAt: data?.createdAt?.toDate().toISOString(),
      updatedAt: data?.updatedAt?.toDate().toISOString(),
      publishedAt: data?.publishedAt?.toDate().toISOString(),
    };

    return NextResponse.json({ data: webinar });
  } catch (error: any) {
    console.error("Error fetching webinar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const docRef = db.collection(COLLECTIONS.WEBINARS).doc(id);

    const updateData = {
      ...body,
      updatedAt: Timestamp.now(),
    };

    // Remove fields that shouldn't be updated or cause issues
    delete updateData.id;
    delete updateData.createdAt;

    await docRef.update(updateData);

    return NextResponse.json({ data: { id, ...updateData } });
  } catch (error: any) {
    console.error("Error updating webinar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const docRef = db.collection(COLLECTIONS.WEBINARS).doc(id);
    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting webinar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
