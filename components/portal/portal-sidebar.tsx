"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { COLLECTIONS, type PlatformSettingsDoc } from "@/lib/schema";
import { useUserProfile } from "@/contexts/user-profile-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Factory,
  LayoutDashboard,
  Target,
  FolderKanban,
  Users,
  Building,
  FileText,
  Calendar,
  CalendarDays,
  CheckSquare,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Handshake,
  DollarSign,
  User,
  ImageIcon,
  Shield,
  Rocket,
  Battery,
  UserCog,
  Building2,
  Search,
  Linkedin,
  FileSignature,
  Bot,
  Plug,
  Bug,
  Heart,
  Phone,
  CalendarClock,
  Eye,
  EyeOff,
  UserCheck,
  Mail,
  Package,
  ClipboardCheck,
  Wand2,
  Share2,
  UserPlus,
  TrendingUp,
  GraduationCap,
  Award,
  BarChart3,
  Briefcase,
  AlertTriangle,
  Activity,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const mainNavItems = [
  {
    title: "Command Center",
    href: "/portal/command-center",
    icon: LayoutDashboard,
  },
  {
    title: "Pursuit Board",
    href: "/portal/pursuits",
    icon: Target,
    badge: "KDM",
  },
  {
    title: "Opportunities",
    href: "/portal/opportunities",
    icon: Target,
    badge: "5",
  },
  {
    title: "Projects",
    href: "/portal/projects",
    icon: FolderKanban,
    badge: "3",
  },
  {
    title: "Member Directory",
    href: "/portal/members",
    icon: Users,
    badge: "KDM",
  },
  {
    title: "Affiliates",
    href: "/portal/affiliates",
    icon: Users,
  },
  {
    title: "Customers",
    href: "/portal/customers",
    icon: Building,
  },
];

const workItems = [
  {
    title: "Resource Library",
    href: "/portal/resources",
    icon: FileText,
    badge: "KDM",
  },
  {
    title: "My Membership",
    href: "/portal/membership",
    icon: UserCheck,
    badge: "KDM",
  },
  {
    title: "Apollo Search",
    href: "/portal/apollo-search",
    icon: Search,
    badge: "AI",
  },
  {
    title: "Supplier Search",
    href: "/portal/supplier-search",
    icon: Factory,
    badge: "AI",
  },
  {
    title: "Documents",
    href: "/portal/documents",
    icon: FileText,
  },
  {
    title: "Calendar",
    href: "/portal/calendar",
    icon: Calendar,
  },
  {
    title: "Availability",
    href: "/portal/availability",
    icon: CalendarDays,
  },
  {
    title: "Meetings",
    href: "/portal/meetings",
    icon: Users,
  },
  {
    title: "Rocks",
    href: "/portal/rocks",
    icon: CheckSquare,
  },
  {
    title: "Networking",
    href: "/portal/networking",
    icon: Handshake,
  },
  {
    title: "Deals",
    href: "/portal/deals",
    icon: DollarSign,
  },
  {
    title: "LinkedIn Content",
    href: "/portal/linkedin-content",
    icon: Linkedin,
    badge: "AI",
  },
  {
    title: "EOS2 Dashboard",
    href: "/portal/eos2",
    icon: Target,
    badge: "EOS",
  },
  {
    title: "AI Workforce",
    href: "/portal/ai-workforce",
    icon: Bot,
    badge: "AI",
  },
  {
    title: "Proposal Creator",
    href: "/portal/proposals",
    icon: FileText,
    badge: "AI",
  },
  {
    title: "GoHighLevel",
    href: "/portal/gohighlevel",
    icon: Plug,
    badge: "CRM",
  },
  {
    title: "Bug Tracker",
    href: "/portal/bug-tracker",
    icon: Bug,
  },
  {
    title: "SVP Tools",
    href: "/portal/svp-tools",
    icon: Sparkles,
    badge: "AI",
  },
];

