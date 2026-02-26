import { db, storage } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { HeroSlide } from "@/components/marketing/hero-carousel";

const HERO_SLIDES_COLLECTION = "hero_slides";
const HERO_IMAGES_FOLDER = "hero_images";

/**
 * Get all hero slides from Firestore
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  if (!db) throw new Error("Firestore not initialized");

  const slidesQuery = query(
    collection(db, HERO_SLIDES_COLLECTION),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(slidesQuery);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      badge: data.badge || "",
      headline: data.headline || "",
      highlightedText: data.highlightedText || "",
      subheadline: data.subheadline || "",
      benefits: data.benefits || [],
      primaryCta: data.primaryCta || { text: "", href: "" },
      secondaryCta: data.secondaryCta || { text: "", href: "" },
      isPublished: data.isPublished ?? false,
      order: data.order || 0,
      backgroundType: data.backgroundType || "animated",
      backgroundImage: data.backgroundImage || "",
      backgroundOverlay: data.backgroundOverlay ?? true,
      backgroundOverlayOpacity: data.backgroundOverlayOpacity || 40,
      fullScreenBg: data.fullScreenBg ?? true,
      showRibbon: data.showRibbon ?? true,
      ribbonColor: data.ribbonColor || "dark",
      showWaves: data.showWaves ?? false,
      highlightOnSecondLine: data.highlightOnSecondLine ?? false,
    } as HeroSlide;
  });
}

/**
 * Save a hero slide to Firestore
 */
export async function saveHeroSlide(slide: HeroSlide): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const slideRef = doc(db, HERO_SLIDES_COLLECTION, slide.id);
  await setDoc(slideRef, {
    ...slide,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a hero slide from Firestore
 */
export async function deleteHeroSlide(slideId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const slideRef = doc(db, HERO_SLIDES_COLLECTION, slideId);
  await deleteDoc(slideRef);
}

/**
 * Reorder hero slides
 */
export async function reorderHeroSlides(slides: HeroSlide[]): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const firestore = db; // Capture db in a variable for the callback
  const batch = writeBatch(firestore);

  slides.forEach((slide, index) => {
    const slideRef = doc(firestore, HERO_SLIDES_COLLECTION, slide.id);
    batch.update(slideRef, { order: index + 1 });
  });

  await batch.commit();
}

/**
 * Upload image to Firebase Storage and return download URL
 */
export async function uploadHeroImage(
  base64Image: string,
  fileName: string
): Promise<string> {
  if (!storage) throw new Error("Firebase Storage not initialized");

  // Extract content type and base64 data
  const match = base64Image.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid base64 image format");
  
  const contentType = match[1];
  const base64Data = match[2];

  // Create a unique filename
  const timestamp = Date.now();
  const uniqueName = `${timestamp}_${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `${HERO_IMAGES_FOLDER}/${uniqueName}`);

  // Upload to Firebase Storage
  await uploadString(storageRef, base64Data, 'base64', {
    contentType,
  });

  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

/**
 * Delete hero image from storage
 */
export async function deleteHeroImage(imageUrl: string): Promise<void> {
  if (!storage) return;

  // Only delete if it's a storage URL (not a base64 data URL)
  if (imageUrl.includes("firebasestorage.googleapis.com")) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (e) {
      console.error("Failed to delete image:", e);
    }
  }
}

/**
 * Image Manager - stores images in Firebase Storage with metadata in Firestore
 */
export interface StoredImage {
  id: string;
  name: string;
  imageUrl: string; // Firebase Storage download URL
  storagePath: string; // Firebase Storage path for deletion
  contentType: string;
  size: nuemerging businessr;
  createdAt: Timestamp;
  usedBy: string[]; // slide IDs using this image
}

const IMAGES_COLLECTION = "hero_images";

/**
 * Save image to Image Manager - uploads to Storage, stores metadata in Firestore
 */
export async function saveImageToManager(
  name: string,
  base64DataUrl: string,
  contentType: string = "image/jpeg"
): Promise<StoredImage> {
  if (!db || !storage) throw new Error("Firebase not initialized");

  // Calculate approximate size of base64 string
  const base64Length = base64DataUrl.split(",")[1]?.length || 0;
  const size = Math.ceil((base64Length * 3) / 4); // Approximate bytes

  // Upload to Firebase Storage
  const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const uniqueName = `${imageId}_${name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `${HERO_IMAGES_FOLDER}/${uniqueName}`);

  // Extract base64 data
  const base64Data = base64DataUrl.split(",")[1];
  if (!base64Data) throw new Error("Invalid base64 data");

  // Upload to Storage
  await uploadString(storageRef, base64Data, 'base64', {
    contentType,
  });

  // Get download URL
  const imageUrl = await getDownloadURL(storageRef);

  // Save metadata to Firestore
  const imageDocRef = doc(db, IMAGES_COLLECTION, imageId);
  const imageData: Omit<StoredImage, "id"> = {
    name,
    imageUrl,
    storagePath: `${HERO_IMAGES_FOLDER}/${uniqueName}`,
    contentType,
    size,
    createdAt: Timestamp.now(),
    usedBy: [],
  };

  await setDoc(imageDocRef, imageData);

  return { id: imageId, ...imageData };
}

/**
 * Get all images from Image Manager
 */
export async function getAllImages(): Promise<StoredImage[]> {
  if (!db) throw new Error("Firestore not initialized");

  const imagesQuery = query(
    collection(db, IMAGES_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(imagesQuery);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      imageUrl: data.imageUrl,
      storagePath: data.storagePath,
      contentType: data.contentType,
      size: data.size,
      createdAt: data.createdAt,
      usedBy: data.usedBy || [],
    } as StoredImage;
  });
}

/**
 * Delete image from Image Manager and Firebase Storage
 */
export async function deleteImageFromManager(imageId: string, storagePath: string): Promise<void> {
  if (!db || !storage) throw new Error("Firebase not initialized");

  // Delete from Firebase Storage
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (e) {
    console.error("Failed to delete image from storage:", e);
    // Continue to delete from Firestore even if storage delete fails
  }

  // Delete from Firestore
  const imageRef = doc(db, IMAGES_COLLECTION, imageId);
  await deleteDoc(imageRef);
}

/**
 * Update image usage tracking
 */
export async function updateImageUsage(
  imageId: string,
  slideId: string,
  isAdding: boolean
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const imageRef = doc(db, IMAGES_COLLECTION, imageId);
  const imageDoc = await getDoc(imageRef);

  if (!imageDoc.exists()) return;

  const data = imageDoc.data();
  const usedBy = data.usedBy || [];

  if (isAdding && !usedBy.includes(slideId)) {
    usedBy.push(slideId);
  } else if (!isAdding) {
    const index = usedBy.indexOf(slideId);
    if (index > -1) usedBy.splice(index, 1);
  }

  await setDoc(imageRef, { ...data, usedBy }, { merge: true });
}
