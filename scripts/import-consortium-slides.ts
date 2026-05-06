/**
 * Script to import KDM Consortium HTML slides into Firestore slide manager
 * Run with: npx ts-node scripts/import-consortium-slides.ts
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";

// Firebase config - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Slide data extracted from KDM-Consortium-Slides-v2.html
const consortiumSlides = [
  {
    title: "Join an Exclusive Network of Government Contracting Experts",
    subtitle: "KDM CONSORTIUM",
    description: "12-50 Expert Companies. One Mission: Winning Together.",
    badge: "SELECTIVE NETWORK",
    benefits: [
      "12-50 curated members only",
      "Hand-picked by capability fit",
      "High-touch, not mass market",
    ],
    ctaText: "Learn More",
    ctaLink: "/consortium",
    backgroundColor: "bg-gradient-to-br from-[#1e3a5f]/95 via-[#2d4a6f]/90 to-[#1e3a5f]/95",
    textColor: "light",
    order: 1,
    isActive: true,
  },
  {
    title: "Your Manufacturing Profile for Federal Contracts",
    subtitle: "GOVERNMENT CONTRACTING READY",
    description: "Complete your verified capability profile to match with government and commercial opportunities",
    benefits: [
      "500+ NAICS codes for precise matching",
      "CMMC certification levels (1-3)",
      "Set-aside certifications (8(a), WOSB, SDVOSB, HUBZone)",
    ],
    ctaText: "Complete Profile",
    ctaLink: "/portal/profile",
    backgroundColor: "bg-gradient-to-br from-[#0f766e]/95 via-[#14b8a6]/90 to-[#0f766e]/95",
    textColor: "light",
    order: 2,
    isActive: true,
  },
  {
    title: "Smart Matching for Government Opportunities",
    subtitle: "INTELLIGENT OPPORTUNITY DELIVERY",
    description: "AI-powered matching connects you with relevant federal contracts and teaming partners",
    benefits: [
      "Personalized opportunity feed",
      "AI-suggested teaming partners",
      "Real-time contract alerts",
    ],
    ctaText: "View Opportunities",
    ctaLink: "/portal/opportunities",
    backgroundColor: "bg-gradient-to-br from-[#7c3aed]/95 via-[#8b5cf6]/90 to-[#7c3aed]/95",
    textColor: "light",
    order: 3,
    isActive: true,
  },
  {
    title: "Showcase Your Manufacturing Capabilities",
    subtitle: "VERIFIED B2B MARKETPLACE",
    description: "List your products and services in our discovery-only marketplace for government buyers",
    benefits: [
      "Capability showcase pages",
      "Past performance highlights",
      "Direct buyer discovery",
    ],
    ctaText: "Explore Marketplace",
    ctaLink: "/portal/marketplace",
    backgroundColor: "bg-gradient-to-br from-[#c9a227]/95 via-[#d4af37]/90 to-[#c9a227]/95",
    textColor: "dark",
    order: 4,
    isActive: true,
  },
  {
    title: "AI-Powered Contract Response Tools",
    subtitle: "FASTER CONTRACT IDENTIFICATION",
    description: "Built-in tools help you identify opportunities faster and respond with winning proposals",
    benefits: [
      "AI bid/no-bid recommendations",
      "Automated RFP analysis",
      "Teaming partner discovery",
    ],
    ctaText: "View AI Tools",
    ctaLink: "/portal/ai-tools",
    backgroundColor: "bg-gradient-to-br from-[#701a75]/95 via-[#86198f]/90 to-[#701a75]/95",
    textColor: "light",
    order: 5,
    isActive: true,
  },
  {
    title: "Why Join the KDM Consortium?",
    subtitle: "MEMBERSHIP BENEFITS",
    description: "Everything you need to win government contracts and grow your manufacturing business",
    benefits: [
      "Selective network of 12-50 vetted members",
      "AI-powered opportunity matching",
      "$650/month promotional pricing",
    ],
    ctaText: "Apply Now",
    ctaLink: "/consortium/join",
    backgroundColor: "bg-gradient-to-br from-[#1e3a5f]/95 via-[#2d4a6f]/90 to-[#1e3a5f]/95",
    textColor: "light",
    order: 6,
    isActive: true,
  },
];

async function importSlides() {
  try {
    console.log("Starting import of consortium slides...");

    for (const slide of consortiumSlides) {
      const slideData = {
        ...slide,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, "consortiumHeroSlides"),
        slideData
      );
      console.log(`Added slide: ${slide.title} (ID: ${docRef.id})`);
    }

    console.log("\n✅ Successfully imported all consortium slides!");
    console.log("\nNext steps:");
    console.log("1. Go to /portal/admin/consortium/hero to manage slides");
    console.log("2. Upload background images for each slide");
    console.log("3. Activate/deactivate slides as needed");
  } catch (error) {
    console.error("❌ Error importing slides:", error);
    process.exit(1);
  }
}

// Run the import
importSlides();
