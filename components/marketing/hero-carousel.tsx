"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getHeroSlides } from "@/lib/firebase-hero";
import { getHomePageSettings } from "@/lib/firebase-home-settings";

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

// Default slides - in production these come from the hero_slides collection.
// These LIFT defaults keep the homepage working on an empty project.
const defaultSlides: HeroSlide[] = [
  {
    id: "lift-welcome",
    badge: "MBDA-Funded · No-Cost Program",
    headline: "No-Cost Support for",
    highlightedText: "Rural Louisiana Business",
    subheadline:
      "The Southern University MBDA LIFT Rural Business Center helps rural small businesses strengthen operations, prepare for capital, and compete for contracts — funded in part by a $1.275M U.S. Department of Commerce MBDA cooperative agreement.",
    benefits: ["Technical Assistance", "Training & Workshops", "Contracting Readiness"],
    primaryCta: { text: "Start the Intake Interview", href: "/sign-up" },
    secondaryCta: { text: "About the Center", href: "/about" },
    isPublished: true,
    order: 1,
    backgroundImage:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80",
    backgroundOverlay: true,
  },
  {
    id: "lift-contracting",
    badge: "Government Contracting Readiness",
    headline: "Compete for",
    highlightedText: "Government Contracts",
    subheadline:
      "Get help with SAM.gov registration, capability statements, and proposal development so your rural business is ready to pursue public-sector opportunities.",
    benefits: ["SAM.gov Guidance", "Proposal Support", "Supplier Development"],
    primaryCta: { text: "See Opportunities", href: "/opportunities" },
    secondaryCta: { text: "", href: "" },
    isPublished: true,
    order: 2,
    backgroundImage:
      "https://images.unsplash.com/photo-1617581629397-a72507c3de9e?auto=format&fit=crop&w=1920&q=80",
    backgroundOverlay: true,
  },
  {
    id: "lift-capital",
    badge: "Capital & Financing Readiness",
    headline: "Prepare for",
    highlightedText: "Capital & Growth",
    subheadline:
      "Work with an advisor on financial statements, loan packaging, and lender connections — so when capital is within reach, your business is ready for it.",
    benefits: ["Capital Readiness Review", "Loan Packaging", "Lender Connections"],
    primaryCta: { text: "Start the Intake Interview", href: "/sign-up" },
    secondaryCta: { text: "", href: "" },
    isPublished: true,
    order: 3,
    backgroundImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=80",
    backgroundOverlay: true,
  },
  {
    id: "lift-workshops",
    badge: "Training & Workshops",
    headline: "Learn at",
    highlightedText: "No-Cost Workshops",
    subheadline:
      "Hands-on workshops and virtual training on business planning, marketing, financing, and government contracting — built for rural business owners.",
    benefits: ["Business Workshops", "Virtual Training", "Expert-Led Sessions"],
    primaryCta: { text: "Browse Events", href: "/events" },
    secondaryCta: { text: "", href: "" },
    isPublished: true,
    order: 4,
    backgroundImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80",
    backgroundOverlay: true,
  },
  {
    id: "lift-manufacturing",
    badge: "Advanced Manufacturing Initiative",
    headline: "Advanced",
    highlightedText: "Manufacturing Support",
    subheadline:
      "Through the center's metal additive manufacturing lab, rural manufacturers get hands-on support making, repairing, and testing parts for agriculture, energy, and defense supply chains.",
    benefits: ["Metal Additive Manufacturing", "Supply Chain Integration", "Hands-On Program"],
    primaryCta: { text: "Join the Program", href: "/sign-up" },
    secondaryCta: { text: "", href: "" },
    isPublished: true,
    order: 5,
    backgroundImage:
      "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1920&q=80",
    backgroundOverlay: true,
  },
];

interface HeroCarouselProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}

// Hero CTA Button
function HeroCtaButton({ slide }: { slide: HeroSlide }) {
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

      if (imagesToPreload.length > 0 && typeof window !== 'undefined') {
        Promise.all(
          imagesToPreload.map(src => {
            return new Promise((resolve) => {
              const img = document.createElement('img');
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
      
      if (firebaseSlides.length > 0) {
        // Filter out any HUBZone slides from Firebase data
        const filtered = firebaseSlides.filter(s => s.id !== "press-release-hubzone");
        setSlides(filtered.length > 0 ? filtered : defaultSlides);
      } else {
        // No Firebase slides, use defaults
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
    (currentSlide.backgroundImage && currentSlide.backgroundImage.trim().length > 0 
      ? currentSlide.backgroundImage 
      : null) ||
    (resolvedBgImages[currentIndex % Object.keys(resolvedBgImages).length] && 
     resolvedBgImages[currentIndex % Object.keys(resolvedBgImages).length].trim().length > 0
      ? resolvedBgImages[currentIndex % Object.keys(resolvedBgImages).length]
      : null) ||
    null;

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
            <p className="text-sm text-white/80 mb-6">A federally funded center serving rural Louisiana</p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-white">$1.275M</span>
                <span className="text-xs text-white/70">MBDA Cooperative Agreement</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-white">1 of 3</span>
                <span className="text-xs text-white/70">HBCU Rural Centers Nationwide</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-white">No-Cost</span>
                <span className="text-xs text-white/70">Advising &amp; Training</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-white">2026–2029</span>
                <span className="text-xs text-white/70">Program Period</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-lg font-bold text-white">Southern</span>
                <span className="text-xs text-white/70">University &amp; A&amp;M College</span>
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
