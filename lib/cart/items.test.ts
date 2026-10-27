import { describe, expect, it } from "vitest";
import type { CartItem } from "@/lib/schemas";
import {
  addBottles,
  addGiftSets,
  isCartItem,
  itemKey,
  removeItem,
  reservedBottles,
  setQty,
  upsertCarton,
} from "./items";

const six = (slug: string) => Array<string>(6).fill(slug);

describe("položky košíka", () => {
  it("rovnaké víno a darčekovú sadu zlučuje do jedného riadku", () => {
    let items: CartItem[] = [];
    items = addBottles(items, "veltlin", 1);
    items = addBottles(items, "veltlin", 2);
    items = addGiftSets(items, "sekt", 1);
    items = addGiftSets(items, "sekt", 1);
    expect(items).toEqual([
      { type: "bottle", wineSlug: "veltlin", qty: 3 },
      { type: "gift-set", setSlug: "sekt", qty: 2 },
    ]);
  });

  it("nastaví množstvo a pri nule položku odstráni", () => {
    const items = addBottles([], "veltlin", 1);
    expect(setQty(items, "bottle:veltlin", 5)).toEqual([{ type: "bottle", wineSlug: "veltlin", qty: 5 }]);
    expect(setQty(items, "bottle:veltlin", 0)).toEqual([]);
  });

  it("kartón s rovnakým id prepíše na mieste, nový pridá", () => {
    const first: CartItem = { type: "carton", id: "a", bottles: six("veltlin") };
    const items: CartItem[] = [first, { type: "bottle", wineSlug: "x", qty: 1 }];
    const edited = upsertCarton(items, { type: "carton", id: "a", bottles: six("frankovka") });
    expect(edited[0]).toEqual({ type: "carton", id: "a", bottles: six("frankovka") });
    expect(edited).toHaveLength(2);
    expect(upsertCarton(items, { type: "carton", id: "b", bottles: six("x") })).toHaveLength(3);
  });

  it("odstráni položku podľa kľúča", () => {
    const items: CartItem[] = [
      { type: "mini-set", id: "m1", setSlug: "spras" },
      { type: "mini-set", id: "m2", setSlug: "spras" },
    ];
    expect(removeItem(items, itemKey(items[0]))).toEqual([items[1]]);
  });

  it("počíta rezervované fľaše z fliaš a kartónov, bez upravovaného kartónu", () => {
    const items: CartItem[] = [
      { type: "bottle", wineSlug: "veltlin", qty: 2 },
      { type: "carton", id: "a", bottles: ["veltlin", "veltlin", "frankovka", "frankovka", "frankovka", "x"] },
      { type: "carton", id: "b", bottles: six("frankovka") },
      { type: "mini-set", id: "m", custom: six("veltlin") },
    ];
    expect(Object.fromEntries(reservedBottles(items))).toEqual({ veltlin: 4, frankovka: 9, x: 1 });
    expect(Object.fromEntries(reservedBottles(items, "b"))).toEqual({ veltlin: 4, frankovka: 3, x: 1 });
  });
});

describe("isCartItem", () => {
  it("prijme všetky štyri typy položiek", () => {
    expect(isCartItem({ type: "bottle", wineSlug: "veltlin", qty: 1 })).toBe(true);
    expect(isCartItem({ type: "carton", id: "a", bottles: six("veltlin") })).toBe(true);
    expect(isCartItem({ type: "mini-set", id: "a", setSlug: "spras" })).toBe(true);
    expect(isCartItem({ type: "mini-set", id: "a", custom: six("veltlin") })).toBe(true);
    expect(isCartItem({ type: "gift-set", setSlug: "sekt", qty: 2 })).toBe(true);
  });

  it("odmietne poškodené dáta z localStorage", () => {
    expect(isCartItem(null)).toBe(false);
    expect(isCartItem({ type: "bottle", wineSlug: "veltlin", qty: 0 })).toBe(false);
    expect(isCartItem({ type: "carton", id: "a", bottles: ["veltlin"] })).toBe(false);
    expect(isCartItem({ type: "mini-set", id: "a" })).toBe(false);
    expect(isCartItem({ type: "magnum", wineSlug: "x" })).toBe(false);
  });
});
