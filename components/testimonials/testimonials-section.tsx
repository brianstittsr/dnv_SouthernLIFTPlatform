"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  clientTitle: string;
  companyName: string;
  companyIndustry: string;
  companyLogoUrl?: string;
  rating: number;
  featured: boolean;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials");
      if (!response.ok) throw new Error("Failed to fetch testimonials");
      const data = await response.json();
      setTestimonials(data.data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const previousTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading || testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real results from clients who transformed their government contracting business with KDM & Associates.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-8 md:p-12">
              <div className="space-y-8">
                {/* Quote Icon */}
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Quote className="h-8 w-8 text-primary" />
                  </div>
                </div>

                {/* Testimonial Quote */}
                <blockquote className="text-xl md:text-2xl font-medium text-center leading-relaxed">
                  "{currentTestimonial.quote}"
                </blockquote>

                {/* Rating */}
                {currentTestimonial.rating && (
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}

                {/* Client Info */}
                <div className="flex flex-col items-center gap-4 pt-4">
                  {currentTestimonial.companyLogoUrl && (
                    <div className="relative w-20 h-20 rounded-full bg-background border-2 flex items-center justify-center overflow-hidden">
                      <Image
                        src={currentTestimonial.companyLogoUrl}
                        alt={currentTestimonial.companyName}
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                    </div>
                  )}
                  {!currentTestimonial.companyLogoUrl && (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {currentTestimonial.clientName.charAt(0)}
                        {currentTestimonial.clientName.split(" ")[1]?.charAt(0) || ""}
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-semibold text-lg">{currentTestimonial.clientName}</p>
                    <p className="text-muted-foreground">
                      {currentTestimonial.clientTitle}, {currentTestimonial.companyName}
                    </p>
                    <p className="text-sm text-muted-foreground">{currentTestimonial.companyIndustry}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={previousTestimonial}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      index === currentIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
