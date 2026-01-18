# AI Page Designer - Implementation Guide

## Overview

The AI Page Designer is a comprehensive page editing tool that allows administrators to create and optimize SVP platform pages using AI assistance. It features a 7-step wizard, AI chat interface, template library, and UX review system.

## Features

### 1. **Design Wizard** (7 Steps)
- **Step 1:** Choose mode (Create New or Update Existing)
- **Step 2:** Define page goal (Lead Gen, Sales, Educate, etc.)
- **Step 3:** Select target audience (SME Owners, Partners, Buyers, etc.)
- **Step 4:** Choose visual style (Tone, Color Scheme, Layout)
- **Step 5:** Select page sections (minimum 2)
- **Step 6:** Add key content (Headline, Subheadline, CTA)
- **Step 7:** Review and generate

### 2. **AI Chat Interface**
- Natural language page editing
- Context-aware responses based on selected page/section
- Quick action buttons for common tasks
- Message history with applied changes tracking
- Section-specific focus mode

### 3. **Template Library**
- Pre-built section templates with best practices
- Filterable by section type (hero, features, testimonials, etc.)
- Popularity ratings
- Easy template application

### 4. **UX Review System**
- Overall score (0-100)
- Category breakdown:
  - Visual Hierarchy
  - Content Clarity
  - Brand Consistency
  - Conversion Optimization
  - Mobile Experience
  - Accessibility
- Prioritized recommendations with impact estimates
- WCAG accessibility issue detection
- Brand consistency metrics

## Files Created

### Core Files

1. **`lib/firebase-page-designer.ts`** (~943 lines)
   - Firebase collection definitions
   - TypeScript interfaces for all data structures
   - CRUD operations for designs, templates, conversations, and reviews
   - SVP platform page configurations

2. **`app/(portal)/portal/admin/page-designer/page.tsx`** (~1400 lines)
   - Main UI component with "use client" directive
   - Wizard, chat, templates, and review interfaces
   - State management and data loading
   - Mock AI responses (ready for real AI integration)

3. **`components/portal/portal-sidebar.tsx`** (updated)
   - Added "Page Designer" menu item under Admin section
   - Added Wand2 icon import

## SVP Platform Pages Configured

The following pages are pre-configured in the Page Designer:

| Page | Path | Sections |
|------|------|----------|
| **Home** | `/` | Hero, Features, How It Works, Testimonials, Stats, CTA |
| **About** | `/about` | Hero, Mission, Team, Values |
| **SME Services** | `/sme-services` | Hero, Proof Packs, Pricing, Benefits, CTA |
| **Partner Services** | `/partner-services` | Hero, Features, Revenue, Testimonials, CTA |
| **Buyer Directory** | `/buyer-directory` | Hero, Search, Featured SMEs, How-to |
| **CMMC Training** | `/cmmc-training` | Hero, Curriculum, Instructors, Pricing, FAQ, CTA |
| **Contact** | `/contact` | Hero, Form, Info |

## Firebase Collections

The Page Designer uses the following Firestore collections:

### 1. `page_designs`
Stores current page designs with versioning.

```typescript
interface PageDesign {
  pageId: string;
  pageName: string;
  content: DesignContent;
  version: number;
  status: "draft" | "published" | "archived";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
```

### 2. `page_design_history`
Version history of all design changes.

```typescript
interface DesignHistory {
  designId: string;
  pageId: string;
  content: DesignContent;
  version: number;
  changeDescription?: string;
  createdBy: string;
  createdAt: Date;
}
```

### 3. `page_layout_templates`
Reusable section templates.

```typescript
interface LayoutTemplate {
  name: string;
  description: string;
  category: string;
  sectionType: SectionType;
  content: SectionDesign;
  popularity: number;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
}
```

### 4. `page_ai_conversations`
AI chat history and context.

