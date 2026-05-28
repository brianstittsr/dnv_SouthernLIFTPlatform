/**
 * Carousel Configuration
 * Central configuration for hero carousel behavior
 */

export interface CarouselConfig {
  enabled: boolean;
  autoPlay: boolean;
  interval: number;
  showDots: boolean;
  showArrows: boolean;
  maxSlides: number;
  featuredOnly: boolean;
}

export const defaultCarouselConfig: CarouselConfig = {
  enabled: false, // Currently disabled - set to true to enable
  autoPlay: true,
  interval: 5000,
  showDots: true,
  showArrows: true,
  maxSlides: 5,
  featuredOnly: true
};

/**
 * Get carousel configuration
 * Can be extended to fetch from environment variables or CMS
 */
export function getCarouselConfig(): CarouselConfig {
  return defaultCarouselConfig;
}

/**
 * Update carousel configuration
 * Can be used for admin panel integration
 */
export function updateCarouselConfig(updates: Partial<CarouselConfig>): CarouselConfig {
  return {
    ...defaultCarouselConfig,
    ...updates
  };
}
