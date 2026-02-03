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
    id: "default-1",
    title: "Powering Growth for Emerging Businesses",
    subtitle: "The KDM Consortium",
    description: "A Total Team Approach to our Clients and Our Customers Success",
    ctaText: "Learn More",
    ctaLink: "/about",
    backgroundColor: "bg-gradient-to-br from-[#a8a4d9] via-[#b8b5e4] to-[#a8a4d9]",
    textColor: "dark",
    order: 1,
    isActive: true,
  },
  {
    id: "default-2",
    title: "Connect. Collaborate. Win.",
    subtitle: "The KDM Consortium",
    description: "A curated network connecting certified small businesses with government buyers and prime contractors for federal contracting opportunities.",
    ctaText: "Join the Consortium",
    ctaLink: "/register",
    backgroundColor: "bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f]",
    textColor: "light",
    order: 2,
    isActive: true,
  },
  {
    id: "default-3",
    title: "Grow Your Government Business",
    subtitle: "For Subject Matter Experts",
    description: "Get discovered by government buyers, access exclusive opportunities, and build your proof pack to demonstrate your capabilities.",
    ctaText: "Register as an SME",
    ctaLink: "/register?type=sme",
    backgroundColor: "bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e]",
    textColor: "light",
    order: 3,
    isActive: true,
  },
  {
    id: "default-4",
    title: "Find Qualified Small Businesses",
    subtitle: "For Government Buyers",
    description: "Access a vetted directory of certified small businesses ready to support your mission requirements.",
    ctaText: "Register as a Buyer",
    ctaLink: "/register?type=buyer",
    backgroundColor: "bg-gradient-to-br from-[#7c3aed] via-[#8b5cf6] to-[#7c3aed]",
    textColor: "light",
    order: 4,
    isActive: true,
  },
  {
    id: "default-5",
    title: "CMMC & Compliance Training",
    subtitle: "Expert-Led Cohorts",
    description: "Prepare your business for government contracting with our instructor-led certification programs.",
    ctaText: "Explore Training",
    ctaLink: "/training",
    backgroundColor: "bg-gradient-to-br from-[#c9a227] via-[#d4af37] to-[#c9a227]",
    textColor: "dark",
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
