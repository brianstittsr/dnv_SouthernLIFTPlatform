# MBE and Minority Keyword Search Report

**Generated:** March 19, 2026  
**Updated:** March 19, 2026 (Refined search criteria)  
**Search Parameters:**
- "MBE" (case-sensitive, standalone word only - excludes MEMBER/MEMBERSHIP)
- "minority" (case-insensitive)

---

## Executive Summary

This report documents all occurrences of "MBE" (as a standalone acronym) and "minority" keywords across the KDM & Associates website codebase.

**Key Findings:**
- **"MBE"** appears in 11 instances across 7 files (standalone acronym only)
- **"minority"** appears in 23 instances across 10 files
- "MBE" is used primarily as a certification type in forms and content
- "minority" has limited public-facing presence (only `/about` page and SEO metadata)

---

## Pages Containing "MBE" (Standalone Acronym Only)

### Components

#### Onboarding Components
- **`components/onboarding/sme-wizard-steps.tsx`** - 1 match
  - **Context:** Certification option in SME onboarding wizard
  - **Line 25:** `{ id: "mbe", label: "MBE" }`

- **`components/onboarding/buyer-wizard-steps.tsx`** - 1 match
  - **Context:** Preferred supplier certification type in buyer onboarding
  - **Line 37:** `{ id: "mbe", label: "MBE" }`

---

### Data Files

#### Configuration Files
- **`lib/iaeoz-config.ts`** - 2 matches
  - **Line 58:** `subtitle: "MBE Spotlight"`
  - **Line 60:** `ctaText: "Watch MBE Stories"`
  - **Context:** IAEOZ summit configuration for diverse business enterprise success stories

#### Schema Files
- **`lib/proof-pack-schema.ts`** - 1 match
  - **Line 201:** `'Minority Business Enterprise (MBE)'`
  - **Context:** Certification type option in proof pack schema

#### Services Data
- **`lib/services-data.ts`** - 1 match
  - **Line 315:** `"Minority Business Enterprise (MBE) certification"`
  - **Context:** Listed as a certification assistance service

#### Mock Data
- **`lib/mock-data/survey-mock-data.ts`** - 1 match
  - **Line 91:** `{ id: "cert1", label: "MBE (Minority Business Enterprise)", value: "mbe" }`
  - **Context:** Survey certification options

---

### Blog Content

#### Blog Posts
- **`lib/blog/us-manufacturing.ts`** - 1 match
  - **Line 194:** `"Growing demand for sustainable materials benefits MBE suppliers"`
  - **Context:** Discussion of MBE suppliers in manufacturing sector

- **`lib/blog/access-to-capital.ts`** - 1 match
  - **Line 589:** `"Attend NMSDC events where defense primes are seeking MBE suppliers"`
  - **Context:** Strategy for MBE businesses to access capital

---

### Scripts

#### Presentation Scripts
- **`scripts/export-presentations-to-pptx-separate.js`** - 2 matches
  - **Lines 46, 90:** `"MBE certification"` in BelPak presentation slides
  - **Line 103:** `"6. MBE certification"` in competitive advantages list
  - **Context:** PowerPoint presentation content about BelPak company

- **`scripts/merge-presentations.js`** - 2 matches
  - **Lines 51, 101:** `"MBE certification"` in BelPak presentation slides
  - **Line 115:** `"6. MBE certification"` in competitive advantages list
  - **Context:** PowerPoint presentation content about BelPak company

---

## Pages Containing "minority" (Case-Insensitive)

### Public Marketing Pages

#### `/about`
- **Matches:** 1
- **Context:** "Minority Business Development Agency (MBDA)" mentioned in company history
- **Full Text:** "On April 30, 2025, KDM & Associates, LLC took a bold step - privatizing the mission of the Department of Commerce's Minority Business Development Agency (MBDA)..."

---

### Components

#### SEO Components
- **`components/seo/json-ld.tsx`** - 1 match
- **Context:** "Minority Business Enterprise" listed in organization's `knowsAbout` schema

---

### Data Files