const adminItems = [
  {
    title: "KDM Dashboard",
    href: "/portal/admin/kdm-dashboard",
    icon: LayoutDashboard,
    badge: "KDM",
  },
  {
    title: "Financial Dashboard",
    href: "/portal/admin/payments",
    icon: DollarSign,
    badge: "New",
  },
  {
    title: "Memberships",
    href: "/portal/admin/memberships",
    icon: Users,
    badge: "KDM",
  },
  {
    title: "Settlements",
    href: "/portal/admin/settlements",
    icon: DollarSign,
    badge: "KDM",
  },
  {
    title: "Team Members",
    href: "/portal/admin/team-members",
    icon: UserCog,
  },
  {
    title: "Strategic Partners",
    href: "/portal/admin/strategic-partners",
    icon: Building2,
  },
  {
    title: "Hero Management",
    href: "/portal/admin/hero",
    icon: ImageIcon,
  },
  {
    title: "Contact Popup",
    href: "/portal/admin/popup",
    icon: MessageSquare,
  },
  {
    title: "Page Designer",
    href: "/portal/admin/page-designer",
    icon: Wand2,
    badge: "AI",
  },
  {
    title: "Events",
    href: "/portal/admin/events",
    icon: CalendarClock,
  },
  {
    title: "Event Manager",
    href: "/portal/admin/event-manager",
    icon: CalendarClock,
    badge: "New",
  },
  {
    title: "MailChimp",
    href: "/portal/admin/mailchimp",
    icon: Mail,
    badge: "Email",
  },
];

const initiativeItems = [
  {
    title: "Initiatives",
    href: "/portal/admin/initiatives",
    icon: Rocket,
  },
  {
    title: "TBMNC Suppliers",
    href: "/portal/admin/initiatives/tbmnc",
    icon: Battery,
  },
];

// ============================================
// SVP PLATFORM NAVIGATION ITEMS
// ============================================

// SME User Navigation
const svpSmeItems = [
  {
    title: "SME Dashboard",
    href: "/portal/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Proof Packs",
    href: "/portal/proof-packs",
    icon: Package,
    badge: "SVP",
  },
  {
    title: "My Profile",
    href: "/portal/sme/profile",
    icon: User,
  },
  {
    title: "Subscription",
    href: "/portal/sme/subscription",
    icon: CreditCard,
  },
  {
    title: "My Introductions",
    href: "/portal/sme/introductions",
    icon: Handshake,
  },
  {
    title: "My Cohorts",
    href: "/portal/sme/cohorts",
    icon: GraduationCap,
  },
  {
    title: "Certificates",
    href: "/portal/sme/certificates",
    icon: Award,
  },
];

// Partner User Navigation
const svpPartnerItems = [
  {
    title: "Partner Dashboard",
    href: "/portal/partner/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Lead Management",
    href: "/portal/partner/leads",
    icon: UserPlus,
    badge: "SVP",
  },
  {
    title: "Introductions",
    href: "/portal/partner/introductions",
    icon: Handshake,
  },
  {
    title: "Revenue Dashboard",
    href: "/portal/partner/revenue",
    icon: DollarSign,
  },
  {
    title: "Service Overlaps",
    href: "/portal/partner/overlaps",
    icon: AlertTriangle,
  },
  {
    title: "My SME Clients",
    href: "/portal/partner/clients",
    icon: Building2,
  },
  {
    title: "Conversion Tracking",
    href: "/portal/partner/conversions",
    icon: TrendingUp,
  },
];

// Buyer Navigation
const svpBuyerItems = [
  {
    title: "Buyer Dashboard",
    href: "/portal/buyer/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "SME Directory",
    href: "/portal/buyer/directory",
    icon: Search,
    badge: "SVP",
  },
  {
    title: "My Introductions",
    href: "/portal/buyer/introductions",
    icon: Handshake,
  },
  {
    title: "Saved SMEs",
    href: "/portal/buyer/favorites",
    icon: Heart,
  },
  {
    title: "Shared Proof Packs",
    href: "/portal/buyer/shared-packs",
    icon: Share2,
  },
];

// QA Reviewer Navigation
const svpQaItems = [
  {
    title: "QA Dashboard",
    href: "/portal/qa/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Review Queue",
    href: "/portal/qa/queue",
    icon: ClipboardCheck,
    badge: "SVP",
  },
  {
    title: "My Reviews",
    href: "/portal/qa/my-reviews",
    icon: CheckSquare,
  },
  {
    title: "Review History",
    href: "/portal/qa/history",
    icon: FileText,
  },
];

// CMMC Instructor Navigation
const svpInstructorItems = [
  {
    title: "Instructor Dashboard",
    href: "/portal/instructor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Cohorts",
    href: "/portal/instructor/cohorts",
    icon: GraduationCap,
    badge: "CMMC",
  },
  {
    title: "Create Cohort",
    href: "/portal/instructor/cohorts/new",
    icon: UserPlus,
  },
  {
    title: "Assessments",
    href: "/portal/instructor/assessments",
    icon: ClipboardCheck,
  },
  {
    title: "Certificates",
    href: "/portal/instructor/certificates",
    icon: Award,
  },
];

