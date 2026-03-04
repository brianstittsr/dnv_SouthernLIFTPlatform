# KDM Consortium Signup Workflow - Implementation Guide

## Overview
This document defines the complete 5-step onboarding flow that transforms visitors into active KDM Consortium members, with clear value proposition at each stage and Stripe-powered subscription management.

---

## Step 1: Entry Point - "Become a KDM Consortium Member"

### Trigger Locations:
- CTA buttons on Industries pages (`/industries/*`)
- CTA buttons on 5 Pillars pages (`/5-pillars/*`)
- CTA buttons on Services detail page (`/services/[id]`)
- "Join Consortium" in main navigation
- Homepage hero CTA

### Button Specification:
```tsx
// Current button at /services/[id]/page.tsx lines 226-235 needs update:
<Button
  size="lg"
  variant="secondary"  // Changed from "outline"
  className="text-lg px-8"  // Removed white styling
  asChild
>
  <Link href="/sign-up?type=consortium">
    Become a KDM Consortium Member
  </Link>
</Button>
```

### URL Parameter: 
Pass `?type=consortium` to `/sign-up` to indicate this is a consortium signup (vs. regular platform signup).

---

## Step 2: Buyer or Supplier Selection

### Current State: 
The `/sign-up/page.tsx` already has this implemented (lines 214-278).

### Enhancement Requirements:
- When `type=consortium` parameter is present, pre-select the appropriate option and show consortium-specific copy
- Add visual indicator that this is "KDM Consortium Membership" signup

### Enhanced Selection Screen:
```tsx
// Add to sign-up page when consortium parameter detected
<Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
  <Users className="h-3 w-3 mr-1" />
  KDM Consortium Membership
</Badge>

// Enhanced descriptions for consortium context:
const consortiumDescriptions = {
  buyer: {
    title: "Government / Prime / OEM Buyers",
    benefit: "Get priority access to CMMC-ready suppliers, critical minerals providers, and certified manufacturers. Reduce procurement time by 60%.",
    cta: "Join as Buyer - $299/month"
  },
  supplier: {
    title: "Government Subcontractors / Manufacturing Suppliers",
    benefit: "Get discovered by prime contractors, access $2.5M+ average contract values, and fast-track your CMMC certification with consortium resources.",
    cta: "Join as Supplier - $199/month"
  }
};
```

---

## Step 3: Account Creation & Authentication

### Current State: 
Already implemented at `/sign-up/page.tsx` (lines 279-401).

### Enhancement Requirements:
- Store `userType` (buyer/supplier) and `membershipType` (consortium/regular) in user metadata during Firebase auth creation
- Set `profileComplete: false` and `paymentComplete: false` flags in Firestore user document
- Store signup timestamp and attribution source (which CTA button clicked)

### Firestore User Document Structure:
```typescript
interface ConsortiumUserDoc {
  id: string;
  firebaseUid: string;
  email: string;
  userType: "buyer" | "supplier";
  membershipType: "consortium";
  profileComplete: boolean;
  paymentComplete: boolean;
  onboardingStatus: "signed_up" | "profile_started" | "profile_complete" | "payment_complete" | "active";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  attributionSource: string; // Which page/CTA led to signup
  profileData?: {
    companyName?: string;
    industry?: string;
    capabilities?: string[];
    certifications?: string[];
    contractTypes?: string[];
    annualSpend?: string;
  };
  stripe?: {
    customerId?: string;
    subscriptionId?: string;
    subscriptionStatus?: "active" | "canceled" | "past_due" | "trialing";
    plan?: "monthly" | "annual";
  };
}
```

---

## Step 4: Initial Profile Completion Modal

### Trigger: 
After successful sign-in, check `onboardingStatus === "signed_up"` and `profileComplete === false`, then auto-show modal.

### Modal Component: 
Create new file `components/modals/ConsortiumOnboardingModal.tsx`

### Modal Design Specifications:

#### Header Section:
```tsx
<div className="text-center mb-6">
  <Badge className="mb-2 bg-amber-100 text-amber-800 border-amber-200">
    <Sparkles className="h-3 w-3 mr-1" />
    Early Access Priority
  </Badge>
  <h2 className="text-2xl font-bold">Welcome to the KDM Consortium</h2>
  <p className="text-muted-foreground mt-2">
    Complete your profile to unlock priority matching with {userType === "buyer" ? "verified suppliers" : "government buyers"}
  </p>
</div>
```

