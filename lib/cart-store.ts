import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  courseId: string;
  title: string;
  slug: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  thumbnailUrl?: string;
  estimatedDurationWeeks: number;
  difficultyLevel: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (courseId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalSavings: () => number;
  isInCart: (courseId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get();
        if (!items.find(i => i.courseId === item.courseId)) {
          set({ items: [...items, item] });
        }
      },
      
      removeItem: (courseId) => {
        set({ items: get().items.filter(i => i.courseId !== courseId) });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.priceInCents, 0);
      },
      
      getTotalSavings: () => {
        return get().items.reduce((total, item) => {
          if (item.compareAtPriceInCents) {
            return total + (item.compareAtPriceInCents - item.priceInCents);
          }
          return total;
        }, 0);
      },
      
      isInCart: (courseId) => {
        return get().items.some(i => i.courseId === courseId);
      },
    }),
    {
      name: 'course-cart-storage-v2',
      version: 2,
    }
  )
);
