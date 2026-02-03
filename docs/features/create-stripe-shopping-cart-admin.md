# Stripe Shopping Cart Admin Component - Development Prompt

## Overview
Create a comprehensive admin component for configuring and managing custom Stripe-powered shopping cart pages with full integration features, user account management, email notifications, and payment tracking.

---

## Component Requirements

### 1. API Configuration Management

#### Stripe API Keys
- **Sandbox/Test Mode**
  - Test publishable key input field
  - Test secret key input field (masked)
  - Visual indicator when in test mode (prominent badge/banner)
  - Test mode toggle switch
  
- **Production Mode**
  - Production publishable key input field
  - Production secret key input field (masked)
  - Production mode warning/confirmation before activation
  - Environment status indicator (Test vs Live)

- **API Key Validation**
  - Real-time validation of API keys on input
  - Connection test button to verify keys work
  - Display Stripe account info when connected (account name, email)
  - Error handling for invalid/expired keys
  - Secure storage in Firebase (encrypted secret keys)

#### Webhook Configuration
- Webhook endpoint URL display (auto-generated)
- Webhook secret key management
- List of active webhook events
- Webhook event testing interface
- Webhook logs viewer with filtering

---

### 2. Product & Pricing Management

#### Product Catalog
- **Product Creation**
  - Product name, description, images
  - SKU/product ID
  - Categories/tags
  - Active/inactive status toggle
  - Inventory tracking (optional)
  - Product metadata (custom fields)

- **Pricing Configuration**
  - One-time payment pricing
  - Recurring/subscription pricing (monthly, yearly, custom intervals)
  - Tiered pricing options
  - Volume/quantity-based pricing
  - Currency selection (multi-currency support)
  - Tax behavior settings (inclusive, exclusive, automatic)

- **Price Management**
  - Create multiple prices per product
  - Set default price
  - Archive old prices
  - Price lookup key for easy reference

#### Product Options & Variants
- Size, color, material options
- Custom option fields
- Variant-specific pricing
- Variant-specific inventory
- Option combinations management

---

### 3. Checkout Page Builder

#### Page Configuration
- **Visual Page Builder**
  - Drag-and-drop product selection
  - Custom page URL/slug
  - Page title and meta description (SEO)
  - Custom header/footer content
  - Brand logo upload
  - Color scheme customization
  - Custom CSS injection (advanced)

- **Checkout Settings**
  - Collect shipping address toggle
  - Collect billing address toggle
  - Phone number collection (required/optional)
  - Custom fields (text, dropdown, checkbox)
  - Terms & conditions checkbox
  - Privacy policy link
  - Promotional code/coupon field

- **Payment Options**
  - Card payments (Visa, Mastercard, Amex, etc.)
  - Digital wallets (Apple Pay, Google Pay)
  - ACH Direct Debit
  - Buy Now Pay Later (Afterpay, Klarna, Affirm)
  - Bank transfers
  - Payment method priority ordering

#### Checkout Flow Customization
- Single-page vs multi-step checkout
- Guest checkout vs required login
  - Create account during checkout option
  - Social login integration (Google, Apple)
- Order summary display options
- Shipping method selection
- Estimated delivery dates
- Gift message option
- Order notes field

---

### 4. User Account & Purchase Tracking

#### User Account Creation
- **During Checkout**
  - Auto-create account on first purchase
  - Password setup (email verification)
  - Optional account creation (guest checkout)
  - Link guest purchases to account later

- **Account Management**
  - Customer profile in Firebase
  - Link Stripe Customer ID to user account
  - Purchase history storage
  - Payment method storage (tokenized)
  - Shipping address book
  - Billing address book

#### Purchase Logging & History
- **Transaction Records**
  - Store all purchases in Firebase collection
  - Link to Stripe Payment Intent ID
  - Order status tracking (pending, processing, completed, refunded)
  - Order timeline (created, paid, shipped, delivered)
  - Download invoice/receipt
  - Reorder functionality

- **Customer Portal**
  - View order history
  - Track shipments
  - Download invoices
  - Manage subscriptions
  - Update payment methods
  - Cancel/modify orders (if allowed)

#### Analytics & Reporting
- Total revenue dashboard
- Revenue by product
- Revenue by time period (daily, weekly, monthly)
- Customer lifetime value (CLV)
- Conversion rate tracking
- Abandoned cart tracking
- Top products report
- Customer segmentation

---

### 5. Email Notification System

#### Purchase Confirmation Emails
- **Order Confirmation**
  - Sent immediately after successful payment
  - Order details (items, quantities, prices)
  - Order number and receipt
  - Estimated delivery date
  - Customer support contact info
  - Branded email template

- **Payment Receipt**
  - Itemized receipt
  - Payment method used
  - Billing address
  - Tax breakdown
  - PDF invoice attachment

#### Payment Activity Notifications
- **Successful Payments**
  - Payment confirmation to customer
  - Admin notification of new order
  - Customizable email templates

- **Failed Payments**
  - Payment failure notification to customer
  - Retry payment link
  - Alternative payment method suggestion
  - Admin alert for failed payments

