"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getHeroSlides } from "@/lib/firebase-hero";
import { listHeroBackgrounds, preloadImage } from "@/lib/firebase-hero-storage";
import { getHomePageSettings } from "@/lib/firebase-home-settings";
import { toast } from "sonner";
import { useCartStore } from "@/lib/stores/cart-store";
import { PRODUCTS } from "@/lib/types/cart";
import { useRouter } from "next/navigation";

export interface HeroSlide {
  id: string;
  badge: string;
  headline: string;
  middleLine?: string; // Optional 3rd line between headline and highlightedText
  highlightedText: string;
  subheadline: string;
  benefits: string[];
  primaryCta: {
    text: string;
    href: string;
    action?: "add-to-cart" | "link";
    productId?: string;
  };
  secondaryCta: {
    text: string;
    href: string;
  };
  isPublished: boolean;
  order: number;
  // Background options
  backgroundType?: "animated" | "image";
  backgroundImage?: string;
  backgroundOverlay?: boolean;
  backgroundOverlayOpacity?: number; // 0-100
  // Appearance toggles
  fullScreenBg?: boolean;
  showRibbon?: boolean;
  ribbonColor?: "light" | "dark";
  showWaves?: boolean;
  highlightOnSecondLine?: boolean;
}

// Default slides - in production these would come from a database
const STORAGE_KEY = "hero-slides";

// Default slides fallback
const defaultSlides: HeroSlide[] = [
  {
    id: "launch-2026",
    badge: "🚀 WORLD DEBUT // PLATFORM LAUNCH",
    headline: "KDM Consortium",
    middleLine: "Digital Platform",
    highlightedText: "May 6, 2026",
    subheadline: "Join the free virtual launch event during National Small Business Week. The nation's first dual-sided platform connecting SMBs & manufacturers with Federal agencies, Prime contractors, and OEMs.",
    benefits: ["Free Virtual Event", "May 6, 2026 at 11:30 AM ET", "Open to All SMBs & Manufacturers"],
    primaryCta: { text: "Learn More", href: "/kdm-launch" },
    secondaryCta: { text: "Join Event", href: "https://streamyard.com/watch/fJCre6Qg7neQ" },
    isPublished: true,
    order: 0,
    backgroundType: "image",
    backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
    backgroundOverlay: true,
    backgroundOverlayOpacity: 70,
    showWaves: false,
  },
  {
    id: "0",
    badge: "Strategic Partnership Announcement",
    headline: "KDM & Associates",
    middleLine: "&",
    highlightedText: "Strategic Value+",
    subheadline: "Two industry leaders unite to deliver unparalleled support for small businesses. Together, we combine operational excellence with government contracting expertise to accelerate your success.",
    benefits: ["Combined Expertise", "Expanded Resources", "Accelerated Growth"],
    primaryCta: { text: "Discover the Partnership", href: "/about" },
    secondaryCta: { text: "Get Started", href: "/contact" },
    isPublished: true,
    order: 1,
  },
  {
    id: "1",
    badge: "MBDA Federal Procurement Center",
    headline: "Powering Growth for",
    highlightedText: "Diverse Businesses",
    subheadline: "KDM & Associates focuses on best practices in government contracting. We call it \"What Works\" because it drives greater success for Small Businesses.",
    benefits: ["Federal Contract Opportunities", "Strategic Teaming", "Government Introductions"],
    primaryCta: { text: "Schedule Introductory Session", href: "/contact" },
    secondaryCta: { text: "Learn More", href: "/about" },
    isPublished: true,
    order: 2,
  },
  {
    id: "2",
    badge: "Government Contracting Services",
    headline: "Build, Grow &",
    highlightedText: "Scale",
    subheadline: "We help small businesses navigate the government procurement process and win government contracts through strategic teaming and capacity building.",
    benefits: ["8(a) & WOSB Guidance", "Mentor-Protégé Programs", "SBA Certifications"],
    primaryCta: { text: "Get Started", href: "/contact" },
    secondaryCta: { text: "View Services", href: "/services" },
    isPublished: true,
    order: 3,
  },
];

interface HeroCarouselProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}

