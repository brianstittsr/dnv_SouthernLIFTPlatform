import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  jobTitle?: string;
  businessType: string;
  industry?: string;
  service: string;
  message?: string;
  newsletter: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    
    console.log("Contact form received:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.company || !body.businessType || !body.service) {
      console.log("Missing fields check:", {
        firstName: !!body.firstName,
        lastName: !!body.lastName,
        email: !!body.email,
        company: !!body.company,
        businessType: !!body.businessType,
        service: !!body.service,
      });
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
    let contactMessageId = "";
    try {
      const docRef = await db.collection(COLLECTIONS.CONTACT_MESSAGES).add({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        company: body.company,
        jobTitle: body.jobTitle || null,
        businessType: body.businessType,
        industry: body.industry || null,
        service: body.service,
        message: body.message || null,
        newsletter: body.newsletter,
        status: "new",
        emailSent: false,
        confirmationEmailSent: false,
        source: "contact-page",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      contactMessageId = docRef.id;
      console.log("Contact form saved to Firestore with ID:", contactMessageId);
    } catch (dbError) {
      console.error("Failed to save contact form to Firestore:", dbError);
      return NextResponse.json(
        { error: "Failed to save submission. Please try again." },
        { status: 500 }
      );
    }

    // Send notification email to KDM team
    const adminEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "kmoore@kdm-assoc.com";
    let emailSent = false;
    let confirmationSent = false;
    
    try {
      await sendEmail({
        to: adminEmail,
        subject: `New Session Request from ${body.firstName} ${body.lastName}`,
        html: `
          <h1>New Session Request</h1>
          <p>A new contact form submission has been received:</p>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.firstName} ${body.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${body.email}">${body.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.phone || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Company</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.company}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Job Title</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.jobTitle || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Business Type</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.businessType}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Industry/NAICS</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.industry || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Service of Interest</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.service}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.message || "No message provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Newsletter</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.newsletter ? "Yes" : "No"}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Please respond within 24 hours.</p>
        `,
        text: `New Session Request from ${body.firstName} ${body.lastName}\n\nEmail: ${body.email}\nPhone: ${body.phone || "Not provided"}\nCompany: ${body.company}\nBusiness Type: ${body.businessType}\nService: ${body.service}\nMessage: ${body.message || "No message"}`,
      });
      emailSent = true;
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
      // Don't fail the request if email fails - data is still saved
    }

    // Send confirmation email to the user
    try {
      await sendEmail({
        to: body.email,
        subject: "Thank you for contacting KDM & Associates",
        html: `
          <h1>Thank you for reaching out, ${body.firstName}!</h1>
          <p>We've received your request for an introductory session and one of our government contracting experts will contact you within 24 hours.</p>
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>A member of our team will review your information</li>
            <li>We'll reach out to schedule your session</li>
            <li>You'll receive a customized assessment of your contracting readiness</li>
          </ul>
          <p>In the meantime, feel free to explore our resources or contact us directly:</p>
          <ul>
            <li>Email: <a href="mailto:info@kdm-assoc.com">info@kdm-assoc.com</a></li>
            <li>Phone: (202) 469-3423</li>
          </ul>
          <p>Best regards,<br>The KDM & Associates Team</p>
        `,
        text: `Thank you for reaching out, ${body.firstName}! We've received your request and will contact you within 24 hours.`,
      });
      confirmationSent = true;
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    // Update Firestore document with email status
    if (contactMessageId) {
      try {
        await db.collection(COLLECTIONS.CONTACT_MESSAGES).doc(contactMessageId).update({
          emailSent,
          confirmationEmailSent: confirmationSent,
          updatedAt: Timestamp.now(),
        });
      } catch (updateError) {
        console.error("Failed to update email status:", updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
      id: contactMessageId,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
