export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor: "light" | "dark";
  order: number;
  isActive: boolean;
}

export const defaultHeroSlides: HeroSlide[] = [
  {
    id: "consortium-launch",
    title: "KDM Consortium Digital Platform",
    subtitle: "WORLD DEBUT // PLATFORM LAUNCH",
    description: "Join the free virtual launch event during National Small Business Week. The nation's first dual-sided platform connecting SMBs & manufacturers with Federal agencies, Prime contractors, and OEMs.",
    ctaText: "Learn More",
    ctaLink: "/kdm-launch",
    backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
    backgroundColor: "bg-gradient-to-br from-[#0c0c0c]/95 via-[#1a1a2e]/90 to-[#0c0c0c]/95",
    textColor: "light",
    order: 0,
    isActive: true,
  },
  {
    id: "consortium-1",
    title: "Join an Exclusive Network of Government Contracting Experts",
    subtitle: "SELECTIVE NETWORK",
    description: "12-50 Expert Companies. One Mission: Winning Together.",
    ctaText: "Learn More",
    ctaLink: "/consortium",
    backgroundImage: "",
    backgroundColor: "bg-gradient-to-br from-[#1e3a5f]/95 via-[#2d4a6f]/90 to-[#1e3a5f]/95",
    textColor: "light",
    order: 1,
    isActive: true,
  },
  {
    id: "consortium-2",
    title: "Your Manufacturing Profile for Federal Contracts",
    subtitle: "GOVERNMENT CONTRACTING READY",
    description: "Complete your verified capability profile to match with government and commercial opportunities.",
    ctaText: "Complete Profile",
    ctaLink: "/portal/profile",
    backgroundImage: "",
    backgroundColor: "bg-gradient-to-br from-[#0f766e]/95 via-[#14b8a6]/90 to-[#0f766e]/95",
    textColor: "light",
    order: 2,
    isActive: true,
  },
  {
    id: "consortium-3",
    title: "Smart Matching for Government Opportunities",
    subtitle: "INTELLIGENT OPPORTUNITY DELIVERY",
    description: "AI-powered matching connects you with relevant federal contracts and teaming partners.",
    ctaText: "View Opportunities",
    ctaLink: "/portal/opportunities",
    backgroundImage: "",
    backgroundColor: "bg-gradient-to-br from-[#7c3aed]/95 via-[#8b5cf6]/90 to-[#7c3aed]/95",
    textColor: "light",
    order: 3,
    isActive: true,
  },
  {
    id: "consortium-4",
    title: "Showcase Your Manufacturing Capabilities",
    subtitle: "VERIFIED B2B MARKETPLACE",
    description: "List your products and services in our discovery-only marketplace for government buyers.",
    ctaText: "Explore Marketplace",
    ctaLink: "/portal/marketplace",
    backgroundImage: "",
    backgroundColor: "bg-gradient-to-br from-[#c9a227]/95 via-[#d4af37]/90 to-[#c9a227]/95",
    textColor: "dark",
    order: 4,
    isActive: true,
  },
  {
    id: "consortium-5",
    title: "AI-Powered Contract Response Tools",
    subtitle: "FASTER CONTRACT IDENTIFICATION",
    description: "Built-in tools help you identify opportunities faster and respond with winning proposals.",
    ctaText: "View AI Tools",
    ctaLink: "/portal/ai-tools",
    backgroundImage: "",
    backgroundColor: "bg-gradient-to-br from-[#701a75]/95 via-[#86198f]/90 to-[#701a75]/95",
    textColor: "light",
    order: 5,
    isActive: true,
  },
  {
    id: "consortium-6",
    title: "Why Join the KDM Consortium?",
    subtitle: "MEMBERSHIP BENEFITS",
    description: "Everything you need to win government contracts and grow your manufacturing business.",
    ctaText: "Apply Now",
    ctaLink: "/consortium/join",
    backgroundImage: "",
    backgroundColor: "bg-gradient-to-br from-[#1e3a5f]/95 via-[#2d4a6f]/90 to-[#1e3a5f]/95",
    textColor: "light",
    order: 6,
    isActive: true,
  },
];

export const backgroundOptions = [
  { value: "bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f]", label: "Navy (Default)" },
  { value: "bg-gradient-to-br from-[#a8a4d9] via-[#b8b5e4] to-[#a8a4d9]", label: "Lavender" },
  { value: "bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e]", label: "Teal" },
  { value: "bg-gradient-to-br from-[#7c3aed] via-[#8b5cf6] to-[#7c3aed]", label: "Purple" },
  { value: "bg-gradient-to-br from-[#c9a227] via-[#d4af37] to-[#c9a227]", label: "Gold" },
  { value: "bg-gradient-to-br from-[#dc2626] via-[#ef4444] to-[#dc2626]", label: "Red" },
  { value: "bg-gradient-to-br from-[#059669] via-[#10b981] to-[#059669]", label: "Green" },
];

export const defaultSlideTemplate: Omit<HeroSlide, "id" | "order"> = {
  title: "",
  subtitle: "",
  description: "",
  ctaText: "",
  ctaLink: "",
  backgroundImage: "",
  backgroundColor: "bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f]",
  textColor: "light",
  isActive: true,
};
