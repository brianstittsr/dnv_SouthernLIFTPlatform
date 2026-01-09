"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "KDM & Associates helped us navigate the 8(a) certification process and connected us with prime contractors. We've since won three federal contracts worth over $2M annually.",
    author: "Marcus Johnson",
    title: "CEO",
    company: "Johnson Tech Solutions",
    industry: "IT Services",
    employees: "MBE Client",
    initials: "MJ",
  },
  {
    quote:
      "The strategic teaming partnerships KDM facilitated transformed our business. We went from subcontractor to prime contractor status within 18 months.",
    author: "Sandra Williams",
    title: "President",
    company: "Williams Consulting Group",
    industry: "Professional Services",
    employees: "MBE Client",
    initials: "SW",
  },
  {
    quote:
      "Their What Works approach was exactly what we needed to break into federal contracting. The team's expertise and hands-on mentorship made all the difference.",
    author: "Roberto Martinez",
    title: "Owner",
    company: "Martinez Construction LLC",
    industry: "Construction",
    employees: "MBE Client",
    initials: "RM",
  },
  {
    quote:
      "KDM's proposal support and grant writing services helped us win our first NOFO award. Their guidance through the federal procurement process was invaluable.",
    author: "Jennifer Park",
    title: "CEO",
    company: "Park Digital Services",
    industry: "Technology",
    employees: "MBE Client",
    initials: "JP",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real results from MBEs who transformed their government contracting business with KDM & Associates.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <Card className="bg-card border-2">
            <CardContent className="p-8 md:p-12">
              <Quote className="h-12 w-12 text-primary/20 mb-6" />
              
              <blockquote className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </blockquote>

              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {testimonials[currentIndex].initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{testimonials[currentIndex].author}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonials[currentIndex].title}, {testimonials[currentIndex].company}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {testimonials[currentIndex].industry} • {testimonials[currentIndex].employees}
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