- **Refund Notifications**
  - Refund confirmation to customer
  - Refund amount and reason
  - Expected refund timeline
  - Admin notification of refund issued

- **Subscription Events**
  - Subscription created
  - Subscription renewed
  - Subscription payment failed
  - Subscription canceled
  - Trial ending soon (3 days, 1 day)
  - Payment method expiring soon

- **Shipping Notifications**
  - Order shipped with tracking number
  - Out for delivery
  - Delivered confirmation
  - Delivery exception/delay

#### Email Template Management
- Visual email template editor
- Variable insertion (customer name, order number, etc.)
- Preview before sending
- Test email functionality
- Multiple template versions (A/B testing)
- Localization support (multi-language)

#### Email Service Integration
- SendGrid integration
- Mailchimp integration
- Resend integration
- Custom SMTP configuration
- Email delivery tracking
- Bounce/complaint handling

---

### 6. Buy Now Pay Later (BNPL) Integration

#### Supported BNPL Providers
- **Klarna**
  - Pay in 4 installments
  - Pay in 30 days
  - Financing options
  - Minimum/maximum order amounts

- **Afterpay/Clearpay**
  - 4 interest-free payments
  - Automatic payment schedule
  - Regional availability settings

- **Affirm**
  - Flexible payment plans (3, 6, 12 months)
  - Interest rates display
  - Pre-qualification check

- **Stripe Payment Links**
  - Native Stripe BNPL options
  - Automatic eligibility checking

#### BNPL Configuration
- Enable/disable per checkout page
- Minimum order amount for BNPL
- Maximum order amount for BNPL
- Display BNPL messaging on product pages
- BNPL calculator widget
- Regional restrictions
- Category exclusions (e.g., gift cards)

#### BNPL Messaging
- "Pay in 4" badges on product cards
- Payment breakdown preview
- Eligibility messaging
- Terms and conditions links
- APR disclosure (where required)

---

### 7. Additional Stripe Best Practices & Features

#### Security & Compliance
- **PCI Compliance**
  - Use Stripe Elements for card input (no card data touches server)
  - Tokenization for stored payment methods
  - 3D Secure (SCA) authentication
  - Address Verification Service (AVS)
  - Card Verification Code (CVC) checks

- **Fraud Prevention**
  - Stripe Radar integration
  - Custom fraud rules
  - Block suspicious countries/IPs
  - Velocity checks (multiple attempts)
  - Manual review queue for flagged orders

- **Data Protection**
  - GDPR compliance features
  - Customer data export
  - Right to be forgotten (data deletion)
  - Consent management
  - Privacy policy integration

#### Payment Features
- **Saved Payment Methods**
  - Save card for future use checkbox
  - Manage saved cards in account
  - Set default payment method
  - Remove payment methods

- **Subscriptions**
  - Recurring billing setup
  - Trial periods (7-day, 14-day, 30-day)
  - Proration handling
  - Subscription upgrades/downgrades
  - Pause subscription feature
  - Subscription cancellation flow

- **Coupons & Promotions**
  - Percentage off coupons
  - Fixed amount off coupons
  - Free shipping coupons
  - First-time customer discounts
  - Referral discounts
  - Coupon usage limits
  - Expiration dates
  - Minimum order amount requirements

- **Tax Calculation**
  - Stripe Tax integration
  - Automatic tax calculation by location
  - Tax-exempt customers
  - Tax ID collection (VAT, GST)
  - Tax reporting

#### Customer Experience
- **Payment Links**
  - Generate shareable payment links
  - QR codes for payment links
  - Link expiration settings
  - One-time vs reusable links

- **Invoicing**
  - Create and send invoices
  - Invoice payment tracking
  - Partial payments
  - Invoice reminders
  - Custom invoice numbering

- **Refunds & Disputes**
  - Full and partial refunds
  - Refund reasons tracking
  - Dispute management interface
  - Evidence submission for disputes
  - Chargeback alerts

#### Reporting & Analytics
- **Financial Reports**
  - Balance transactions
  - Payout reports
  - Fee breakdown
  - Reconciliation reports
  - Export to CSV/Excel

- **Customer Insights**
  - Customer lifetime value
  - Repeat purchase rate
  - Average order value
  - Customer acquisition cost
  - Cohort analysis

#### Multi-Currency & Localization
- Support for 135+ currencies
- Automatic currency conversion
- Display prices in customer's currency
- Settlement currency configuration
- Exchange rate handling

#### Mobile Optimization
- Responsive checkout design
- Mobile wallet support (Apple Pay, Google Pay)
- SMS notifications option
- Mobile-friendly email templates
- Touch-optimized UI elements

---

## Technical Implementation Requirements

### Frontend Components
- **Admin Dashboard** (`/portal/admin/stripe-cart`)
  - API configuration tab
  - Products & pricing tab
  - Checkout pages tab
  - Orders & customers tab
  - Email templates tab
  - Analytics & reports tab
  - Settings tab

