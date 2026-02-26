"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroSlide } from "@/lib/iaeoz-config";

interface IAEOZHeroCarouselProps {
  slides: HeroSlide[];
}

export function IAEOZHeroCarousel({ slides }: IAEOZHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

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

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <section
      className="relative min-h-[600px] flex items-center overflow-hidden transition-all duration-700"
      style={{
        backgroundImage: `url(${currentSlide.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="container relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg font-medium mb-2 tracking-wide uppercase text-emerald-300">
            {currentSlide.subtitle}
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white">
            {currentSlide.title}
          </h1>

          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90">
            {currentSlide.description}
          </p>

          <Button
            size="lg"
            asChild
            className="text-lg px-8 py-6 bg-emerald-600 text-white hover:bg-emerald-700"
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
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-white" />
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
                      ? "bg-emerald-400 scale-125"
                      : "bg-white/50 hover:bg-white/70"
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
                <Pause className="h-4 w-4 text-white" />
              ) : (
                <Play className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
