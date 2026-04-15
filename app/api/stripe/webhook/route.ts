import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

const CC_EMAIL = "kmoore@kdm-assoc.com";
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

async function sendCcNotification(eventType: string, data: PaymentEventData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping CC email for", eventType);
    return;
  }

  const amountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: data.currency.toUpperCase(),
  }).format(data.amount / 100);

  const subject = `[KDM Payment] ${eventType.replace(".", " ").toUpperCase()} - ${amountFormatted}`;

  const htmlContent = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a1a1a; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
        Payment ${data.status === "succeeded" ? "Received" : "Updated"}
      </h2>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Event Type:</strong></td>
          <td style="padding: 8px 0;">${eventType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Amount:</strong></td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #2563eb;">${amountFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Customer:</strong></td>
          <td style="padding: 8px 0;">${data.customerName || "N/A"} (${data.customerEmail || "no email"})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Description:</strong></td>
          <td style="padding: 8px 0;">${data.description || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Payment ID:</strong></td>
          <td style="padding: 8px 0; font-family: monospace;">${data.id}</td>
        </tr>
        ${data.invoiceId ? `
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Invoice ID:</strong></td>
          <td style="padding: 8px 0; font-family: monospace;">${data.invoiceId}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
          <td style="padding: 8px 0;">
            <span style="
              background: ${data.status === "succeeded" || data.status === "paid" ? "#dcfce7" : "#fef3c7"};
              color: ${data.status === "succeeded" || data.status === "paid" ? "#166534" : "#92400e"};
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
            ">${data.status}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
          <td style="padding: 8px 0;">${new Date(data.created * 1000).toLocaleString()}</td>
        </tr>
      </table>

      ${data.hostedInvoiceUrl || data.receiptUrl ? `
      <div style="margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; color: #666;"><strong>Links:</strong></p>
        ${data.hostedInvoiceUrl ? `<a href="${data.hostedInvoiceUrl}" style="color: #2563eb; display: block; margin: 5px 0;">View Invoice</a>` : ""}
        ${data.receiptUrl ? `<a href="${data.receiptUrl}" style="color: #2563eb; display: block; margin: 5px 0;">View Receipt</a>` : ""}
        <a href="https://dashboard.stripe.com/payments/${data.id}" style="color: #2563eb; display: block; margin: 5px 0;">View in Stripe Dashboard</a>
      </div>
      ` : ""}

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #9ca3af; font-size: 12px;">
        This is an automated notification from the KDM Associates payment system.<br>
        You are receiving this because you are configured to receive payment CC notifications.
      </p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: CC_EMAIL,
      subject,
      html: htmlContent,
    });
    console.log("CC email sent to", CC_EMAIL, "for event", eventType, "result:", result);
  } catch (error) {
    console.error("Failed to send CC email:", error);
    // Don't throw - webhook should still succeed even if CC email fails
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
        await sendCcNotification(event.type, {
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
        await sendCcNotification(event.type, {
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
        await sendCcNotification(event.type, {
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
        await sendCcNotification(event.type, {
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
        await sendCcNotification(event.type, {
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
        await sendCcNotification(event.type, {
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
        await sendCcNotification(event.type, {
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
