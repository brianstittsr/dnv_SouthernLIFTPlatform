---
description: Complete migration guide for Webinar Creator feature to white-labeled instance
---

# Webinar Creator Migration Guide

This workflow provides a complete migration strategy for moving the Webinar Creator feature and all webinar content from the SVP platform to a new white-labeled instance.

## Phase 1: Export Webinar Data from Source

### Step 1: Create Export Script
Create a Node.js script in the source instance to export all webinar data:

```typescript
// scripts/export-webinars.ts
import { getDb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import * as fs from "fs";

async function exportWebinars() {
  const db = getDb();
  if (!db) throw new Error("Database not initialized");

  const webinarsRef = collection(db, COLLECTIONS.WEBINARS);
  const snapshot = await getDocs(webinarsRef);

  const webinars = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Convert Firestore Timestamps to ISO strings for JSON export
    createdAt: doc.data().createdAt?.toDate().toISOString(),
    updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    publishedAt: doc.data().publishedAt?.toDate().toISOString(),
    scheduledPublishAt: doc.data().scheduledPublishAt?.toDate().toISOString(),
  }));

  const exportData = {
    exportDate: new Date().toISOString(),
    totalWebinars: webinars.length,
    webinars,
  };

  fs.writeFileSync(
    "webinars-export.json",
    JSON.stringify(exportData, null, 2)
  );

  console.log(`✅ Exported ${webinars.length} webinars to webinars-export.json`);
}

exportWebinars().catch(console.error);
```

### Step 2: Run Export
```bash
npx tsx scripts/export-webinars.ts
```

This creates `webinars-export.json` with all webinar data.

---

## Phase 2: Migrate Code to Destination

### Step 3: Copy Feature Files

Copy the following files from source to destination (maintain exact paths):

**Admin UI Components:**
- `app/(portal)/portal/admin/webinar-creator/page.tsx`
- `app/(portal)/portal/admin/webinar-creator/[id]/page.tsx`
- `app/(portal)/portal/admin/webinar-creator/components/WizardStepper.tsx`
- `app/(portal)/portal/admin/webinar-creator/components/BasicInfoStep.tsx`
- `app/(portal)/portal/admin/webinar-creator/components/LandingPageStep.tsx`
- `app/(portal)/portal/admin/webinar-creator/components/ConfirmationPageStep.tsx`
- `app/(portal)/portal/admin/webinar-creator/components/GHLIntegrationStep.tsx`
- `app/(portal)/portal/admin/webinar-creator/components/PreviewPublishStep.tsx`
- `app/(portal)/portal/admin/webinar-creator/components/DynamicListEditor.tsx`
- `app/(portal)/portal/admin/webinar-creator/components/IconSelector.tsx`
- `app/(portal)/portal/admin/webinar-creator/components/WebinarPreview.tsx`

**Public Marketing Pages:**
- `app/(marketing)/webinars/[slug]/page.tsx`
- `app/(marketing)/webinars/[slug]/confirmation/page.tsx`

**API Routes:**
- `app/api/admin/webinars/route.ts`
- `app/api/admin/webinars/[id]/route.ts`
- `app/api/admin/webinars/[id]/publish/route.ts`

**Type Definitions:**
- `lib/types/webinar.ts`

### Step 4: Update Schema and Types

1. In `lib/schema.ts`, add the `WebinarDoc` interface:

```typescript
/** Webinar document in Firestore */
export interface WebinarDoc {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: "draft" | "published" | "scheduled" | "archived";
  startTime: string;
  duration: number;
  timezone: string;
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    backgroundImage?: string;
    videoPreviewUrl?: string;
  };
  about: {
    title: string;
    content: string;
    image?: string;
  };
  benefits: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
  }>;
  speakers: Array<{
    id: string;
    name: string;
    title: string;
    bio: string;
    imageUrl?: string;
  }>;
  agenda: Array<{
    id: string;
    time: string;
    title: string;
    description?: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  registration: {
    type: "external" | "internal";
    externalUrl?: string;
    buttonText: string;
  };
  ghlIntegration?: {
    enabled: boolean;
    apiKey?: string;
    locationId?: string;
    formId?: string;
    tags?: string[];
  };
  confirmation: {
    title: string;
    message: string;
    videoUrl?: string;
    nextStepsTitle?: string;
    nextSteps: string[];
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}
```

2. Add to the `COLLECTIONS` object in `lib/schema.ts`:

```typescript
export const COLLECTIONS = {
  // ... existing collections
  WEBINARS: "webinars",
};
```

3. Ensure types are exported from `types/index.ts`:

```typescript
export * from "../lib/types/webinar";
```

### Step 5: Verify Dependencies

Ensure these packages are installed in the destination:
```bash
npm install lucide-react sonner
```

Verify `shadcn/ui` components exist:
- Card, Button, Input, Label, Textarea, Badge
- Select, Checkbox, Switch, Tabs, Dialog
- Table, ScrollArea, DropdownMenu

---

## Phase 3: White-Label Customization

### Step 6: Update Brand Colors

