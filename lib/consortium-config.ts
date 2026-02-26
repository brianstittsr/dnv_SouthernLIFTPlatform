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
  order: nuemerging businessr;
  isActive: boolean;
}

export const defaultHeroSlides: HeroSlide[] = [
  {
    id: "default-1",
    title: "KDM Connects Small Businesses with Government Buyers",
    subtitle: "The KDM Consortium",
    description: "We bridge the gap between certified small businesses and federal procurement opportunities, creating pathways to success in government contracting.",
    ctaText: "Learn More",
    ctaLink: "/about",
    backgroundImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
    backgroundColor: "bg-gradient-to-br from-[#0c4a6e]/95 via-[#075985]/90 to-[#0c4a6e]/95",
    textColor: "light",
    order: 1,
    isActive: true,
  },
  {
    id: "default-2",
    title: "KDM Helps Small Businesses Win Federal Contracts",
    subtitle: "The KDM Consortium",
    description: "From 8(a) to WOSB, SDVOSB to HUBZone, we provide the tools, training, and connections you need to succeed in federal contracting.",
    ctaText: "Join the Consortium",
    ctaLink: "/register",
    backgroundImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80",
    backgroundColor: "bg-gradient-to-br from-[#14532d]/95 via-[#166534]/90 to-[#14532d]/95",
    textColor: "light",
    order: 2,
    isActive: true,
  },
  {
    id: "default-3",
    title: "KDM Prepares Small Businesses for DoD Contracts",
    subtitle: "CMMC Certification & Compliance",
    description: "Get CMMC certified and prepared for Department of Defense contracts. Our expert-led training ensures you meet all cybersecurity and compliance requirements.",
    ctaText: "Get DoD Ready",
    ctaLink: "/training",
    backgroundImage: "https://images.unsplash.com/photo-1568607689150-17e625c1586e?w=1920&q=80",
    backgroundColor: "bg-gradient-to-br from-[#701a75]/95 via-[#86198f]/90 to-[#701a75]/95",
    textColor: "light",
    order: 3,
    isActive: true,
  },
  {
    id: "default-4",
    title: "KDM Provides Access to Qualified Small Businesses",
    subtitle: "For Government Buyers",
    description: "Access our vetted directory of certified small businesses—8(a), WOSB, SDVOSB, HUBZone, and CMMC-compliant contractors ready to support your mission.",
    ctaText: "Register as a Buyer",
    ctaLink: "/register?type=buyer",
    backgroundImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80",
    backgroundColor: "bg-gradient-to-br from-[#1e3a5f]/95 via-[#1e40af]/90 to-[#1e3a5f]/95",
    textColor: "light",
    order: 4,
    isActive: true,
  },
  {
    id: "default-5",
    title: "KDM Delivers Expert CMMC Certification Training",
    subtitle: "Expert-Led Cohorts",
    description: "Master cybersecurity maturity model certification and federal compliance requirements through our intensive, instructor-led training programs.",
    ctaText: "Explore Training",
    ctaLink: "/training",
    backgroundImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80",
    backgroundColor: "bg-gradient-to-br from-[#92400e]/95 via-[#b45309]/90 to-[#92400e]/95",
    textColor: "light",
    order: 5,
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
