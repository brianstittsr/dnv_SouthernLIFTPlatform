# KDM Consortium Platform - Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Configuration

#### Stripe Setup
- [ ] Create Stripe account for KDM Consortium
- [ ] Enable Stripe Connect for revenue splitting
- [ ] Create products and prices in Stripe Dashboard:
  - [ ] Core Capture Monthly ($1,750/month)
  - [ ] Core Capture Annual ($18,900/year)
  - [ ] Pursuit Pack ($500 one-time)
- [ ] Get API keys:
  - [ ] `STRIPE_SECRET_KEY` (production)
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (production)
  - [ ] `STRIPE_CONNECT_CLIENT_ID`
- [ ] Configure webhook endpoint:
  - URL: `https://consortium.kdmassociates.com/api/stripe/webhooks`
  - Events: `customer.subscription.*`, `invoice.*`, `payment_intent.*`, `checkout.session.completed`, `charge.refunded`
  - [ ] Get `STRIPE_WEBHOOK_SECRET`

#### Email Service Setup
- [ ] Choose email provider (SendGrid or Resend)
- [ ] Create account and verify domain
- [ ] Get API key:
  - [ ] `SENDGRID_API_KEY` or `RESEND_API_KEY`
- [ ] Configure sender:
  - [ ] `SENDGRID_FROM_EMAIL` / `RESEND_FROM_EMAIL`
  - [ ] `SENDGRID_FROM_NAME` / `RESEND_FROM_NAME`

#### Firebase Configuration
- [ ] Create Firebase project for KDM (or use existing)
- [ ] Enable Firestore Database
- [ ] Enable Firebase Authentication
- [ ] Enable Firebase Storage
- [ ] Get configuration:
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

#### Platform Configuration
- [ ] Set platform variables:
  - [ ] `NEXT_PUBLIC_PLATFORM_NAME="KDM Consortium"`
  - [ ] `NEXT_PUBLIC_PLATFORM_URL=https://consortium.kdmassociates.com`
  - [ ] `NEXT_PUBLIC_SUPPORT_EMAIL=support@kdmassociates.com`

### 2. Database Setup

#### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

#### Firestore Security Rules
- [ ] Review and update security rules for new collections:
  - `memberships` - User can read own, admin can read/write all
  - `tickets` - User can read own, admin can read/write all
  - `pursuitBriefs` - Members can read, admin can write
  - `sponsors` - Public read, admin write
  - `promoCodes` - Admin only
  - `settlements` - Admin only

### 3. Code Preparation

#### Build Verification
```bash
npm run build
```
- [ ] No TypeScript errors
- [ ] No build errors
- [ ] All pages compile successfully

#### Environment Variables
- [ ] Create `.env.local` with all production values
- [ ] Verify no secrets in `.env.example` or committed code

### 4. Branding Updates (Optional)

- [ ] Replace SVP logo with KDM logo in:
  - [ ] `public/logo.svg`
  - [ ] `public/favicon.ico`
  - [ ] `public/og-image.png`
- [ ] Update `app/layout.tsx` metadata:
  - [ ] Title
  - [ ] Description
  - [ ] Keywords
  - [ ] OpenGraph data
- [ ] Update marketing page copy as needed

---

## Deployment Steps

### 1. Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Vercel Environment Variables
Add all environment variables in Vercel Dashboard:
- Project Settings → Environment Variables
- Add each variable from `.env.local`

### 2. Alternative: Self-Hosted

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### 3. Domain Configuration

- [ ] Point `consortium.kdmassociates.com` to deployment
- [ ] Configure SSL certificate
- [ ] Verify HTTPS is working

---

## Post-Deployment Verification

### 1. Public Pages
- [ ] Homepage loads correctly
- [ ] Events page displays
- [ ] Membership pricing page works
- [ ] Contact form submits

### 2. Authentication
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Password reset works

### 3. Membership Flow
- [ ] Pricing page displays correctly
- [ ] Signup form works
- [ ] Stripe checkout redirects properly
- [ ] Webhook receives events
- [ ] Welcome email sends

### 4. Event System
- [ ] Events list displays
- [ ] Event detail page works
- [ ] Registration form works
- [ ] Ticket purchase completes
- [ ] Confirmation email sends

### 5. Portal Access
- [ ] Portal loads after login
- [ ] Pursuit Board displays
- [ ] Member Directory works
- [ ] Resource Library accessible
- [ ] My Membership page shows data

### 6. Admin Functions
- [ ] KDM Dashboard loads with metrics
- [ ] Membership management works
- [ ] Settlement statements display
- [ ] Event management works

---

## Monitoring Setup

### 1. Error Tracking
- [ ] Set up Sentry or similar
- [ ] Configure error alerts

### 2. Analytics
- [ ] Verify Firebase Analytics working
- [ ] Set up conversion tracking for:
  - [ ] Membership signups
  - [ ] Event registrations
  - [ ] Contact form submissions

### 3. Uptime Monitoring
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure alerts for downtime

---

## Rollback Plan

If issues occur after deployment:

1. **Vercel**: Revert to previous deployment in Vercel Dashboard
2. **Database**: Firestore has automatic backups
3. **Stripe**: Webhooks can be replayed from Stripe Dashboard

---

## Support Contacts

- **Technical Issues**: [V+ Development Team]
- **Stripe Support**: https://support.stripe.com
- **Firebase Support**: https://firebase.google.com/support
- **Vercel Support**: https://vercel.com/support

---

## Appendix: Environment Variables Template

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_CONNECT_CLIENT_ID=
STRIPE_WEBHOOK_SECRET=

# Email (choose one)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@kdmassociates.com
SENDGRID_FROM_NAME=KDM Consortium

# OR
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@kdmassociates.com
RESEND_FROM_NAME=KDM Consortium

# Platform
NEXT_PUBLIC_PLATFORM_NAME=KDM Consortium
NEXT_PUBLIC_PLATFORM_URL=https://consortium.kdmassociates.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@kdmassociates.com
```

---

**Document Version:** 1.0  
**Last Updated:** December 29, 2025
