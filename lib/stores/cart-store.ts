/**
 * Cart State Management using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartItem, Product } from '@/lib/types/cart';

interface CartStore extends Cart {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );

          let newItems: CartItem[];

          if (existingItemIndex > -1) {
            // Update quantity if item already exists
            newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
          } else {
            // Add new item
            newItems = [...state.items, { product, quantity }];
          }

          const total = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          return { items: newItems, total };
        });
      },

      removeItem: (productId: string) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => item.product.id !== productId
          );

          const total = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          return { items: newItems, total };
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return get().removeItem(productId) as any;
          }

          const newItems = state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );

          const total = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          return { items: newItems, total };
        });
      },

      clearCart: () => {
        set({ items: [], total: 0 });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