// SVP Admin Navigation
const svpAdminItems = [
  {
    title: "SVP Admin Dashboard",
    href: "/portal/admin/svp-dashboard",
    icon: LayoutDashboard,
    badge: "SVP",
  },
  {
    title: "User Management",
    href: "/portal/admin/users",
    icon: Users,
  },
  {
    title: "All Proof Packs",
    href: "/portal/admin/proof-packs",
    icon: Package,
  },
  {
    title: "QA Management",
    href: "/portal/admin/qa",
    icon: ClipboardCheck,
  },
  {
    title: "Lead Routing Rules",
    href: "/portal/admin/routing-rules",
    icon: Target,
  },
  {
    title: "Revenue Config",
    href: "/portal/admin/revenue-config",
    icon: DollarSign,
  },
  {
    title: "Settlements",
    href: "/portal/admin/svp-settlements",
    icon: CreditCard,
  },
  {
    title: "All Cohorts",
    href: "/portal/admin/cohorts",
    icon: GraduationCap,
  },
  {
    title: "System Health",
    href: "/portal/admin/system-health",
    icon: Activity,
  },
  {
    title: "Audit Logs",
    href: "/portal/admin/audit-logs",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/portal/admin/analytics",
    icon: BarChart3,
  },
];

const aiItems = [
  {
    title: "Ask IntellEDGE",
    href: "/portal/ask",
    icon: Sparkles,
  },
];

// All available roles for the role switcher
const AVAILABLE_ROLES = [
  // Platform roles
  { value: "admin", label: "Admin" },
  { value: "team_member", label: "Team Member" },
  { value: "affiliate", label: "Affiliate" },
  { value: "client", label: "Client" },
  { value: "viewer", label: "Viewer" },
  // SVP Platform roles
  { value: "platform_admin", label: "SVP Platform Admin" },
  { value: "sme_user", label: "SVP SME User" },
  { value: "partner_user", label: "SVP Partner User" },
  { value: "buyer", label: "SVP Buyer" },
  { value: "qa_reviewer", label: "SVP QA Reviewer" },
  { value: "cmmc_instructor", label: "SVP CMMC Instructor" },
];

// Define which sections are visible for each SVP role
const SVP_ROLE_SECTIONS: Record<string, string[]> = {
  // Regular admin sees all SVP sections
  admin: ["svpSme", "svpPartner", "svpBuyer", "svpQa", "svpInstructor", "svpAdmin"],
  // SVP Platform Admin sees all sections
  platform_admin: ["svpSme", "svpPartner", "svpBuyer", "svpQa", "svpInstructor", "svpAdmin"],
  sme_user: ["svpSme"],
  partner_user: ["svpPartner"],
  buyer: ["svpBuyer"],
  qa_reviewer: ["svpQa"],
  cmmc_instructor: ["svpInstructor", "svpSme"],
};

// Export all nav items for use in settings
export const ALL_NAV_ITEMS = [
  ...mainNavItems.map(item => ({ ...item, section: "Navigation" })),
  ...workItems.map(item => ({ ...item, section: "Work" })),
  ...aiItems.map(item => ({ ...item, section: "Intelligence" })),
  ...adminItems.map(item => ({ ...item, section: "Admin" })),
  ...initiativeItems.map(item => ({ ...item, section: "Initiatives" })),
  // SVP Platform items
  ...svpSmeItems.map(item => ({ ...item, section: "SVP - SME" })),
  ...svpPartnerItems.map(item => ({ ...item, section: "SVP - Partner" })),
  ...svpBuyerItems.map(item => ({ ...item, section: "SVP - Buyer" })),
  ...svpQaItems.map(item => ({ ...item, section: "SVP - QA" })),
  ...svpInstructorItems.map(item => ({ ...item, section: "SVP - Instructor" })),
  ...svpAdminItems.map(item => ({ ...item, section: "SVP - Admin" })),
];

