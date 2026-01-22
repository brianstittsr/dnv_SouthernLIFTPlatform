/**
 * Comprehensive Page Registry
 * Maps all actual pages in the SVP platform with accurate metadata
 */

export interface PageSection {
  id: string;
  name: string;
  type: string;
  order: number;
  isEditable: boolean;
}

export interface PageRegistryEntry {
  id: string;
  path: string;
  name: string;
  category: 'marketing' | 'portal' | 'admin';
  description: string;
  sections: PageSection[];
  isDynamic?: boolean;
  dynamicParam?: string;
}

// ============================================================================
// Marketing Pages (Public)
// ============================================================================

const MARKETING_PAGES: PageRegistryEntry[] = [
  {
    id: "home",
    path: "/",
    name: "Home",
    category: "marketing",
    description: "Main landing page showcasing SVP platform",
    sections: [
      { id: "hero", name: "Hero Section", type: "hero", order: 1, isEditable: true },
      { id: "features", name: "Key Features", type: "features", order: 2, isEditable: true },
      { id: "how-it-works", name: "How It Works", type: "content", order: 3, isEditable: true },
      { id: "testimonials", name: "Success Stories", type: "testimonials", order: 4, isEditable: true },
      { id: "stats", name: "Platform Statistics", type: "stats", order: 5, isEditable: true },
      { id: "cta", name: "Call to Action", type: "cta", order: 6, isEditable: true },
    ],
  },
  {
    id: "about",
    path: "/about",
    name: "About Us",
    category: "marketing",
    description: "Company information and mission",
    sections: [
      { id: "hero", name: "About Hero", type: "hero", order: 1, isEditable: true },
      { id: "mission", name: "Our Mission", type: "content", order: 2, isEditable: true },
      { id: "history", name: "Our History", type: "timeline", order: 3, isEditable: true },
      { id: "values", name: "Core Values", type: "cards", order: 4, isEditable: true },
    ],
  },
  {
    id: "team",
    path: "/team",
    name: "Team",
    category: "marketing",
    description: "Meet our team members",
    sections: [
      { id: "hero", name: "Team Hero", type: "hero", order: 1, isEditable: true },
      { id: "leadership", name: "Leadership Team", type: "team", order: 2, isEditable: true },
      { id: "advisors", name: "Advisory Board", type: "team", order: 3, isEditable: true },
    ],
  },
  {
    id: "leadership",
    path: "/leadership",
    name: "Leadership",
    category: "marketing",
    description: "Executive leadership team",
    sections: [
      { id: "hero", name: "Leadership Hero", type: "hero", order: 1, isEditable: true },
      { id: "executives", name: "Executive Team", type: "team", order: 2, isEditable: true },
      { id: "bios", name: "Leadership Bios", type: "content", order: 3, isEditable: true },
    ],
  },
  {
    id: "company",
    path: "/company",
    name: "Company",
    category: "marketing",
    description: "Company overview and information",
    sections: [
      { id: "hero", name: "Company Hero", type: "hero", order: 1, isEditable: true },
      { id: "overview", name: "Company Overview", type: "content", order: 2, isEditable: true },
      { id: "achievements", name: "Achievements", type: "cards", order: 3, isEditable: true },
    ],
  },
  {
    id: "services",
    path: "/services",
    name: "Services",
    category: "marketing",
    description: "Our service offerings",
    sections: [
      { id: "hero", name: "Services Hero", type: "hero", order: 1, isEditable: true },
      { id: "offerings", name: "Service Offerings", type: "features", order: 2, isEditable: true },
      { id: "process", name: "Our Process", type: "timeline", order: 3, isEditable: true },
      { id: "pricing", name: "Pricing", type: "pricing", order: 4, isEditable: true },
      { id: "cta", name: "Get Started", type: "cta", order: 5, isEditable: true },
    ],
  },
  {
    id: "products",
    path: "/products",
    name: "Products",
    category: "marketing",
    description: "Product catalog and offerings",
    sections: [
      { id: "hero", name: "Products Hero", type: "hero", order: 1, isEditable: true },
      { id: "catalog", name: "Product Catalog", type: "cards", order: 2, isEditable: true },
      { id: "features", name: "Product Features", type: "features", order: 3, isEditable: true },
      { id: "cta", name: "Purchase CTA", type: "cta", order: 4, isEditable: true },
    ],
  },
  {
    id: "partners",
    path: "/partners",
    name: "Partners",
    category: "marketing",
    description: "Our partner network",
    sections: [
      { id: "hero", name: "Partners Hero", type: "hero", order: 1, isEditable: true },
      { id: "partner-grid", name: "Partner Logos", type: "logos", order: 2, isEditable: true },
      { id: "benefits", name: "Partnership Benefits", type: "features", order: 3, isEditable: true },
      { id: "cta", name: "Become a Partner", type: "cta", order: 4, isEditable: true },
    ],
  },
  {
    id: "affiliates",
    path: "/affiliates",
    name: "Affiliates",
    category: "marketing",
    description: "Affiliate program information",
    sections: [
      { id: "hero", name: "Affiliates Hero", type: "hero", order: 1, isEditable: true },
      { id: "program", name: "Program Details", type: "content", order: 2, isEditable: true },
      { id: "benefits", name: "Affiliate Benefits", type: "features", order: 3, isEditable: true },
      { id: "cta", name: "Join Program", type: "cta", order: 4, isEditable: true },
    ],
  },
  {
    id: "membership",
    path: "/membership",
    name: "Membership",
    category: "marketing",
    description: "Membership tiers and benefits",
    sections: [
      { id: "hero", name: "Membership Hero", type: "hero", order: 1, isEditable: true },
      { id: "tiers", name: "Membership Tiers", type: "pricing", order: 2, isEditable: true },
      { id: "benefits", name: "Member Benefits", type: "features", order: 3, isEditable: true },
      { id: "testimonials", name: "Member Testimonials", type: "testimonials", order: 4, isEditable: true },
      { id: "cta", name: "Join Now", type: "cta", order: 5, isEditable: true },
    ],
  },
  {
    id: "events",
    path: "/events",
    name: "Events",
    category: "marketing",
    description: "Upcoming and past events",
    sections: [
      { id: "hero", name: "Events Hero", type: "hero", order: 1, isEditable: true },
      { id: "upcoming", name: "Upcoming Events", type: "cards", order: 2, isEditable: true },
      { id: "past", name: "Past Events", type: "cards", order: 3, isEditable: true },
      { id: "cta", name: "Register CTA", type: "cta", order: 4, isEditable: true },
    ],
  },
  {
    id: "news",
    path: "/news",
    name: "News",
    category: "marketing",
    description: "Latest news and updates",
    sections: [
      { id: "hero", name: "News Hero", type: "hero", order: 1, isEditable: true },
      { id: "featured", name: "Featured News", type: "cards", order: 2, isEditable: true },
      { id: "archive", name: "News Archive", type: "list", order: 3, isEditable: true },
    ],
  },
  {
    id: "newsletter",
    path: "/newsletter",
    name: "Newsletter",
    category: "marketing",
    description: "Newsletter archive and signup",
    sections: [
      { id: "hero", name: "Newsletter Hero", type: "hero", order: 1, isEditable: true },
      { id: "latest", name: "Latest Issues", type: "cards", order: 2, isEditable: true },
      { id: "signup", name: "Subscribe Form", type: "form", order: 3, isEditable: true },
    ],
  },
  {
    id: "press-releases",
    path: "/press-releases",
    name: "Press Releases",
    category: "marketing",
    description: "Official press releases",
    sections: [
      { id: "hero", name: "Press Hero", type: "hero", order: 1, isEditable: true },
      { id: "releases", name: "Press Releases", type: "list", order: 2, isEditable: true },
    ],
  },
  {
    id: "media",
    path: "/media",
    name: "Media",
    category: "marketing",
    description: "Media resources and press kit",
    sections: [
      { id: "hero", name: "Media Hero", type: "hero", order: 1, isEditable: true },
      { id: "press-kit", name: "Press Kit", type: "content", order: 2, isEditable: true },
      { id: "media-coverage", name: "Media Coverage", type: "cards", order: 3, isEditable: true },
    ],
  },
  {
    id: "what-works",
    path: "/what-works",
    name: "What Works",
    category: "marketing",
    description: "Success stories and case studies",
    sections: [
      { id: "hero", name: "What Works Hero", type: "hero", order: 1, isEditable: true },
      { id: "stories", name: "Success Stories", type: "cards", order: 2, isEditable: true },
      { id: "impact", name: "Impact Metrics", type: "stats", order: 3, isEditable: true },
    ],
  },
  {
    id: "opportunities",
    path: "/opportunities",
    name: "Opportunities",
    category: "marketing",
    description: "Business opportunities and contracts",
    sections: [
      { id: "hero", name: "Opportunities Hero", type: "hero", order: 1, isEditable: true },
      { id: "listings", name: "Opportunity Listings", type: "cards", order: 2, isEditable: true },
      { id: "how-to-apply", name: "How to Apply", type: "content", order: 3, isEditable: true },
    ],
  },
  {
    id: "jobs",
    path: "/jobs",
    name: "Careers",
    category: "marketing",
    description: "Job openings and career opportunities",
    sections: [
      { id: "hero", name: "Careers Hero", type: "hero", order: 1, isEditable: true },
      { id: "openings", name: "Open Positions", type: "cards", order: 2, isEditable: true },
      { id: "culture", name: "Company Culture", type: "content", order: 3, isEditable: true },
      { id: "benefits", name: "Benefits", type: "features", order: 4, isEditable: true },
    ],
  },
  {
    id: "our-work",
    path: "/our-work",
    name: "Our Work",
    category: "marketing",
    description: "Portfolio and case studies",
    sections: [
      { id: "hero", name: "Work Hero", type: "hero", order: 1, isEditable: true },
      { id: "portfolio", name: "Project Portfolio", type: "cards", order: 2, isEditable: true },
      { id: "case-studies", name: "Case Studies", type: "content", order: 3, isEditable: true },
    ],
  },
  {
    id: "contact",
    path: "/contact",
    name: "Contact Us",
    category: "marketing",
    description: "Contact information and form",
    sections: [
      { id: "hero", name: "Contact Hero", type: "hero", order: 1, isEditable: true },
      { id: "form", name: "Contact Form", type: "form", order: 2, isEditable: true },
      { id: "info", name: "Contact Information", type: "content", order: 3, isEditable: true },
      { id: "map", name: "Location Map", type: "map", order: 4, isEditable: true },
    ],
  },
  {
    id: "faq",
    path: "/faq",
    name: "FAQ",
    category: "marketing",
    description: "Frequently asked questions",
    sections: [
      { id: "hero", name: "FAQ Hero", type: "hero", order: 1, isEditable: true },
      { id: "questions", name: "FAQ Items", type: "faq", order: 2, isEditable: true },
      { id: "cta", name: "Still Have Questions", type: "cta", order: 3, isEditable: true },
    ],
  },
  {
    id: "accessibility",
    path: "/accessibility",
    name: "Accessibility",
    category: "marketing",
    description: "Accessibility statement and features",
    sections: [
      { id: "hero", name: "Accessibility Hero", type: "hero", order: 1, isEditable: true },
      { id: "statement", name: "Accessibility Statement", type: "content", order: 2, isEditable: true },
      { id: "features", name: "Accessibility Features", type: "features", order: 3, isEditable: true },
    ],
  },
  {
    id: "register",
    path: "/register",
    name: "Register",
    category: "marketing",
    description: "User registration page",
    sections: [
      { id: "hero", name: "Register Hero", type: "hero", order: 1, isEditable: true },
      { id: "form", name: "Registration Form", type: "form", order: 2, isEditable: true },
      { id: "benefits", name: "Member Benefits", type: "features", order: 3, isEditable: true },
    ],
  },
  // Product-specific pages
  {
    id: "antifragile",
    path: "/antifragile",
    name: "Antifragile",
    category: "marketing",
    description: "Antifragile product page",
    sections: [
      { id: "hero", name: "Product Hero", type: "hero", order: 1, isEditable: true },
      { id: "features", name: "Product Features", type: "features", order: 2, isEditable: true },
      { id: "pricing", name: "Pricing", type: "pricing", order: 3, isEditable: true },
      { id: "cta", name: "Get Started", type: "cta", order: 4, isEditable: true },
    ],
  },
  {
    id: "v-edge",
    path: "/v-edge",
    name: "V-Edge",
    category: "marketing",
    description: "V-Edge product page",
    sections: [
      { id: "hero", name: "Product Hero", type: "hero", order: 1, isEditable: true },
      { id: "features", name: "Product Features", type: "features", order: 2, isEditable: true },
      { id: "pricing", name: "Pricing", type: "pricing", order: 3, isEditable: true },
      { id: "cta", name: "Get Started", type: "cta", order: 4, isEditable: true },
    ],
  },
  {
    id: "oem",
    path: "/oem",
    name: "OEM",
    category: "marketing",
    description: "OEM solutions page",
    sections: [
      { id: "hero", name: "OEM Hero", type: "hero", order: 1, isEditable: true },
      { id: "solutions", name: "OEM Solutions", type: "features", order: 2, isEditable: true },
      { id: "partners", name: "OEM Partners", type: "logos", order: 3, isEditable: true },
      { id: "cta", name: "Partner With Us", type: "cta", order: 4, isEditable: true },
    ],
  },
  {
    id: "cmmc-training",
    path: "/cmmc-training",
    name: "CMMC Training",
    category: "marketing",
    description: "CMMC certification training cohorts for DoD contractors",
    sections: [
      { id: "hero", name: "Hero Section", type: "hero", order: 1, isEditable: true },
      { id: "program-overview", name: "CMMC Cohort Program", type: "content", order: 2, isEditable: true },
      { id: "timeline", name: "Critical Compliance Timeline", type: "timeline", order: 3, isEditable: true },
      { id: "process", name: "Turnkey Compliance Process", type: "features", order: 4, isEditable: true },
      { id: "faq", name: "FAQ Section", type: "faq", order: 5, isEditable: true },
      { id: "testimonials", name: "Testimonials", type: "testimonials", order: 6, isEditable: true },
      { id: "cta", name: "Final CTA", type: "cta", order: 7, isEditable: true },
    ],
  },
];

