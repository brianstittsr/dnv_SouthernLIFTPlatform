import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, type PlatformSettingsDoc } from "@/lib/schema";
import { getProgramBranding } from "@/lib/branding";

const branding = getProgramBranding();

/** Masks an email for logs: "brian@x.com" -> "b***@x.com" */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

/** Masks a phone for logs: "(225) 555-0100" -> "***-0100" */
function maskPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  return `***-${digits.slice(-4) || "****"}`;
}

/** Logs the submission shape without PII (names, emails, phones, free text). */
function logSubmission(body: ContactFormData) {
  console.log("Contact form received:", {
    name: `${body.firstName?.slice(0, 1) ?? "?"}*** ${body.lastName?.slice(0, 1) ?? "?"}***`,
    email: maskEmail(body.email ?? ""),
    phone: maskPhone(body.phone),
    company: body.company,
    businessType: body.businessType,
    industry: body.industry,
    service: body.service,
    newsletter: body.newsletter,
    smsConsentTransactional: !!body.smsConsentTransactional,
    smsConsentMarketing: !!body.smsConsentMarketing,
    messageLength: body.message?.length ?? 0,
  });
}

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
  smsConsentTransactional?: boolean;
  smsConsentMarketing?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }
    const body: ContactFormData = await request.json();

    logSubmission(body);

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
        smsConsentTransactional: body.smsConsentTransactional || false,
        smsConsentMarketing: body.smsConsentMarketing || false,
        smsConsentTimestamp: (body.smsConsentTransactional || body.smsConsentMarketing) ? Timestamp.now() : null,
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

    // Fetch CC recipients: admin-managed list in platformSettings/global plus
    // the legacy contactEmailRecipients collection.
    const ccEmails = new Set<string>();
    try {
      const settingsSnap = await db
        .collection(COLLECTIONS.PLATFORM_SETTINGS)
        .doc("global")
        .get();
      const settings = settingsSnap.data() as PlatformSettingsDoc | undefined;
      for (const email of settings?.contactEmailRecipients ?? []) {
        if (email?.includes("@")) ccEmails.add(email.trim());
      }
    } catch (settingsError) {
      console.error("Failed to fetch settings recipients:", settingsError);
    }
    try {
      const recipientsSnap = await db.collection("contactEmailRecipients").get();
      for (const d of recipientsSnap.docs) {
        const email = d.data().email as string;
        if (email?.includes("@")) ccEmails.add(email.trim());
      }
    } catch (ccError) {
      console.error("Failed to fetch CC recipients:", ccError);
    }

    // Send notification email to the program team
    const adminEmail =
      process.env.NEXT_PUBLIC_SUPPORT_EMAIL || branding.contactFormRecipient;
    let emailSent = false;
    let confirmationSent = false;
    let emailError = null;
    
    try {
      const adminResult = await sendEmail({
        to: adminEmail,
        ...(ccEmails.size > 0 ? { cc: [...ccEmails] } : {}),
        subject: branding.isLift
          ? `New LIFT Center inquiry from ${body.firstName} ${body.lastName}`
          : `New Session Request from ${body.firstName} ${body.lastName}`,
        html: `
          <h1>${branding.isLift ? "New LIFT Center Inquiry" : "New Session Request"}</h1>
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
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>SMS Consent (Transactional)</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.smsConsentTransactional ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>SMS Consent (Marketing)</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.smsConsentMarketing ? "Yes" : "No"}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Please respond within 24 hours.</p>
        `,
        text: `${branding.isLift ? "New LIFT Center inquiry" : "New Session Request"} from ${body.firstName} ${body.lastName}\n\nEmail: ${body.email}\nPhone: ${body.phone || "Not provided"}\nCompany: ${body.company}\nBusiness Type: ${body.businessType}\nService: ${body.service}\nMessage: ${body.message || "No message"}`,
      });
      
      if (!adminResult.success) {
        throw new Error(adminResult.error || "Failed to send admin notification email");
      }
      emailSent = true;
    } catch (emailError: any) {
      console.error("Failed to send notification email:", emailError);
      return NextResponse.json(
        { error: `Email failed: ${emailError.message || "Could not send email"}` },
        { status: 500 }
      );
    }

    // Send confirmation email to the user
    const confirmation = branding.isLift
      ? {
          subject: "Thank you for contacting the Southern University LIFT Center",
          html: `
          <h1>Thank you for reaching out, ${body.firstName}!</h1>
          <p>We've received your inquiry at the Southern University MBDA LIFT Rural Business Center. A member of our team will review your submission and follow up with you.</p>
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>A LIFT Center team member will review your information</li>
            <li>You may be invited to complete the AI intake interview and program forms</li>
            <li>An advisor will follow up about no-cost services available to your business</li>
          </ul>
          <p>In the meantime, feel free to contact us directly:</p>
          <ul>
            <li>Email: <a href="mailto:${branding.contactEmail}">${branding.contactEmail}</a></li>
            <li>Phone: ${branding.contactPhone}</li>
          </ul>
          <p>Best regards,<br>The Southern University LIFT Center Team</p>
          <p style="margin-top:16px;font-size:12px;color:#666;">Funded in part by the U.S. Department of Commerce, Minority Business Development Agency (MBDA).</p>
        `,
          text: `Thank you for reaching out, ${body.firstName}! The Southern University MBDA LIFT Rural Business Center received your inquiry and will follow up. Contact us at ${branding.contactEmail} or ${branding.contactPhone}.`,
        }
      : {
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
            <li>Email: <a href="mailto:${branding.contactEmail}">${branding.contactEmail}</a></li>
            <li>Phone: ${branding.contactPhone}</li>
          </ul>
          <p>Best regards,<br>The KDM & Associates Team</p>
        `,
          text: `Thank you for reaching out, ${body.firstName}! We've received your request and will contact you within 24 hours.`,
        };
    try {
      await sendEmail({
        to: body.email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
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