#### Process Overview Section (Visual Timeline):
```tsx
// Visual 4-step journey from zero to contract
<div className="grid grid-cols-4 gap-2 mb-8">
  {[
    { step: 1, label: "Join", desc: "You're here!", active: true, icon: UserPlus },
    { step: 2, label: "Complete Profile", desc: "5 min", active: false, icon: ClipboardList },
    { step: 3, label: "Get Matched", desc: "AI-powered", active: false, icon: Zap },
    { step: 4, label: "Win Contracts", desc: "$2.5M avg", active: false, icon: Trophy },
  ].map((item) => (
    <div key={item.step} className={`text-center p-3 rounded-lg ${item.active ? 'bg-primary/10 border-primary/20' : 'bg-muted'}`}>
      <item.icon className={`h-5 w-5 mx-auto mb-1 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
      <div className="text-xs font-semibold">{item.label}</div>
      <div className="text-[10px] text-muted-foreground">{item.desc}</div>
    </div>
  ))}
</div>
```

#### Value Proposition Copy:

**For Buyers:**
```
🎯 Be Among the First to Access Verified Suppliers

The KDM Consortium is curating a select network of:
• CMMC Level 2+ certified manufacturers
• Critical minerals suppliers (titanium, rare earth elements)
• Opportunity Zone-based production facilities
• SDVOSB, WOSB, and minority-owned certified vendors

Complete your profile NOW to:
→ Get early access to supplier profiles before public launch
→ Receive AI-matched supplier recommendations within 48 hours
→ Skip the 6-month vetting process with pre-verified partners
→ Access $50M+ in shared contract opportunities
```

**For Suppliers:**
```
🚀 Get Discovered by Prime Contractors & Government Buyers

The KDM Consortium connects you directly with:
• Boeing, Northrop Grumman, and major prime procurement teams
• Government agencies with simplified procurement pathways
• Capital partners for contract financing

Complete your profile NOW to:
→ Appear in buyer search results immediately
→ Receive RFP alerts matching your capabilities
→ Get introduced to buyers seeking your specific expertise
→ Access $2.5M average contract value opportunities
```

#### Form Fields (Progressive Profiling):
```tsx
// Step 1 of modal - Essential info only (keep it short)
const profileFields = userType === "buyer" ? [
  { name: "companyName", label: "Organization Name", type: "text", required: true },
  { name: "industry", label: "Primary Industry", type: "select", options: ["Aerospace", "Defense", "Manufacturing", "Technology", "Other"] },
  { name: "contractTypes", label: "Contract Types Interested In", type: "multi-select", options: ["Set-Aside", "Prime", "Subcontractor", "Teaming"] },
  { name: "annualSpend", label: "Annual Procurement Budget", type: "select", options: ["$0-500K", "$500K-2M", "$2M-10M", "$10M+"] },
] : [
  { name: "companyName", label: "Company Name", type: "text", required: true },
  { name: "industry", label: "Industry Sector", type: "select", options: ["Advanced Manufacturing", "Aerospace", "Critical Minerals", "Technology", "Other"] },
  { name: "certifications", label: "Current Certifications", type: "multi-select", options: ["CMMC Level 1", "CMMC Level 2", "SDVOSB", "WOSB", "8(a)", "HUBZone", "None"] },
  { name: "capabilities", label: "Key Capabilities", type: "textarea", placeholder: "e.g., CNC Machining, Titanium Processing, Software Development" },
];
```

#### Social Proof/Urgency Footer:
```tsx
<div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
  <div className="flex items-start gap-3">
    <TrendingUp className="h-5 w-5 text-amber-600 mt-0.5" />
    <div className="text-sm">
      <span className="font-semibold text-amber-900">
        {userType === "buyer" ? "47 buyers" : "124 suppliers"} 
      </span>
      <span className="text-amber-800">
        {userType === "buyer" 
          ? " have already joined and are actively seeking partners like you." 
          : " completed profiles this week and received RFP invitations."}
      </span>
    </div>
  </div>
