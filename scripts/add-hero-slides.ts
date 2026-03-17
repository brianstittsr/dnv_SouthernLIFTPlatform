 /**
 * Script to add CMMC Training Cohort slide and update KDM Consortium slide
 * Run this with: npx tsx scripts/add-hero-slides.ts
 */

import { db } from "../lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const HERO_SLIDES_COLLECTION = "hero_slides";

async function addHeroSlides() {
  if (!db) {
    console.error("Firebase Admin not initialized");
    process.exit(1);
  }

  try {
    // CMMC Training Cohort Slide
    const cmmcSlide = {
      id: "cmmc-training-cohort",
      badge: "CMMC Certification Training",
      headline: "Achieve CMMC Compliance",
      highlightedText: "12-Week Intensive Cohort",
      subheadline: "Join our expert-led program to prepare your organization for CMMC Level 2 certification. Get the training, tools, and support you need to protect sensitive defense information.",
      benefits: [
        "Expert-Led Training Sessions",
        "Documentation Templates & Tools",
        "Mock Assessments & Gap Analysis",
        "C3PAO Referral Network"
      ],
      primaryCta: {
        text: "Enroll in CMMC Cohort - $7,500",
        href: "/cmmc-cohort"
      },
      secondaryCta: {
        text: "Learn More About CMMC",
        href: "/cmmc-training"
      },
      isPublished: true,
      order: 4,
      backgroundType: "image",
      backgroundImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1920&q=80",
      backgroundOverlay: true,
      backgroundOverlayOpacity: 60,
      fullScreenBg: true,
      showRibbon: true,
      ribbonColor: "dark",
      showWaves: false,
      highlightOnSecondLine: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // KDM Consortium Slide (Updated with cart functionality)
    const consortiumSlide = {
      id: "kdm-consortium",
      badge: "Exclusive Membership",
      headline: "Join the",
      highlightedText: "KDM Consortium",
      subheadline: "Become part of our selective network of 12-50 expert companies collaborating to win and deliver large government contracts in manufacturing, critical minerals, defense, and energy sectors.",
      benefits: [
        "Curated Opportunity Access",
        "Weekly Consortium Meetings",
        "Expert Partnership Network",
        "Contract Delivery Support"
      ],
      primaryCta: {
        text: "Join the Consortium - $1,250/month",
        href: "/checkout-cart?add=consortium",
        action: "add-to-cart",
        productId: "consortium"
      },
      secondaryCta: {
        text: "Learn More About the Consortium",
        href: "/consortium"
      },
      isPublished: true,
      order: 3,
      backgroundType: "image",
      backgroundImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80",
      backgroundOverlay: true,
      backgroundOverlayOpacity: 50,
      fullScreenBg: true,
      showRibbon: true,
      ribbonColor: "dark",
      showWaves: false,
      highlightOnSecondLine: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add CMMC slide
    console.log("Adding CMMC Training Cohort slide...");
    await db.collection(HERO_SLIDES_COLLECTION).doc(cmmcSlide.id).set(cmmcSlide);
    console.log("✓ CMMC Training Cohort slide added");

    // Add/Update Consortium slide
    console.log("Adding/Updating KDM Consortium slide...");
    await db.collection(HERO_SLIDES_COLLECTION).doc(consortiumSlide.id).set(consortiumSlide);
    console.log("✓ KDM Consortium slide added/updated");

    console.log("\n✅ Hero slides successfully added/updated!");
    console.log("\nSlides added:");
    console.log("1. CMMC Training Cohort (order: 4)");
    console.log("2. KDM Consortium (order: 3)");
    
  } catch (error) {
    console.error("Error adding hero slides:", error);
    process.exit(1);
  }
}

addHeroSlides();
