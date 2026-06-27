import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS, type HomePageSettingsDoc } from "@/lib/schema";

const SETTINGS_ID = "default";

/**
 * Default home page settings
 */
export const defaultHomePageSettings: HomePageSettingsDoc = {
  id: SETTINGS_ID,
  // Hero Slider Settings
  heroSliderSpeed: 6000, // 6 seconds
  heroSliderAutoPlay: true,
  
  // Popup Form Settings
  popupFormEnabled: true,
  popupFormTriggerDelay: 60, // 60 seconds
  popupFormPosition: "bottom-right",
  popupFormTitle: "KDM & Associates",
  popupFormSubtitle: "Schedule an introductory session to explore how we can help you win government contracts.",
  popupFormDescription: "Tell us about your business and contracting goals. We'll follow up with next steps.",
  popupFormButtonText: "Schedule Session",
  popupFormSuccessMessage: "Thank you! We'll be in touch within 24 hours.",
  
  // Discount Banner Settings
  discountBannerEnabled: true,
  discountBannerText: "Limited Time Offer: Join the KDM Consortium for just $625/month — Save $600 off the regular price! Offer ends at the close of the HubZone Conference.",
  discountBannerCtaText: "Join Now",
  discountBannerCtaLink: "/pricing",
  discountBannerBackgroundColor: "#dc2626", // red-600
  discountBannerTextColor: "#ffffff",
  
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

/**
 * Get home page settings from Firestore
 */
export async function getHomePageSettings(): Promise<HomePageSettingsDoc> {
  if (!db) throw new Error("Firestore not initialized");

  try {
    const settingsRef = doc(db, COLLECTIONS.HOME_PAGE_SETTINGS, SETTINGS_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return settingsSnap.data() as HomePageSettingsDoc;
    } else {
      // Return defaults if not found
      return defaultHomePageSettings;
    }
  } catch (error) {
    console.error("Error fetching home page settings:", error);
    return defaultHomePageSettings;
  }
}

/**
 * Save home page settings to Firestore
 */
export async function saveHomePageSettings(
  settings: Partial<HomePageSettingsDoc>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const settingsRef = doc(db, COLLECTIONS.HOME_PAGE_SETTINGS, SETTINGS_ID);
  await setDoc(
    settingsRef,
    {
      ...settings,
      id: SETTINGS_ID,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

/**
 * Update hero slider speed
 */
export async function updateHeroSliderSpeed(speed: number): Promise<void> {
  await saveHomePageSettings({ heroSliderSpeed: speed });
}

/**
 * Update hero slider autoplay
 */
export async function updateHeroSliderAutoPlay(autoPlay: boolean): Promise<void> {
  await saveHomePageSettings({ heroSliderAutoPlay: autoPlay });
}

/**
 * Update popup form trigger delay
 */
export async function updatePopupFormTriggerDelay(delay: number): Promise<void> {
  await saveHomePageSettings({ popupFormTriggerDelay: delay });
}

/**
 * Update popup form enabled status
 */
export async function updatePopupFormEnabled(enabled: boolean): Promise<void> {
  await saveHomePageSettings({ popupFormEnabled: enabled });
}

/**
 * Update popup form position
 */
export async function updatePopupFormPosition(
  position: "bottom-right" | "bottom-left" | "center"
): Promise<void> {
  await saveHomePageSettings({ popupFormPosition: position });
}