</div>
```

---

## Step 5: Stripe Payment Integration

### Trigger: 
After profile form submission, `onboardingStatus` changes to `"profile_complete"`, redirect to payment screen.

### New Page: 
Create `/app/(portal)/portal/payment/page.tsx`

### Payment Screen Design:

#### Header:
```tsx
<div className="max-w-lg mx-auto text-center mb-8">
  <Badge className="mb-2 bg-green-100 text-green-800">
    <CheckCircle className="h-3 w-3 mr-1" />
    Profile Complete
  </Badge>
  <h1 className="text-3xl font-bold">Activate Your Membership</h1>
  <p className="text-muted-foreground mt-2">
    Subscribe to unlock full platform access and start connecting
  </p>
</div>
```

#### Pricing Cards:
```tsx
<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
  {/* Monthly Plan */}
  <Card className="relative">
    <CardHeader>
      <CardTitle>Monthly</CardTitle>
      <CardDescription>Flexible, cancel anytime</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold">
        ${userType === "buyer" ? "299" : "199"}
        <span className="text-lg font-normal text-muted-foreground">/month</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          Full platform access
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          Unlimited profile views
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          Direct messaging
        </li>
      </ul>
      <Button 
        className="w-full mt-6" 
        onClick={() => initiateStripeCheckout("monthly")}
      >
        Subscribe Monthly
      </Button>
    </CardContent>
  </Card>

  {/* Annual Plan - Recommended */}
  <Card className="relative border-primary">
    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white">
      Best Value - Save 20%
    </Badge>
    <CardHeader>
      <CardTitle>Annual</CardTitle>
      <CardDescription>Commit to growth, maximize savings</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold">
        ${userType === "buyer" ? "2,870" : "1,910"}
        <span className="text-lg font-normal text-muted-foreground">/year</span>
      </div>
      <div className="text-sm text-green-600 mt-1">
        Save ${userType === "buyer" ? "718" : "478"} per year
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          Everything in Monthly
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          Priority search ranking
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          Dedicated account manager
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          Early access to new features
        </li>
      </ul>
      <Button 
        className="w-full mt-6" 
        variant="default"
        onClick={() => initiateStripeCheckout("annual")}
      >
        Subscribe Annual
      </Button>
    </CardContent>
  </Card>
</div>
```

### Stripe Integration Technical Specifications:

#### Environment Variables Required:
```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Product/Price IDs
STRIPE_BUYER_MONTHLY_PRICE_ID=price_...
STRIPE_BUYER_ANNUAL_PRICE_ID=price_...
STRIPE_SUPPLIER_MONTHLY_PRICE_ID=price_...
STRIPE_SUPPLIER_ANNUAL_PRICE_ID=price_...
```

#### API Route: `app/api/stripe/checkout/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const { plan, userType } = await req.json();
  const session = await auth.verifyIdToken(req.headers.get("authorization")!);
  
  const priceIds = {
    buyer: {
      monthly: process.env.STRIPE_BUYER_MONTHLY_PRICE_ID,
      annual: process.env.STRIPE_BUYER_ANNUAL_PRICE_ID,
    },
    supplier: {
      monthly: process.env.STRIPE_SUPPLIER_MONTHLY_PRICE_ID,
      annual: process.env.STRIPE_SUPPLIER_ANNUAL_PRICE_ID,
    },
  };

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.email,
    line_items: [{
      price: priceIds[userType][plan],
      quantity: 1,
    }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_URL}/portal/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/portal/payment/cancel`,
    metadata: {
      firebaseUid: session.uid,
      userType,
      plan,
    },
  });

  return NextResponse.json({ sessionId: checkoutSession.id });
}
```

