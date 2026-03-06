"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cart-store";

export function CartIcon() {
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/checkout-cart">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {itemCount}
          </Badge>
        )}
        <span className="sr-only">Shopping Cart ({itemCount} items)</span>
      </Link>
    </Button>
  );
}
