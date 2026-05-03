"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/stores/cart-store";
import { PRODUCTS } from "@/lib/types/cart";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ConsortiumCTA() {
  const { addItem } = useCartStore();
  const router = useRouter();

  const handleJoinConsortium = () => {
    const consortiumProduct = PRODUCTS['consortium'];
    addItem(consortiumProduct, 1);
    toast.success("Consortium membership added to cart!");
    router.push("/checkout-cart");
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Join the KDM Consortium?
              </h2>
              <p className="text-xl text-gray-200 mb-8">
                Apply to become one of our 12-50 curated members and gain access to exclusive government contract opportunities, expert partnerships, and high-touch support.
              </p>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 mb-8">
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div>
                    <div className="text-2xl font-bold mb-2">$1,250</div>
                    <p className="text-sm text-gray-200">Per month membership</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold mb-2">Weekly</div>
                    <p className="text-sm text-gray-200">Friday 3pm meetings</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold mb-2">2 Hours</div>
                    <p className="text-sm text-gray-200">Concierge support/month</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleJoinConsortium}
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart & Apply Now
                </Button>
                <Link href="/consortium/members">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8"
                  >
                    Learn More
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-300 mt-6">
                * Membership is subject to application review and approval. We maintain a selective consortium of 12-50 expert companies.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