#### Webhook Handler: `app/api/stripe/webhooks/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature")!;
  
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { firebaseUid, userType } = session.metadata!;
      
      // Update Firestore user document
      await db.collection("users").doc(firebaseUid).update({
        "stripe.customerId": session.customer,
        "stripe.subscriptionId": session.subscription,
        "stripe.subscriptionStatus": "active",
        paymentComplete: true,
        onboardingStatus: "payment_complete",
        updatedAt: Timestamp.now(),
      });
      
      // Trigger welcome email
      await sendWelcomeEmail(session.customer_email!, userType);
      break;
    }
    
    case "invoice.payment_failed": {
      // Handle failed payment - send notification
      break;
    }
    
    case "customer.subscription.deleted": {
      // Handle cancellation
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

#### Client-Side Integration:
```tsx
// components/stripe/CheckoutButton.tsx
"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CheckoutButton({ plan, userType }: { plan: "monthly" | "annual"; userType: "buyer" | "supplier" }) {
  const handleCheckout = async () => {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": await getAuthToken(),
      },
      body: JSON.stringify({ plan, userType }),
    });
    
    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <Button onClick={handleCheckout}>
      Subscribe {plan === "annual" ? "Annual" : "Monthly"}
    </Button>
  );
}
```

---

## Post-Payment Success Flow

### Success Page: `/portal/payment/success`

#### Content:
```tsx
<div className="max-w-2xl mx-auto text-center py-12">
  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
    <CheckCircle className="h-10 w-10 text-green-600" />
  </div>
  <h1 className="text-3xl font-bold mb-4">Welcome to the KDM Consortium!</h1>
  <p className="text-lg text-muted-foreground mb-8">
    Your membership is now active. You're among an exclusive group of 
    {userType === "buyer" ? "procurement professionals" : "verified suppliers"} 
    positioned to win federal contracts.
  </p>
  
  <div className="grid md:grid-cols-3 gap-4 mb-8">
    <Card>
      <CardContent className="pt-6">
        <Search className="h-8 w-8 mx-auto mb-3 text-primary" />
        <h3 className="font-semibold">Browse {userType === "buyer" ? "Suppliers" : "Opportunities"}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start exploring matches now
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-6">
        <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
        <h3 className="font-semibold">Connect Directly</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Message potential partners
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-6">
        <GraduationCap className="h-8 w-8 mx-auto mb-3 text-primary" />
        <h3 className="font-semibold">Access Training</h3>
        <p className="text-sm text-muted-foreground mt-1">
          CMMC & procurement resources
        </p>
      </CardContent>
    </Card>
  </div>
  
  <Button size="lg" asChild>
    <Link href="/portal/dashboard">
      Go to Dashboard
      <ArrowRight className="ml-2 h-5 w-5" />
    </Link>
  </Button>
</div>
```

---

## Technical Implementation Checklist

### Firebase/Firestore:
- [ ] Create `users` collection with schema defined above
- [ ] Set up Firestore security rules for profile data
- [ ] Create Cloud Function to sync Stripe webhooks to user documents

### Stripe Setup:
- [ ] Create 4 products in Stripe Dashboard (Buyer Monthly, Buyer Annual, Supplier Monthly, Supplier Annual)
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Set up customer portal for subscription management

### Next.js Routes:
- [ ] `/app/api/stripe/checkout/route.ts` - Create checkout session
- [ ] `/app/api/stripe/webhooks/route.ts` - Handle Stripe events
- [ ] `/app/api/stripe/portal/route.ts` - Customer portal session
- [ ] `/app/(portal)/portal/payment/page.tsx` - Payment selection UI
- [ ] `/app/(portal)/portal/payment/success/page.tsx` - Success screen
- [ ] `/components/modals/ConsortiumOnboardingModal.tsx` - Profile completion modal

### State Management:
- [ ] Add onboarding status check to PortalLayout or middleware
- [ ] Redirect to appropriate step if onboarding incomplete
- [ ] Store profile progress in localStorage for recovery

### Email Notifications:
- [ ] Welcome email after payment (Postmark/Resend)
- [ ] Profile completion reminder (24hr delay if incomplete)
- [ ] Payment failure notification
- [ ] Subscription renewal reminder (7 days before)

---

## Analytics & Tracking

Track these events for funnel optimization:
- `consortium_signup_started` - Button click
- `buyer_selected` / `supplier_selected` - Selection made
- `account_created` - Firebase auth complete
- `profile_modal_viewed` - Modal opened
- `profile_field_completed` - Each field filled
- `profile_submitted` - Form submitted
- `checkout_initiated` - Stripe checkout started
- `payment_completed` - Successful subscription
- `payment_failed` - Failed payment

Use these to identify drop-off points and optimize conversion.

---

## Pricing Structure

### Buyer Pricing:
- **Monthly**: $299/month
- **Annual**: $2,870/year (save $718 - 20% discount)

### Supplier Pricing:
- **Monthly**: $199/month
- **Annual**: $1,910/year (save $478 - 20% discount)

### Features by Plan:
All plans include:
- Full platform access
- Unlimited profile views
- Direct messaging with matches
- RFP/opportunity alerts
- CMMC training resources
- Contract templates

Annual plans additionally include:
- Priority search ranking
- Dedicated account manager
- Early access to new features
- Quarterly strategy sessions
