# Custom Checkout Implementation

## Overview

This document describes the custom Stripe checkout implementation that replaces the hosted Stripe checkout with an embedded payment form that matches the SVP Platform's design system.

## Architecture

### Flow

1. User selects a subscription tier on `/portal/subscription`
2. User is redirected to `/portal/subscription/checkout?tier={tier}`
3. Custom checkout page creates a Stripe Payment Intent via API
4. User enters payment details using Stripe Elements
5. Payment is processed and user is redirected to `/portal/subscription/success?tier={tier}`
6. Success page updates the user's subscription tier in Firestore
7. User can navigate to create Proof Packs or view their subscription

### Components

#### 1. Checkout Page (`app/(portal)/portal/subscription/checkout/page.tsx`)

**Features:**
- Matches website design with Card components
- Order summary sidebar showing tier details and pricing
- Embedded Stripe Elements payment form
- Email pre-filled from Firebase Auth
- Secure payment processing with Stripe
- Error handling and loading states

**Key Elements:**
- `CheckoutForm` component handles Stripe Elements integration
- `PaymentElement` provides the payment method input
- Responsive layout with order summary and payment form
- Security indicators (lock icons, "Powered by Stripe")

#### 2. Success Page (`app/(portal)/portal/subscription/success/page.tsx`)

**Features:**
- Confirmation message with success icon
- Subscription details display
- Automatic subscription tier update via API
- Next steps guidance
- Quick actions to create Proof Packs or view subscription

#### 3. API Routes

**`/api/subscription/create-payment-intent`**
- Creates Stripe Payment Intent for the selected tier
- Validates user authentication
- Returns client secret for Stripe Elements
- Stores metadata (userId, tier, email)

**`/api/subscription/update`** (existing)
- Updates user's subscription tier in Firestore
- Logs audit event
- Used by success page after payment confirmation

## Stripe Integration

### Required Environment Variables

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

### Pricing

Prices are defined in cents:
- DIY: $99.00 (9900 cents)
- DWY: $299.00 (29900 cents)
- DFY: $599.00 (59900 cents)

### Payment Methods

Stripe Elements automatically supports:
- Credit/debit cards
- Apple Pay
- Google Pay
- Link (Stripe's one-click checkout)

## Design System Integration

The custom checkout uses the existing UI components:

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Button` with variants (default, outline)
- `Input` for email field
- `Label` for form labels
- `Alert`, `AlertDescription` for errors and messages
- `Separator` for visual dividers
- Lucide icons: `CreditCard`, `Lock`, `Check`, `ArrowLeft`, `CheckCircle2`

### Styling

The Stripe Elements appearance is customized to match the site:

```typescript
appearance: {
  theme: "stripe",
  variables: {
    colorPrimary: "#0f172a",
    colorBackground: "#ffffff",
    colorText: "#0f172a",
    colorDanger: "#ef4444",
    fontFamily: "system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
}
```

## Security

- All API routes require Firebase Auth token
- Payment processing handled by Stripe (PCI compliant)
- Client secrets are single-use and expire
- HTTPS required for production
- No sensitive card data touches the server

## Testing

### Test Cards (Stripe Test Mode)

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

### Test Flow

1. Navigate to `/portal/subscription`
2. Click "Upgrade to DIY" (or DWY/DFY)
3. Verify checkout page loads with correct tier info
4. Enter test card details
5. Submit payment
6. Verify redirect to success page
7. Confirm subscription tier updated in Firestore

## Dependencies

```json
{
  "@stripe/stripe-js": "^4.x.x",
  "@stripe/react-stripe-js": "^2.x.x",
  "stripe": "^17.x.x"
}
```

## Future Enhancements

- [ ] Add subscription management (cancel, update payment method)
- [ ] Implement webhooks for payment events
- [ ] Add invoice history
- [ ] Support for annual billing with discount
- [ ] Proration handling for mid-cycle upgrades
- [ ] Add coupon/promo code support
- [ ] Email receipts via SendGrid/Resend

## Troubleshooting

### Payment Intent Creation Fails

**Symptom:** Checkout page shows "Failed to initialize checkout"

**Solutions:**
1. Verify `STRIPE_SECRET_KEY` is set in `.env.local`
2. Check Firebase Admin credentials are configured
3. Verify user is authenticated
4. Check server logs for specific error

### Payment Confirmation Fails

**Symptom:** Payment processes but subscription not updated

**Solutions:**
1. Check `/api/subscription/update` route is working
2. Verify Firestore permissions
3. Check browser console for errors
4. Verify success page redirect URL is correct

### Stripe Elements Not Loading

**Symptom:** Payment form shows "Initializing payment form..."

**Solutions:**
1. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
2. Check browser console for Stripe.js errors
3. Ensure internet connection (Stripe.js loads from CDN)
4. Verify client secret is valid

## References

- [Stripe Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [React Stripe.js](https://stripe.com/docs/stripe-js/react)
