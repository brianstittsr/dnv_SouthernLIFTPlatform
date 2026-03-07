import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { TESTIMONIALS_COLLECTION } from "@/lib/schema/testimonials";
import { Timestamp } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/auth/server-auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const testimonialsRef = db.collection(TESTIMONIALS_COLLECTION);
    const snapshot = await testimonialsRef.orderBy("displayOrder", "asc").orderBy("createdAt", "desc").get();

    const testimonials = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      };
    });

    return NextResponse.json({ data: testimonials });
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await req.json();
    const testimonialsRef = db.collection(TESTIMONIALS_COLLECTION);

    const now = Timestamp.now();
    const docData = {
      quote: body.quote,
      clientName: body.clientName,
      clientTitle: body.clientTitle,
      companyName: body.companyName,
      companyIndustry: body.companyIndustry,
      companyLogoUrl: body.companyLogoUrl || null,
      rating: body.rating || 5,
      featured: body.featured || false,
      isActive: body.isActive !== undefined ? body.isActive : true,
      displayOrder: body.displayOrder || 0,
      createdAt: now,
      updatedAt: now,
      createdBy: user.uid,
    };

    const docRef = await testimonialsRef.add(docData);

    return NextResponse.json({ 
      data: { 
        id: docRef.id, 
        ...docData,
        createdAt: now.toDate().toISOString(), 
        updatedAt: now.toDate().toISOString() 
      } 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
