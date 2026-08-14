/**
 * Client-side image resizing utilities.
 */

export interface ResizeImageOptions {
  maxDimension: number;
  maxBytes: number;
  outputType?: "image/jpeg" | "image/png";
  initialQuality?: number;
  minQuality?: number;
  qualityStep?: number;
}

export function resizeImage(file: File, options: ResizeImageOptions): Promise<string> {
  const {
    maxDimension,
    maxBytes,
    outputType = "image/jpeg",
    initialQuality = 0.92,
    minQuality = 0.3,
    qualityStep = 0.1,
  } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select an image file"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(maxDimension / width, maxDimension / height, 1);
        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = initialQuality;
        let dataUrl = canvas.toDataURL(outputType, quality);
        while (dataUrl.length * 0.75 > maxBytes && quality > minQuality) {
          quality -= qualityStep;
          dataUrl = canvas.toDataURL(outputType, quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}
