import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { TESTIMONIALS_COLLECTION } from "@/lib/schema/testimonials";
import { Timestamp } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/auth/server-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const docRef = db.collection(TESTIMONIALS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    const data = docSnap.data();
    const testimonial = {
      id: docSnap.id,
      ...data,
      createdAt: data?.createdAt?.toDate().toISOString(),
      updatedAt: data?.updatedAt?.toDate().toISOString(),
    };

    return NextResponse.json({ data: testimonial });
  } catch (error: any) {
    console.error("Error fetching testimonial:", error);
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
    const docRef = db.collection(TESTIMONIALS_COLLECTION).doc(id);

    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (body.quote !== undefined) updateData.quote = body.quote;
    if (body.clientName !== undefined) updateData.clientName = body.clientName;
    if (body.clientTitle !== undefined) updateData.clientTitle = body.clientTitle;
    if (body.companyName !== undefined) updateData.companyName = body.companyName;
    if (body.companyIndustry !== undefined) updateData.companyIndustry = body.companyIndustry;
    if (body.companyLogoUrl !== undefined) updateData.companyLogoUrl = body.companyLogoUrl;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;

    await docRef.update(updateData);

    return NextResponse.json({ data: { id, ...updateData } });
  } catch (error: any) {
    console.error("Error updating testimonial:", error);
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
    const docRef = db.collection(TESTIMONIALS_COLLECTION).doc(id);
    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
