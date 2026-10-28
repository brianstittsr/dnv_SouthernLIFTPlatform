import { db } from "./firebase";
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
import { HeroSlide } from "@/components/marketing/hero-carousel";

const HERO_SLIDES_COLLECTION = "hero_slides";

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
      middleLine: data.middleLine || "",
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

/** Converts a data URL (data:<mime>;base64,<data>) into a Blob for upload. */
async function dataUrlToBlob(dataUrl: string): Promise<{ blob: Blob; contentType: string }> {
  const match = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!match) throw new Error("Invalid base64 image format");
  const contentType = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return { blob: new Blob([bytes], { type: contentType }), contentType };
}

/** Extracts the fileBlobs id from an /api/files/{id} URL; null for other URLs. */
function fileIdFromUrl(url: string): string | null {
  const match = url.match(/\/api\/files\/([^/?#]+)/);
  return match ? match[1] : null;
}

/**
 * Upload a base64 image and return its public URL.
 * Files are stored as base64 chunks in Firestore (fileBlobs) and served
 * from /api/files/{id}.
 */
export async function uploadHeroImage(
  base64Image: string,
  fileName: string
): Promise<string> {
  const { blob } = await dataUrlToBlob(base64Image);

  const formData = new FormData();
  formData.append("file", new File([blob], fileName, { type: blob.type }));
  formData.append("category", "hero_images");

  const response = await fetch("/api/upload-image", { method: "POST", body: formData });
  if (!response.ok) throw new Error("Image upload failed");

  const data = (await response.json()) as { imageUrl?: string };
  if (!data.imageUrl) throw new Error("Image upload returned no URL");
  return data.imageUrl;
}

/**
 * Delete a previously uploaded image. Only /api/files/{id} URLs are
 * deletable; legacy Firebase Storage URLs are left as-is (Storage disabled).
 */
export async function deleteHeroImage(imageUrl: string): Promise<void> {
  const fileId = fileIdFromUrl(imageUrl);
  if (!fileId) return;
  try {
    await fetch(`/api/files/${fileId}`, { method: "DELETE" });
  } catch (e) {
    console.error("Failed to delete image:", e);
  }
}

/**
 * Image Manager - metadata docs in Firestore; bytes live in fileBlobs
 */
export interface StoredImage {
  id: string;
  name: string;
  imageUrl: string; // /api/files/{fileId} URL
  fileId?: string; // fileBlobs document id for deletion
  contentType: string;
  size: number;
  createdAt: Timestamp;
  usedBy: string[]; // slide IDs using this image
}

const IMAGES_COLLECTION = "hero_images";

/**
 * Save image to Image Manager - stores bytes in fileBlobs, metadata in Firestore
 */
export async function saveImageToManager(
  name: string,
  base64DataUrl: string,
  contentType: string = "image/jpeg"
): Promise<StoredImage> {
  if (!db) throw new Error("Firestore not initialized");

  // Calculate approximate size of base64 string
  const base64Length = base64DataUrl.split(",")[1]?.length || 0;
  const size = Math.ceil((base64Length * 3) / 4); // Approximate bytes

  // Upload bytes through the server route (writes fileBlobs chunks)
  const { blob } = await dataUrlToBlob(base64DataUrl);
  const formData = new FormData();
  formData.append("file", new File([blob], name, { type: contentType }));
  formData.append("category", "hero_images");

  const response = await fetch("/api/upload-image", { method: "POST", body: formData });
  if (!response.ok) throw new Error("Image upload failed");
  const uploaded = (await response.json()) as { imageId?: string; imageUrl?: string };
  if (!uploaded.imageId || !uploaded.imageUrl) throw new Error("Image upload returned no id");

  // Save metadata to Firestore
  const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const imageDocRef = doc(db, IMAGES_COLLECTION, imageId);
  const imageData: Omit<StoredImage, "id"> = {
    name,
    imageUrl: uploaded.imageUrl,
    fileId: uploaded.imageId,
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
      fileId: data.fileId,
      contentType: data.contentType,
      size: data.size,
      createdAt: data.createdAt,
      usedBy: data.usedBy || [],
    } as StoredImage;
  });
}

/**
 * Delete image from Image Manager and the file store
 */
export async function deleteImageFromManager(imageId: string, fileId?: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  // Delete the stored bytes (best-effort; legacy docs may not have a fileId)
  if (fileId) {
    try {
      await fetch(`/api/files/${fileId}`, { method: "DELETE" });
    } catch (e) {
      console.error("Failed to delete image file:", e);
    }
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