export function PortalSidebar() {
  const pathname = usePathname();
  const { getDisplayName, getInitials, profile } = useUserProfile();
  const [bookCallLeadsCount, setBookCallLeadsCount] = useState(0);
  const [hiddenNavItems, setHiddenNavItems] = useState<string[]>([]);
  const [roleVisibility, setRoleVisibility] = useState<Record<string, string[]>>({});
  const [previewRole, setPreviewRole] = useState<string | null>(null);
  const isAdmin = profile.role === "admin" || profile.svpRole === "platform_admin";
  
  // The effective role for filtering (either preview role or actual svpRole)
  const effectiveRole = previewRole || profile.svpRole || profile.role;
  
  // Check if a SVP section should be visible based on role
  const isSvpSectionVisible = (sectionKey: string) => {
    // Admins see all sections
    if (isAdmin && !previewRole) return true;
    
    // Check SVP role sections
    const visibleSections = SVP_ROLE_SECTIONS[effectiveRole] || [];
    return visibleSections.includes(sectionKey);
  };

  // Subscribe to BookCallLeads count (new leads only)
  // Only subscribe if user is admin to avoid permission errors that can corrupt Firestore state
  useEffect(() => {
    if (!db || !isAdmin) return;
    
    let unsubscribe: (() => void) | undefined;
    
    try {
      const q = query(
        collection(db, COLLECTIONS.BOOK_CALL_LEADS),
        where("status", "==", "new")
      );
      
      unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          setBookCallLeadsCount(snapshot.size);
        },
        (error) => {
          // Silently handle permission errors - user may not have access to this collection
          console.warn("BookCallLeads snapshot error (may be permission-related):", error.code);
          // Don't let this error propagate - just set count to 0
          setBookCallLeadsCount(0);
        }
      );
    } catch (error) {
      console.warn("Failed to set up BookCallLeads listener:", error);
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAdmin]);
  
  // Load navigation settings from Firebase
  useEffect(() => {
    const loadNavSettings = async () => {
      if (!db) return;
      try {
        const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as PlatformSettingsDoc;
          if (data.navigationSettings?.hiddenItems) {
            setHiddenNavItems(data.navigationSettings.hiddenItems);
          }
          if (data.navigationSettings?.roleVisibility) {
            setRoleVisibility(data.navigationSettings.roleVisibility);
          }
        }
      } catch (error) {
        console.error("Error loading navigation settings:", error);
      }
    };
    loadNavSettings();
  }, []);
  
  // Filter nav items based on role-based visibility
  const filterNavItems = (items: typeof mainNavItems) => {
    return items.filter(item => {
      // If admin is not previewing, show all items
      if (isAdmin && !previewRole) return true;
      
      // Check role-based visibility
      const roleHiddenItems = roleVisibility[effectiveRole] || [];
      const isHiddenForRole = roleHiddenItems.includes(item.href);
      
      // Also check legacy hiddenItems for backwards compatibility
      const isGloballyHidden = hiddenNavItems.includes(item.href);
      
      return !isHiddenForRole && !isGloballyHidden;
    });
  };
  
  // Check if item should show as hidden (for admin preview)
  const isItemHidden = (href: string) => {
    const roleHiddenItems = roleVisibility[effectiveRole] || [];
    return roleHiddenItems.includes(href) || hiddenNavItems.includes(href);
  };
  
  // Collapsible state for each section
  const [openSections, setOpenSections] = useState({
    // SVP Platform sections - at top, open by default
    svpSme: true,
    svpPartner: true,
    svpBuyer: true,
    svpQa: true,
    svpInstructor: true,
    svpAdmin: true,
    // Other sections - grouped under OTHER
    other: false,
    navigation: false,
    work: false,
    intelligence: false,
    admin: false,
    initiatives: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/portal" className="flex items-center px-2 py-4">
          <NextImage
            src="/kdm-logo.png"
            alt="KDM & Associates Logo"
            width={160}
            height={40}
            priority
            style={{ width: 'auto', height: '40px' }}
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* ============================================ */}
        {/* SVP PLATFORM NAVIGATION SECTIONS - TOP PRIORITY */}
        {/* ============================================ */}

        {/* SVP - SME Section */}
        {isSvpSectionVisible("svpSme") && (
        <Collapsible open={openSections.svpSme} onOpenChange={() => toggleSection("svpSme")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span className="flex items-center gap-2">
                  <Package className="h-3 w-3 text-blue-500" />
                  SVP - SME
                </span>
                {openSections.svpSme ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterNavItems(svpSmeItems).map((item) => {
                    const hidden = isItemHidden(item.href);
                    return (
                      <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {hidden && isAdmin && !previewRole && (
                              <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                        {item.badge && !hidden && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        )}

        {/* SVP - Partner Section */}
        {isSvpSectionVisible("svpPartner") && (
        <Collapsible open={openSections.svpPartner} onOpenChange={() => toggleSection("svpPartner")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span className="flex items-center gap-2">
                  <Handshake className="h-3 w-3 text-green-500" />
                  SVP - Partner
                </span>
                {openSections.svpPartner ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterNavItems(svpPartnerItems).map((item) => {
                    const hidden = isItemHidden(item.href);
                    return (
                      <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {hidden && isAdmin && !previewRole && (
                              <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                        {item.badge && !hidden && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        )}

        {/* SVP - Buyer Section */}
        {isSvpSectionVisible("svpBuyer") && (
        <Collapsible open={openSections.svpBuyer} onOpenChange={() => toggleSection("svpBuyer")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-3 w-3 text-purple-500" />
                  SVP - Buyer
                </span>
                {openSections.svpBuyer ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterNavItems(svpBuyerItems).map((item) => {
                    const hidden = isItemHidden(item.href);
                    return (
                      <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {hidden && isAdmin && !previewRole && (
                              <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                        {item.badge && !hidden && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        )}

        {/* SVP - QA Reviewer Section */}
        {isSvpSectionVisible("svpQa") && (
        <Collapsible open={openSections.svpQa} onOpenChange={() => toggleSection("svpQa")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span className="flex items-center gap-2">
                  <ClipboardCheck className="h-3 w-3 text-orange-500" />
                  SVP - QA Review
                </span>
                {openSections.svpQa ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterNavItems(svpQaItems).map((item) => {
                    const hidden = isItemHidden(item.href);
                    return (
                      <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {hidden && isAdmin && !previewRole && (
                              <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                        {item.badge && !hidden && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        )}

        {/* SVP - CMMC Instructor Section */}
        {isSvpSectionVisible("svpInstructor") && (
        <Collapsible open={openSections.svpInstructor} onOpenChange={() => toggleSection("svpInstructor")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-3 w-3 text-indigo-500" />
                  SVP - Instructor
                </span>
                {openSections.svpInstructor ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterNavItems(svpInstructorItems).map((item) => {
                    const hidden = isItemHidden(item.href);
                    return (
                      <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {hidden && isAdmin && !previewRole && (
                              <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                        {item.badge && !hidden && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        )}

        {/* SVP - Admin Section */}
        {isSvpSectionVisible("svpAdmin") && (
        <Collapsible open={openSections.svpAdmin} onOpenChange={() => toggleSection("svpAdmin")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-red-500" />
                  SVP - Admin
                </span>
                {openSections.svpAdmin ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterNavItems(svpAdminItems).map((item) => {
                    const hidden = isItemHidden(item.href);
                    return (
                      <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {hidden && isAdmin && !previewRole && (
                              <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                        {item.badge && !hidden && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        )}

        {/* ============================================ */}
        {/* OTHER - NON-SVP SECTIONS */}
        {/* ============================================ */}

        <Collapsible open={openSections.other} onOpenChange={() => toggleSection("other")}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                <span className="font-semibold">OTHER</span>
                {openSections.other ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                {/* Navigation */}
                <Collapsible open={openSections.navigation} onOpenChange={() => toggleSection("navigation")}>
                  <SidebarGroup>
                    <CollapsibleTrigger asChild>
                      <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2 text-sm">
                        <span>Navigation</span>
                        {openSections.navigation ? (
                          <ChevronDown className="h-3 w-3 text-sidebar-foreground/60" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-sidebar-foreground/60" />
                        )}
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {filterNavItems(mainNavItems).map((item) => {
                            const hidden = isItemHidden(item.href);
                            return (
                              <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={pathname === item.href}
                                  tooltip={item.title}
                                >
                                  <Link href={item.href}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                    {hidden && isAdmin && !previewRole && (
                                      <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                                    )}
                                  </Link>
                                </SidebarMenuButton>
                                {item.badge && !hidden && (
                                  <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                                )}
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>

                {/* Work */}
                <Collapsible open={openSections.work} onOpenChange={() => toggleSection("work")}>
                  <SidebarGroup>
                    <CollapsibleTrigger asChild>
                      <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2 text-sm">
                        <span>Work</span>
                        {openSections.work ? (
                          <ChevronDown className="h-3 w-3 text-sidebar-foreground/60" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-sidebar-foreground/60" />
                        )}
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {filterNavItems(workItems).map((item) => {
                            const hidden = isItemHidden(item.href);
                            return (
                              <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={pathname === item.href}
                                  tooltip={item.title}
                                >
                                  <Link href={item.href}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                    {hidden && isAdmin && !previewRole && (
                                      <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                                    )}
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>

                {/* Intelligence */}
                <Collapsible open={openSections.intelligence} onOpenChange={() => toggleSection("intelligence")}>
                  <SidebarGroup>
                    <CollapsibleTrigger asChild>
                      <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2 text-sm">
                        <span>Intelligence</span>
                        {openSections.intelligence ? (
                          <ChevronDown className="h-3 w-3 text-sidebar-foreground/60" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-sidebar-foreground/60" />
                        )}
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {filterNavItems(aiItems).map((item) => {
                            const hidden = isItemHidden(item.href);
                            return (
                              <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={pathname === item.href}
                                  tooltip={item.title}
                                >
                                  <Link href={item.href}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                    {hidden && isAdmin && !previewRole && (
                                      <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                                    )}
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>

                {/* Admin */}
                {isAdmin && (
                <Collapsible open={openSections.admin} onOpenChange={() => toggleSection("admin")}>
                  <SidebarGroup>
                    <CollapsibleTrigger asChild>
                      <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2 text-sm">
                        <span>Admin</span>
                        {openSections.admin ? (
                          <ChevronDown className="h-3 w-3 text-sidebar-foreground/60" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-sidebar-foreground/60" />
                        )}
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === "/portal/admin/book-call-leads"}
                              tooltip="Book Call Leads"
                            >
                              <Link href="/portal/admin/book-call-leads">
                                <Phone className="h-4 w-4" />
                                <span>Book Call Leads</span>
                              </Link>
                            </SidebarMenuButton>
                            {bookCallLeadsCount > 0 && (
                              <SidebarMenuBadge className="bg-red-500 text-white">
                                {bookCallLeadsCount}
                              </SidebarMenuBadge>
                            )}
                          </SidebarMenuItem>
                          {filterNavItems(adminItems).map((item) => {
                            const hidden = isItemHidden(item.href);
                            return (
                              <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={pathname === item.href || pathname.startsWith(item.href)}
                                  tooltip={item.title}
                                >
                                  <Link href={item.href}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                    {hidden && isAdmin && !previewRole && (
                                      <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                                    )}
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
                )}

                {/* Initiatives */}
                <Collapsible open={openSections.initiatives} onOpenChange={() => toggleSection("initiatives")}>
                  <SidebarGroup>
                    <CollapsibleTrigger asChild>
                      <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2 text-sm">
                        <span>Initiatives</span>
                        {openSections.initiatives ? (
                          <ChevronDown className="h-3 w-3 text-sidebar-foreground/60" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-sidebar-foreground/60" />
                        )}
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {filterNavItems(initiativeItems).map((item) => {
                            const hidden = isItemHidden(item.href);
                            return (
                              <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                                  tooltip={item.title}
                                >
                                  <Link href={item.href}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                    {hidden && isAdmin && !previewRole && (
                                      <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                                    )}
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {/* Admin Role Switcher */}
        {isAdmin && (
          <div className="px-3 py-2 border-b border-sidebar-border">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-sidebar-foreground/60" />
              <span className="text-xs font-medium text-sidebar-foreground/60">Preview as Role</span>
            </div>
            <Select
              value={previewRole || "admin"}
              onValueChange={(value) => setPreviewRole(value === "admin" ? null : value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select role to preview" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value} className="text-xs">
                    <div className="flex items-center gap-2">
                      {role.label}
                      {role.value === "admin" && (
                        <Badge variant="outline" className="text-[10px] h-4">Your Role</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {previewRole && (
              <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Previewing as {AVAILABLE_ROLES.find(r => r.value === previewRole)?.label}
              </p>
            )}
          </div>
        )}
        
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{getDisplayName()}</span>
                    <span className="text-xs text-sidebar-foreground/60 capitalize">
                      {previewRole 
                        ? `${(profile.svpRole || profile.role).replace("_", " ")} (viewing as ${previewRole.replace("_", " ")})` 
                        : (profile.svpRole || profile.role).replace("_", " ")}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/portal/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings?tab=notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={async () => {
                    try {
                      const { signOut } = await import("firebase/auth");
                      const { auth } = await import("@/lib/firebase");
                      if (auth) {
                        await signOut(auth);
                        window.location.href = "/";
                      }
                    } catch (error) {
                      console.error("Error signing out:", error);
                    }
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
