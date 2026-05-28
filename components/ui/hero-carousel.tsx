'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface PressReleaseSlide {
  id: string;
  title: string;
  subtitle?: string;
  location: string;
  releaseDate: Date;
  category: string;
  slug: string;
  excerpt: string;
  imageUrl?: string;
  featured?: boolean;
}

interface HeroCarouselProps {
  slides: PressReleaseSlide[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  enabled?: boolean;
}

export function HeroCarousel({
  slides,
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showArrows = true,
  className = '',
  enabled = false
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter to only featured slides if available, otherwise use all slides
  const featuredSlides = slides.filter(slide => slide.featured);
  const displaySlides = featuredSlides.length > 0 ? featuredSlides : slides;

  useEffect(() => {
    if (!enabled || !autoPlay || isPaused || displaySlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === displaySlides.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [enabled, autoPlay, isPaused, interval, displaySlides.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displaySlides.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === displaySlides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!enabled || displaySlides.length === 0) {
    return null;
  }

  const currentSlide = displaySlides[currentIndex];

  return (
    <div 
      className={`relative w-full h-96 md:h-[500px] overflow-hidden rounded-lg ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
      
      {/* Slide content */}
      <div className="relative h-full z-20">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl text-white">
            {/* Category badge */}
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              {currentSlide.category}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            {currentSlide.subtitle && (
              <p className="text-lg md:text-xl mb-4 text-white/90 leading-relaxed">
                {currentSlide.subtitle}
              </p>
            )}

            {/* Excerpt */}
            <p className="text-base md:text-lg mb-6 text-white/80 leading-relaxed line-clamp-3">
              {currentSlide.excerpt}
            </p>

            {/* Meta information */}
            <div className="flex items-center gap-4 text-sm text-white/70 mb-6">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{currentSlide.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(currentSlide.releaseDate, 'MMMM d, yyyy')}</span>
              </div>
            </div>

            {/* Call to action */}
            <Button size="lg" className="bg-white text-black hover:bg-white/90">
              Read Full Press Release
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && displaySlides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {showDots && displaySlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Sample data for the press release carousel
export const samplePressReleaseSlides: PressReleaseSlide[] = [
  {
    id: '1',
    title: 'KDM Consortium and HUBZone Contractors National Council Launch A Whole of Government Team Approach',
    subtitle: 'Major strategic collaboration establishes centralized digital ecosystem platform to consolidate capabilities across the HUBZone community',
    location: 'ALEXANDRIA, Va.',
    releaseDate: new Date('2026-05-26'),
    category: 'Partnership',
    slug: 'kdm-consortium-hubzone-council-digital-ecosystem',
    excerpt: 'The KDM Consortium and the HUBZone Contractors National Council today announced a major strategic collaboration to launch A Whole of Government Team Approach. The initiative establishes a centralized digital ecosystem platform designed to consolidate capabilities, resources, and partnerships across the HUBZone community — significantly enhancing small business competitiveness in federal contracting while supporting national manufacturing and supply chain resilience priorities.',
    featured: true
  },
  {
    id: '2',
    title: 'KDM & Associates Announces Strategic Partnership with Leading Defense Contractors',
    subtitle: 'New alliance aims to accelerate opportunities for small businesses in federal contracting',
    location: 'WASHINGTON, D.C.',
    releaseDate: new Date('2026-04-15'),
    category: 'Partnership',
    slug: 'kdm-strategic-defense-partnership',
    excerpt: 'KDM & Associates has formed a strategic alliance with top defense contractors to create enhanced pathways for small businesses to participate in federal procurement opportunities, focusing on manufacturing and technology sectors.',
    featured: false
  },
  {
    id: '3',
    title: 'KDM Consortium Receives Excellence Award for Small Business Advocacy',
    subtitle: 'Recognition highlights outstanding contributions to HUBZone business development and growth',
    location: 'ARLINGTON, Va.',
    releaseDate: new Date('2026-03-22'),
    category: 'Award',
    slug: 'kdm-excellence-award-small-business',
    excerpt: 'The KDM Consortium has been honored with the prestigious Excellence Award for its exceptional work in advancing HUBZone business development and creating opportunities for small businesses in the federal marketplace.',
    featured: false
  }
];
