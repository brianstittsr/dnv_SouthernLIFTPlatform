export interface StockImageResult {
  url: string;
  source: "unsplash" | "pexels";
  author?: string;
  description?: string;
}

interface DownloadedImage {
  base64: string;
  mimeType: string;
  size: number;
}

const FALLBACK_IMAGES: StockImageResult[] = [
  {
    url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&fit=crop&q=80",
    source: "unsplash",
    description: "Business team collaboration",
  },
  {
    url: "https://images.unsplash.com/photo-1504384308090-c54be3852d33?w=1200&fit=crop&q=80",
    source: "unsplash",
    description: "Modern manufacturing facility",
  },
  {
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&fit=crop&q=80",
    source: "unsplash",
    description: "Engineer working on machinery",
  },
  {
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&fit=crop&q=80",
    source: "unsplash",
    description: "Data dashboard and analytics",
  },
  {
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&fit=crop&q=80",
    source: "unsplash",
    description: "Business strategy meeting",
  },
  {
    url: "https://images.unsplash.com/photo-1497215728101-856f4ea18874?w=1200&fit=crop&q=80",
    source: "unsplash",
    description: "Office workspace",
  },
];

function chooseFallback(keyword: string): StockImageResult {
  // Deterministic but varied selection based on keyword
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) {
    hash = (hash << 5) - hash + keyword.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[index];
}

/**
 * Search Pexels or Unsplash for a stock image matching the keyword.
 * Falls back to a curated list when API keys are not configured or calls fail.
 */
export async function searchStockImage(keyword: string): Promise<StockImageResult> {
  const pexelsKey = process.env.PEXELS_API_KEY;
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  if (pexelsKey) {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          keyword
        )}&per_page=5&orientation=landscape`,
        {
          headers: { Authorization: pexelsKey },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (response.ok) {
        const data = (await response.json()) as {
          photos?: Array<{
            src?: { landscape?: string; large?: string; large2x?: string };
            photographer?: string;
            alt?: string;
          }>;
        };
        const photo = data.photos?.[0];
        const src = photo?.src;
        const url =
          src?.landscape || src?.large2x || src?.large;
        if (url) {
          return {
            url,
            source: "pexels",
            author: photo?.photographer,
            description: photo?.alt,
          };
        }
      }
    } catch (error) {
      console.warn("Pexels search failed, trying fallback:", error);
    }
  }

  if (unsplashKey) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          keyword
        )}&per_page=5&orientation=landscape`,
        {
          headers: { Authorization: `Client-ID ${unsplashKey}` },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (response.ok) {
        const data = (await response.json()) as {
          results?: Array<{
            urls?: { regular?: string; small?: string };
            user?: { name?: string };
            alt_description?: string;
            description?: string;
          }>;
        };
        const result = data.results?.[0];
        const url = result?.urls?.regular;
        if (url) {
          return {
            url,
            source: "unsplash",
            author: result?.user?.name,
            description: result?.description || result?.alt_description,
          };
        }
      }
    } catch (error) {
      console.warn("Unsplash search failed, using fallback:", error);
    }
  }

  return chooseFallback(keyword);
}

/**
 * Download an image and return it as a base64-encoded data string.
 */
export async function downloadImageAsBase64(
  imageUrl: string
): Promise<DownloadedImage> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to download image: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType =
      response.headers.get("content-type") || "image/jpeg";

    return {
      base64: buffer.toString("base64"),
      mimeType,
      size: buffer.length,
    };
  } finally {
    clearTimeout(timeout);
  }
}
