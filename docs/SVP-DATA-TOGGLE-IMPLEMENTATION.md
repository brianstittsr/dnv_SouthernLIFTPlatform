# SVP Pages - Mock/Live Data Toggle Implementation Guide

## Overview

All SVP pages now support toggling between mock data (for testing/demo) and live Firebase data. This allows development and testing without requiring real data in Firebase.

## Implementation Pattern

### 1. Import the DataModeToggle Component

```typescript
import { DataModeToggle } from "@/components/svp/data-mode-toggle";
```

### 2. Add State Management

```typescript
const [useMockData, setUseMockData] = useState(true); // Default to mock data
const [loading, setLoading] = useState(true);
const [data, setData] = useState<YourDataType[]>([]);
```

### 3. Create Mock Data

```typescript
const MOCK_DATA: YourDataType[] = [
  {
    id: "mock-1",
    // ... mock fields matching your data structure
  },
  // Add 3-5 realistic mock records
];
```

### 4. Update Load Function

```typescript
const loadData = async () => {
  setLoading(true);
  
  if (useMockData) {
    // Use mock data
    setData(MOCK_DATA);
    setLoading(false);
    return;
  }

  // Load from Firebase
  if (!db) {
    setLoading(false);
    return;
  }
  
  try {
    const q = query(
      collection(db, "yourCollection"),
      // ... your query constraints
    );
    
    const snapshot = await getDocs(q);
    const liveData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as YourDataType[];
    
    setData(liveData);
  } catch (error) {
    console.error("Error loading data:", error);
    toast.error("Failed to load data");
  } finally {
    setLoading(false);
  }
};
```

### 5. Add useEffect to Reload on Toggle

```typescript
useEffect(() => {
  loadData();
}, [useMockData]); // Reload when toggle changes
```

### 6. Add Toggle to Page Header

```typescript
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold">Page Title</h1>
    <p className="text-muted-foreground">Page description</p>
  </div>
  <DataModeToggle 
    useMockData={useMockData} 
    onToggle={() => setUseMockData(!useMockData)} 
  />
</div>
```

## SVP Pages Requiring Updates

### SME Pages (6 pages)
- ✅ `/portal/sme/cohorts` - Updated with toggle
- ✅ `/portal/sme/cohorts/browse` - Updated with toggle
- ⏳ `/portal/sme/dashboard` - Needs toggle
- ⏳ `/portal/sme/profile` - Needs toggle
- ⏳ `/portal/sme/subscription` - Needs toggle
- ⏳ `/portal/sme/introductions` - Needs toggle
- ⏳ `/portal/sme/certificates` - Needs toggle

### Partner Pages (7 pages)
- ⏳ `/portal/partner/dashboard` - Needs toggle
- ⏳ `/portal/partner/leads` - Needs toggle
- ⏳ `/portal/partner/leads/[id]` - Needs toggle
- ⏳ `/portal/partner/introductions` - Needs toggle
- ⏳ `/portal/partner/revenue` - Needs toggle
- ⏳ `/portal/partner/overlaps` - Needs toggle
- ⏳ `/portal/partner/clients` - Needs toggle
- ⏳ `/portal/partner/conversions` - Needs toggle

### Buyer Pages (5 pages)
- ⏳ `/portal/buyer/dashboard` - Needs toggle
- ⏳ `/portal/buyer/directory` - Needs toggle
- ⏳ `/portal/buyer/introductions` - Needs toggle
- ⏳ `/portal/buyer/favorites` - Needs toggle
- ⏳ `/portal/buyer/shared-packs` - Needs toggle

### QA Pages (5 pages)
- ⏳ `/portal/qa/dashboard` - Needs toggle
- ⏳ `/portal/qa/queue` - Needs toggle
- ⏳ `/portal/qa/my-reviews` - Needs toggle
- ⏳ `/portal/qa/history` - Needs toggle
- ⏳ `/portal/qa/review/[id]` - Needs toggle

