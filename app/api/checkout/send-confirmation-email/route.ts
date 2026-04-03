import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      firstName,
      lastName,
      paymentIntentId,
      amount,
      productName,
    } = body;

    if (!email || !paymentIntentId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: email, paymentIntentId, amount" },
        { status: 400 }
      );
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1>Payment Confirmation</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Dear ${firstName} ${lastName},</p>
          
          <p>Thank you for your payment! Your KDM Consortium Membership has been successfully activated.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Transaction Details</h3>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
            <p><strong>Transaction ID:</strong> ${paymentIntentId}</p>
            <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">Completed</span></p>
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Your account has been created and is ready to use</li>
            <li>You can now log in with your email and password</li>
            <li>Access exclusive member benefits and resources</li>
            <li>Connect with other KDM Consortium members</li>
          </ul>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Log In to Your Account
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 14px;">
            If you have any questions about your membership or need support, please contact us at <strong>kmoore@kdm-assoc.com</strong>
          </p>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            © 2024 KDM & Associates. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await db.collection("emailQueue").add({
      to: [email],
      subject: "Payment Confirmation - KDM Consortium Membership",
      htmlBody: emailContent,
      textBody: `
Payment Confirmation

Dear ${firstName} ${lastName},

Thank you for your payment! Your KDM Consortium Membership has been successfully activated.

Transaction Details:
- Product: ${productName}
- Amount: $${(amount / 100).toFixed(2)}
- Transaction ID: ${paymentIntentId}
- Status: Completed

What's Next?
- Your account has been created and is ready to use
- You can now log in with your email and password
- Access exclusive member benefits and resources
- Connect with other KDM Consortium members

Log in to your account: ${process.env.NEXT_PUBLIC_APP_URL}/login

If you have any questions about your membership or need support, please contact us at kmoore@kdm-assoc.com

© 2024 KDM & Associates. All rights reserved.
      `,
      createdAt: Timestamp.now(),
      status: "pending",
      type: "payment_confirmation",
      metadata: {
        paymentIntentId,
        email,
        firstName,
        lastName,
      },
    });

    return NextResponse.json({
      message: "Confirmation email queued successfully",
      emailId: paymentIntentId,
    });
  } catch (error) {
    console.error("Error queuing confirmation email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to queue email" },
      { status: 500 }
    );
  }
}