### Backend/API Routes
- `/api/stripe/config` - Save/retrieve API keys
- `/api/stripe/products` - CRUD operations for products
- `/api/stripe/prices` - CRUD operations for prices
- `/api/stripe/checkout` - Create checkout sessions
- `/api/stripe/webhooks` - Handle Stripe webhooks
- `/api/stripe/customers` - Customer management
- `/api/stripe/refunds` - Process refunds
- `/api/stripe/subscriptions` - Subscription management

### Database Schema (Firebase)
```typescript
// Collections needed
stripe_config {
  environment: 'test' | 'production'
  testPublishableKey: string
  testSecretKey: string (encrypted)
  productionPublishableKey: string
  productionSecretKey: string (encrypted)
  webhookSecret: string
  activeEnvironment: 'test' | 'production'
}

stripe_products {
  id: string
  stripeProductId: string
  name: string
  description: string
  images: string[]
  active: boolean
  metadata: object
  createdAt: Timestamp
  updatedAt: Timestamp
}

stripe_prices {
  id: string
  stripePriceId: string
  productId: string
  unitAmount: number
  currency: string
  type: 'one_time' | 'recurring'
  interval?: 'day' | 'week' | 'month' | 'year'
  active: boolean
  metadata: object
}

checkout_pages {
  id: string
  slug: string
  title: string
  products: string[] // product IDs
  settings: {
    collectShipping: boolean
    collectPhone: boolean
    allowCoupons: boolean
    bnplEnabled: boolean
    customFields: array
  }
  branding: {
    logo: string
    primaryColor: string
    backgroundColor: string
  }
  active: boolean
  createdAt: Timestamp
}

stripe_orders {
  id: string
  userId: string
  stripePaymentIntentId: string
  stripeCustomerId: string
  amount: number
  currency: string
  status: string
  items: array
  shippingAddress: object
  billingAddress: object
  metadata: object
  createdAt: Timestamp
  updatedAt: Timestamp
}

email_templates {
  id: string
  type: 'order_confirmation' | 'payment_failed' | 'refund' | 'subscription_renewed' | etc.
  subject: string
  htmlBody: string
  textBody: string
  variables: string[]
  active: boolean
}
```

### UI/UX Requirements
- Use existing UI components (shadcn/ui)
- Consistent with admin portal design
- Loading states for all async operations
- Error handling with user-friendly messages
- Success notifications (toast)
- Confirmation dialogs for destructive actions
- Responsive design (mobile-friendly)
- Accessibility compliance (WCAG AA)

### Security Considerations
- Encrypt Stripe secret keys before storing
- Validate webhook signatures
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Environment variable management
- Audit logging for sensitive operations

---

## Development Phases

### Phase 1: Foundation
1. Create admin page structure
2. Implement API key configuration
3. Set up Stripe SDK integration
4. Create database schema
5. Build API routes for configuration

### Phase 2: Product Management
1. Product CRUD interface
2. Price management
3. Product options/variants
4. Image upload integration
5. Sync with Stripe Product catalog

### Phase 3: Checkout Builder
1. Checkout page configuration UI
2. Checkout session creation
3. Payment processing flow
4. Success/cancel page handling
5. Order creation and storage

### Phase 4: User Accounts
1. Account creation during checkout
2. Link Stripe customers to users
3. Purchase history display
4. Customer portal
5. Payment method management

### Phase 5: Email System
1. Email template management
2. Email service integration
3. Webhook-triggered emails
4. Email preview and testing
5. Email delivery tracking

### Phase 6: BNPL & Advanced Features
1. BNPL provider integration
2. Subscription management
3. Coupon system
4. Refund processing
5. Analytics dashboard

### Phase 7: Testing & Optimization
1. Test mode end-to-end testing
2. Production deployment checklist
3. Performance optimization
4. Security audit
5. Documentation

---

## Success Criteria
- ✅ Admin can switch between test and production modes seamlessly
- ✅ Products and prices sync correctly with Stripe
- ✅ Checkout pages are fully customizable and functional
- ✅ User accounts are created automatically on purchase
- ✅ All purchases are logged and trackable
- ✅ Email notifications are sent for all payment events
- ✅ BNPL options are available and working
- ✅ Webhooks are properly configured and handling events
- ✅ Refunds can be processed from admin interface
- ✅ Analytics provide actionable insights
- ✅ System is secure and PCI compliant
- ✅ Mobile experience is optimized
- ✅ Error handling is robust and user-friendly

---

## Additional Resources
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [Stripe Payment Links](https://stripe.com/docs/payment-links)
- [Stripe Tax](https://stripe.com/docs/tax)
- [Stripe Radar](https://stripe.com/docs/radar)
- [PCI Compliance Guide](https://stripe.com/docs/security/guide)

---

## Notes
- Start with test mode and thoroughly test before enabling production
- Use Stripe's test card numbers for development
- Implement proper error handling for all Stripe API calls
- Consider rate limits when making API requests
- Use webhooks for asynchronous event handling (don't rely on client-side callbacks)
- Store minimal payment data (use Stripe as source of truth)
- Implement idempotency for payment operations
- Plan for webhook retry logic
- Consider multi-tenancy if supporting multiple businesses
- Implement proper logging for debugging and audit trails