### Instructor Pages (5 pages)
- ✅ `/portal/instructor/cohorts` - Updated with toggle
- ⏳ `/portal/instructor/dashboard` - Needs toggle
- ⏳ `/portal/instructor/cohorts/new` - Needs toggle
- ⏳ `/portal/instructor/assessments` - Needs toggle
- ⏳ `/portal/instructor/certificates` - Needs toggle

### Admin SVP Pages (3 pages)
- ⏳ `/portal/admin/svp-settings` - Needs toggle
- ⏳ `/portal/admin/user-management` - Needs toggle
- ⏳ `/portal/admin/analytics` - Needs toggle

## Mock Data Guidelines

### 1. Realistic Data
- Use realistic names, dates, and values
- Follow actual business scenarios
- Include variety in statuses and states

### 2. Sufficient Volume
- Provide 3-5 mock records minimum
- Include edge cases (empty states, full capacity, etc.)
- Cover different status types

### 3. Consistent Structure
- Match Firebase document structure exactly
- Include all required fields
- Use proper Timestamp objects for dates

### 4. Example Mock Data Structures

#### Cohort
```typescript
{
  id: "mock-1",
  title: "CMMC Level 1 Certification - Spring 2026",
  description: "Comprehensive 12-week program...",
  instructorId: "instructor-1",
  instructorName: "James Thompson",
  startDate: Timestamp.fromDate(new Date("2026-03-15")),
  endDate: Timestamp.fromDate(new Date("2026-06-07")),
  duration: 12,
  maxParticipants: 20,
  currentEnrollment: 14,
  status: "published",
  price: 3500,
  level: "beginner"
}
```

#### Proof Pack
```typescript
{
  id: "mock-1",
  smeId: "sme-1",
  smeName: "Acme Manufacturing",
  title: "ISO 9001 Quality Management System",
  description: "Complete QMS documentation...",
  category: "quality",
  status: "approved",
  packHealth: 85,
  documentsCount: 24,
  lastUpdated: Timestamp.now(),
  price: 3500
}
```

#### Lead
```typescript
{
  id: "mock-1",
  partnerId: "partner-1",
  companyName: "Defense Contractor Inc",
  contactName: "John Smith",
  email: "john@defensecontractor.com",
  phone: "(555) 123-4567",
  status: "qualified",
  source: "website",
  vertical: "defense",
  estimatedValue: 50000,
  createdAt: Timestamp.now()
}
```

## Firebase Collections Reference

| Collection | Used By | Purpose |
|------------|---------|---------|
| `cmmcCohorts` | Instructor, SME | CMMC training cohorts |
| `cohortEnrollments` | SME | User enrollments in cohorts |
| `proofPacks` | SME, QA, Buyer | SME capability documentation |
| `smeSubscriptions` | SME | Subscription management |
| `partnerLeads` | Partner | Lead management |
| `partnerIntroductions` | Partner, SME | Introduction requests |
| `partnerRevenue` | Partner | Revenue tracking |
| `buyerRequests` | Buyer | Buyer introduction requests |
| `qaReviews` | QA | Proof pack reviews |
| `platformSettings` | Admin | Platform configuration |
| `teamMembers` | Admin | User management |

## Testing Checklist

For each page:
- [ ] Toggle switches between mock and live data
- [ ] Mock data displays correctly
- [ ] Live data loads from Firebase (when available)
- [ ] Empty states work for both modes
- [ ] Loading states display properly
- [ ] Error handling works for Firebase failures
- [ ] Toggle persists during page session
- [ ] All CRUD operations work in both modes

## Benefits

1. **Development Speed**: Work without waiting for Firebase data
2. **Demo Ready**: Always have data to show stakeholders
3. **Testing**: Test UI with various data scenarios
4. **Offline Work**: Develop without internet connection
5. **Data Privacy**: Demo without exposing real customer data

## Next Steps

1. Update remaining SME pages (5 pages)
2. Update all Partner pages (8 pages)
3. Update all Buyer pages (5 pages)
4. Update all QA pages (5 pages)
5. Update remaining Instructor pages (4 pages)
6. Update Admin SVP pages (3 pages)

**Total**: 30 pages remaining to update
