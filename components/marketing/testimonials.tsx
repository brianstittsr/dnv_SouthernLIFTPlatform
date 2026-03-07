"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import Image from "next/image";

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

export function Testimonials() {
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

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading || testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];
  const initials = currentTestimonial.clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real results from clients who transformed their government contracting business with KDM & Associates.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <Card className="bg-card border-2">
            <CardContent className="p-8 md:p-12">
              <Quote className="h-12 w-12 text-primary/20 mb-6" />
              
              <blockquote className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Rating */}
              {currentTestimonial.rating && (
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                {currentTestimonial.companyLogoUrl ? (
                  <div className="relative w-14 h-14 rounded-full bg-background border-2 flex items-center justify-center overflow-hidden">
                    <Image
                      src={currentTestimonial.companyLogoUrl}
                      alt={currentTestimonial.companyName}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <div className="font-semibold">{currentTestimonial.clientName}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentTestimonial.clientTitle}, {currentTestimonial.companyName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentTestimonial.companyIndustry} • Client
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prev}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={next}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
