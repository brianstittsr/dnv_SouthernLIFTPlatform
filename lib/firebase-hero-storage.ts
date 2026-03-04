/**
 * Optimized Image Storage for Hero Backgrounds
 * Uses Firebase Storage for faster loading instead of Firestore base64
 */

import { storage } from "./firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from "firebase/storage";

const HERO_STORAGE_PATH = "hero-backgrounds";

export interface OptimizedHeroImage {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  contentType: string;
  width?: number;
  height?: number;
  uploadedAt: Date;
}

/**
 * Compress image for web use before upload
 */
export async function compressImageForWeb(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Use better quality settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload hero background image to Firebase Storage
 * Much faster than Firestore base64 for large images
 */
export async function uploadHeroBackground(
  file: File,
  name?: string
): Promise<OptimizedHeroImage> {
  if (!storage) throw new Error("Firebase Storage not initialized");

  // Compress image before upload
  const compressedBlob = await compressImageForWeb(file, 1920, 0.85);

  // Generate unique ID and path
  const imageId = crypto.randomUUID();
  const fileName = name || file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storagePath = `${HERO_STORAGE_PATH}/${imageId}_${fileName}`;

  // Upload to Firebase Storage
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, compressedBlob, {
    contentType: "image/jpeg",
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Get download URL
  const url = await getDownloadURL(storageRef);

  return {
    id: imageId,
    name: fileName,
    url,
    path: storagePath,
    size: compressedBlob.size,
    contentType: "image/jpeg",
    uploadedAt: new Date(),
  };
}

/**
 * Get optimized hero background image URL
 * Returns a properly sized CDN URL for fast loading
 */
export function getOptimizedHeroUrl(
  storageUrl: string,
  width: number = 1920
): string {
  // Firebase Storage URLs are already optimized via CDN
  // We can add resize parameters if using Firebase Extensions like "Resize Images"
  return storageUrl;
}

/**
 * Delete hero background from storage
 */
export async function deleteHeroBackground(path: string): Promise<void> {
  if (!storage) throw new Error("Firebase Storage not initialized");

  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * List all hero background images
 */
export async function listHeroBackgrounds(): Promise<OptimizedHeroImage[]> {
  if (!storage) throw new Error("Firebase Storage not initialized");

  const storageRef = ref(storage, HERO_STORAGE_PATH);
  const result = await listAll(storageRef);

  const images: OptimizedHeroImage[] = [];

  for (const item of result.items) {
    try {
      const [url, metadata] = await Promise.all([
        getDownloadURL(item),
        getMetadata(item),
      ]);

      // Extract ID from filename
      const id = item.name.split("_")[0];

      images.push({
        id,
        name: metadata.customMetadata?.originalName || item.name,
        url,
        path: item.fullPath,
        size: metadata.size,
        contentType: metadata.contentType || "image/jpeg",
        uploadedAt: new Date(metadata.updated || metadata.timeCreated),
      });
    } catch (error) {
      console.error("Failed to get image metadata:", error);
    }
  }

  return images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
}

/**
 * Preload image for instant display
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to preload image"));
    img.src = url;
  });
}

/**
 * Check if image is already cached
 */
export function isImageCached(url: string): boolean {
  const img = new Image();
  img.src = url;
  return img.complete;
}
