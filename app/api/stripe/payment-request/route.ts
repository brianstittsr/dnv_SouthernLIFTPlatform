import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "usd", description, customerEmail, customerName, memo, dueDate } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "A valid amount is required" }, { status: 400 });
    }
    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }

    // Find or create customer
    let customer: Stripe.Customer;
    const existing = await stripe.customers.list({ email: customerEmail, limit: 1 });
    if (existing.data.length > 0) {
      customer = existing.data[0];
      if (customerName && !customer.name) {
        customer = await stripe.customers.update(customer.id, { name: customerName });
      }
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName || undefined,
        metadata: { source: "payment-request" },
      });
    }

    // Create a Payment Link via a one-time price
    const price = await stripe.prices.create({
      unit_amount: Math.round(amount * 100),
      currency,
      product_data: {
        name: description || "Payment Request",
      },
    });

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: {
        type: "hosted_confirmation",
        hosted_confirmation: { custom_message: "Thank you for your payment!" },
      },
      metadata: {
        customerEmail,
        customerName: customerName || "",
        memo: memo || "",
        dueDate: dueDate || "",
        source: "revenue-config-payment-request",
      },
    });

    // Send the payment link via Stripe invoice email (optional — also returns the URL)
    // Create an invoice and send it so the customer gets an email
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customer.id,
      amount: Math.round(amount * 100),
      currency,
      description: description || "Payment Request",
    });

    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: dueDate ? Math.max(1, Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)) : 30,
      description: memo || description || undefined,
      metadata: {
        source: "revenue-config-payment-request",
        paymentLinkId: paymentLink.id,
        paymentLinkUrl: paymentLink.url,
      },
    });

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(finalizedInvoice.id);

    return NextResponse.json({
      success: true,
      paymentLink: {
        id: paymentLink.id,
        url: paymentLink.url,
      },
      invoice: {
        id: finalizedInvoice.id,
        hostedUrl: finalizedInvoice.hosted_invoice_url,
        status: finalizedInvoice.status,
      },
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
    });
  } catch (error) {
    console.error("Payment request error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // Fetch invoices tagged as payment requests
    const invoices = await stripe.invoices.list({
      limit,
    });

    const requests = invoices.data
      .filter(inv => inv.metadata?.source === "revenue-config-payment-request")
      .map(inv => ({
        id: inv.id,
        amount: (inv.amount_due || 0) / 100,
        currency: inv.currency,
        status: inv.status,
        customerEmail: inv.customer_email,
        customerName: inv.customer_name,
        description: inv.description,
        hostedUrl: inv.hosted_invoice_url,
        paymentLinkUrl: inv.metadata?.paymentLinkUrl,
        memo: inv.metadata?.memo,
        dueDate: inv.metadata?.dueDate,
        created: inv.created,
        paidAt: inv.status_transitions?.paid_at,
      }));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching payment requests:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch payment requests" },
      { status: 500 }
    );
  }
}