In the destination's `tailwind.config.ts`, ensure `primary` color is set to the new brand:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
    },
  },
}
```

### Step 7: Replace Hardcoded Text

Search and replace any SVP-specific references:

**In `lib/types/webinar.ts`:**
- Update `getDefaultWebinar()` default values if needed
- Update placeholder text in form fields

**In component files:**
- Update any hardcoded company names
- Update default logo URLs
- Update default payment links

### Step 8: Update Navigation

Add Webinar Creator to the admin navigation menu in the destination's sidebar/nav component:

```tsx
{
  title: "Webinar Creator",
  href: "/portal/admin/webinar-creator",
  icon: Video,
}
```

---

## Phase 4: Import Webinar Data to Destination

### Step 9: Create Import Script

Create this script in the destination instance:

```typescript
// scripts/import-webinars.ts
import { getDb } from "@/lib/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import * as fs from "fs";

async function importWebinars() {
  const db = getDb();
  if (!db) throw new Error("Database not initialized");

  const exportData = JSON.parse(
    fs.readFileSync("webinars-export.json", "utf-8")
  );

  console.log(`📦 Importing ${exportData.totalWebinars} webinars...`);

  const webinarsRef = collection(db, COLLECTIONS.WEBINARS);
  let imported = 0;

  for (const webinar of exportData.webinars) {
    const { id, ...data } = webinar;

    // Convert ISO strings back to Firestore Timestamps
    const docData = {
      ...data,
      createdAt: data.createdAt ? Timestamp.fromDate(new Date(data.createdAt)) : Timestamp.now(),
      updatedAt: data.updatedAt ? Timestamp.fromDate(new Date(data.updatedAt)) : Timestamp.now(),
      publishedAt: data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : undefined,
      scheduledPublishAt: data.scheduledPublishAt ? Timestamp.fromDate(new Date(data.scheduledPublishAt)) : undefined,
    };

    // Use same ID or generate new one
    const docRef = doc(webinarsRef, id);
    await setDoc(docRef, docData);
    imported++;
    console.log(`✓ Imported: ${data.title} (${id})`);
  }

  console.log(`✅ Successfully imported ${imported} webinars`);
}

importWebinars().catch(console.error);
```

### Step 10: Transfer Export File

Copy `webinars-export.json` from source to destination root directory.

### Step 11: Run Import

```bash
npx tsx scripts/import-webinars.ts
```

---

## Phase 5: Verification & Testing

### Step 12: Verify Admin UI

1. Navigate to `/portal/admin/webinar-creator`
2. Verify all imported webinars appear in the list
3. Click "Edit" on a webinar and verify all 5 wizard steps load correctly
4. Test creating a new webinar from scratch

### Step 13: Verify Public Pages

For each imported webinar:
1. Visit `/webinars/{slug}` - verify landing page renders
2. Visit `/webinars/{slug}/confirmation` - verify confirmation page renders
3. Test registration form submission (if GHL integration is enabled)

### Step 14: Test Publishing Flow

1. Edit a draft webinar
2. Navigate to Preview step
3. Click "Publish"
4. Verify status changes to "published"
5. Verify public page is accessible

---

## Phase 6: Post-Migration Cleanup

### Step 15: Update Image URLs

If webinars reference images stored in Firebase Storage or external CDN:
1. Review all `logo`, `primaryLogo`, `secondaryLogo` fields
2. Update URLs to point to destination storage
3. Re-upload images if necessary

### Step 16: Update Integration Settings

If using GoHighLevel integration:
1. Update `ghlIntegration.apiKey` for each webinar
2. Update `ghlIntegration.locationId`
3. Test webhook endpoints

### Step 17: Update SEO Metadata

Review and update for new domain:
1. `seo.landingPage.metaTitle`
2. `seo.landingPage.metaDescription`
3. `seo.confirmationPage.metaTitle`
4. `seo.confirmationPage.metaDescription`

---

## Rollback Plan

If migration fails, restore source data:

```bash
# In source instance
npm run backup-firestore
```

Keep the `webinars-export.json` file as a backup.

---

## Success Criteria

✅ All webinar documents imported to destination Firestore
✅ Admin UI loads and displays all webinars
✅ Wizard navigation works across all 5 steps
✅ Public landing pages render correctly
✅ Confirmation pages render correctly
✅ New webinars can be created
✅ Publishing flow works end-to-end
✅ Brand colors match destination theme
✅ No hardcoded SVP references remain

---

## Troubleshooting

**Issue: "Database not initialized" error**
- Verify Firebase config in destination `.env.local`
- Check `lib/firebase.ts` initialization

**Issue: Missing UI components**
- Run `npx shadcn-ui@latest add [component-name]`

**Issue: Type errors in TypeScript**
- Verify `lib/types/webinar.ts` is copied
- Run `npm run type-check`

**Issue: Images not loading**
- Update image URLs in webinar documents
- Check CORS settings on image CDN

**Issue: GHL integration not working**
- Update API keys in destination environment
- Verify webhook URLs point to new domain

---

## Estimated Timeline

- **Phase 1 (Export):** 15 minutes
- **Phase 2 (Code Migration):** 30 minutes
- **Phase 3 (White-Labeling):** 45 minutes
- **Phase 4 (Data Import):** 15 minutes
- **Phase 5 (Verification):** 30 minutes
- **Phase 6 (Cleanup):** 30 minutes

**Total:** ~2.5 hours for complete migration

---

## Notes

- This migration preserves all webinar IDs, so URLs remain consistent
- Timestamps are preserved from source
- Status (draft/published/scheduled) is maintained
- All content (landing page, confirmation page, integrations) is fully migrated
- The feature is completely self-contained - no dependencies on other SVP-specific features
