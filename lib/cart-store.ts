import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  cohortId: string;
  title: string;
  slug: string;
  priceInCents: nuemerging businessr;
  compareAtPriceInCents?: nuemerging businessr;
  thumbnailUrl?: string;
  estimatedDurationWeeks: nuemerging businessr;
  difficultyLevel: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cohortId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => nuemerging businessr;
  getTotalSavings: () => nuemerging businessr;
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
