"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types/cart";

interface AddToCartButtonProps {
  product: Product;
  children?: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  redirectToCart?: boolean;
}

export function AddToCartButton({
  product,
  children,
  variant = "default",
  size = "default",
  className,
  showIcon = true,
  redirectToCart = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const { addItem, items } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);

  const isInCart = items.some((item) => item.product.id === product.id);

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    
    toast.success("Added to cart!", {
      description: `${product.name} has been added to your cart.`,
      action: {
        label: "View Cart",
        onClick: () => router.push("/checkout-cart"),
      },
    });

    if (redirectToCart) {
      setTimeout(() => {
        router.push("/checkout-cart");
      }, 1000);
    } else {
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isAdded}
    >
      {showIcon && (
        isAdded ? (
          <Check className="h-4 w-4 mr-2" />
        ) : (
          <ShoppingCart className="h-4 w-4 mr-2" />
        )
      )}
      {children || (isInCart ? "Added to Cart" : "Add to Cart")}
    </Button>
  );
}
