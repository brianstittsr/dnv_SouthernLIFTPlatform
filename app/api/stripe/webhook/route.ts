import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { auth, db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!);
const getResend = () => process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const CC_EMAILS = ["bstitt@strategicvalueplus.com", "kmoore@kdm-assoc.com"];
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "payments@kdm-assoc.com";

interface PaymentEventData {
  id: string;
  amount: number;
  currency: string;
  customerEmail?: string | null;
  customerName?: string | null;
  description?: string | null;
  invoiceId?: string | null;
  receiptUrl?: string | null;
  hostedInvoiceUrl?: string | null;
  status: string;
  created: number;
}

async function sendPaymentConfirmation(eventType: string, data: PaymentEventData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping payment confirmation email for", eventType);
    return;
  }

  // Skip if no customer email to send to
  if (!data.customerEmail) {
    console.warn("No customer email found, skipping payment confirmation");
    return;
  }

  const amountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: data.currency.toUpperCase(),
  }).format(data.amount / 100);

  const isSuccessful = data.status === "succeeded" || data.status === "paid" || data.status === "completed";
  const subject = isSuccessful 
    ? `Payment Confirmation - ${amountFormatted} - KDM Associates`
    : `Payment Update - ${amountFormatted} - KDM Associates`;

  // Customer-friendly confirmation email
  const htmlContent = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: ${isSuccessful ? '#166534' : '#92400e'}; margin-bottom: 10px;">
          ${isSuccessful ? '✓ Payment Confirmed' : 'Payment Status Update'}
        </h1>
        <p style="font-size: 14px; color: #666;">Thank you for your payment to KDM Associates</p>
      </div>
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Amount Paid:</strong></td>
            <td style="padding: 8px 0; font-size: 20px; font-weight: bold; color: #2563eb;">${amountFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
            <td style="padding: 8px 0;">${new Date(data.created * 1000).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Description:</strong></td>
            <td style="padding: 8px 0;">${data.description || "Payment to KDM Associates"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
            <td style="padding: 8px 0;">
              <span style="
                background: ${isSuccessful ? '#dcfce7' : '#fef3c7'};
                color: ${isSuccessful ? '#166534' : '#92400e'};
                padding: 4px 12px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 600;
              ">${data.status}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Payment ID:</strong></td>
            <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${data.id}</td>
          </tr>
          ${data.invoiceId ? `
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Invoice ID:</strong></td>
            <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${data.invoiceId}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      ${data.hostedInvoiceUrl || data.receiptUrl ? `
      <div style="margin: 25px 0; text-align: center;">
        ${data.receiptUrl ? `<a href="${data.receiptUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 5px;">View Receipt</a>` : ""}
        ${data.hostedInvoiceUrl ? `<a href="${data.hostedInvoiceUrl}" style="background: #f1f5f9; color: #334155; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 5px;">View Invoice</a>` : ""}
      </div>
      ` : ""}

      <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
        <p style="color: #666; font-size: 13px; margin-bottom: 5px;"><strong>Questions about this payment?</strong></p>
        <p style="color: #666; font-size: 13px; margin: 0;">
          Contact us at <a href="mailto:support@kdm-assoc.com" style="color: #2563eb;">support@kdm-assoc.com</a> or 
          call us at (555) 123-4567.
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #9ca3af; font-size: 11px; text-align: center;">
        KDM Associates | Strategic Value Plus Platform<br>
        This is an automated confirmation of your payment.
      </p>
    </div>
  `;

  const resendClient = getResend();
  if (!resendClient) {
    console.warn("RESEND_API_KEY not set, skipping email for", eventType);
    return;
  }
  try {
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      cc: CC_EMAILS,
      subject,
      html: htmlContent,
    });
    console.log("Payment confirmation sent to", data.customerEmail, "with CC to", CC_EMAILS.join(", "), "result:", result);
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
    // Don't throw - webhook should still succeed even if email fails
  }
}

/**
 * Handle KDM Consortium membership signup
 * Creates Firebase Auth user, Firestore user/teamMember records, and sends welcome email
 */
async function handleConsortiumSignup(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;
  const { firebaseUid, firstName: metaFirst, lastName: metaLast, companyName: metaCompany, plan } = session.metadata || {};

  if (!customerEmail) {
    console.error("No customer email in session, cannot create consortium member");
    return;
  }

  try {
    // Parse name — prefer metadata values, fall back to Stripe customer name split
    const nameParts = customerName?.split(" ") || [];
    const firstName = metaFirst || nameParts[0] || "";
    const lastName = metaLast || nameParts.slice(1).join(" ") || "";
    const companyName = metaCompany || "";

    // ------------------------------------------------------------------
    // 1. Resolve or create Firebase Auth user
    // ------------------------------------------------------------------
    let userRecord;
    let isNewUser = false;
    let tempPassword: string | null = null;
    let passwordResetLink: string | null = null;

    try {
      // If firebaseUid is in metadata the user was already signed in at checkout
      if (firebaseUid) {
        userRecord = await auth.getUser(firebaseUid);
        console.log("Resolved existing Firebase user from metadata UID:", userRecord.uid);
      } else {
        userRecord = await auth.getUserByEmail(customerEmail);
        console.log("Resolved existing Firebase user by email:", userRecord.uid);
      }
      // Existing user — generate a password reset link so they can set their password
      const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || process.env.NEXT_PUBLIC_URL || "https://kdm-assoc.com";
      passwordResetLink = await auth.generatePasswordResetLink(customerEmail, {
        url: `${baseUrl}/portal/dashboard`,
      });
      console.log("Generated password reset link for existing user:", userRecord.uid);
    } catch {
      // No existing account — create one with a temporary password
      isNewUser = true;
      tempPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-4).toUpperCase() +
        Math.floor(Math.random() * 90 + 10).toString();

      userRecord = await auth.createUser({
        email: customerEmail,
        displayName: customerName || `${firstName} ${lastName}`.trim() || undefined,
        password: tempPassword,
        emailVerified: true, // auto-verify since they paid
      });
      console.log("Created new Firebase Auth user:", userRecord.uid);
    }

    const uid = userRecord.uid;

    // ------------------------------------------------------------------
    // 2. Create or update the Firestore users doc
    // ------------------------------------------------------------------
    const usersRef = db.collection("users");
    const userDocRef = usersRef.doc(uid);
    const existingUserDoc = await userDocRef.get();

    const subscriptionData = {
      stripeCustomerId: session.customer || null,
      stripeSubscriptionId: session.subscription || null,
      subscriptionStatus: "active",
      plan: plan || "monthly",
      membershipType: "consortium",
      activatedAt: FieldValue.serverTimestamp(),
    };

    if (existingUserDoc.exists()) {
      await userDocRef.update({
        ...subscriptionData,
        firstName: firstName || existingUserDoc.data()?.firstName,
        lastName: lastName || existingUserDoc.data()?.lastName,
        companyName: companyName || existingUserDoc.data()?.companyName,
        paymentComplete: true,
        onboardingStatus: "active",
        updatedAt: FieldValue.serverTimestamp(),
        ...(isNewUser && tempPassword
          ? { tempPassword, isTempPassword: true, hasChangedPassword: false }
          : {}),
      });
      console.log("Updated existing users doc:", uid);
    } else {
      await userDocRef.set({
        email: customerEmail,
        firstName,
        lastName,
        companyName,
        displayName: customerName || `${firstName} ${lastName}`.trim(),
        ...subscriptionData,
        paymentComplete: true,
        profileComplete: false,
        onboardingStatus: "active",
        onboardingStep: 0,
        role: "consortium_member",
        ...(isNewUser && tempPassword
          ? { tempPassword, isTempPassword: true, hasChangedPassword: false }
          : {}),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log("Created new users doc:", uid);
    }

    // ------------------------------------------------------------------
    // 3. Create or update teamMembers record
    // ------------------------------------------------------------------
    const teamMembersRef = db.collection("teamMembers");
    const existingQuery = await teamMembersRef
      .where("emailPrimary", "==", customerEmail)
      .limit(1)
      .get();

    const teamMemberData = {
      firebaseUid: uid,
      firstName,
      lastName,
      emailPrimary: customerEmail,
      company: companyName,
      expertise: "KDM Consortium Member",
      role: "affiliate",
      status: "active",
      teamTag: "affiliate",
      tags: ["kdm-consortium"],
      consortiumOnboardingComplete: false,
      consortiumJoinedAt: FieldValue.serverTimestamp(),
      stripeCustomerId: session.customer || null,
      stripeSubscriptionId: session.subscription || null,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (existingQuery.empty) {
      await teamMembersRef.add({ ...teamMemberData, createdAt: FieldValue.serverTimestamp() });
      console.log("Created new teamMembers record for:", uid);
    } else {
      await existingQuery.docs[0].ref.update({
        ...teamMemberData,
        tags: FieldValue.arrayUnion("kdm-consortium"),
      });
      console.log("Updated existing teamMembers record for:", uid);
    }

    // ------------------------------------------------------------------
    // 4. Send welcome email with credentials or password reset link
    // ------------------------------------------------------------------
    await sendConsortiumWelcomeEmail({
      email: customerEmail,
      name: customerName || `${firstName} ${lastName}`.trim(),
      isNewUser,
      tempPassword,
      passwordResetLink,
    });

  } catch (error) {
    console.error("Error handling consortium signup:", error);
    // Don't throw — payment is still valid; log for manual follow-up
  }
}

interface ConsortiumWelcomeEmailParams {
  email: string;
  name: string;
  isNewUser: boolean;
  tempPassword: string | null;
  passwordResetLink: string | null;
}

/**
 * Send KDM Consortium welcome email with login credentials or password reset link
 */
async function sendConsortiumWelcomeEmail(params: ConsortiumWelcomeEmailParams) {
  const { email, name, isNewUser, tempPassword, passwordResetLink } = params;

  const resendClient = getResend();
  if (!resendClient) {
    console.warn("RESEND_API_KEY not set, skipping welcome email");
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || process.env.NEXT_PUBLIC_URL || "https://kdm-assoc.com";
  const loginUrl = `${baseUrl}/sign-in`;

  // Build the credentials block based on whether this is a new or returning user
  const credentialsHtml = isNewUser && tempPassword
    ? `
      <div style="background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">Your Login Credentials</h3>
        <p style="margin: 6px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 6px 0;"><strong>Temporary Password:</strong> <code style="background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-size: 15px;">${tempPassword}</code></p>
        <p style="margin: 12px 0 0 0; font-size: 13px; color: #92400e;">
          ⚠️ This is a temporary password. You will be prompted to create a permanent password after your first login.
        </p>
      </div>`
    : passwordResetLink
    ? `
      <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">Set Your Password</h3>
        <p style="margin: 6px 0;">Your membership is linked to your existing account (<strong>${email}</strong>).</p>
        <p style="margin: 6px 0;">Click the button below to set a password for your portal access:</p>
        <div style="margin: 16px 0; text-align: center;">
          <a href="${passwordResetLink}" style="background: #3b82f6; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">
            Set My Password
          </a>
        </div>
        <p style="margin: 0; font-size: 12px; color: #6b7280;">This link expires in 24 hours.</p>
      </div>`
    : `
      <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0;">Use your existing email and password to log in: <strong>${email}</strong></p>
      </div>`;

  const credentialsText = isNewUser && tempPassword
    ? `Your Login Credentials\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nThis is a temporary password — you will be prompted to create a permanent password on first login.`
    : passwordResetLink
    ? `Set Your Password\nYour membership is linked to your existing account (${email}).\nSet your password here: ${passwordResetLink}\n(This link expires in 24 hours.)`
    : `Use your existing email and password to log in: ${email}`;

  const htmlContent = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e3a5f; margin-bottom: 10px;">Welcome to the KDM Consortium!</h1>
        <p style="font-size: 16px; color: #666;">Your membership has been activated</p>
      </div>

      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="margin-top: 0;">Dear ${name || "New Member"},</p>

        <p>Thank you for joining the KDM Consortium! You are now part of our selective network of expert companies positioned to win federal contracts.</p>

        ${credentialsHtml}

        <div style="margin: 24px 0; text-align: center;">
          <a href="${loginUrl}" style="background: #c9a227; color: #1e3a5f; padding: 14px 32px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 16px;">
            Log In to Your Portal
          </a>
        </div>

        <p><strong>What happens next:</strong></p>
        <ul>
          <li>Complete your profile to get matched with opportunities</li>
          <li>Join our weekly Friday 3pm consortium meetings</li>
          <li>Access curated contract opportunities</li>
          <li>Connect with government buyers and fellow members</li>
        </ul>

        <p style="font-size: 14px; color: #666;">
          <strong>Need help?</strong><br>
          Contact us at <a href="mailto:kmoore@kdm-assoc.com" style="color: #2563eb;">kmoore@kdm-assoc.com</a>
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #9ca3af; font-size: 11px; text-align: center;">
        KDM Consortium | KDM &amp; Associates<br>
        This email was sent because you recently joined the KDM Consortium.
      </p>
    </div>
  `;

  const textContent = `Welcome to the KDM Consortium!

Dear ${name || "New Member"},

Thank you for joining the KDM Consortium! You are now part of our selective network of expert companies.

${credentialsText}

Log in here: ${loginUrl}

What happens next:
- Complete your profile to get matched with opportunities
- Join our weekly Friday 3pm consortium meetings
- Access curated contract opportunities
- Connect with government buyers and fellow members

Need help? Contact us at kmoore@kdm-assoc.com

KDM Consortium | KDM & Associates
  `;

  try {
    await resendClient.emails.send({
      from: FROM_EMAIL,
      to: email,
      cc: CC_EMAILS,
      subject: "Welcome to the KDM Consortium — Your Account is Ready",
      html: htmlContent,
      text: textContent,
    });
    console.log("Consortium welcome email sent to", email);
  } catch (error) {
    console.error("Failed to send consortium welcome email:", error);
  }
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Stripe webhook received:", event.type, event.id);

  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await sendPaymentConfirmation(event.type, {
          id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          customerEmail: invoice.customer_email,
          customerName: invoice.customer_name,
          description: invoice.description || `Invoice #${invoice.number}`,
          invoiceId: invoice.id,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          status: "paid",
          created: invoice.created,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await sendPaymentConfirmation(event.type, {
          id: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          customerEmail: invoice.customer_email,
          customerName: invoice.customer_name,
          description: invoice.description || `Invoice #${invoice.number}`,
          invoiceId: invoice.id,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          status: "failed",
          created: invoice.created,
        });
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const charge = paymentIntent.latest_charge ? await getStripe().charges.retrieve(paymentIntent.latest_charge as string) : null;
        await sendPaymentConfirmation(event.type, {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerEmail: paymentIntent.receipt_email || charge?.receipt_email,
          customerName: charge?.billing_details?.name,
          description: paymentIntent.description || "Payment",
          receiptUrl: charge?.receipt_url,
          status: "succeeded",
          created: paymentIntent.created,
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await sendPaymentConfirmation(event.type, {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerEmail: paymentIntent.receipt_email,
          description: paymentIntent.description || "Payment",
          status: "failed",
          created: paymentIntent.created,
        });
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await sendPaymentConfirmation(event.type, {
          id: session.id,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          customerEmail: session.customer_details?.email,
          customerName: session.customer_details?.name,
          description: `Checkout Session - ${session.mode}`,
          status: "completed",
          created: session.created,
        });
        
        // Handle KDM Consortium membership signup
        if (session.metadata?.membershipType === "consortium") {
          await handleConsortiumSignup(session);
        }
        break;
      }

      case "charge.succeeded": {
        const charge = event.data.object as Stripe.Charge;
        await sendPaymentConfirmation(event.type, {
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          customerEmail: charge.receipt_email,
          customerName: charge.billing_details?.name,
          description: charge.description || "Charge",
          receiptUrl: charge.receipt_url,
          status: "succeeded",
          created: charge.created,
        });
        break;
      }

      case "charge.failed": {
        const charge = event.data.object as Stripe.Charge;
        await sendPaymentConfirmation(event.type, {
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          customerEmail: charge.receipt_email,
          customerName: charge.billing_details?.name,
          description: charge.description || "Charge",
          status: "failed",
          created: charge.created,
        });
        break;
      }

      default:
        console.log("Unhandled webhook event type:", event.type);
    }
  } catch (error) {
    console.error("Error processing webhook event:", event.type, error);
    // Still return 200 to acknowledge receipt - we don't want Stripe to retry
  }

  return NextResponse.json({ received: true });
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds for webhook processing
