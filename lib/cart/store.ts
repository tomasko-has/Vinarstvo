"use client";

// Košík: Zustand + localStorage, funguje aj offline. Logika položiek je v items.ts (testovaná).
// Hlavička a spodná lišta používajú len useCartCount() — jeho podpis sa nemení.
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/schemas";
import {
  addBottles,
  addGiftSets,
  isCartItem,
  newId,
  removeItem,
  setQty,
  upsertCarton,
} from "./items";

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  addBottles: (wineSlug: string, qty?: number) => void;
  addGiftSets: (setSlug: string, qty?: number) => void;
  /** Uloží kartón. Bez id vytvorí nový. Vráti id kartónu. */
  saveCarton: (bottles: string[], id?: string) => string;
  addMiniSet: (set: { setSlug: string } | { custom: string[] }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => set((s) => ({ items: [...s.items, item] })),
      addBottles: (wineSlug, qty = 1) => set((s) => ({ items: addBottles(s.items, wineSlug, qty) })),
      addGiftSets: (setSlug, qty = 1) => set((s) => ({ items: addGiftSets(s.items, setSlug, qty) })),
      saveCarton: (bottles, id = newId()) => {
        set((s) => ({ items: upsertCarton(s.items, { type: "carton", id, bottles }) }));
        return id;
      },
      addMiniSet: (miniSet) => set((s) => ({ items: [...s.items, { type: "mini-set", id: newId(), ...miniSet }] })),
      setQty: (key, qty) => set((s) => ({ items: setQty(s.items, key, qty) })),
      remove: (key) => set((s) => ({ items: removeItem(s.items, key) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "na-sprasi-kosik",
      version: 1,
      partialize: (s) => ({ items: s.items }),
      // Poškodené alebo staré položky z localStorage zahodíme namiesto pádu stránky.
      merge: (persisted, current) => {
        const items = (persisted as { items?: unknown } | undefined)?.items;
        return { ...current, items: Array.isArray(items) ? items.filter(isCartItem) : [] };
      },
    },
  ),
);

/** Počet kusov v košíku: fľaše a darčekové sady podľa množstva, kartón a mini-set ako 1. */
export function countItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + ("qty" in item ? item.qty : 1), 0);
}

const noopSubscribe = () => () => {};

/** true až po hydratácii v prehliadači (server nevidí localStorage). */
export function useHydrated() {
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

/** Položky košíka; pred hydratáciou prázdny zoznam, aby sa server a prehliadač zhodli. */
export function useCartItems() {
  const items = useCartStore((s) => s.items);
  return useHydrated() ? items : empty;
}

const empty: CartItem[] = [];
