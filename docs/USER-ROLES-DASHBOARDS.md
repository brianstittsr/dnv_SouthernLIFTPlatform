# User Roles & Dashboard Definitions

## Overview
The SVP Platform supports multiple user roles, each with specialized dashboards and features tailored to their specific needs and workflows.

---

## User Roles

### 1. **Admin**
**Primary Dashboard:** Command Center (`/portal/command-center`)

**Role Definition:**
Platform administrators with full system access. Manage users, configure integrations, oversee all operations, and access analytics across the entire platform.

**Key Capabilities:**
- Full access to all platform features
- User management and role assignment
- System configuration and settings
- Integration management (Mattermost, Apollo, GoHighLevel, etc.)
- Platform-wide analytics and monitoring
- Audit log access
- Content management and migration tools
- Event and initiative management

**Dashboard Features:**
- Pipeline value overview
- Active projects tracking
- Quarterly rocks progress
- Team online status
- Recent opportunities
- Today's meetings
- Action items
- Recent activity feed

**Exclusive Access:**
- `/portal/admin/*` - All admin tools
- User management
- Platform settings
- Integration configuration
- Audit logs
- System monitoring

---

### 2. **Buyer**
**Primary Dashboard:** Buyer Dashboard (`/portal/buyer/dashboard`)

**Role Definition:**
Organizations or individuals seeking to purchase products, services, or engage with suppliers. Buyers browse directories, review proof packs, and manage introductions.

**Key Capabilities:**
- Browse supplier/affiliate directory
- View and request proof packs
- Manage introduction requests
- Save favorites
- Track shared proof packs
- Review supplier credentials

**Dashboard Features:**
- Active searches
- Pending introductions
- Saved suppliers/favorites
- Recent proof pack views
- Recommended matches
- Introduction status tracking

**Primary Workflows:**
1. **Directory Search** (`/portal/buyer/directory`)
   - Search and filter suppliers
   - View detailed profiles
   - Request introductions

2. **Proof Pack Review** (`/portal/buyer/shared-packs`)
   - Access shared compliance documents
   - Review certifications and credentials
   - Track document access

3. **Introductions** (`/portal/buyer/introductions`)
   - Manage introduction requests
   - Track response status
   - Schedule meetings

---

### 3. **Partner/Affiliate**
**Primary Dashboard:** Partner Dashboard (`/portal/partner/dashboard`)

**Role Definition:**
Strategic partners and affiliates who refer clients, generate leads, and earn revenue through the network. Focus on relationship building and revenue generation.

**Key Capabilities:**
- Lead generation and tracking
- Client referral management
- Revenue tracking and attribution
- Introduction facilitation
- Overlap analysis with other partners
- Conversion tracking

**Dashboard Features:**
- Active leads pipeline
- Conversion metrics
- Revenue attribution
- Recent introductions
- Client overlap opportunities
- Performance analytics

**Primary Workflows:**
1. **Lead Management** (`/portal/partner/leads`)
   - Track lead status
   - Manage follow-ups
   - Record activities

2. **Client Tracking** (`/portal/partner/clients`)
   - Active client list
   - Engagement history
   - Revenue attribution

3. **Revenue Dashboard** (`/portal/partner/revenue`)
   - Earnings overview
   - Attribution tracking
   - Settlement status

4. **Introductions** (`/portal/partner/introductions`)
   - Facilitate buyer-supplier connections
   - Track introduction outcomes

---

### 4. **SME (Subject Matter Expert)**
**Primary Dashboard:** SME Dashboard (`/portal/sme/dashboard`)

**Role Definition:**
Subject matter experts who provide specialized knowledge, training, and consulting services. Participate in cohorts, earn certifications, and engage with the learning ecosystem.

**Key Capabilities:**
- Browse and enroll in cohorts
- Earn certifications
- Manage subscription
- Participate in introductions
- Access specialized content
- Profile management

**Dashboard Features:**
- Enrolled cohorts
- Certification progress
- Upcoming sessions
- Learning path recommendations
- Introduction opportunities
- Subscription status

**Primary Workflows:**
1. **Cohort Participation** (`/portal/sme/cohorts`)
   - Browse available cohorts
   - Enroll in programs
   - Track progress

2. **Certifications** (`/portal/sme/certificates`)
   - View earned certificates
   - Track certification progress
   - Download credentials

3. **Profile Management** (`/portal/sme/profile`)
   - Update expertise
   - Manage networking profile
   - Set availability

---

### 5. **Instructor**
**Primary Dashboard:** Instructor Dashboard (`/portal/instructor/dashboard`)

**Role Definition:**
Educators and trainers who create and deliver cohort-based learning programs. Manage courses, assess students, and issue certifications.

**Key Capabilities:**
- Create and manage cohorts
- Design curriculum
- Assess student performance
- Issue certificates
- Track cohort analytics
- Manage assessments

