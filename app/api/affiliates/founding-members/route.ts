import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";

interface FoundingMemberAffiliateFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName: string;
  jobTitle?: string;
  expertise: string[];
  valueProposition?: string;
  acknowledgesCommitments: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: FoundingMemberAffiliateFormData = await request.json();

    // Validate required fields
    if (
      !body.firstName ||
      !body.lastName ||
      !body.email ||
      !body.companyName ||
      !body.expertise ||
      body.expertise.length === 0 ||
      !body.acknowledgesCommitments
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Save to Firestore
    let applicationId = "";
    try {
      if (!db) {
        throw new Error("Firestore not initialized");
      }

      const docRef = await db.collection(COLLECTIONS.AFFILIATE_APPLICATIONS).add({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        companyName: body.companyName,
        jobTitle: body.jobTitle || null,
        expertise: body.expertise,
        valueProposition: body.valueProposition || null,
        source: "founding-member-affiliate-page",
        isFoundingMember: true,
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      applicationId = docRef.id;
    } catch (dbError) {
      console.error("Failed to save affiliate application to Firestore:", dbError);
      return NextResponse.json(
        { error: "Failed to save application. Please try again." },
        { status: 500 }
      );
    }

    // Send notification email to admin
    try {
      await sendEmail({
        to: "kmoore@kdm-assoc.com",
        subject: `New Founding Member Affiliate Application — ${body.firstName} ${body.lastName}`,
        html: `
          <h1>New Founding Member Affiliate Application</h1>
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <ul>
            <li><strong>Name:</strong> ${body.firstName} ${body.lastName}</li>
            <li><strong>Email:</strong> ${body.email}</li>
            <li><strong>Phone:</strong> ${body.phone || "N/A"}</li>
            <li><strong>Company:</strong> ${body.companyName}</li>
            <li><strong>Job Title:</strong> ${body.jobTitle || "N/A"}</li>
            <li><strong>Expertise:</strong> ${body.expertise.join(", ")}</li>
          </ul>
          <p><strong>Value Proposition:</strong></p>
          <p>${body.valueProposition || "N/A"}</p>
          <p>Review in the admin portal under Affiliate Applications.</p>
        `,
        text: `New Founding Member Affiliate Application from ${body.firstName} ${body.lastName} (${body.email}) at ${body.companyName}. Expertise: ${body.expertise.join(", ")}.`,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
      // Do not fail the request if email fails
    }

    // Send confirmation email to applicant
    try {
      await sendEmail({
        to: body.email,
        subject: "KDM Affiliate Application Received",
        html: `
          <h1>Thank you, ${body.firstName}!</h1>
          <p>We have received your application to join the KDM Affiliate Network as a Founding Member affiliate.</p>
          <p>Our team will review your submission and contact you within 2 business days with next steps.</p>
          <p>Best regards,<br>The KDM & Associates Team</p>
        `,
        text: `Thank you, ${body.firstName}! We have received your Founding Member affiliate application. Our team will review it and contact you within 2 business days.`,
      });
    } catch (emailError) {
      console.error("Failed to send applicant confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      applicationId,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Founding member affiliate application error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