// ============================================================================
// Portal Pages (Authenticated)
// ============================================================================

const PORTAL_PAGES: PageRegistryEntry[] = [
  {
    id: "portal-dashboard",
    path: "/portal",
    name: "Portal Dashboard",
    category: "portal",
    description: "Main portal dashboard",
    sections: [
      { id: "overview", name: "Dashboard Overview", type: "dashboard", order: 1, isEditable: false },
      { id: "quick-actions", name: "Quick Actions", type: "cards", order: 2, isEditable: true },
      { id: "recent-activity", name: "Recent Activity", type: "list", order: 3, isEditable: false },
    ],
  },
  {
    id: "portal-profile",
    path: "/portal/profile",
    name: "User Profile",
    category: "portal",
    description: "User profile management",
    sections: [
      { id: "basic-info", name: "Basic Information", type: "form", order: 1, isEditable: false },
      { id: "settings", name: "Account Settings", type: "form", order: 2, isEditable: false },
    ],
  },
  {
    id: "portal-affiliates",
    path: "/portal/affiliates",
    name: "Affiliate Portal",
    category: "portal",
    description: "Affiliate management dashboard",
    sections: [
      { id: "stats", name: "Affiliate Statistics", type: "stats", order: 1, isEditable: false },
      { id: "links", name: "Affiliate Links", type: "list", order: 2, isEditable: false },
    ],
  },
];

