"use client";

// Základ košíka z fázy 0. Vlastník: session B (rozšíri o akcie, ceny, konfigurátor).
// Hlavička a spodná lišta používajú len useCartCount().
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/schemas";

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => set((s) => ({ items: [...s.items, item] })),
      clear: () => set({ items: [] }),
    }),
    { name: "na-sprasi-kosik", version: 1 },
  ),
);

/** Počet kusov v košíku: fľaše a darčekové sady podľa množstva, kartón a mini-set ako 1. */
export function countItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + ("qty" in item ? item.qty : 1), 0);
}

const noopSubscribe = () => () => {};

/** true až po hydratácii v prehliadači (server nevidí localStorage). */
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useCartCount() {
  const count = useCartStore((s) => countItems(s.items));
  return useHydrated() ? count : 0;
}
