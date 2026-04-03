# Stripe Monthly Recurring Billing Setup Guide

## Overview
This guide explains how to set up monthly recurring billing for the KDM Consortium Membership ($1,250/month) in Stripe.

## Step 1: Set Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys (already configured)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Monthly Price ID (obtained after setup)
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxxxx

# Admin setup key (for one-time setup)
ADMIN_SETUP_KEY=your_secure_admin_key_here
```

## Step 2: Run the Setup Endpoint

This creates the Stripe product and prices automatically.

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/stripe/setup-products \
  -H "Authorization: Bearer your_secure_admin_key_here" \
  -H "Content-Type: application/json"
```

### Using Node.js/JavaScript:
```javascript
const response = await fetch('/api/stripe/setup-products', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_secure_admin_key_here',
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
console.log('Setup complete:', data);
```

### Response Example:
```json
{
  "message": "Stripe products and prices set up successfully",
  "product": {
    "id": "prod_xxxxx",
    "name": "KDM Consortium Membership"
  },
  "prices": {
    "monthly": {
      "id": "price_xxxxx",
      "amount": 125000,
      "currency": "usd",
      "interval": "month"
    },
    "annual": {
      "id": "price_yyyyy",
      "amount": 1200000,
      "currency": "usd",
      "interval": "year"
    }
  }
}
```

## Step 3: Update Environment Variables

Copy the `price_id` from the monthly price and add it to `.env.local`:

```env
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxxxx
```

## Step 4: Verify in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Catalog**
3. Find "KDM Consortium Membership"
4. Verify:
   - Monthly price: $1,250.00 USD
   - Annual price: $12,000.00 USD (20% discount)
   - Recurring billing enabled

## How It Works

### Checkout Flow for Recurring Billing:

1. **User adds KDM Consortium Membership to cart**
   - System detects this is a recurring product

2. **User clicks "Proceed to Checkout"**
   - System creates a Stripe Subscription (not a one-time payment)
   - Subscription is in "incomplete" state pending payment

3. **User fills registration form and payment details**
   - First Name, Last Name, Email, Password
   - Credit card or other payment method

4. **Payment is confirmed**
   - First month ($1,250) is charged immediately
   - Subscription is activated
   - User account is created with "consortium_member" role
   - User is tagged as "KDM Consortium Member"

5. **Automatic recurring charges**
   - Stripe automatically charges the customer monthly
   - Charges occur on the same day each month
   - Subscription continues until cancelled

## API Endpoints

### Create Subscription
**POST** `/api/checkout/create-subscription`

Request:
```json
{
  "email": "user@example.com",
  "priceId": "price_xxxxx"
}
```

Response:
```json
{
  "subscriptionId": "sub_xxxxx",
  "clientSecret": "pi_xxxxx_secret_xxxxx",
  "customerId": "cus_xxxxx"
}
```

### Record Transaction
**POST** `/api/checkout/record-transaction`

Request:
```json
{
  "paymentIntentId": "pi_xxxxx",
  "userId": "user_id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "amount": 125000,
  "currency": "usd",
  "productName": "KDM Consortium Membership",
  "status": "succeeded",
  "membershipType": "kdm-consortium"
}
```

## Subscription Management

### View Subscriptions in Stripe Dashboard
1. Go to **Customers** in Stripe Dashboard
2. Find the customer by email
3. View their active subscriptions
4. See billing history and upcoming charges

### Cancel a Subscription
Users can cancel their subscription through:
- Stripe Customer Portal (self-service)
- Admin dashboard (manual cancellation)

### Update Subscription
To change billing interval or amount:
1. Retrieve the subscription ID
2. Update via Stripe API or Dashboard
3. Changes apply to next billing cycle

## Testing

### Test Card Numbers
- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **Amex**: 3782 822463 10005

Use any future expiration date and any CVC.

### Test Subscription Flow
1. Add KDM Consortium Membership to cart
2. Click "Proceed to Checkout"
3. Fill in registration form
4. Use test card 4242 4242 4242 4242
5. Complete payment
6. Verify subscription created in Stripe Dashboard

## Webhook Events to Monitor

Configure webhooks in Stripe Dashboard for:

- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

## Troubleshooting

### Subscription not created
- Check that `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID` is set correctly
- Verify price exists in Stripe Dashboard
- Check browser console for errors

### Payment fails
- Verify card is not expired
- Check card has sufficient funds
- Ensure billing address matches card

### Customer not found
- Ensure customer email is correct
- Check Stripe Dashboard for customer record

## Production Checklist

- [ ] Use live Stripe keys (not test keys)
- [ ] Set `ADMIN_SETUP_KEY` to a secure random value
- [ ] Configure webhook endpoints in Stripe Dashboard
- [ ] Enable email notifications for failed payments
- [ ] Set up dunning management for failed renewals
- [ ] Test subscription cancellation flow
- [ ] Document customer support process for cancellations
- [ ] Set up monitoring for failed payments
- [ ] Configure tax settings if applicable

## Support

For issues with Stripe integration:
1. Check Stripe Dashboard logs
2. Review browser console for client-side errors
3. Check server logs for API errors
4. Contact Stripe support for account-level issues
