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

export const iaeozHeroSlides: HeroSlide[] = [
  {
    id: "iaeoz-1",
    title: "Innovation in Agriculture & Energy Opportunity Zones",
    subtitle: "IAEOZ Summit",
    description: "Watch keynotes and presentations from industry leaders, government officials, and entrepreneurs driving economic development in Opportunity Zones.",
    ctaText: "Browse Videos",
    ctaLink: "#videos",
    backgroundImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80",
    backgroundColor: "bg-gradient-to-br from-emerald-900/95 via-emerald-800/90 to-teal-900/95",
    textColor: "light",
    order: 1,
    isActive: true,
  },
  {
    id: "iaeoz-2",
    title: "Global Diversity Export Initiative Trade Missions",
    subtitle: "International Trade",
    description: "Explore trade missions to Africa and beyond, building commercial bridges between U.S. businesses and international markets.",
    ctaText: "View Trade Mission Videos",
    ctaLink: "#videos",
    backgroundImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1920&q=80",
    backgroundColor: "bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-indigo-900/95",
    textColor: "light",
    order: 2,
    isActive: true,
  },
  {
    id: "iaeoz-3",
    title: "Justice40 & Federal Energy Programs",
    subtitle: "Government Initiatives",
    description: "Learn about Justice40 initiatives at the U.S. Department of Energy and how they support underserved communities.",
    ctaText: "Watch DOE Sessions",
    ctaLink: "#videos",
    backgroundImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1920&q=80",
    backgroundColor: "bg-gradient-to-br from-aemerging businessr-900/95 via-aemerging businessr-800/90 to-orange-900/95",
    textColor: "light",
    order: 3,
    isActive: true,
  },
  {
    id: "iaeoz-4",
    title: "Minority Business Enterprise Success Stories",
    subtitle: "emerging business Spotlight",
    description: "Hear from successful minority business owners and leaders sharing their journey in federal contracting and economic development.",
    ctaText: "Watch emerging business Stories",
    ctaLink: "#videos",
    backgroundImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80",
    backgroundColor: "bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-violet-900/95",
    textColor: "light",
    order: 4,
    isActive: true,
  },
  {
    id: "iaeoz-5",
    title: "Broadband & Data Management for Rural Communities",
    subtitle: "Infrastructure & Technology",
    description: "Discover what works for emerging businesss and rural communities in data management, broadband access, and digital infrastructure.",
    ctaText: "Explore Tech Sessions",
    ctaLink: "#videos",
    backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
    backgroundColor: "bg-gradient-to-br from-cyan-900/95 via-cyan-800/90 to-sky-900/95",
    textColor: "light",
    order: 5,
    isActive: true,
  },
];
