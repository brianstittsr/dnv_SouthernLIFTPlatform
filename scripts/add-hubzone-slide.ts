import { db } from '../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

async function addHubZoneSlide() {
  if (!db) {
    console.error('Database not initialized');
    process.exit(1);
  }

  try {
    const slideId = "press-release-hubzone";

    // Check if slide already exists
    const existingDoc = await db.collection('hero_slides').doc(slideId).get();
    
    if (existingDoc.exists) {
      console.log('HUBZone press release slide already exists in Firebase');
      console.log('Updating it now...');
      
      // Update the existing slide
      await db.collection('hero_slides').doc(slideId).update({
        badge: "🎉 Major Partnership Announcement",
        headline: "KDM Consortium &",
        middleLine: "&",
        highlightedText: "HUBZone Council",
        subheadline: "Launching a Whole of Government Team Approach to build a National HUBZone Digital Ecosystem. Accelerating small business success and strengthening federal contracting opportunities.",
        benefits: ["Digital Ecosystem Platform", "2026 National HUBZone Conference", "Federal Contracting Support"],
        primaryCta: {
          text: "Read Press Release",
          href: "/press-releases/kdm-consortium-hubzone-council-digital-ecosystem",
          action: "link"
        },
        secondaryCta: {
          text: "Join the Consortium",
          href: "/consortium"
        },
        isPublished: true,
        order: 0,
        backgroundType: "image",
        backgroundImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80",
        backgroundOverlay: true,
        backgroundOverlayOpacity: 60,
        fullScreenBg: true,
        showRibbon: true,
        ribbonColor: "dark",
        showWaves: false,
        highlightOnSecondLine: true,
        updatedAt: Timestamp.now(),
      });
      
      console.log('HUBZone slide updated successfully');
    } else {
      console.log('Adding HUBZone press release slide to Firebase...');
      
      // Create the HUBZone press release slide
      const heroSlide = {
        badge: "🎉 Major Partnership Announcement",
        headline: "KDM Consortium &",
        middleLine: "&",
        highlightedText: "HUBZone Council",
        subheadline: "Launching a Whole of Government Team Approach to build a National HUBZone Digital Ecosystem. Accelerating small business success and strengthening federal contracting opportunities.",
        benefits: ["Digital Ecosystem Platform", "2026 National HUBZone Conference", "Federal Contracting Support"],
        primaryCta: {
          text: "Read Press Release",
          href: "/press-releases/kdm-consortium-hubzone-council-digital-ecosystem",
          action: "link"
        },
        secondaryCta: {
          text: "Join the Consortium",
          href: "/consortium"
        },
        isPublished: true,
        order: 0,
        backgroundType: "image",
        backgroundImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80",
        backgroundOverlay: true,
        backgroundOverlayOpacity: 60,
        fullScreenBg: true,
        showRibbon: true,
        ribbonColor: "dark",
        showWaves: false,
        highlightOnSecondLine: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Save to Firestore
      await db.collection('hero_slides').doc(slideId).set(heroSlide);
      console.log('HUBZone slide added successfully');
    }

    // Check current slides
    const allSlides = await db.collection('hero_slides').orderBy('order', 'asc').get();
    console.log(`\nTotal slides in Firebase: ${allSlides.size}`);
    console.log('Published slides:');
    allSlides.docs.forEach(doc => {
      const data = doc.data();
      if (data.isPublished) {
        console.log(`  - Order ${data.order}: ${data.headline} ${data.highlightedText}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding HUBZone hero slide:', error);
    process.exit(1);
  }
}

addHubZoneSlide();
