/**
 * Hero background image helpers.
 * Image bytes are stored as base64 chunks in Firestore (fileBlobs) and
 * served from /api/files/{id} — no Firebase Storage required.
 */

const HERO_CATEGORY = "hero-backgrounds";

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
 * Upload hero background image through the server route.
 * The server stores it as base64 chunks in Firestore and returns an
 * /api/files/{id} URL.
 */
export async function uploadHeroBackground(
  file: File,
  name?: string
): Promise<OptimizedHeroImage> {
  // Compress image before upload
  const compressedBlob = await compressImageForWeb(file, 1920, 0.85);
  const fileName = name || file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

  const formData = new FormData();
  formData.append("file", new File([compressedBlob], fileName, { type: "image/jpeg" }));
  formData.append("category", HERO_CATEGORY);

  const response = await fetch("/api/upload-image", { method: "POST", body: formData });
  if (!response.ok) throw new Error("Hero background upload failed");

  const data = (await response.json()) as { imageId?: string; imageUrl?: string };
  if (!data.imageId || !data.imageUrl) throw new Error("Hero background upload returned no id");

  return {
    id: data.imageId,
    name: fileName,
    url: data.imageUrl,
    path: data.imageId,
    size: compressedBlob.size,
    contentType: "image/jpeg",
    uploadedAt: new Date(),
  };
}

/**
 * Get optimized hero background image URL
 */
export function getOptimizedHeroUrl(
  imageUrl: string,
  width: number = 1920
): string {
  return imageUrl;
}

/**
 * Delete hero background by its fileBlobs id or /api/files/{id} URL
 */
export async function deleteHeroBackground(fileIdOrUrl: string): Promise<void> {
  const match = fileIdOrUrl.match(/\/api\/files\/([^/?#]+)/);
  const fileId = match ? match[1] : fileIdOrUrl;
  const response = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete hero background");
  }
}

/**
 * List all hero background images (from the hero_images metadata collection)
 */
export async function listHeroBackgrounds(): Promise<OptimizedHeroImage[]> {
  const response = await fetch("/api/hero-backgrounds");
  if (!response.ok) throw new Error("Failed to list hero backgrounds");

  const data = (await response.json()) as {
    images?: { id: string; url: string; name?: string }[];
  };

  return (data.images || []).map((img) => ({
    id: img.id,
    name: img.name || img.id,
    url: img.url,
    path: img.id,
    size: 0,
    contentType: "image/jpeg",
    uploadedAt: new Date(0),
  }));
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
