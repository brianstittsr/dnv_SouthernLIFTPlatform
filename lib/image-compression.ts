/**
 * Image Compression Utility
 * Compresses images to under 1MB and converts to base64 for Firebase storage
 */

export interface CompressedImage {
  base64Data: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
}

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  maintainAspectRatio?: boolean;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1200,
  quality: 0.85,
  maintainAspectRatio: true,
};

/**
 * Compress an image file to under specified size and convert to base64
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const compressed = compressImageElement(img, file.type, opts);
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an image element and return base64 data
 */
function compressImageElement(
  img: HTMLImageElement,
  mimeType: string,
  options: CompressionOptions
): CompressedImage {
  const { maxWidthOrHeight, quality, maintainAspectRatio } = options;
  
  let width = img.width;
  let height = img.height;
  
  // Calculate new dimensions while maintaining aspect ratio
  if (maxWidthOrHeight && (width > maxWidthOrHeight || height > maxWidthOrHeight)) {
    if (maintainAspectRatio) {
      if (width > height) {
        height = (height / width) * maxWidthOrHeight;
        width = maxWidthOrHeight;
      } else {
        width = (width / height) * maxWidthOrHeight;
        height = maxWidthOrHeight;
      }
    } else {
      width = Math.min(width, maxWidthOrHeight);
      height = Math.min(height, maxWidthOrHeight);
    }
  }
  
  // Create canvas and draw resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Use better image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw image
  ctx.drawImage(img, 0, 0, width, height);
  
  // Convert to base64 with quality setting
  const base64 = canvas.toDataURL(mimeType, quality);
  
  // Extract base64 data without data URL prefix
  const base64Data = base64.split(',')[1];
  
  // Calculate size in bytes
  const size = Math.ceil((base64Data.length * 3) / 4);
  
  // If still too large, reduce quality further
  if (options.maxSizeMB && size > options.maxSizeMB * 1024 * 1024) {
    const newQuality = Math.max(0.5, (quality || 0.85) - 0.1);
    return compressImageElement(img, mimeType, { ...options, quality: newQuality });
  }
  
  return {
    base64Data,
    mimeType,
    width: Math.round(width),
    height: Math.round(height),
    size,
  };
}

/**
 * Convert base64 to data URL for display
 */
export function base64ToDataUrl(base64Data: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64Data}`;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
    };
  }
  
  // Check file size (max 10MB before compression)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File is too large. Please upload an image smaller than 10MB.',
    };
  }
  
  return { valid: true };
}

/**
 * Compress image for profile photo (circular display)
 * Uses square crop to prevent stretching in circular avatars
 */
export async function compressProfilePhoto(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const compressed = compressProfilePhotoElement(img, file.type);
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Compress profile photo with square crop
 */
function compressProfilePhotoElement(
  img: HTMLImageElement,
  mimeType: string
): CompressedImage {
  const targetSize = 400; // Square size for profile photos
  const quality = 0.85;
  
  // Calculate crop dimensions (center square)
  const size = Math.min(img.width, img.height);
  const x = (img.width - size) / 2;
  const y = (img.height - size) / 2;
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Use better image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw cropped and resized image
  ctx.drawImage(
    img,
    x, y, size, size, // Source crop
    0, 0, targetSize, targetSize // Destination
  );
  
  // Convert to base64
  let base64 = canvas.toDataURL(mimeType, quality);
  let base64Data = base64.split(',')[1];
  let size_bytes = Math.ceil((base64Data.length * 3) / 4);
  
  // If still too large, reduce quality
  let currentQuality = quality;
  while (size_bytes > 1024 * 1024 && currentQuality > 0.5) {
    currentQuality -= 0.1;
    base64 = canvas.toDataURL(mimeType, currentQuality);
    base64Data = base64.split(',')[1];
    size_bytes = Math.ceil((base64Data.length * 3) / 4);
  }
  
  return {
    base64Data,
    mimeType,
    width: targetSize,
    height: targetSize,
    size: size_bytes,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
