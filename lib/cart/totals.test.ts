import { describe, expect, it } from "vitest";
import type { CartItem, GiftSet, MiniSet } from "@/lib/schemas";
import { indexWines } from "./carton";
import { cartTotals, indexCatalog, linePrice, stockProblems, validateCustomMiniSet } from "./totals";
import { wine } from "./test-wines";

const wines = [
  wine("veltlin", { priceCents: 890, stock: 100 }),
  wine("frankovka", { priceCents: 990, stock: 3 }),
  wine("archiv", { priceCents: 2490, stock: 0, sampleAvailable: false }),
];
const miniSet: MiniSet = {
  slug: "spras",
  name: "Spoznaj Rad Spraš",
  description: "…",
  samples: ["veltlin", "frankovka", "a", "b", "c", "d"],
  tastingOrder: ["veltlin", "frankovka", "a", "b", "c", "d"],
  priceCents: 1990,
};
const giftSet: GiftSet = {
  slug: "sekt",
  name: "Sekt a dva poháre",
  description: "…",
  contents: ["sekt"],
  priceCents: 3490,
  image: { src: "/x.svg", alt: "" },
};
const catalog = indexCatalog({
  wines,
  miniSets: [miniSet],
  giftSets: [giftSet],
  cartonSize: 6,
  cartonDiscountPct: 10,
  customMiniSetPriceCents: 1790,
});
const carton = ["veltlin", "veltlin", "veltlin", "veltlin", "frankovka", "frankovka"];

describe("linePrice", () => {
  it("vypočíta cenu každého typu položky", () => {
    expect(linePrice({ type: "bottle", wineSlug: "veltlin", qty: 3 }, catalog)?.totalCents).toBe(2670);
    expect(linePrice({ type: "gift-set", setSlug: "sekt", qty: 2 }, catalog)?.totalCents).toBe(6980);
    expect(linePrice({ type: "mini-set", id: "m", setSlug: "spras" }, catalog)?.totalCents).toBe(1990);
    expect(linePrice({ type: "carton", id: "c", bottles: carton }, catalog)).toEqual({
      subtotalCents: 5540,
      discountCents: 554,
      totalCents: 4986,
    });
  });

  it("vlastný mini-set má pevnú cenu z konfigurácie", () => {
    const custom = Array<string>(6).fill("veltlin");
    expect(linePrice({ type: "mini-set", id: "m", custom }, catalog)?.totalCents).toBe(1790);
  });

  it("vráti null, ak položka odkazuje na niečo, čo už nie je v ponuke", () => {
    expect(linePrice({ type: "bottle", wineSlug: "zmizlo", qty: 1 }, catalog)).toBeNull();
    expect(linePrice({ type: "mini-set", id: "m", setSlug: "zmizlo" }, catalog)).toBeNull();
    expect(linePrice({ type: "carton", id: "c", bottles: [...carton.slice(1), "zmizlo"] }, catalog)).toBeNull();
  });
});

describe("cartTotals", () => {
  it("sčíta položky a zľavy, nedostupné len spočíta", () => {
    const items: CartItem[] = [
      { type: "bottle", wineSlug: "veltlin", qty: 2 },
      { type: "carton", id: "c", bottles: carton },
      { type: "gift-set", setSlug: "zmizlo", qty: 1 },
    ];
    expect(cartTotals(items, catalog)).toEqual({
      subtotalCents: 1780 + 5540,
      discountCents: 554,
      totalCents: 1780 + 4986,
      unavailable: 1,
    });
  });

  it("prázdny košík je nula", () => {
    expect(cartTotals([], catalog)).toEqual({ subtotalCents: 0, discountCents: 0, totalCents: 0, unavailable: 0 });
  });
});

describe("stockProblems", () => {
  it("nájde víno, ktorého je vo fľašiach a kartónoch spolu viac než na sklade", () => {
    const items: CartItem[] = [
      { type: "bottle", wineSlug: "frankovka", qty: 2 },
      { type: "carton", id: "c", bottles: carton },
      { type: "bottle", wineSlug: "archiv", qty: 1 },
    ];
    expect(stockProblems(items, catalog.wines)).toEqual([
      { slug: "frankovka", requested: 4, stock: 3 },
      { slug: "archiv", requested: 1, stock: 0 },
    ]);
  });
});

describe("validateCustomMiniSet", () => {
  const many = [1, 2, 3, 4, 5, 6].map((n) => wine(`v${n}`));
  const index = indexWines([...many, ...wines]);

  it("prijme 6 rôznych vín dostupných ako vzorka", () => {
    expect(validateCustomMiniSet(many.map((w) => w.slug), index, 6)).toBe(true);
  });

  it("odmietne duplicity, nedostupné vzorky a nesprávny počet", () => {
    expect(validateCustomMiniSet(["v1", "v1", "v2", "v3", "v4", "v5"], index, 6)).toBe(false);
    expect(validateCustomMiniSet(["v1", "v2", "v3", "v4", "v5", "archiv"], index, 6)).toBe(false);
    expect(validateCustomMiniSet(["v1", "v2"], index, 6)).toBe(false);
  });
});
