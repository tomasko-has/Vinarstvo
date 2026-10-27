// Čistá logika konfigurátora kartónu (MASTER_PROMPT.md, 5.2): validácia, cena, sklad.
// Bez Reactu a bez prístupu k súborom, aby sa dala testovať a použiť na serveri aj v prehliadači.
import type { Wine } from "@/lib/schemas";

/** Do kartónu idú len fľaše 0,75 l. */
export const CARTON_BOTTLE_ML = 750;

export type WineIndex = ReadonlyMap<string, Wine>;
/** Koľko fliaš z daného vína ešte môže ísť do kartónu (sklad mínus to, čo už je v košíku inde). */
export type StockMap = ReadonlyMap<string, number>;

export function indexWines(wines: readonly Wine[]): WineIndex {
  return new Map(wines.map((w) => [w.slug, w]));
}

export function isCartonEligible(wine: Wine) {
  return wine.volumeMl === CARTON_BOTTLE_ML;
}

export function countBySlug(slugs: readonly string[]) {
  const counts = new Map<string, number>();
  for (const slug of slugs) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  return counts;
}

/** Dostupný sklad = sklad vína mínus fľaše rezervované inde v košíku (nikdy menej ako 0). */
export function availableStock(wines: readonly Wine[], reserved: ReadonlyMap<string, number> = new Map()): StockMap {
  return new Map(wines.map((w) => [w.slug, Math.max(0, w.stock - (reserved.get(w.slug) ?? 0))]));
}

export type AddRefusal = "full" | "unknown" | "not-eligible" | "out-of-stock";
export type AddCheck = { ok: true } | { ok: false; reason: AddRefusal };

export function canAddBottle(
  bottles: readonly string[],
  slug: string,
  wines: WineIndex,
  available: StockMap,
  size: number,
): AddCheck {
  if (bottles.length >= size) return { ok: false, reason: "full" };
  const wine = wines.get(slug);
  if (!wine) return { ok: false, reason: "unknown" };
  if (!isCartonEligible(wine)) return { ok: false, reason: "not-eligible" };
  const inCarton = bottles.filter((b) => b === slug).length;
  if (inCarton >= (available.get(slug) ?? 0)) return { ok: false, reason: "out-of-stock" };
  return { ok: true };
}

/** Pridá fľašu, ak to pravidlá dovolia. Inak vráti pôvodné pole. */
export function addBottle(
  bottles: readonly string[],
  slug: string,
  wines: WineIndex,
  available: StockMap,
  size: number,
): readonly string[] {
  return canAddBottle(bottles, slug, wines, available, size).ok ? [...bottles, slug] : bottles;
}

export function removeBottleAt(bottles: readonly string[], index: number): readonly string[] {
  if (index < 0 || index >= bottles.length) return bottles;
  return [...bottles.slice(0, index), ...bottles.slice(index + 1)];
}

/**
 * Doplní voľné sloty náhodnými vínami, ktoré sú na sklade.
 * Rešpektuje sklad; ak už nie je čo pridať, vráti neúplný kartón.
 */
export function fillRandom(
  bottles: readonly string[],
  wines: readonly Wine[],
  available: StockMap,
  size: number,
  random: () => number = Math.random,
): readonly string[] {
  const index = indexWines(wines);
  let result = bottles;
  while (result.length < size) {
    const candidates = wines.filter((w) => canAddBottle(result, w.slug, index, available, size).ok);
    if (candidates.length === 0) break;
    const pick = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
    result = [...result, pick.slug];
  }
  return result;
}

export type CartonIssue =
  | { kind: "size"; count: number; size: number }
  | { kind: "unknown"; slug: string }
  | { kind: "not-eligible"; slug: string }
  | { kind: "stock"; slug: string; requested: number; available: number };

/** Kartón je platný, keď má presne `size` známych fliaš 0,75 l a nepresahuje sklad. */
export function validateCarton(
  bottles: readonly string[],
  wines: WineIndex,
  available: StockMap,
  size: number,
): CartonIssue[] {
  const issues: CartonIssue[] = [];
  if (bottles.length !== size) issues.push({ kind: "size", count: bottles.length, size });
  for (const [slug, requested] of countBySlug(bottles)) {
    const wine = wines.get(slug);
    if (!wine) {
      issues.push({ kind: "unknown", slug });
      continue;
    }
    if (!isCartonEligible(wine)) issues.push({ kind: "not-eligible", slug });
    const free = available.get(slug) ?? 0;
    if (requested > free) issues.push({ kind: "stock", slug, requested, available: free });
  }
  return issues;
}

export type Price = { subtotalCents: number; discountCents: number; totalCents: number };

/** Cena kartónu: súčet fliaš, zľava sa zaokrúhľuje na celé centy. Neznáme vína sa nepočítajú. */
export function cartonPrice(bottles: readonly string[], wines: WineIndex, discountPct: number): Price {
  const subtotalCents = bottles.reduce((sum, slug) => sum + (wines.get(slug)?.priceCents ?? 0), 0);
  const discountCents = Math.round((subtotalCents * discountPct) / 100);
  return { subtotalCents, discountCents, totalCents: subtotalCents - discountCents };
}
