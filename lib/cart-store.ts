import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  cohortId: string;
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
  removeItem: (cohortId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalSavings: () => number;
  isInCart: (cohortId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get();
        if (!items.find(i => i.cohortId === item.cohortId)) {
          set({ items: [...items, item] });
        }
      },
      
      removeItem: (cohortId) => {
        set({ items: get().items.filter(i => i.cohortId !== cohortId) });
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
      
      isInCart: (cohortId) => {
        return get().items.some(i => i.cohortId === cohortId);
      },
    }),
    {
      name: 'cohort-cart-storage',
    }
  )
);
