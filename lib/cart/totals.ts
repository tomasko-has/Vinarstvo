// Ceny položiek a súčty košíka. Katalóg prichádza zo servera ako props, košík z localStorage.
import type { CartItem, GiftSet, MiniSet, Wine } from "@/lib/schemas";
import { cartonPrice, countBySlug, indexWines, type Price, type WineIndex } from "./carton";

/** Všetko, čo košík potrebuje na výpočet cien. Serializovateľné cez hranicu server → klient. */
export type ShopCatalog = {
  wines: Wine[];
  miniSets: MiniSet[];
  giftSets: GiftSet[];
  cartonSize: number;
  cartonDiscountPct: number;
  customMiniSetPriceCents: number;
};

export type CatalogIndex = {
  wines: WineIndex;
  miniSets: ReadonlyMap<string, MiniSet>;
  giftSets: ReadonlyMap<string, GiftSet>;
  cartonDiscountPct: number;
  customMiniSetPriceCents: number;
};

export function indexCatalog(catalog: ShopCatalog): CatalogIndex {
  return {
    wines: indexWines(catalog.wines),
    miniSets: new Map(catalog.miniSets.map((s) => [s.slug, s])),
    giftSets: new Map(catalog.giftSets.map((s) => [s.slug, s])),
    cartonDiscountPct: catalog.cartonDiscountPct,
    customMiniSetPriceCents: catalog.customMiniSetPriceCents,
  };
}

const full = (cents: number): Price => ({ subtotalCents: cents, discountCents: 0, totalCents: cents });

/** Cena jednej položky, alebo null, ak odkazuje na niečo, čo už v ponuke nie je. */
export function linePrice(item: CartItem, catalog: CatalogIndex): Price | null {
  switch (item.type) {
    case "bottle": {
      const wine = catalog.wines.get(item.wineSlug);
      return wine ? full(wine.priceCents * item.qty) : null;
    }
    case "gift-set": {
      const set = catalog.giftSets.get(item.setSlug);
      return set ? full(set.priceCents * item.qty) : null;
    }
    case "carton":
      if (item.bottles.some((slug) => !catalog.wines.has(slug))) return null;
      return cartonPrice(item.bottles, catalog.wines, catalog.cartonDiscountPct);
    case "mini-set": {
      if (item.custom) {
        return item.custom.every((slug) => catalog.wines.has(slug)) ? full(catalog.customMiniSetPriceCents) : null;
      }
      const set = item.setSlug ? catalog.miniSets.get(item.setSlug) : undefined;
      return set ? full(set.priceCents) : null;
    }
  }
}

export type CartTotals = Price & { unavailable: number };

/** Súčty košíka. Položky, ktoré už nie sú v ponuke, sa nepočítajú a hlásia sa v `unavailable`. */
export function cartTotals(items: readonly CartItem[], catalog: CatalogIndex): CartTotals {
  const totals: CartTotals = { subtotalCents: 0, discountCents: 0, totalCents: 0, unavailable: 0 };
  for (const item of items) {
    const price = linePrice(item, catalog);
    if (!price) {
      totals.unavailable += 1;
      continue;
    }
    totals.subtotalCents += price.subtotalCents;
    totals.discountCents += price.discountCents;
    totals.totalCents += price.totalCents;
  }
  return totals;
}

export type StockProblem = { slug: string; requested: number; stock: number };

/** Vína, ktorých je v košíku (fľaše + kartóny) viac, než je na sklade. */
export function stockProblems(items: readonly CartItem[], wines: WineIndex): StockProblem[] {
  const requested = countBySlug(
    items.flatMap((i) =>
      i.type === "bottle" ? Array<string>(i.qty).fill(i.wineSlug) : i.type === "carton" ? i.bottles : [],
    ),
  );
  const problems: StockProblem[] = [];
  for (const [slug, n] of requested) {
    const stock = wines.get(slug)?.stock;
    if (stock !== undefined && n > stock) problems.push({ slug, requested: n, stock });
  }
  return problems;
}

/** Vlastný mini-set: presne `size` rôznych vín, ktoré sa dajú objednať ako vzorka. */
export function validateCustomMiniSet(samples: readonly string[], wines: WineIndex, size: number) {
  const unique = new Set(samples);
  return (
    samples.length === size &&
    unique.size === samples.length &&
    samples.every((slug) => wines.get(slug)?.sampleAvailable === true)
  );
}
