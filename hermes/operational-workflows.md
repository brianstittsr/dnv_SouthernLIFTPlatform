# Operational Workflows - Hermes Platform Management

## Daily Operations

### Morning Routine (8:00 AM ET)
1. **Health Check** - Verify platform uptime, check error logs
2. **Lead Triage** - Identify and route unassigned leads from overnight
3. **Payment Reconciliation** - Confirm successful payments, flag failures
4. **Daily Digest** - Send summary to admin Telegram group

### Continuous Monitoring
- New lead alerts (real-time)
- Payment event notifications (real-time)
- Service overlap detection (on lead assignment)
- Member onboarding progress tracking

### Evening Wrap (6:00 PM ET)
- End-of-day metrics summary
- Tomorrow's calendar preview
- Outstanding action items reminder

---

## Member Lifecycle Workflows

### 1. New Member Onboarding

```
Trigger: checkout.session.completed (Stripe webhook)
    |
    v
[1] Create Firebase Auth account
[2] Create Firestore user document (role: member)
[3] Create team member record
[4] Send welcome email with credentials
[5] Telegram notification to admin group
[6] Start 7-day onboarding sequence:
    Day 0: Welcome + login instructions
    Day 1: Complete your profile prompt
    Day 3: Upload first documents prompt
    Day 5: Proof Pack introduction
    Day 7: Schedule orientation call
```

### 2. Lead-to-Member Conversion

```
[1] Lead captured (contact form, event, referral)
[2] Auto-route to best-fit partner (industry + service type + capacity)
[3] Partner contacts lead within 24h
[4] Lead qualified (budget, authority, need, timeline)
[5] If qualified: Move to "proposal" stage
[6] Proposal sent with membership tier recommendation
[7] If accepted: Redirect to Stripe checkout
[8] On payment: Trigger onboarding workflow
```

### 3. Proof Pack Journey

```
[1] Member uploads initial documents
[2] System calculates Pack Health score (0-100)
[3] Gap analysis generated automatically:
    - Missing documents identified
    - Expired certifications flagged
    - Format/quality issues noted
[4] Remediation plan created (30/60/90 day)
[5] Member works through gaps (assisted by consortium partners)
[6] Pack Health improves with each upload/fix
[7] At score >= 70: Pack enters QA review queue
[8] QA reviewer (admin) approves or requests revision
[9] On approval: Member status = "intro-eligible"
[10] AI matching begins for buyer introductions
```

### 4. Buyer Introduction Flow

```
[1] Member achieves intro-eligible status
[2] AI matching identifies potential buyers
[3] Admin reviews and approves match
[4] Introduction Brief generated (member profile + relevant capabilities)
[5] NDA sent to buyer via DocuSeal (if required)
[6] On NDA signature: Proof Pack shared with buyer
[7] Introduction email sent to both parties
[8] Track outcome: intro -> meeting -> RFQ -> award
[9] Attribution recorded for revenue share
```

### 5. Subscription Lifecycle

```
Active:
    |-- Payment succeeds monthly -> Continue
    |-- Payment fails -> Grace period (7 days)
    |   |-- Retry succeeds -> Resume
    |   |-- Retry fails -> Suspend
    |       |-- Member contacts support -> Manual resolution
    |       |-- 30 days inactive -> Deactivate
    |           |-- Winback campaign (60 days)
    |           |-- Archive after 90 days

Cancellation:
    |-- Voluntary cancel -> Exit survey
    |-- Offboarding: revoke portal access, archive data
    |-- Proof Pack remains read-only for 90 days
```

---

## Partner Coordination Workflows

### Lead Routing Algorithm

```python
# Pseudocode for automated lead routing
def route_lead(lead):
    candidates = get_active_routing_rules()
    
    for rule in candidates:
        score = 0
        # Match by industry expertise
        if lead.industry in rule.industries:
            score += 10
        # Match by service type
        if lead.serviceType in rule.serviceTypes:
            score += 10
        # Check partner capacity
        current_load = count_active_leads(rule.partnerId)
        if current_load < rule.maxCapacity:
            score += 5
        else:
            score -= 10  # Penalize overloaded partners
    
    best_match = max(candidates, key=lambda r: r.score)
    assign_lead(lead.id, best_match.partnerId)
    notify_partner(best_match.partnerId, lead)
    log_assignment(lead.id, best_match.partnerId)
```

### Service Overlap Prevention

```
Trigger: Lead assigned to new partner
    |
    v
[1] Query all active leads for same company
[2] Check if other partners already assigned
[3] If overlap detected:
    [a] Create serviceOverlaps record
    [b] Notify all involved partners
    [c] Flag for admin resolution
    [d] Suggest coordination meeting
[4] Resolution options:
    - Merge assignments (one partner leads)
    - Split by service type
    - Joint delivery with revenue split
```

### Revenue Settlement Process

```
Quarterly (or as configured):
    |
[1] Calculate all attributions for period
[2] For each transaction:
    - Identify lead generation partner (20%)
    - Identify service delivery partner (50%)
    - Identify introduction partner (20%)
    - Apply platform fee (10%)
[3] Generate settlement preview
[4] Admin reviews and approves
[5] Process payouts via Stripe Connect
[6] Send settlement statements to all partners
[7] Log to audit trail
```

---

## Event Management Workflows

### Event Lifecycle

```
[1] Create event (admin or via Telegram)
    - Title, date, type, location, capacity
    - Pricing (free/paid/tiered)
    - Speakers and agenda

[2] Publish event
    - Marketing page generated
    - Email announcement to relevant members
    - Social media posts queued

[3] Registration period
    - Track registrations vs capacity
    - Send confirmation emails
    - Generate QR code tickets
    - Milestone notifications (25%, 50%, 75%, sold out)

[4] Pre-event
    - 7-day reminder
    - 1-day reminder
    - Day-of logistics email

[5] Event execution
    - Attendance tracking
    - Live engagement (if virtual)

[6] Post-event
    - Thank you emails
    - Feedback surveys
    - Recording/resources shared
    - Leads captured from attendees
    - ROI report generated
```

---

## CMMC Cohort Workflow

```
[1] Cohort created (12-week program)
    - Curriculum defined
    - Max enrollment set
    - Pricing configured
    - Instructor assigned

[2] Enrollment open
    - Marketing to eligible members
    - Payment processing
    - Pre-assessment distributed

[3] Weekly sessions (12 weeks)
    - Content delivery
    - Quizzes/assessments
    - Office hours support
    - Progress tracking

[4] Completion
    - Final assessment
    - Certificate generation
    - CMMC readiness score updated
    - Pack Health recalculated
    - Graduation announcement
```

---

## Escalation Matrix

| Situation | Auto-Action | Escalation To |
|-----------|-------------|---------------|
| New lead unassigned >24h | Reminder notification | Admin DM |
| Payment failed 2x | Suspend + email member | Admin DM |
| Service overlap detected | Alert all parties | Admin for resolution |
| Pack Health drops below 70 | Notify member | Partner account manager |
| Member inactive >30 days | Automated re-engagement | Admin for review |
| System error rate >5% | Alert + log | Super admin (immediate) |
| Buyer complaint | Log + flag | Admin (immediate) |
| Contract award reported | Celebration notification | All partners |
| Revenue dispute | Freeze payout | Admin + both parties |

---

## Data Backup & Recovery

- **Firestore**: Automatic daily backups (Firebase)
- **User Data**: Export capability via admin panel
- **Critical Events**: Real-time replication to audit log
- **Recovery SLA**: <4 hours for full platform restore
- **Data Retention**: 7 years for financial records, 3 years for activity logs
