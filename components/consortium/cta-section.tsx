"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Landmark, Users, DollarSign, Award, CheckCircle } from "lucide-react";

const stats = [
  { icon: Building2, value: "500+", label: "Certified Small Businesses" },
  { icon: Landmark, value: "50+", label: "Government Agencies" },
  { icon: DollarSign, value: "$100M+", label: "Facilitated Contracts" },
  { icon: Award, value: "98%", label: "Satisfaction Rate" },
];

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1e3a5f]/95 via-[#2d4a6f]/90 to-[#1e3a5f]/95" />
      
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Government Contracting Journey?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join hundreds of small businesses and government buyers already succeeding with the KDM Consortium.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              asChild
              className="bg-white text-[#1e3a5f] hover:bg-white/90 text-lg px-8 py-6"
            >
              <Link href="/register?type=sme">
                Register as an SME
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              <Link href="/register?type=buyer">
                Register as a Buyer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-6 w-6 text-[#c9a227]" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
