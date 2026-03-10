import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { TESTIMONIALS_COLLECTION } from "@/lib/schema/testimonials";

export async function GET(req: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!db) {
      console.error("Testimonials API: Firebase Admin DB not initialized");
      return NextResponse.json({ 
        data: [],
        warning: "Database not initialized" 
      });
    }

    const testimonialsRef = db.collection(TESTIMONIALS_COLLECTION);
    
    // Only return active testimonials
    // Note: Using single orderBy to avoid composite index requirement
    const snapshot = await testimonialsRef
      .where("isActive", "==", true)
      .orderBy("displayOrder", "asc")
      .get();

    // If no testimonials found, return empty array (not an error)
    if (snapshot.empty) {
      console.log("Testimonials API: No active testimonials found");
      return NextResponse.json({ data: [] });
    }

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

    console.log(`Testimonials API: Returning ${cleanedTestimonials.length} testimonials`);
    return NextResponse.json({ data: cleanedTestimonials });
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json({ 
      data: [],
      error: error.message 
    }, { status: 200 }); // Changed to 200 to prevent client-side errors
  }
}
