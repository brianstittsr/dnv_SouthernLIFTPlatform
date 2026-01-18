/**
 * Firebase Page Designer Utility Library
 * Handles all Firestore operations for the Page Designer feature
 */

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from "firebase/firestore";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export type SectionType =
  | "hero"
  | "features"
  | "testimonials"
  | "cta"
  | "pricing"
  | "team"
  | "faq"
  | "contact"
  | "gallery"
  | "stats"
  | "content"
  | "cards"
  | "timeline"
  | "comparison"
  | "video"
  | "newsletter"
  | "footer";

export interface PageSection {
  id: string;
  name: string;
  type: SectionType;
  order: number;
  isEditable: boolean;
}

export interface PublicPage {
  id: string;
  path: string;
  name: string;
  description: string;
  sections: PageSection[];
}

export interface SectionDesign {
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

export interface DesignContent {
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

export interface PageDesign {
  id?: string;
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

export interface DesignHistory {
  id?: string;
  designId: string;
  pageId: string;
  content: DesignContent;
  version: number;
  changeDescription?: string;
  createdBy: string;
  createdAt: Date;
}

export interface LayoutTemplate {
  id?: string;
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

export interface AIConversation {
  id?: string;
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

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  appliedChanges?: boolean;
}

export interface UXReview {
  id?: string;
  pageId: string;
  designId: string;
  overallScore: number;
  categories: {
    visualHierarchy: CategoryScore;
    contentClarity: CategoryScore;
    brandConsistency: CategoryScore;
    conversionOptimization: CategoryScore;
    mobileExperience: CategoryScore;
    accessibility: CategoryScore;
  };
  recommendations: Recommendation[];
  accessibilityIssues: AccessibilityIssue[];
  brandMetrics: BrandMetrics;
  createdBy: string;
  createdAt: Date;
}

export interface CategoryScore {
  score: number;
  feedback: string;
  improvements: string[];
}

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  issue: string;
  suggestion: string;
  impact: string;
  effort: "low" | "medium" | "high";
}

export interface AccessibilityIssue {
  id: string;
  severity: "critical" | "serious" | "moderate" | "minor";
  wcagLevel: "A" | "AA" | "AAA";
  issue: string;
  location: string;
  fix: string;
}

export interface BrandMetrics {
  colorConsistency: number;
  toneConsistency: number;
  messagingAlignment: number;
  visualIdentity: number;
}

// ============================================================================
// SVP Platform Public Pages Configuration
// ============================================================================

export const PUBLIC_PAGES: PublicPage[] = [
  {
    id: "home",
    path: "/",
    name: "Home",
    description: "Main SVP platform landing page",
    sections: [
      { id: "hero", name: "Hero Section", type: "hero", order: 1, isEditable: true },
      { id: "features", name: "Platform Features", type: "features", order: 2, isEditable: true },
      { id: "how-it-works", name: "How It Works", type: "content", order: 3, isEditable: true },
      { id: "testimonials", name: "Success Stories", type: "testimonials", order: 4, isEditable: true },
      { id: "stats", name: "Platform Stats", type: "stats", order: 5, isEditable: true },
      { id: "cta", name: "Get Started CTA", type: "cta", order: 6, isEditable: true },
    ],
  },
  {
    id: "about",
    path: "/about",
    name: "About",
    description: "About SVP and CMMC compliance",
    sections: [
      { id: "hero", name: "About Hero", type: "hero", order: 1, isEditable: true },
      { id: "mission", name: "Our Mission", type: "content", order: 2, isEditable: true },
      { id: "team", name: "Our Team", type: "team", order: 3, isEditable: true },
      { id: "values", name: "Our Values", type: "cards", order: 4, isEditable: true },
    ],
  },
  {
    id: "sme-services",
    path: "/sme-services",
    name: "SME Services",
    description: "Services for SME users",
    sections: [
      { id: "hero", name: "SME Hero", type: "hero", order: 1, isEditable: true },
      { id: "proof-packs", name: "Proof Pack Management", type: "features", order: 2, isEditable: true },
      { id: "pricing", name: "Subscription Tiers", type: "pricing", order: 3, isEditable: true },
      { id: "benefits", name: "SME Benefits", type: "cards", order: 4, isEditable: true },
      { id: "cta", name: "Sign Up CTA", type: "cta", order: 5, isEditable: true },
    ],
  },
  {
    id: "partner-services",
    path: "/partner-services",
    name: "Partner Services",
    description: "Services for consortium partners",
    sections: [
      { id: "hero", name: "Partner Hero", type: "hero", order: 1, isEditable: true },
      { id: "features", name: "Partner Features", type: "features", order: 2, isEditable: true },
      { id: "revenue", name: "Revenue Sharing", type: "content", order: 3, isEditable: true },
      { id: "testimonials", name: "Partner Success", type: "testimonials", order: 4, isEditable: true },
      { id: "cta", name: "Become a Partner", type: "cta", order: 5, isEditable: true },
    ],
  },
  {
    id: "buyer-directory",
    path: "/buyer-directory",
    name: "Buyer Directory",
    description: "Browse verified SMEs",
    sections: [
      { id: "hero", name: "Directory Hero", type: "hero", order: 1, isEditable: true },
      { id: "search", name: "Search & Filter", type: "content", order: 2, isEditable: true },
      { id: "featured", name: "Featured SMEs", type: "cards", order: 3, isEditable: true },
      { id: "how-to", name: "How to Use", type: "content", order: 4, isEditable: true },
    ],
  },
  {
    id: "cmmc-training",
    path: "/cmmc-training",
    name: "CMMC Training",
    description: "12-week CMMC certification cohorts",
    sections: [
      { id: "hero", name: "Training Hero", type: "hero", order: 1, isEditable: true },
      { id: "curriculum", name: "Curriculum Overview", type: "timeline", order: 2, isEditable: true },
      { id: "instructors", name: "Our Instructors", type: "team", order: 3, isEditable: true },
      { id: "pricing", name: "Cohort Pricing", type: "pricing", order: 4, isEditable: true },
      { id: "faq", name: "Training FAQ", type: "faq", order: 5, isEditable: true },
      { id: "cta", name: "Enroll Now", type: "cta", order: 6, isEditable: true },
    ],
  },
  {
    id: "contact",
    path: "/contact",
    name: "Contact",
    description: "Get in touch with us",
    sections: [
      { id: "hero", name: "Contact Hero", type: "hero", order: 1, isEditable: true },
      { id: "form", name: "Contact Form", type: "contact", order: 2, isEditable: true },
      { id: "info", name: "Contact Info", type: "content", order: 3, isEditable: true },
    ],
  },
];

// ============================================================================
// Page Goals for SVP Platform
// ============================================================================

export const PAGE_GOALS = [
  { id: "lead-gen", label: "Generate Leads", description: "Capture potential SME/Partner contacts", icon: "UserPlus" },
  { id: "sales", label: "Drive Sales", description: "Convert to paid subscriptions", icon: "DollarSign" },
  { id: "educate", label: "Educate", description: "Inform about CMMC compliance", icon: "GraduationCap" },
  { id: "brand", label: "Build Brand", description: "Establish trust and authority", icon: "Award" },
  { id: "recruit", label: "Recruit Partners", description: "Grow consortium network", icon: "Handshake" },
  { id: "engage", label: "Engage Users", description: "Increase platform usage", icon: "Activity" },
];

// ============================================================================
// Target Audience Options
// ============================================================================

export const AUDIENCE_OPTIONS = [
  { id: "sme-owners", label: "SME Owners", description: "Small business owners needing CMMC compliance" },
  { id: "partners", label: "Consortium Partners", description: "Service providers joining the network" },
  { id: "buyers", label: "Government Buyers", description: "Procurement officers seeking verified SMEs" },
  { id: "instructors", label: "CMMC Instructors", description: "Certified trainers offering cohorts" },
  { id: "qa-reviewers", label: "QA Reviewers", description: "Quality assurance professionals" },
  { id: "platform-admins", label: "Platform Admins", description: "System administrators" },
];

// ============================================================================
// Style Options
// ============================================================================

export const STYLE_OPTIONS = {
  tone: [
    { id: "professional", label: "Professional", description: "Formal, trustworthy, authoritative" },
    { id: "friendly", label: "Friendly", description: "Approachable, warm, conversational" },
    { id: "bold", label: "Bold", description: "Confident, direct, impactful" },
    { id: "inspiring", label: "Inspiring", description: "Motivational, uplifting, aspirational" },
  ],
  colorScheme: [
    { id: "blue-slate", label: "Blue & Slate", description: "Professional trust (Primary: Blue, Secondary: Slate)" },
    { id: "green-gray", label: "Green & Gray", description: "Growth and stability (Primary: Green, Secondary: Gray)" },
    { id: "purple-indigo", label: "Purple & Indigo", description: "Innovation and expertise (Primary: Purple, Secondary: Indigo)" },
    { id: "red-charcoal", label: "Red & Charcoal", description: "Bold and authoritative (Primary: Red, Secondary: Charcoal)" },
  ],
  layout: [
    { id: "modern", label: "Modern", description: "Clean lines, ample whitespace, contemporary" },
    { id: "classic", label: "Classic", description: "Traditional, structured, timeless" },
    { id: "dynamic", label: "Dynamic", description: "Energetic, asymmetric, engaging" },
    { id: "minimal", label: "Minimal", description: "Simple, focused, uncluttered" },
  ],
};

// ============================================================================
// Firestore Collection Names
// ============================================================================

const COLLECTIONS = {
  DESIGNS: "page_designs",
  HISTORY: "page_design_history",
  TEMPLATES: "page_layout_templates",
  CONVERSATIONS: "page_ai_conversations",
  REVIEWS: "page_ux_reviews",
};

// ============================================================================
// CRUD Operations
// ============================================================================

// Page Designs
export async function getPageDesign(pageId: string): Promise<PageDesign | null> {
  if (!db) return null;
  
  try {
    const q = query(
      collection(db, COLLECTIONS.DESIGNS),
      where("pageId", "==", pageId),
      where("status", "!=", "archived"),
      orderBy("status"),
      orderBy("updatedAt", "desc"),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      publishedAt: doc.data().publishedAt?.toDate(),
    } as PageDesign;
  } catch (error) {
    console.error("Error getting page design:", error);
    return null;
  }
}

export async function savePageDesign(design: Omit<PageDesign, "id">): Promise<string | null> {
  if (!db) return null;
  
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.DESIGNS), {
      ...design,
      createdAt: Timestamp.fromDate(design.createdAt),
      updatedAt: Timestamp.fromDate(design.updatedAt),
      publishedAt: design.publishedAt ? Timestamp.fromDate(design.publishedAt) : null,
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving page design:", error);
    return null;
  }
}

export async function updatePageDesign(id: string, updates: Partial<PageDesign>): Promise<boolean> {
  if (!db) return false;
  
  try {
    const docRef = doc(db, COLLECTIONS.DESIGNS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    
    return true;
  } catch (error) {
    console.error("Error updating page design:", error);
    return false;
  }
}

// Design History
export async function saveDesignHistory(history: Omit<DesignHistory, "id">): Promise<string | null> {
  if (!db) return null;
  
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.HISTORY), {
      ...history,
      createdAt: Timestamp.fromDate(history.createdAt),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving design history:", error);
    return null;
  }
}

export async function getDesignHistory(designId: string): Promise<DesignHistory[]> {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, COLLECTIONS.HISTORY),
      where("designId", "==", designId),
      orderBy("version", "desc"),
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as DesignHistory[];
  } catch (error) {
    console.error("Error getting design history:", error);
    return [];
  }
}

