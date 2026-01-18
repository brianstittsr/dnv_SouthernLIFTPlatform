# Sidebar Reorganization Guide

## Current Status

✅ **All 24 SVP pages have been created successfully!**

The following pages are now available:

### SME Pages
- `/portal/sme/dashboard` - SME Dashboard
- `/portal/sme/profile` - SME Profile
- `/portal/sme/subscription` - Subscription Management
- `/portal/sme/introductions` - My Introductions
- `/portal/sme/cohorts` - My Cohorts
- `/portal/sme/certificates` - Certificates

### Partner Pages
- `/portal/partner/dashboard` - Partner Dashboard
- `/portal/partner/leads` - Lead Management
- `/portal/partner/introductions` - Introductions
- `/portal/partner/revenue` - Revenue Dashboard
- `/portal/partner/overlaps` - Service Overlaps
- `/portal/partner/clients` - My SME Clients
- `/portal/partner/conversions` - Conversion Tracking

### Buyer Pages
- `/portal/buyer/dashboard` - Buyer Dashboard
- `/portal/buyer/directory` - SME Directory
- `/portal/buyer/introductions` - My Introductions
- `/portal/buyer/favorites` - Saved SMEs
- `/portal/buyer/shared-packs` - Shared Proof Packs

### QA Pages
- `/portal/qa/dashboard` - QA Dashboard
- `/portal/qa/queue` - Review Queue
- `/portal/qa/my-reviews` - My Reviews
- `/portal/qa/history` - Review History

### Instructor Pages
- `/portal/instructor/dashboard` - Instructor Dashboard
- `/portal/instructor/cohorts` - My Cohorts
- `/portal/instructor/cohorts/new` - Create Cohort
- `/portal/instructor/assessments` - Assessments
- `/portal/instructor/certificates` - Certificates

### Admin Pages
- `/portal/admin/svp-settings` - SVP Settings
- `/portal/admin/user-management` - User Management
- `/portal/admin/analytics` - Platform Analytics

## Sidebar Organization

The sidebar is currently organized with SVP sections appearing after other sections. The SVP sections are:

1. **SVP - SME** (visible to: platform_admin, sme_user, cmmc_instructor)
2. **SVP - Partner** (visible to: platform_admin, partner_user)
3. **SVP - Buyer** (visible to: platform_admin, buyer)
4. **SVP - QA** (visible to: platform_admin, qa_reviewer)
5. **SVP - Instructor** (visible to: platform_admin, cmmc_instructor)
6. **SVP - Admin** (visible to: platform_admin)

## Next Steps

### 1. Manual Sidebar Reorganization

To move SVP sections to the top of the sidebar, you need to manually edit `components/portal/portal-sidebar.tsx`:

1. Locate the SVP section rendering code (starts around line 982)
2. Cut all SVP section code blocks
3. Paste them immediately after the `<SidebarContent>` opening tag (around line 750)
4. Group remaining sections under a new "OTHER" collapsible section

### 2. Create Firebase Indexes

Create `firestore.indexes.json` with the following indexes:

```json
{
  "indexes": [
    {
      "collectionGroup": "smeSubscriptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "partnerLeads",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "partnerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "buyerRequests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "buyerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "qaReviews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "reviewerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "cmmcCohorts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "instructorId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "startDate", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 3. Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

## Testing Checklist

After reorganization, test each SVP page:

- [ ] All SME pages load without 404 errors
- [ ] All Partner pages load without 404 errors
- [ ] All Buyer pages load without 404 errors
- [ ] All QA pages load without 404 errors
- [ ] All Instructor pages load without 404 errors
- [ ] All Admin SVP pages load without 404 errors
- [ ] SVP sections appear at the top of the sidebar
- [ ] Non-SVP sections are grouped under "OTHER"
- [ ] Role-based visibility works correctly

## Firebase Collections Status

All required collections have been defined in the Firestore rules. To initialize them, run the collection initializer:

1. Navigate to: `http://localhost:3000/portal/admin/init-collections`
2. Click "Initialize Collections"
3. Wait for completion
4. Restore secure rules:
   ```bash
   Copy-Item firestore.rules.backup firestore.rules -Force
   firebase deploy --only firestore:rules
   ```

## Summary

✅ All 24 SVP pages created
✅ All pages have basic CRUD structure
✅ Firestore rules include all SVP collections
⏳ Sidebar reorganization (manual step required)
⏳ Firebase indexes (need to be deployed)
⏳ Collection initialization (user action required)
