import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { TESTIMONIALS_COLLECTION } from "@/lib/schema/testimonials";

export async function GET(req: NextRequest) {
  try {
    const testimonialsRef = db.collection(TESTIMONIALS_COLLECTION);
    
    // Only return active testimonials, ordered by displayOrder and creation date
    const snapshot = await testimonialsRef
      .where("isActive", "==", true)
      .orderBy("displayOrder", "asc")
      .orderBy("createdAt", "desc")
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
      };
    });

    return NextResponse.json({ data: testimonials });
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
