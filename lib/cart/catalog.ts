// Filtre a radenie katalógu. Stav filtrov žije v URL (zdieľateľné odkazy), preto parse/serialize.
import type { Sweetness, Wine, WineColor, WineLine } from "@/lib/schemas";
import { sweetnesses, wineColors, wineLines } from "./labels";

export const sortKeys = ["odporucane", "cena-vzostupne", "cena-zostupne", "rocnik", "nazov"] as const;
export type SortKey = (typeof sortKeys)[number];

export const sortLabel: Record<SortKey, string> = {
  odporucane: "Odporúčané",
  "cena-vzostupne": "Od najlacnejšieho",
  "cena-zostupne": "Od najdrahšieho",
  rocnik: "Od najmladšieho ročníka",
  nazov: "Podľa názvu",
};

export type CatalogFilters = {
  line: WineLine[];
  color: WineColor[];
  sweetness: Sweetness[];
  /** slugy odrôd, pozri varietySlug() */
  variety: string[];
  sort: SortKey;
};

export const emptyFilters: CatalogFilters = { line: [], color: [], sweetness: [], variety: [], sort: "odporucane" };

/** Názvy parametrov v URL. */
export const filterParams = {
  line: "rad",
  color: "farba",
  sweetness: "sladkost",
  variety: "odroda",
  sort: "radenie",
} as const;

/** „Veltlínske zelené“ → „veltlinske-zelene“ */
export function varietySlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Cuvée má odrody oddelené čiarkou. */
export function varietiesOf(wine: Pick<Wine, "variety">) {
  return wine.variety.split(",").map((v) => v.trim()).filter(Boolean);
}

export function varietyOptions(wines: readonly Wine[]) {
  const options = new Map<string, { slug: string; label: string; count: number }>();
  for (const wine of wines) {
    for (const label of varietiesOf(wine)) {
      const slug = varietySlug(label);
      const option = options.get(slug) ?? { slug, label, count: 0 };
      option.count += 1;
      options.set(slug, option);
    }
  }
  return [...options.values()].sort((a, b) => a.label.localeCompare(b.label, "sk"));
}

type Readable = Pick<URLSearchParams, "get">;

function list<T extends string>(params: Readable, name: string, allowed?: readonly T[]): T[] {
  const values = (params.get(name) ?? "").split(",").filter(Boolean) as T[];
  const unique = [...new Set(values)];
  return allowed ? unique.filter((v) => allowed.includes(v)) : unique;
}

/** Neznáme hodnoty z URL ticho zahodí, aby rozbitý odkaz neskončil chybou. */
export function parseFilters(params: Readable): CatalogFilters {
  const sort = params.get(filterParams.sort) as SortKey | null;
  return {
    line: list(params, filterParams.line, wineLines),
    color: list(params, filterParams.color, wineColors),
    sweetness: list(params, filterParams.sweetness, sweetnesses),
    variety: list(params, filterParams.variety),
    sort: sort && sortKeys.includes(sort) ? sort : "odporucane",
  };
}

/** Predvolené hodnoty do URL nepíše, takže čistý katalóg má čistú adresu. */
export function serializeFilters(filters: CatalogFilters) {
  const params = new URLSearchParams();
  for (const key of ["line", "color", "sweetness", "variety"] as const) {
    if (filters[key].length > 0) params.set(filterParams[key], filters[key].join(","));
  }
  if (filters.sort !== "odporucane") params.set(filterParams.sort, filters.sort);
  return params;
}

export function countActive(filters: CatalogFilters) {
  return filters.line.length + filters.color.length + filters.sweetness.length + filters.variety.length;
}

/** V rámci skupiny platí „alebo“, medzi skupinami „a zároveň“. */
export function filterWines(wines: readonly Wine[], filters: CatalogFilters) {
  return wines.filter(
    (w) =>
      (filters.line.length === 0 || filters.line.includes(w.line)) &&
      (filters.color.length === 0 || filters.color.includes(w.color)) &&
      (filters.sweetness.length === 0 || filters.sweetness.includes(w.sweetness)) &&
      (filters.variety.length === 0 || varietiesOf(w).some((v) => filters.variety.includes(varietySlug(v)))),
  );
}

const lineOrder: Record<WineLine, number> = { ulicka: 0, spras: 1, pivnica: 2 };

export function sortWines(wines: readonly Wine[], sort: SortKey) {
  const byName = (a: Wine, b: Wine) => a.name.localeCompare(b.name, "sk");
  const sorted = [...wines];
  switch (sort) {
    case "cena-vzostupne":
      return sorted.sort((a, b) => a.priceCents - b.priceCents || byName(a, b));
    case "cena-zostupne":
      return sorted.sort((a, b) => b.priceCents - a.priceCents || byName(a, b));
    case "rocnik":
      return sorted.sort((a, b) => b.vintage - a.vintage || byName(a, b));
    case "nazov":
      return sorted.sort(byName);
    case "odporucane":
      // Najprv to, čo sa dá kúpiť, potom podľa radu a ceny.
      return sorted.sort(
        (a, b) =>
          Number(a.stock === 0) - Number(b.stock === 0) ||
          lineOrder[a.line] - lineOrder[b.line] ||
          a.priceCents - b.priceCents,
      );
  }
}

/** Od tohto počtu nižšie ukazujeme „posledné kusy“. */
export const LOW_STOCK = 6;

export type StockStatus = "skladom" | "posledne" | "vypredane";

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "vypredane";
  if (stock <= LOW_STOCK) return "posledne";
  return "skladom";
}
