/**
 * PayPal Payment Integration
 * 
 * Handles PayPal payment processing for event tickets and sponsorships
 * Requires PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables
 */

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Types
export interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  links: { href: string; rel: string; method: string }[];
  purchase_units: PayPalPurchaseUnit[];
  payer?: PayPalPayer;
  create_time?: string;
  update_time?: string;
}

export interface PayPalPurchaseUnit {
  reference_id?: string;
  description?: string;
  custom_id?: string;
  amount: {
    currency_code: string;
    value: string;
    breakdown?: {
      item_total?: { currency_code: string; value: string };
      shipping?: { currency_code: string; value: string };
      tax_total?: { currency_code: string; value: string };
    };
  };
  items?: PayPalItem[];
  payee?: { email_address?: string; merchant_id?: string };
  payments?: {
    captures?: PayPalCapture[];
    refunds?: PayPalRefund[];
  };
}

export interface PayPalItem {
  name: string;
  description?: string;
  quantity: string;
  unit_amount: { currency_code: string; value: string };
  category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS' | 'DONATION';
}

export interface PayPalPayer {
  name?: { given_name?: string; surname?: string };
  email_address?: string;
  payer_id?: string;
  address?: {
    address_line_1?: string;
    admin_area_2?: string;
    admin_area_1?: string;
    postal_code?: string;
    country_code?: string;
  };
}

export interface PayPalCapture {
  id: string;
  status: string;
  amount: { currency_code: string; value: string };
  create_time: string;
}

export interface PayPalRefund {
  id: string;
  status: string;
  amount: { currency_code: string; value: string };
  create_time: string;
}

export interface CreateOrderParams {
  eventId: string;
  eventName: string;
  items: {
    name: string;
    description?: string;
    price: number; // in dollars
    quantity: number;
  }[];
  currency?: string;
  returnUrl: string;
  cancelUrl: string;
  customId?: string;
}

// Get PayPal access token
async function getAccessToken(): Promise<string | null> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error('PayPal credentials not configured');
    return null;
  }

  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    return null;
  }
}

// Create PayPal order
export async function createOrder(params: CreateOrderParams): Promise<PayPalOrder | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const currency = params.currency || 'USD';
    const items: PayPalItem[] = params.items.map(item => ({
      name: item.name.substring(0, 127), // PayPal limit
      description: item.description?.substring(0, 127),
      quantity: item.quantity.toString(),
      unit_amount: {
        currency_code: currency,
        value: item.price.toFixed(2),
      },
      category: 'DIGITAL_GOODS' as const,
    }));

    const itemTotal = params.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: params.eventId,
        description: params.eventName.substring(0, 127),
        custom_id: params.customId || params.eventId,
        amount: {
          currency_code: currency,
          value: itemTotal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: itemTotal.toFixed(2),
            },
          },
        },
        items,
      }],
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        brand_name: 'KDM & Associates',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
      },
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal create order error:', errorData);
      throw new Error(`PayPal order creation failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
}

// Capture PayPal order (complete payment)
export async function captureOrder(orderId: string): Promise<PayPalOrder | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal capture error:', errorData);
      throw new Error(`PayPal capture failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
}

// Get order details
export async function getOrder(orderId: string): Promise<PayPalOrder | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`PayPal get order failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting PayPal order:', error);
    return null;
  }
}

// Refund a captured payment
export async function refundCapture(captureId: string, amount?: number, currency?: string): Promise<PayPalRefund | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const body: any = {};
    if (amount !== undefined) {
      body.amount = {
        currency_code: currency || 'USD',
        value: amount.toFixed(2),
      };
    }

    const response = await fetch(`${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal refund error:', errorData);
      throw new Error(`PayPal refund failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error refunding PayPal capture:', error);
    throw error;
  }
}

// Verify webhook signature
export async function verifyWebhookSignature(
  webhookId: string,
  headers: Record<string, string>,
  body: string
): Promise<boolean> {
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  try {
    const verificationData = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationData),
    });

    if (!response.ok) return false;

    const result = await response.json();
    return result.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Error verifying PayPal webhook:', error);
    return false;
  }
}

// Check if PayPal is configured
export function isPayPalConfigured(): boolean {
  return !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);
}

// Get approval URL from order
export function getApprovalUrl(order: PayPalOrder): string | null {
  const approveLink = order.links?.find(link => link.rel === 'approve');
  return approveLink?.href || null;
}
