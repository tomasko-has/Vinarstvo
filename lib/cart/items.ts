// Čisté operácie nad položkami košíka. Store (store.ts) ich len volá, testy ich overujú priamo.
import type { CartItem } from "@/lib/schemas";

export type BottleItem = Extract<CartItem, { type: "bottle" }>;
export type CartonItem = Extract<CartItem, { type: "carton" }>;
export type MiniSetItem = Extract<CartItem, { type: "mini-set" }>;
export type GiftSetItem = Extract<CartItem, { type: "gift-set" }>;

/** Stabilný kľúč položky: fľaše a darčekové sady sa zlučujú, kartóny a mini-sety majú vlastné id. */
export function itemKey(item: CartItem) {
  switch (item.type) {
    case "bottle":
      return `bottle:${item.wineSlug}`;
    case "gift-set":
      return `gift-set:${item.setSlug}`;
    case "carton":
      return `carton:${item.id}`;
    case "mini-set":
      return `mini-set:${item.id}`;
  }
}

/** Krátke náhodné id. crypto.randomUUID nie je dostupné na http mimo localhost. */
export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().slice(0, 8);
  return Math.random().toString(36).slice(2, 10);
}

export function addBottles(items: CartItem[], wineSlug: string, qty: number): CartItem[] {
  if (qty <= 0) return items;
  const existing = items.find((i): i is BottleItem => i.type === "bottle" && i.wineSlug === wineSlug);
  if (!existing) return [...items, { type: "bottle", wineSlug, qty }];
  return items.map((i) => (i === existing ? { ...existing, qty: existing.qty + qty } : i));
}

export function addGiftSets(items: CartItem[], setSlug: string, qty: number): CartItem[] {
  if (qty <= 0) return items;
  const existing = items.find((i): i is GiftSetItem => i.type === "gift-set" && i.setSlug === setSlug);
  if (!existing) return [...items, { type: "gift-set", setSlug, qty }];
  return items.map((i) => (i === existing ? { ...existing, qty: existing.qty + qty } : i));
}

/** Nastaví množstvo fliaš alebo darčekovej sady; 0 a menej položku odstráni. Iné typy nemajú množstvo. */
export function setQty(items: CartItem[], key: string, qty: number): CartItem[] {
  if (qty <= 0) return removeItem(items, key);
  return items.map((i) => (itemKey(i) === key && "qty" in i ? { ...i, qty } : i));
}

export function removeItem(items: CartItem[], key: string): CartItem[] {
  return items.filter((i) => itemKey(i) !== key);
}

/** Uloží kartón: existujúci s rovnakým id prepíše na mieste, inak pridá nový na koniec. */
export function upsertCarton(items: CartItem[], carton: CartonItem): CartItem[] {
  const index = items.findIndex((i) => i.type === "carton" && i.id === carton.id);
  if (index === -1) return [...items, carton];
  return items.map((i, n) => (n === index ? carton : i));
}

/** Rezervované fľaše 0,75 l v košíku (jednotlivé fľaše + kartóny), voliteľne bez jedného kartónu. */
export function reservedBottles(items: readonly CartItem[], excludeCartonId?: string) {
  const reserved = new Map<string, number>();
  const add = (slug: string, n: number) => reserved.set(slug, (reserved.get(slug) ?? 0) + n);
  for (const item of items) {
    if (item.type === "bottle") add(item.wineSlug, item.qty);
    if (item.type === "carton" && item.id !== excludeCartonId) item.bottles.forEach((slug) => add(slug, 1));
  }
  return reserved;
}

/** Ľahká kontrola tvaru položky pri načítaní z localStorage (bez Zodu v klientskom balíku). */
export function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const isSlug = (s: unknown) => typeof s === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
  const isQty = (q: unknown) => typeof q === "number" && Number.isInteger(q) && q > 0;
  const isSix = (a: unknown) => Array.isArray(a) && a.length === 6 && a.every(isSlug);
  switch (v.type) {
    case "bottle":
      return isSlug(v.wineSlug) && isQty(v.qty);
    case "gift-set":
      return isSlug(v.setSlug) && isQty(v.qty);
    case "carton":
      return typeof v.id === "string" && isSix(v.bottles);
    case "mini-set":
      return typeof v.id === "string" && (isSlug(v.setSlug) || isSix(v.custom));
    default:
      return false;
  }
}
