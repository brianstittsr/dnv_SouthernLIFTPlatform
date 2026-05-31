# KDM Consortium Demo Setup Guide

## Overview
Complete demo setup for testing the KDM Consortium member pipeline with fake Stripe integration and test data.

## Demo Features

### ✅ What's Included
- **No Real Charges** - Fake Stripe integration with demo payment processing
- **Full Platform Access** - Complete pipeline from signup to proposal generation
- **Test Data** - Pre-populated opportunities and teaming partners
- **Email Simulation** - Demo email service (logs instead of sending)
- **30-Day Access** - Demo accounts valid for 30 days

### 🎯 Demo User Journey
1. **Signup** → Demo registration form with fake payment
2. **Email** → Temporary password (logged to console)
3. **Login** → Access with temporary password
4. **Onboarding** → Complete business profile wizard
5. **Dashboard** → View matched opportunities
6. **Teaming** → Find AI-recommended partners
7. **Proposal** → Generate professional proposals

---

## Quick Start

### 1. Access Demo Signup
```
URL: http://localhost:3000/demo-signup
```

### 2. Create Demo Account
- Email: `demo-contractor@kdm-assoc.com`
- Password: `demo1234567890`
- No credit card required (demo mode)

### 3. Login with Temporary Password
```
URL: http://localhost:3000/login?demo=true
Email: demo-contractor@kdm-assoc.com
Password: demo1234567890
```

### 4. Complete Business Profile
- Business Type: Government Contractor
- Company: Demo Government Solutions LLC
- NAICS Codes: 541330, 541519, 561210
- Certifications: CMMC Level 2, 8(a), HUBZone

---

## Technical Setup

### Files Created

| File | Purpose |
|------|---------|
| `app/api/auth/signup-demo/route.ts` | Demo signup API (no Stripe charges) |
| `components/demo/demo-signup-form.tsx` | Demo registration UI component |
| `app/(marketing)/demo-signup/page.tsx` | Demo signup page |
| `lib/email-demo.ts` | Demo email service (logs only) |
| `scripts/seed-demo-data.ts` | Test data seeding script |

### Database Collections

| Collection | Demo Data |
|------------|-----------|
| `users` | Demo accounts with `isDemo: true` flag |
| `businessProfiles` | Complete business profiles |
| `opportunities` | 3 sample government opportunities |
| `opportunityMatches` | Pre-matched opportunities |
| `demoEmails` | Email logs for testing |

---

## Demo Data Details

### Main Demo User
```
Email: demo-contractor@kdm-assoc.com
Password: demo1234567890
Company: Demo Government Solutions LLC
Type: Government Contractor
Experience: 8 years in Engineering Services
Certifications: CMMC Level 2, 8(a), HUBZone
```

### Sample Opportunities

1. **Cybersecurity Modernization Program**
   - Agency: Department of Defense
   - Budget: $5M-10M
   - Deadline: June 30, 2026
   - NAICS: 541330, 541519, 511210

2. **IT Infrastructure Refresh**
   - Agency: General Services Administration
   - Budget: $2M-4M
   - Deadline: July 15, 2026
   - NAICS: 541519, 511210, 541512

3. **Systems Engineering Support**
   - Agency: NASA
   - Budget: $1.5M-3M
   - Deadline: August 1, 2026
   - NAICS: 541330, 541715, 511210

### Teaming Partners

1. **CyberShield Technologies Inc.**
   - Specialty: Advanced Cybersecurity
   - CMMC Level 3 certified
   - Complementary capabilities for cybersecurity opportunities

2. **Federal Hardware Solutions**
   - Specialty: Hardware Manufacturing
   - ISO 9001 certified
   - Complementary for hardware-heavy contracts

---

## Running the Demo