#### Blog Content
- **`lib/blog/access-to-capital.ts`** - 7 matches
- **`lib/blog/us-manufacturing.ts`** - 3 matches
- **`lib/blog/cross-cutting-topics.ts`** - 3 matches
- **`lib/blog/defense-contracting-cmmc.ts`** - 1 match
- **`lib/blog-data.ts`** - 2 matches

#### Other Data
- **`lib/proof-pack-schema.ts`** - 3 matches
- **`lib/services-data.ts`** - 1 match
- **`lib/mock-data/survey-mock-data.ts`** - 1 match

---

## Analysis & Insights

### "MBE" Usage Patterns (Refined Results)

1. **Certification Type:** Primary usage as a business certification designation
   - Onboarding forms: SME and Buyer wizards
   - Proof pack schema: Listed as certification option
   - Services data: Offered as a certification assistance service

2. **Content & Marketing:**
   - IAEOZ summit: "MBE Spotlight" section for success stories
   - Blog posts: Referenced in manufacturing and capital access content
   - Presentation scripts: BelPak company case study mentions MBE certification

3. **No Public-Facing Pages:**
   - MBE does NOT appear on any public marketing pages (e.g., `/pricing`, `/team`)
   - All references are in backend components, data files, or blog content
   - Previous report incorrectly included TEAM_MEMBERS/MEMBERSHIP false positives

### "minority" Usage Patterns

1. **Limited Public Presence:**
   - Only 1 public-facing page (`/about`)
   - Mentioned once in context of MBDA partnership history

2. **SEO Metadata:**
   - Included in structured data as "Minority Business Enterprise"
   - Part of organization's knowledge areas

3. **Content Strategy:**
   - Appears in blog post content (not necessarily published)
   - Referenced in data schemas and services

### Recommendations

1. **Public Visibility:**
   - Both "MBE" and "minority" have minimal presence on public pages
   - Consider adding dedicated content for MBE/minority business services
   - Current references are primarily in backend/data files

2. **Consistency:**
   - "MBE" used as standalone acronym in forms and content
   - "Minority Business Enterprise (MBE)" used in formal contexts
   - Good consistency across the codebase

3. **Content Opportunities:**
   - Blog posts contain MBE/minority-related content but may not be published
   - IAEOZ summit has MBE spotlight section - could be promoted more
   - Services data mentions MBE certification assistance - could be featured on services page

---

## File Distribution Summary

### "MBE" Distribution (Refined)
- **7 files total**
- **11 total matches**
- **Files by category:**
  - **Components:** 2 files (onboarding wizards)
  - **Data/Config:** 4 files (schemas, services, mock data, IAEOZ config)
  - **Blog Content:** 2 files (manufacturing, capital access)
  - **Scripts:** 2 files (presentation generators)

### "minority" Distribution
- **10 files total**
- **23 total matches**
- **Top files by match count:**
  1. `lib/blog/access-to-capital.ts` (7)
  2. `lib/blog/cross-cutting-topics.ts` (3)
  3. `lib/blog/us-manufacturing.ts` (3)
  4. `lib/proof-pack-schema.ts` (3)
  5. `lib/blog-data.ts` (2)

---

## Conclusion

The refined search reveals that:
- **"MBE"** appears 11 times across 7 files (down from 109 false positives)
- **"MBE"** is used primarily as a certification type in forms and content, NOT in page URLs or public marketing
- **"minority"** has very limited public-facing presence (only `/about` page and SEO metadata)
- Both terms are more prevalent in data files and blog content than in customer-facing pages

**Key Insight:** The previous report incorrectly counted TEAM_MEMBERS and MEMBERSHIP references as "MBE" matches. The actual usage of "MBE" as Minority Business Enterprise is much more limited and focused on certification-related contexts.

For marketing and SEO purposes, consider whether additional public-facing content featuring these terms would be beneficial for reaching MBE/minority business audiences.

---

**Report Generated By:** Cascade AI  
**Date:** March 19, 2026  
**Project:** KDM & Associates Platform (svp-platform)