**Dashboard Features:**
- Active cohorts overview
- Student enrollment numbers
- Upcoming sessions
- Assessment queue
- Certificate issuance tracking
- Cohort performance metrics

**Primary Workflows:**
1. **Cohort Management** (`/portal/instructor/cohorts`)
   - Create new cohorts
   - Manage curriculum
   - Track enrollment

2. **Assessments** (`/portal/instructor/assessments`)
   - Create assessments
   - Grade submissions
   - Provide feedback

3. **Certificates** (`/portal/instructor/certificates`)
   - Issue certificates
   - Track completions
   - Manage credentials

---

### 6. **QA (Quality Assurance)**
**Primary Dashboard:** QA Dashboard (`/portal/qa/dashboard`)

**Role Definition:**
Quality assurance specialists who review and validate content, proof packs, and submissions before they go live. Ensure quality standards are met.

**Key Capabilities:**
- Review queue management
- Content validation
- Proof pack review
- Quality scoring
- Approval/rejection workflow
- Review history tracking

**Dashboard Features:**
- Pending review queue
- Review statistics
- Quality metrics
- Recent approvals/rejections
- Priority items
- Review history

**Primary Workflows:**
1. **Review Queue** (`/portal/qa/queue`)
   - View pending items
   - Prioritize reviews
   - Assign reviews

2. **Review Process** (`/portal/qa/review/[id]`)
   - Detailed item review
   - Quality assessment
   - Approve or reject with feedback

3. **History** (`/portal/qa/history`)
   - Past reviews
   - Quality trends
   - Performance metrics

---

### 7. **Team Member**
**Primary Dashboard:** Main Dashboard (`/portal/dashboard`)

**Role Definition:**
General team members with standard access to core platform features. Manage opportunities, projects, and collaborate with the team.

**Key Capabilities:**
- Opportunity management
- Project tracking
- Task management
- Calendar access
- Document management
- Team collaboration

**Dashboard Features:**
- Personal pipeline
- Assigned projects
- Action items
- Upcoming meetings
- Recent activity
- Team updates

**Primary Workflows:**
1. **Opportunities** (`/portal/opportunities`)
   - Create and track opportunities
   - Manage pipeline stages
   - Update deal status

2. **Projects** (`/portal/projects`)
   - Project overview
   - Task management
   - Progress tracking

3. **Calendar** (`/portal/calendar`)
   - Meeting schedule
   - Event management
   - Availability

---

## Role Comparison Matrix

| Feature | Admin | Buyer | Partner | SME | Instructor | QA | Team Member |
|---------|-------|-------|---------|-----|------------|----|-----------| 
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Directory Access | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Proof Packs | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Lead Management | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Revenue Tracking | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cohorts (Browse) | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Cohorts (Create) | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Certifications | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| QA Reviews | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Opportunities | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Projects | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Introductions | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## Dashboard Navigation

Each role has a customized sidebar navigation that shows only relevant menu items:

- **Admin**: Full navigation access
- **Buyer**: Directory, Favorites, Introductions, Shared Packs
- **Partner**: Leads, Clients, Revenue, Conversions, Introductions
- **SME**: Cohorts, Certificates, Profile, Subscription, Introductions
- **Instructor**: Cohorts, Assessments, Certificates
- **QA**: Queue, Reviews, History, My Reviews
- **Team Member**: Opportunities, Projects, Calendar, Documents

Navigation visibility can be customized by administrators in **Settings → Navigation**.

---

## Getting Started by Role

### New Admin
1. Complete profile setup
2. Configure integrations (Settings → Integrations)
3. Set up team members (Admin → User Management)
4. Configure platform settings
5. Review audit logs and monitoring

### New Buyer
1. Complete profile
2. Browse directory (`/portal/buyer/directory`)
3. Save favorites
4. Request introductions
5. Review proof packs

### New Partner/Affiliate
1. Complete profile with networking details
2. Set up proof pack
3. Start tracking leads
4. Analyze overlaps with other partners
5. Monitor revenue dashboard

### New SME
1. Complete profile and expertise
2. Browse available cohorts
3. Enroll in relevant programs
4. Track certification progress
5. Update availability for introductions

### New Instructor
1. Complete instructor profile
2. Create first cohort
3. Design curriculum
4. Set up assessments
5. Manage enrollments

### New QA Reviewer
1. Complete profile
2. Review queue guidelines
3. Start with low-priority items
4. Learn quality standards
5. Track review metrics

### New Team Member
1. Complete profile
2. Create first opportunity
3. Set up calendar
4. Join active projects
5. Complete action items

---

## Support & Resources

- **Help Center**: `/portal/help` (coming soon)
- **Settings**: `/portal/settings`
- **Profile**: `/portal/profile`
- **Documentation**: `/docs`

For role-specific questions, contact your administrator or refer to the platform help documentation.