// ============================================================================
// Admin Pages
// ============================================================================

const ADMIN_PAGES: PageRegistryEntry[] = [
  {
    id: "admin-page-designer",
    path: "/portal/admin/page-designer",
    name: "Page Designer",
    category: "admin",
    description: "AI-powered page design tool",
    sections: [
      { id: "design", name: "Design Configuration", type: "form", order: 1, isEditable: false },
    ],
  },
  {
    id: "admin-images",
    path: "/portal/admin/images",
    name: "Image Manager",
    category: "admin",
    description: "Image library management",
    sections: [
      { id: "gallery", name: "Image Gallery", type: "gallery", order: 1, isEditable: false },
    ],
  },
  {
    id: "admin-content-migration",
    path: "/portal/admin/content-migration",
    name: "Content Migration",
    category: "admin",
    description: "Content migration tools",
    sections: [
      { id: "migration", name: "Migration Dashboard", type: "dashboard", order: 1, isEditable: false },
    ],
  },
];

// ============================================================================
// Complete Page Registry
// ============================================================================

export const PAGE_REGISTRY: PageRegistryEntry[] = [
  ...MARKETING_PAGES,
  ...PORTAL_PAGES,
  ...ADMIN_PAGES,
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getPageByPath(path: string): PageRegistryEntry | undefined {
  return PAGE_REGISTRY.find(page => page.path === path);
}

export function getPageById(id: string): PageRegistryEntry | undefined {
  return PAGE_REGISTRY.find(page => page.id === id);
}

export function getPagesByCategory(category: 'marketing' | 'portal' | 'admin'): PageRegistryEntry[] {
  return PAGE_REGISTRY.filter(page => page.category === category);
}

export function getEditablePages(): PageRegistryEntry[] {
  return PAGE_REGISTRY.filter(page => 
    page.sections.some(section => section.isEditable)
  );
}

export function getMarketingPages(): PageRegistryEntry[] {
  return MARKETING_PAGES;
}

export function getPortalPages(): PageRegistryEntry[] {
  return PORTAL_PAGES;
}

export function getAdminPages(): PageRegistryEntry[] {
  return ADMIN_PAGES;
}

// Export for backward compatibility
export const PUBLIC_PAGES = MARKETING_PAGES;
