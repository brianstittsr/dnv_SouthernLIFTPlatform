"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { HeroSlide, defaultHeroSlides } from "@/lib/consortium-config";

export function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  useEffect(() => {
    const loadSlides = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }

      try {
        const slidesQuery = query(
          collection(db, "consortiumHeroSlides"),
          where("isActive", "==", true),
          orderBy("order", "asc")
        );
        const snapshot = await getDocs(slidesQuery);
        
        if (!snapshot.empty) {
          const loadedSlides = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as HeroSlide[];
          setSlides(loadedSlides);
        }
      } catch (error) {
        console.error("Error loading hero slides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSlides();
  }, []);

  useEffect(() => {
    const preloadImages = () => {
      slides.forEach((slide) => {
        if (slide.backgroundImage) {
          const img = document.createElement('img');
          img.src = slide.backgroundImage;
        }
      });
      setImagesPreloaded(true);
    };

    if (slides.length > 0) {
      preloadImages();
    }
  }, [slides]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;

    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide, slides.length]);

  if (isLoading) {
    return (
      <section className="relative min-h-[600px] bg-[#1e3a5f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <section 
      className={cn(
        "relative min-h-[600px] flex items-center overflow-hidden transition-all duration-700",
        currentSlide.backgroundImage ? "" : currentSlide.backgroundColor
      )}
      style={currentSlide.backgroundImage ? {
        backgroundImage: `url(${currentSlide.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } : undefined}
    >
      {currentSlide.backgroundImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      <div className="container relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Image
              src="/KDM_Consortium_Logo.png"
              alt="KDM Consortium"
              width={540}
              height={540}
              className="mx-auto mb-6"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </div>

          <p className={cn(
            "text-lg font-medium mb-2 tracking-wide uppercase",
            currentSlide.textColor === "light" ? "text-white/80" : "text-gray-700"
          )}>
            {currentSlide.subtitle}
          </p>

          <h1 className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight min-h-[8rem] md:min-h-[10rem] lg:min-h-[12rem] flex items-center justify-center",
            currentSlide.textColor === "light" ? "text-white" : "text-gray-900"
          )}>
            {currentSlide.title}
          </h1>

          <p className={cn(
            "text-lg md:text-xl mb-8 max-w-2xl mx-auto",
            currentSlide.textColor === "light" ? "text-white/90" : "text-gray-700"
          )}>
            {currentSlide.description}
          </p>

          <Button
            size="lg"
            asChild
            className={cn(
              "text-lg px-8 py-6",
              currentSlide.textColor === "light" 
                ? "bg-white text-[#1e3a5f] hover:bg-white/90" 
                : "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
            )}
          >
            <Link href={currentSlide.ctaLink}>
              {currentSlide.ctaText}
            </Link>
          </Button>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className={cn(
              "h-6 w-6",
              currentSlide.textColor === "light" ? "text-white" : "text-gray-900"
            )} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-20"
            aria-label="Next slide"
          >
            <ChevronRight className={cn(
              "h-6 w-6",
              currentSlide.textColor === "light" ? "text-white" : "text-gray-900"
            )} />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    index === currentIndex
                      ? currentSlide.textColor === "light" ? "bg-white scale-125" : "bg-gray-900 scale-125"
                      : currentSlide.textColor === "light" ? "bg-white/50 hover:bg-white/70" : "bg-gray-900/50 hover:bg-gray-900/70"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
            >
              {isPlaying ? (
                <Pause className={cn(
                  "h-4 w-4",
                  currentSlide.textColor === "light" ? "text-white" : "text-gray-900"
                )} />
              ) : (
                <Play className={cn(
                  "h-4 w-4",
                  currentSlide.textColor === "light" ? "text-white" : "text-gray-900"
                )} />
              )}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
