import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { TESTIMONIALS_COLLECTION } from "@/lib/schema/testimonials";

export async function GET(req: NextRequest) {
  try {
    const testimonialsRef = db.collection(TESTIMONIALS_COLLECTION);
    
    // Only return active testimonials
    // Note: Using single orderBy to avoid composite index requirement
    const snapshot = await testimonialsRef
      .where("isActive", "==", true)
      .orderBy("displayOrder", "asc")
      .get();

    const testimonials = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        quote: data.quote,
        clientName: data.clientName,
        clientTitle: data.clientTitle,
        companyName: data.companyName,
        companyIndustry: data.companyIndustry,
        companyLogoUrl: data.companyLogoUrl || null,
        rating: data.rating || 5,
        featured: data.featured || false,
        displayOrder: data.displayOrder || 0,
        createdAt: data.createdAt,
      };
    });

    // Sort in memory: first by displayOrder, then by createdAt (newest first)
    testimonials.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      // If displayOrder is the same, sort by createdAt descending
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    // Remove internal fields before returning
    const cleanedTestimonials = testimonials.map(({ displayOrder, createdAt, ...rest }) => rest);

    return NextResponse.json({ data: cleanedTestimonials });
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