// Layout Templates
export async function getTemplates(sectionType?: SectionType): Promise<LayoutTemplate[]> {
  if (!db) return [];
  
  try {
    let q;
    if (sectionType) {
      q = query(
        collection(db, COLLECTIONS.TEMPLATES),
        where("sectionType", "==", sectionType),
        orderBy("popularity", "desc")
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.TEMPLATES),
        orderBy("popularity", "desc")
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as LayoutTemplate[];
  } catch (error) {
    console.error("Error getting templates:", error);
    return [];
  }
}

// AI Conversations
export async function saveConversation(conversation: Omit<AIConversation, "id">): Promise<string | null> {
  if (!db) return null;
  
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CONVERSATIONS), {
      ...conversation,
      messages: conversation.messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp),
      })),
      createdAt: Timestamp.fromDate(conversation.createdAt),
      updatedAt: Timestamp.fromDate(conversation.updatedAt),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving conversation:", error);
    return null;
  }
}

export async function updateConversation(id: string, updates: Partial<AIConversation>): Promise<boolean> {
  if (!db) return false;
  
  try {
    const docRef = doc(db, COLLECTIONS.CONVERSATIONS, id);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    if (updates.messages) {
      updateData.messages = updates.messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp),
      }));
    }
    
    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error("Error updating conversation:", error);
    return false;
  }
}

// UX Reviews
export async function saveUXReview(review: Omit<UXReview, "id">): Promise<string | null> {
  if (!db) return null;
  
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
      ...review,
      createdAt: Timestamp.fromDate(review.createdAt),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error saving UX review:", error);
    return null;
  }
}

export async function getLatestUXReview(pageId: string): Promise<UXReview | null> {
  if (!db) return null;
  
  try {
    const q = query(
      collection(db, COLLECTIONS.REVIEWS),
      where("pageId", "==", pageId),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    } as UXReview;
  } catch (error) {
    console.error("Error getting UX review:", error);
    return null;
  }
}
