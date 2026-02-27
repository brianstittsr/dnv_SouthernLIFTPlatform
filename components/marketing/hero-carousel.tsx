"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getHeroSlides } from "@/lib/firebase-hero";
import { listImages, getImageDataUrl, type ImageMetadata } from "@/lib/firebase-images";
import { toast } from "sonner";

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
  };
  secondaryCta: {
    text: string;
    href: string;
  };
  isPublished: boolean;
  order: nuemerging businessr;
  // Background options
  backgroundType?: "animated" | "image";
  backgroundImage?: string;
  backgroundOverlay?: boolean;
  backgroundOverlayOpacity?: nuemerging businessr; // 0-100
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
    id: "0",
    badge: "Strategic Partnership Announcement",
    headline: "KDM & Associates",
    middleLine: "&",
    highlightedText: "Strategic Value+",
    subheadline: "Two industry leaders unite to deliver unparalleled support for small emerging businesses. Together, we combine operational excellence with government contracting expertise to accelerate your success.",
    benefits: ["Combined Expertise", "Expanded Resources", "Accelerated Growth"],
    primaryCta: { text: "Discover the Partnership", href: "/about" },
    secondaryCta: { text: "Get Started", href: "/contact" },
    isPublished: true,
    order: 0,
  },
  {
    id: "1",
    badge: "MBDA Federal Procurement Center",
    headline: "Powering Growth for",
    highlightedText: "Emerging Businesses",
    subheadline: "KDM & Associates focuses on best practices in government contracting. We call it \"What Works\" because it drives greater success for Small Businesses.",
    benefits: ["Federal Contract Opportunities", "Strategic Teaming", "Government Introductions"],
    primaryCta: { text: "Schedule Introductory Session", href: "/contact" },
    secondaryCta: { text: "Learn More", href: "/about" },
    isPublished: true,
    order: 1,
  },
  {
    id: "2",
    badge: "Government Contracting Services",
    headline: "Build, Grow &",
    highlightedText: "Scale",
    subheadline: "We help small emerging businesses navigate the government procurement process and win government contracts through strategic teaming and capacity building.",
    benefits: ["8(a) & WOSB Guidance", "Mentor-Protégé Programs", "SBA Certifications"],
    primaryCta: { text: "Get Started", href: "/contact" },
    secondaryCta: { text: "View Services", href: "/services" },
    isPublished: true,
    order: 2,
  },
];

interface HeroCarouselProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}

export function HeroCarousel({ slides: propSlides, autoPlayInterval = 6000 }: HeroCarouselProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(propSlides || defaultSlides);
  const [isLoading, setIsLoading] = useState(!propSlides);
  const [galleryImages, setGalleryImages] = useState<ImageMetadata[]>([]);
  const [resolvedBgImages, setResolvedBgImages] = useState<Record<number, string>>({});
  const [contentVisible, setContentVisible] = useState(false);

  // Load slides and gallery images from Firebase on mount
  useEffect(() => {
    if (!propSlides) {
      loadSlidesFromFirebase();
    }
    loadGalleryImages();
    // Delay content fade-in slightly so background renders first
    const t = setTimeout(() => setContentVisible(true), 120);
    return () => clearTimeout(t);
  }, [propSlides]);

  const loadGalleryImages = async () => {
    try {
      const images = await listImages("hero");
      setGalleryImages(images);
      // Pre-load base64 data URLs for each image
      const dataUrls: Record<number, string> = {};
      for (let i = 0; i < images.length; i++) {
        const dataUrl = await getImageDataUrl(images[i].id);
        if (dataUrl) dataUrls[i] = dataUrl;
      }
      setResolvedBgImages(dataUrls);
    } catch (error) {
      console.error("Failed to load gallery images:", error);
    }
  };

  const loadSlidesFromFirebase = async () => {
    try {
      setIsLoading(true);
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
    
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval, goToNext, publishedSlides.length]);

  if (publishedSlides.length === 0) {
    return null;
  }

  const currentSlide = publishedSlides[currentIndex];

  // Resolve background image: use slide's own image, or pull from gallery by index
  const resolvedBgImage =
    currentSlide.backgroundImage ||
    resolvedBgImages[currentIndex % Object.keys(resolvedBgImages).length];

  return (
    <section className="relative overflow-hidden text-white" style={{ backgroundColor: "#0f172a" }}>
      
      {/* Background Image - from slide config or Image Manager gallery */}
      {resolvedBgImage && (
        <>
          <div className="absolute inset-0 z-10" key={`bg-${currentSlide.id}`}>
            <Image
              src={resolvedBgImage}
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Overlay for text readability */}
          <div 
            className="absolute inset-0 z-20 bg-black"
            style={{ opacity: (currentSlide.backgroundOverlayOpacity ?? 50) / 100 }}
          />
        </>
      )}
      
      <div
        className="relative z-30 py-20 md:py-32 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        style={{ opacity: contentVisible ? 1 : 0, transition: "opacity 0.5s ease" }}
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
            <div className="mt-10 flex justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href={currentSlide.primaryCta.href}>
                  {currentSlide.primaryCta.text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
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
  );
}