```typescript
interface AIConversation {
  pageId?: string;
  sectionId?: string;
  messages: AIMessage[];
  context: {
    currentPage?: string;
    currentSection?: string;
    designGoal?: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5. `page_ux_reviews`
UX audit results and recommendations.

```typescript
interface UXReview {
  pageId: string;
  designId: string;
  overallScore: number;
  categories: CategoryScores;
  recommendations: Recommendation[];
  accessibilityIssues: AccessibilityIssue[];
  brandMetrics: BrandMetrics;
  createdBy: string;
  createdAt: Date;
}
```

## Customization Points

### 1. Page Goals
Located in `lib/firebase-page-designer.ts`:

```typescript
export const PAGE_GOALS = [
  { id: "lead-gen", label: "Generate Leads", description: "...", icon: "UserPlus" },
  { id: "sales", label: "Drive Sales", description: "...", icon: "DollarSign" },
  // Add more goals...
];
```

### 2. Target Audiences
```typescript
export const AUDIENCE_OPTIONS = [
  { id: "sme-owners", label: "SME Owners", description: "..." },
  { id: "partners", label: "Consortium Partners", description: "..." },
  // Add more audiences...
];
```

### 3. Style Options
```typescript
export const STYLE_OPTIONS = {
  tone: [...],
  colorScheme: [...],
  layout: [...],
};
```

### 4. Public Pages
```typescript
export const PUBLIC_PAGES: PublicPage[] = [
  {
    id: "home",
    path: "/",
    name: "Home",
    description: "Main SVP platform landing page",
    sections: [
      { id: "hero", name: "Hero Section", type: "hero", order: 1, isEditable: true },
      // Add more sections...
    ],
  },
  // Add more pages...
];
```

## AI Integration Points

The following functions currently use mock responses and should be replaced with real AI API calls:

### 1. Design Generation
In `handleWizardGenerate()`:
```typescript
// Replace mock generation with AI API call
const generatedContent = await callAIDesignAPI({
  goal: wizardData.goal,
  audience: wizardData.audience,
  tone: wizardData.tone,
  sections: wizardData.sections,
  // ...
});
```

### 2. Chat Responses
In `handleChatSend()`:
```typescript
// Replace mock response with AI API call
const aiResponse = await callAIChatAPI({
  message: chatInput,
  context: {
    page: selectedPage,
    section: selectedSection,
    currentDesign: currentDesign,
  },
});
```

### 3. UX Review
In `handleUXReview()`:
```typescript
// Replace mock review with AI API call
const review = await callAIReviewAPI({
  pageId: selectedPage.id,
  design: currentDesign,
});
```

## Usage

### Accessing the Page Designer

1. Navigate to **Admin** section in the sidebar
2. Click **Page Designer** (with AI badge)
3. Select a page to design
4. Choose your workflow:
   - **Wizard:** Step-by-step guided design creation
   - **Chat:** Natural language editing with AI
   - **Templates:** Browse and apply pre-built sections
   - **Review:** Get UX analysis and recommendations

### Creating a New Page Design

1. **Select a page** from the grid
2. Go to **Wizard** tab
3. Choose **Create New** mode
4. Follow the 7-step wizard:
   - Define your goal
   - Select target audience
   - Choose visual style
   - Pick page sections
   - Add key content
   - Review and generate
5. Click **Generate Design**
6. Refine using the **AI Chat**
7. **Save Draft** or **Publish** when ready

### Editing with AI Chat

1. Select a page with an existing design
2. Go to **Chat** tab
3. Optionally select a specific section to focus on
4. Type natural language requests:
   - "Make the headline more compelling"
   - "Add social proof to the hero section"
   - "Improve the call-to-action"
5. Review AI suggestions
6. Apply changes

### Running a UX Review

1. Select a page with a design
2. Go to **Review** tab
3. Click **Run UX Review**
4. Review the analysis:
   - Overall score
   - Category breakdowns
   - Prioritized recommendations
   - Accessibility issues
   - Brand consistency metrics
5. Use recommendations to improve the design

## Section Types Available

- `hero` - Hero/banner sections
- `features` - Feature showcases
- `testimonials` - Customer testimonials
- `cta` - Call-to-action sections
- `pricing` - Pricing tables
- `team` - Team member profiles
- `faq` - Frequently asked questions
- `contact` - Contact forms
- `gallery` - Image galleries
- `stats` - Statistics/metrics
- `content` - General content blocks
- `cards` - Card-based layouts
- `timeline` - Timeline displays
- `comparison` - Comparison tables
- `video` - Video embeds
- `newsletter` - Newsletter signups
- `footer` - Page footers

## Design Content Structure

```typescript
interface DesignContent {
  sections: SectionDesign[];
  globalStyles?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    spacing?: string;
  };
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

interface SectionDesign {
  sectionId: string;
  sectionType: SectionType;
  content: {
    headline?: string;
    subheadline?: string;
    body?: string;
    cta?: {
      text: string;
      link: string;
      style?: string;
    };
    items?: any[];
    media?: {
      type: "image" | "video";
      url: string;
      alt?: string;
    };
  };
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    alignment?: "left" | "center" | "right";
  };
}
```

## Best Practices

### 1. Design Creation
- Start with the wizard for structured guidance
- Select at least 2 sections for a complete page
- Use clear, action-oriented headlines
- Include strong CTAs

### 2. AI Chat Usage
- Be specific in your requests
- Focus on one section at a time for better results
- Review AI suggestions before applying
- Iterate based on feedback

### 3. Template Usage
- Browse templates by section type
- Check popularity ratings
- Customize templates to match your brand
- Save successful designs as new templates

### 4. UX Reviews
- Run reviews after major changes
- Prioritize high-impact, low-effort improvements
- Address accessibility issues first
- Monitor brand consistency metrics

## Security & Permissions

- **Access:** Admin role required
- **Operations:** All design operations are user-scoped
- **History:** Full version history maintained
- **Publishing:** Separate draft and published states

## Future Enhancements

1. **Real AI Integration**
   - Connect to OpenAI/Anthropic API
   - Implement streaming responses
   - Add image generation

2. **A/B Testing**
   - Create design variants
   - Track performance metrics
   - Auto-optimize based on data

3. **Collaboration**
   - Multi-user editing
   - Comments and annotations
   - Approval workflows

4. **Export/Import**
   - Export designs as JSON
   - Import from other sites
   - Template marketplace

5. **Visual Editor**
   - Drag-and-drop interface
   - Live preview
   - WYSIWYG editing

## Troubleshooting

### Design Not Saving
- Check Firebase permissions
- Verify user authentication
- Check browser console for errors

### AI Responses Not Working
- Currently using mock responses
- Implement real AI API integration
- Check API keys and quotas

### Templates Not Loading
- Verify Firebase collections exist
- Check Firestore rules
- Seed default templates if needed

### UX Review Failing
- Ensure design exists
- Check for valid design content
- Verify review API integration

## Support

For issues or questions:
1. Check the browser console for errors
2. Review Firebase logs
3. Verify all dependencies are installed
4. Check that Firebase collections are initialized

## Dependencies

- React 19
- Next.js 16
- Firebase/Firestore
- shadcn/ui components
- Lucide React icons
- Sonner (toast notifications)

## License

Part of the SVP Platform - Internal Use Only