// Hero CTA Button Component with Cart Support
function HeroCtaButton({ slide }: { slide: HeroSlide }) {
  const { addItem } = useCartStore();
  const router = useRouter();

  const handleClick = () => {
    if (slide.primaryCta.action === "add-to-cart" && slide.primaryCta.productId) {
      const product = PRODUCTS[slide.primaryCta.productId as keyof typeof PRODUCTS];
      if (product) {
        addItem(product, 1);
        toast.success(`${product.name} added to cart!`);
        router.push("/checkout-cart");
      }
    }
  };

  if (slide.primaryCta.action === "add-to-cart") {
    return (
      <Button size="lg" className="text-lg px-8" onClick={handleClick}>
        <ShoppingCart className="mr-2 h-5 w-5" />
        {slide.primaryCta.text}
      </Button>
    );
  }

  return (
    <Button size="lg" className="text-lg px-8" asChild>
      <Link href={slide.primaryCta.href}>
        {slide.primaryCta.text}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>
  );
}

// Add gradient animation styles
const gradientAnimationStyles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 15s ease infinite;
  }
`;

export function HeroCarousel({ slides: propSlides, autoPlayInterval = 6000 }: HeroCarouselProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(propSlides || defaultSlides);
  const [isLoading, setIsLoading] = useState(!propSlides);
  const [storageImages, setStorageImages] = useState<{id: string, url: string}[]>([]);
  const [resolvedBgImages, setResolvedBgImages] = useState<Record<number, string>>({});
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [configuredSpeed, setConfiguredSpeed] = useState(autoPlayInterval);

  // Load slides and gallery images from Firebase on mount
  useEffect(() => {
    if (!propSlides) {
      loadSlidesFromFirebase();
    }
    loadGalleryImages();
    loadSettings();
  }, [propSlides]);

  const loadSettings = async () => {
    try {
      const settings = await getHomePageSettings();
      setConfiguredSpeed(settings.heroSliderSpeed);
    } catch (error) {
      console.error("Failed to load home page settings:", error);
      setConfiguredSpeed(autoPlayInterval);
    }
  };

  // Preload all background images to prevent layout shift
  useEffect(() => {
    if (Object.keys(resolvedBgImages).length > 0 || slides.some(s => s.backgroundImage)) {
      setIsImageLoading(true);
      const imagesToPreload = slides
        .filter(s => s.backgroundImage || resolvedBgImages[slides.indexOf(s)])
        .map(s => s.backgroundImage || resolvedBgImages[slides.indexOf(s)])
        .filter(Boolean);

      if (imagesToPreload.length > 0) {
        Promise.all(
          imagesToPreload.map(src => {
            return new Promise((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
              img.src = src!;
            });
          })
        ).then(() => {
          setImagesPreloaded(true);
          setIsImageLoading(false);
        });
      } else {
        setImagesPreloaded(true);
        setIsImageLoading(false);
      }
    } else {
      setIsImageLoading(false);
    }
  }, [slides, resolvedBgImages]);

  const loadGalleryImages = async () => {
    try {
      // Use server-side API to avoid CORS issues with Firebase Storage
      const response = await fetch('/api/hero-backgrounds');
      if (!response.ok) {
        throw new Error('Failed to fetch hero backgrounds');
      }
      
      const data = await response.json();
      const images = data.images || [];
      setStorageImages(images.map((img: any) => ({ id: img.id, url: img.url })));
      
      // Create index mapping for slides
      const dataUrls: Record<number, string> = {};
      images.forEach((img: any, i: number) => {
        dataUrls[i] = img.url;
      });
      setResolvedBgImages(dataUrls);
    } catch (error) {
      console.error("Failed to load gallery images:", error);
    }
  };

  const loadSlidesFromFirebase = async () => {
    try {
      setIsLoading(true);
      // Add cache buster to ensure fresh data
      const timestamp = Date.now();
      sessionStorage.setItem("hero_slides_timestamp", timestamp.toString());
      
      const firebaseSlides = await getHeroSlides();
      // If no slides in Firebase, use default slides
      if (firebaseSlides.length > 0) {
        setSlides(firebaseSlides);
      } else {
        setSlides(defaultSlides);
      }
    } catch (error) {
      console.error("Failed to load slides from Firebase:", error);
      // Fallback to default slides
      setSlides(defaultSlides);
    } finally {
      setIsLoading(false);
    }
  };

  const publishedSlides = slides.filter(s => s.isPublished).sort((a, b) => a.order - b.order);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % publishedSlides.length);
  }, [publishedSlides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + publishedSlides.length) % publishedSlides.length);
  }, [publishedSlides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || publishedSlides.length <= 1) return;
    
    const interval = setInterval(goToNext, configuredSpeed);
    return () => clearInterval(interval);
  }, [isAutoPlaying, configuredSpeed, goToNext, publishedSlides.length]);

  if (publishedSlides.length === 0) {
    return null;
  }

  const currentSlide = publishedSlides[currentIndex];

  // Resolve background image: use slide's own image, or pull from gallery by index
  const resolvedBgImage =
    currentSlide.backgroundImage ||
    resolvedBgImages[currentIndex % Object.keys(resolvedBgImages).length];

  return (
    <>
      <style>{gradientAnimationStyles}</style>
      <section className="relative overflow-hidden text-white min-h-[600px]">
        
        {/* Animated Gradient Background - always visible as base layer */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-gradient" />
        
        {/* Loading Skeleton - shown while images are loading */}
        {(isImageLoading || !imagesPreloaded) && resolvedBgImage && (
          <div className="absolute inset-0 z-5 animate-pulse bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
        
        {/* Background Image - from slide config or Image Manager gallery */}
        {resolvedBgImage && (
          <>
            <div 
              className={`absolute inset-0 z-10 transition-opacity duration-700 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`} 
              key={`bg-${currentSlide.id}`}
            >
              <Image
                src={resolvedBgImage}
                alt=""
                fill
                className="object-cover"
                priority
                sizes="100vw"
                quality={85}
              />
            </div>
            {/* Overlay for text readability */}
            <div 
              className={`absolute inset-0 z-20 bg-black/70 transition-opacity duration-500 ${isImageLoading ? 'opacity-0' : ''}`}
            />
          </>
        )}
      
      <div
        className="relative z-30 py-20 md:py-32 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          {/* Slide Content with Fade Animation */}
          <div key={currentSlide.id} className="animate-in fade-in duration-500">
            {/* Badge */}
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              {currentSlide.badge}
            </Badge>

            {/* Headline */}
            <h1 className={cn(
              "text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl whitespace-pre-line",
              (currentSlide.highlightOnSecondLine || currentSlide.middleLine) && "flex flex-col items-center"
            )}>
              {currentSlide.headline}
              {currentSlide.middleLine ? (
                <>
                  <span className="text-primary" style={{ textShadow: '0 0 4px white, 0 0 8px white, 0 0 12px white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>{currentSlide.middleLine}</span>
                  <span className="text-primary" style={{ textShadow: '0 0 4px white, 0 0 8px white, 0 0 12px white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>{currentSlide.highlightedText}</span>
                </>
              ) : currentSlide.highlightOnSecondLine ? (
                <span className="text-primary" style={{ textShadow: '0 0 4px white, 0 0 8px white, 0 0 12px white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>{currentSlide.highlightedText}</span>
              ) : (
                <> <span className="text-primary" style={{ textShadow: '0 0 4px white, 0 0 8px white, 0 0 12px white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>{currentSlide.highlightedText}</span></>
              )}
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg text-white/90 md:text-xl max-w-2xl mx-auto">
              {currentSlide.subheadline}
            </p>

            {/* Key Benefits */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
              {currentSlide.benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <HeroCtaButton slide={currentSlide} />
            </div>
          </div>

          {/* Carousel Navigation */}
          {publishedSlides.length > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              {/* Prev Button */}
              <button
                onClick={() => { goToPrev(); setIsAutoPlaying(false); }}
                className="p-2 rounded-full bg-gray-800/10 hover:bg-gray-800/20 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {publishedSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-300",
                      index === currentIndex
                        ? "bg-primary w-8"
                        : "bg-gray-400 hover:bg-gray-500"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => { goToNext(); setIsAutoPlaying(false); }}
                className="p-2 rounded-full bg-gray-800/10 hover:bg-gray-800/20 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-white/30">
            <p className="text-sm text-white/80 mb-6">Our Performance - Built on a track record of &quot;What Works&quot;</p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-white">475</span>
                <span className="text-xs text-white/70">Clients</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-white">14+</span>
                <span className="text-xs text-white/70">Shared Outcome Agreements</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-white">$50B+</span>
                <span className="text-xs text-white/70">Contract Transactions</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-white">30+</span>
                <span className="text-xs text-white/70">Resource Partners</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-white">MBDA</span>
                <span className="text-xs text-white/70">Federal Procurement Center</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
    </>
  );
}