### Step 1: Seed Demo Data
```bash
# Run the seeding script
npm run seed:demo

# Or run directly
npx ts-node scripts/seed-demo-data.ts
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Access Demo
```
Open: http://localhost:3000/demo-signup
```

### Step 4: Complete Full Pipeline
1. Register demo account
2. Check console for email log
3. Login with temporary password
4. Complete business profile wizard
5. View opportunity dashboard
6. Select opportunities for response
7. Explore teaming recommendations
8. Test proposal generation

---

## Demo Script for Presentations

### 5-Minute Demo Flow

**Slide 1: Introduction (30s)**
```
"Today I'll show you the complete KDM Consortium platform - 
from signup through professional proposal generation in under 5 minutes."
```

**Slide 2: Demo Signup (45s)**
```
Navigate to /demo-signup
- Show demo signup form
- Fill in demo email/password
- Highlight "No credit card required"
- Submit and show success message
```

**Slide 3: Email & Login (45s)**
```
- Check console for email log
- Navigate to login page
- Login with temporary password
- Show dashboard access
```

**Slide 4: Business Profile (60s)**
```
- Complete 5-step wizard
- Show NAICS code selection
- Add certifications
- Complete profile
```

**Slide 5: Opportunity Dashboard (60s)**
```
- Show AI-matched opportunities
- Display match scores and reasons
- Select opportunities for response
```

**Slide 6: Teaming Partners (45s)**
```
- Show AI teaming recommendations
- Display partner profiles
- Select teaming partners
```

**Slide 7: Proposal Generation (45s)**
```
- Upload sample document
- Show AI scoping
- Generate professional proposal
- Download final proposal
```

---

## Testing Scenarios

### Scenario 1: New User Registration
**Goal**: Test complete signup flow
**Steps**:
1. Visit `/demo-signup`
2. Fill registration form
3. Verify account creation
4. Check email log
5. Login successfully

### Scenario 2: Business Profile Completion
**Goal**: Test profile wizard
**Steps**:
1. Login with demo account
2. Complete all 5 profile steps
3. Verify data saved correctly
4. Check dashboard access

### Scenario 3: Opportunity Matching
**Goal**: Test AI matching algorithm
**Steps**:
1. Navigate to opportunity dashboard
2. Verify matched opportunities
3. Check match scores
4. View match reasons

### Scenario 4: Teaming Recommendations
**Goal**: Test partner matching
**Steps**:
1. Select multiple opportunities
2. Choose teaming response option
3. Review recommended partners
4. Select teaming partners

### Scenario 5: Proposal Generation
**Goal**: Test document processing
**Steps**:
1. Upload sample RFP document
2. Generate AI scope
3. Create proposal sections
4. Enhance with AI
5. Run quality check
6. Generate final proposal

---

## Troubleshooting

### Common Issues

**Issue**: Demo signup not working
**Solution**: Check that `/api/auth/signup-demo` endpoint exists and Firebase Admin SDK is configured

**Issue**: No opportunities showing
**Solution**: Run `npm run seed:demo` to populate test data

**Issue**: Email not received
**Solution**: Check console logs - demo emails are logged, not sent

**Issue**: Teaming partners not showing
**Solution**: Verify additional demo users are created in seeding script

**Issue**: Proposal generation failing
**Solution**: Check that document upload endpoint exists and AI services are configured

### Debug Mode

Enable debug logging:
```bash
# Set environment variable
NEXT_PUBLIC_DEBUG_DEMO=true

# Check console for detailed logs
```

### Reset Demo Data

```bash
# Clear demo collections
npm run reset:demo

# Re-seed fresh data
npm run seed:demo
```

---

## Production Considerations

### Security
- Demo accounts flagged with `isDemo: true`
- Temporary passwords expire in 48 hours
- Demo data isolated from production data
- No real payment processing

### Performance
- Demo data lightweight
- No external API calls
- Local email simulation
- Optimized for development

### Limitations
- AI processing simulated
- Document upload limited to demo files
- No real email delivery
- No actual proposal submission

---

## Next Steps

### Immediate (This Week)
1. ✅ Create demo signup flow
2. ✅ Add test data seeding
3. ✅ Implement demo email service
4. 🔄 Test complete pipeline

### Short Term (Next Week)
1. Add more diverse demo opportunities
2. Create demo video walkthrough
3. Add demo analytics dashboard
4. Implement demo reset functionality

### Medium Term (Next Month)
1. Add mobile demo experience
2. Create demo API documentation
3. Add demo performance metrics
4. Implement demo user feedback collection

---

## Success Metrics

### Demo Completion Rate
- **Target**: 85% of demo users complete full pipeline
- **Current**: Track with demo analytics

### Time to Value
- **Target**: < 10 minutes from signup to proposal
- **Current**: Measure with timing logs

### Feature Engagement
- **Target**: All demo features tested by 90% of users
- **Current**: Track feature usage analytics

---

*Last Updated: May 28, 2026*
*Version: 1.0*
