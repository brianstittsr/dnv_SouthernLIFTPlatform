/**
 * Firebase Images Library
 * Handles image storage in Firestore as base64-encoded data
 */

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

export const IMAGES_COLLECTION = "images";

export type ImageCategory = 
  | "hero"
  | "about"
  | "team"
  | "services"
  | "testimonials"
  | "logos"
  | "icons"
  | "backgrounds"
  | "marketing"
  | "portal"
  | "other";

export interface ImageDoc {
  id: string;
  name: string;
  description?: string;
  category: ImageCategory;
  mimeType: string;
  base64Data: string;
  width?: number;
  height?: number;
  size: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
  tags?: string[];
  isActive: boolean;
}

export interface ImageMetadata {
  id: string;
  name: string;
  description?: string;
  category: ImageCategory;
  mimeType: string;
  width?: number;
  height?: number;
  size: number;
  createdAt: Date;
  updatedAt?: Date;
  tags?: string[];
  isActive: boolean;
}

export interface ImageUploadOptions {
  name: string;
  description?: string;
  category: ImageCategory;
  tags?: string[];
  createdBy?: string;
}

export const SITE_IMAGE_KEYS = {
  ABOUT_ICY_WILLIAMS: "about-icy-williams",
  HERO_MAIN: "hero-main",
  LOGO_MAIN: "logo-main",
} as const;

const MAX_SIZE = 1024 * 1024; // 1MB

/**
 * Convert File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 to data URL for display
 */
export function base64ToDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Extract image dimensions
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compress image if needed - aggressively compresses to ensure base64 stays under 1MB
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  targetBase64Size: number = 900 * 1024 // 900KB to leave room for base64 encoding overhead
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Initial resize based on maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Iteratively compress until we hit target size
      let quality = 0.9;
      const tryCompress = (currentQuality: number) => {
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            // Convert to base64 to check actual size
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              const base64Size = base64.length;

              // If still too large and we can reduce quality further
              if (base64Size > targetBase64Size && currentQuality > 0.1) {
                tryCompress(currentQuality - 0.1);
              } 
              // If still too large even at lowest quality, reduce dimensions
              else if (base64Size > targetBase64Size) {
                const scaleFactor = 0.8;
                canvas.width = Math.floor(width * scaleFactor);
                canvas.height = Math.floor(height * scaleFactor);
                width = canvas.width;
                height = canvas.height;
                ctx.drawImage(img, 0, 0, width, height);
                tryCompress(0.8);
              } 
              // Success - size is acceptable
              else {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          currentQuality
        );
      };

      tryCompress(quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload image to Firestore with aggressive compression to ensure base64 stays under 1MB
 */
export async function uploadImage(
  file: File,
  options: ImageUploadOptions
): Promise<string | null> {
  try {
    if (!db) throw new Error("Firebase not initialized");

    // Always compress images to ensure they fit in Firestore
    // Target 900KB base64 size (leaves room for metadata)
    const processedFile = await compressImage(file, 1920, 900 * 1024);

    const base64Data = await fileToBase64(processedFile);
    
    // Final check - if base64 is still too large, reject
    const base64Size = base64Data.length;
    if (base64Size > 900 * 1024) {
      throw new Error("Image is too large even after compression. Please use a smaller image.");
    }

    const dimensions = await getImageDimensions(processedFile);

    const imageDoc: any = {
      name: options.name,
      category: options.category,
      mimeType: "image/jpeg",
      base64Data,
      width: dimensions.width,
      height: dimensions.height,
      size: processedFile.size,
      createdAt: Timestamp.now(),
      tags: options.tags || [],
      isActive: true,
    };

    // Only add optional fields if they have values
    if (options.description) {
      imageDoc.description = options.description;
    }
    if (options.createdBy) {
      imageDoc.createdBy = options.createdBy;
    }

    const docRef = await addDoc(collection(db, IMAGES_COLLECTION), imageDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * Get full image document
 */
export async function getImage(imageId: string): Promise<ImageDoc | null> {
  try {
    if (!db) throw new Error("Firebase not initialized");
    
    const docRef = doc(db, IMAGES_COLLECTION, imageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ImageDoc;
    }
    return null;
  } catch (error) {
    console.error("Error getting image:", error);
    return null;
  }
}

/**
 * Get image as data URL
 */
export async function getImageDataUrl(imageId: string): Promise<string | null> {
  const image = await getImage(imageId);
  if (image) {
    return base64ToDataUrl(image.base64Data, image.mimeType);
  }
  return null;
}

/**
 * List images (metadata only, without base64)
 */
export async function listImages(category?: ImageCategory): Promise<ImageMetadata[]> {
  try {
    if (!db) throw new Error("Firebase not initialized");
    
    const imagesRef = collection(db, IMAGES_COLLECTION);
    let q = query(
      imagesRef,
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );

    if (category) {
      q = query(
        imagesRef,
        where("isActive", "==", true),
        where("category", "==", category),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const images: ImageMetadata[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      images.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        category: data.category,
        mimeType: data.mimeType,
        width: data.width,
        height: data.height,
        size: data.size,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        tags: data.tags,
        isActive: data.isActive,
      });
    });

    return images;
  } catch (error) {
    console.error("Error listing images:", error);
    return [];
  }
}

/**
 * Update image metadata
 */
export async function updateImageMetadata(
  imageId: string,
  updates: Partial<Pick<ImageDoc, "name" | "description" | "category" | "tags" | "isActive">>
): Promise<boolean> {
  try {
    if (!db) throw new Error("Firebase not initialized");
    
    const docRef = doc(db, IMAGES_COLLECTION, imageId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating image metadata:", error);
    return false;
  }
}

/**
 * Delete image
 */
export async function deleteImage(imageId: string): Promise<boolean> {
  try {
    if (!db) throw new Error("Firebase not initialized");
    
    const docRef = doc(db, IMAGES_COLLECTION, imageId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

/**
 * Get images by category
 */
export async function getImagesByCategory(category: ImageCategory): Promise<ImageMetadata[]> {
  return listImages(category);
}

/**
 * Get image by name
 */
export async function getImageByName(
  name: string,
  category?: ImageCategory
): Promise<ImageDoc | null> {
  try {
    if (!db) throw new Error("Firebase not initialized");
    
    const imagesRef = collection(db, IMAGES_COLLECTION);
    let q = query(
      imagesRef,
      where("name", "==", name),
      where("isActive", "==", true)
    );

    if (category) {
      q = query(
        imagesRef,
        where("name", "==", name),
        where("category", "==", category),
        where("isActive", "==", true)
      );
    }

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as ImageDoc;
    }
    return null;
  } catch (error) {
    console.error("Error getting image by name:", error);
    return null;
  }
}

/**
 * Get site image by predefined key
 */
export async function getSiteImage(key: string): Promise<string | null> {
  const image = await getImageByName(key);
  if (image) {
    return base64ToDataUrl(image.base64Data, image.mimeType);
  }
  return null;
}
