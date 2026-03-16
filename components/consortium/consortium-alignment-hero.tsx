"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/hooks/use-cart";
import { PRODUCTS } from "@/lib/types/cart";
import { toast } from "sonner";

export function ConsortiumAlignmentHero() {
  const { addItem } = useCart();

  const handleJoinConsortium = () => {
    const consortiumProduct = PRODUCTS['consortium'];
    addItem(consortiumProduct, 1);
    toast.success("Consortium membership added to cart!");
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
          alt="Collective experts collaborating"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="border-amber-400 text-amber-400 mb-6">
            Boutique Consortium Model
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            KDM Consortium: A Selective Network of{" "}
            <span className="text-amber-400">Expert Companies</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Join 12-50 hand-picked members collaborating to win and deliver large government contracts in manufacturing, critical minerals, defense, and energy sectors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={handleJoinConsortium}
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Join the Consortium - $1,250/month
            </Button>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-slate-900"
              >
                Learn How It Works
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              <div className="text-3xl font-bold text-amber-400 mb-2">12-50</div>
              <p className="text-sm text-gray-300">Curated Members Maximum</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              <div className="text-3xl font-bold text-amber-400 mb-2">Weekly</div>
              <p className="text-sm text-gray-300">Friday 3pm Consortium Meetings</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              <div className="text-3xl font-bold text-amber-400 mb-2">5 Pillars</div>
              <p className="text-sm text-gray-300">Strategic Focus Areas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
