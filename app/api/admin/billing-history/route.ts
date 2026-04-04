import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { COLLECTIONS } from '@/lib/schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

interface BillingRecord {
  customerId: string;
  customerName: string;
  customerEmail: string;
  month: string; // YYYY-MM format
  amount: number;
  currency: string;
  status: string;
  invoiceId?: string;
  subscriptionId?: string;
  tier?: string;
}

interface MonthlyBillingGroup {
  month: string;
  totalRevenue: number;
  totalCustomers: number;
  records: BillingRecord[];
}

/**
 * GET /api/admin/billing-history
 * Fetch monthly billing history for KDM Consortium customers
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthsBack = parseInt(searchParams.get('monthsBack') || '12');
    const customerId = searchParams.get('customerId');

    const billingRecords: BillingRecord[] = [];

    // Fetch from Stripe invoices
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe API key not configured' },
        { status: 500 }
      );
    }

    try {
      // Fetch all invoices from Stripe
      const invoices = await stripe.invoices.list({
        limit: 100,
        status: 'paid',
      });

      for (const invoice of invoices.data) {
        if (!invoice.customer) continue;

        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
        
        // Get customer details
        let customerName = 'Unknown';
        let customerEmail = 'Unknown';
        let tier = 'unknown';

        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer && !customer.deleted) {
            customerName = (customer as Stripe.Customer).name || 'Unknown';
            customerEmail = (customer as Stripe.Customer).email || 'Unknown';
            
            // Try to get tier from metadata
            const metadata = (customer as Stripe.Customer).metadata;
            if (metadata?.tier) {
              tier = metadata.tier;
            }
          }
        } catch (err) {
          console.error('Error fetching customer:', err);
        }

        // Extract month from invoice date
        const invoiceDate = new Date(invoice.created * 1000);
        const month = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`;

        // Check if within requested range
        const monthDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 1);
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);

        if (monthDate < cutoffDate) continue;

        // Filter by customerId if specified
        if (customerId && customerId !== invoice.customer) continue;

        const invoiceAny = invoice as any;
        billingRecords.push({
          customerId,
          customerName,
          customerEmail,
          month,
          amount: (invoice.amount_paid || 0) / 100,
          currency: (invoice.currency || 'usd').toUpperCase(),
          status: invoice.status || 'unknown',
          invoiceId: invoice.id,
          subscriptionId: typeof invoiceAny.subscription === 'string' ? invoiceAny.subscription : invoiceAny.subscription?.id,
          tier,
        });
      }
    } catch (error: any) {
      console.error('Error fetching from Stripe:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Stripe invoices', details: error.message },
        { status: 500 }
      );
    }

    // Group by month
    const groupedByMonth = new Map<string, BillingRecord[]>();
    billingRecords.forEach((record) => {
      if (!groupedByMonth.has(record.month)) {
        groupedByMonth.set(record.month, []);
      }
      groupedByMonth.get(record.month)!.push(record);
    });

    // Sort months in descending order and create summary
    const monthlyBilling: MonthlyBillingGroup[] = Array.from(groupedByMonth.entries())
      .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
      .map(([month, records]) => ({
        month,
        totalRevenue: records.reduce((sum, r) => sum + r.amount, 0),
        totalCustomers: new Set(records.map(r => r.customerId)).size,
        records: records.sort((a, b) => b.amount - a.amount),
      }));

    // Calculate overall summary
    const totalRevenue = billingRecords.reduce((sum, r) => sum + r.amount, 0);
    const uniqueCustomers = new Set(billingRecords.map(r => r.customerId)).size;
    const averageMonthlyRevenue = monthlyBilling.length > 0 ? totalRevenue / monthlyBilling.length : 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        uniqueCustomers,
        averageMonthlyRevenue,
        monthsIncluded: monthlyBilling.length,
      },
      monthlyBilling,
      totalRecords: billingRecords.length,
    });
  } catch (error: any) {
    console.error('Error fetching billing history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch billing history' },
      { status: 500 }
    );
  }
}
