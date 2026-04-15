import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

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

  try {
    const result = await resend.emails.send({
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
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
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
        const charge = paymentIntent.latest_charge ? await stripe.charges.retrieve(paymentIntent.latest_charge as string) : null;
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

export const config = {
  api: {
    bodyParser: false, // Required for Stripe webhook signature verification
  },
};
