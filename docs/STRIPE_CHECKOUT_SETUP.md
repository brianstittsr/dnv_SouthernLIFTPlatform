# Stripe Checkout Integration Guide

## Overview

The SVP Platform now includes a complete e-commerce checkout system integrated with Stripe for processing payments for:
- **KDM Consortium Membership** ($1,250/month or $13,500/year)
- **CMMC Cohort Training** ($7,500 one-time)

## Features

- ✅ Shopping cart with persistent state (localStorage)
- ✅ Stripe Checkout integration
- ✅ Transaction tracking in Firestore
- ✅ Admin transaction management dashboard
- ✅ Webhook handling for payment events
- ✅ Success/failure page handling

## Setup Instructions

### 1. Stripe Account Setup

1. Create or log in to your [Stripe account](https://dashboard.stripe.com/)
2. Get your API keys from **Developers > API keys**
3. Create a webhook endpoint at **Developers > Webhooks**

### 2. Environment Variables

Add the following to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...                    # From Stripe Dashboard > API keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # From Stripe Dashboard > API keys
STRIPE_WEBHOOK_SECRET=whsec_...                  # From Stripe Dashboard > Webhooks

# Application URL (for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000        # Change to production URL in production
```

### 3. Webhook Configuration

1. Go to **Stripe Dashboard > Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/checkout/webhook`
4. Select the following events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret** and add it to `STRIPE_WEBHOOK_SECRET`

### 4. Firestore Security Rules

Add the following rules to your `firestore.rules`:

```javascript
// Transactions collection
match /transactions/{transactionId} {
  // Only admins can read all transactions
  allow read: if isAdmin();
  
  // System can write (via Admin SDK)
  allow write: if false;
}
```

### 5. Test the Integration

1. Start the dev server: `npm run dev`
2. Navigate to `/pricing`
3. Click "Add to Cart" on either product
4. Go to `/checkout-cart`
5. Click "Proceed to Checkout"
6. Use Stripe test card: `4242 4242 4242 4242`
7. Complete the checkout flow

## File Structure

```
app/
├── (marketing)/
│   ├── checkout-cart/
│   │   └── page.tsx              # Shopping cart page
│   ├── checkout-success/
│   │   └── page.tsx              # Success page after payment
│   └── pricing/
│       └── page.tsx              # Updated with Add to Cart buttons
├── (portal)/portal/admin/
│   └── transactions/
│       └── page.tsx              # Admin transaction management
└── api/checkout/
    ├── create-session/
    │   └── route.ts              # Create Stripe checkout session
    └── webhook/
        └── route.ts              # Handle Stripe webhooks

components/
└── cart/
    ├── add-to-cart-button.tsx    # Reusable add to cart button
    └── cart-icon.tsx             # Cart icon with item count

lib/
├── stores/
│   └── cart-store.ts             # Zustand cart state management
├── types/
│   └── cart.ts                   # Product and cart type definitions
└── schema/
    └── transactions.ts           # Transaction Firestore schema
```

## Product Configuration

Products are defined in `lib/types/cart.ts`:

```typescript
export const PRODUCTS: Record<ProductType, Product> = {
  'consortium': {
    id: 'kdm-consortium-membership',
    name: 'KDM Consortium Membership',
    price: 1250,
    billingPeriod: 'monthly',
    // ... features
  },
  'cmmc-cohort': {
    id: 'cmmc-cohort-training',
    name: 'CMMC Cohort Training',
    price: 7500,
    billingPeriod: 'one-time',
    // ... features
  }
};
```

## Admin Transaction Management

Access the transaction dashboard at `/portal/admin/transactions` to:
- View all transactions with real-time updates
- Filter by status (pending, completed, failed, refunded)
- Search by customer email or transaction ID
- View detailed transaction information
- Track revenue metrics

## Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Mark transaction as completed, store payment intent ID |
| `checkout.session.expired` | Mark transaction as failed |
| `payment_intent.payment_failed` | Mark transaction as failed with reason |
| `charge.refunded` | Mark transaction as refunded |

## Testing with Stripe Test Cards

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Declined payment |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

Use any future expiration date and any 3-digit CVC.

## Production Deployment

1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Replace test API keys with live keys from Stripe
3. Update webhook endpoint to production URL
4. Test thoroughly in production mode before going live

## Troubleshooting

### Webhook Not Receiving Events
- Verify webhook URL is publicly accessible
- Check webhook signing secret matches `.env.local`
- Review Stripe Dashboard > Webhooks for delivery attempts

### Transaction Not Updating
- Check Firebase Admin SDK is properly initialized
- Verify Firestore security rules allow admin writes
- Check server logs for errors

### Cart Not Persisting
- Ensure localStorage is enabled in browser
- Check browser console for Zustand errors
- Clear localStorage and try again

## Support

For issues or questions, contact the development team or refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
