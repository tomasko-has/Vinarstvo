// Zdieľané dátové schémy — zmluva medzi všetkými sessions (MASTER_PROMPT.md, sekcia 9).
// Mení ich len fáza 0. Návrhy zmien: docs/requests/<session>.md
import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug: malé písmená, číslice a pomlčky");
const cents = z.number().int().nonnegative();
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "čas vo formáte HH:MM");
const image = z.object({ src: z.string(), alt: z.string() });

export const gpsSchema = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });
/** Bod v súradniciach SVG mapy (viewBox mapy uličky). */
export const mapPointSchema = z.object({ x: z.number(), y: z.number() });

// ── Vína ────────────────────────────────────────────────────────────────

export const wineLineSchema = z.enum(["ulicka", "spras", "pivnica"]);
export const wineColorSchema = z.enum(["biele", "ruzove", "cervene", "sumive"]);
export const sweetnessSchema = z.enum(["suche", "polosuche", "polosladke", "sladke"]);

export const wineSchema = z.object({
  slug,
  name: z.string().min(1),
  line: wineLineSchema,
  variety: z.string().min(1),
  vintage: z.number().int().min(1950).max(2100),
  color: wineColorSchema,
  sweetness: sweetnessSchema,
  volumeMl: z.number().int().positive(),
  priceCents: cents,
  stock: z.number().int().nonnegative(),
  alcohol: z.number().min(0).max(20),
  sugarGl: z.number().nonnegative(),
  acidityGl: z.number().nonnegative(),
  vineyard: z.string().optional(),
  description: z.string().min(1),
  /** Chuťový profil na škále 1–5 */
  tasting: z.object({
    body: z.number().int().min(1).max(5),
    acidity: z.number().int().min(1).max(5),
    fruit: z.number().int().min(1).max(5),
  }),
  pairing: z.array(z.string()),
  images: z.array(image),
  /** Dá sa objednať ako 0,1 l vzorka do mini-setu */
  sampleAvailable: z.boolean(),
});

// ── Pivnice a mapa ──────────────────────────────────────────────────────

export const openingHoursSchema = z.object({
  /** 0 = nedeľa … 6 = sobota */
  days: z.array(z.number().int().min(0).max(6)).min(1),
  open: time,
  close: time,
  note: z.string().optional(),
});

export const cellarFeatureSchema = z.enum(["degustacia", "ubytovanie", "predaj"]);

export const cellarSchema = z.object({
  slug,
  name: z.string().min(1),
  owner: z.string().min(1),
  /** true = Vinárstvo Na Spraši */
  isOurs: z.boolean(),
  mapPoint: mapPointSchema,
  gps: gpsSchema,
  openingHours: z.array(openingHoursSchema),
  features: z.array(cellarFeatureSchema),
  phone: z.string().optional(),
  story: z.string().min(1),
  image: image,
  /** Slugy vín z e-shopu (len pri našej pivnici) */
  wines: z.array(slug).optional(),
});

export const mapAnchorSchema = z.object({ gps: gpsSchema, svg: mapPointSchema });
/** Presne 3 kotevné body pre prepočet GPS → SVG (afinná transformácia). */
export const mapAnchorsSchema = z.tuple([mapAnchorSchema, mapAnchorSchema, mapAnchorSchema]);

export const mapPoiSchema = z.object({
  id: slug,
  kind: z.enum(["vstup", "parkovisko", "wc", "vyhliadka", "penzion"]),
  label: z.string().min(1),
  mapPoint: mapPointSchema,
});

export const guideStopSchema = z.object({
  id: slug,
  order: z.number().int().positive(),
  title: z.string().min(1),
  mapPoint: mapPointSchema,
  gps: gpsSchema,
  audioUrl: z.string(),
  durationSec: z.number().int().positive(),
  transcript: z.string().min(1),
});

// ── E-shop ──────────────────────────────────────────────────────────────

export const shopConfigSchema = z.object({
  cartonSize: z.literal(6),
  cartonDiscountPct: z.number().min(0).max(50),
  sampleVolumeMl: z.number().int().positive(),
  recommendedCartons: z.array(
    z.object({ slug, name: z.string().min(1), description: z.string(), bottles: z.array(slug).length(6) }),
  ),
});

export const miniSetSchema = z.object({
  slug,
  name: z.string().min(1),
  description: z.string().min(1),
  samples: z.array(slug).length(6),
  priceCents: cents,
  /** Odporúčané poradie ochutnávania (slugy vín) */
  tastingOrder: z.array(slug).length(6),
});

export const giftSetSchema = z.object({
  slug,
  name: z.string().min(1),
  description: z.string().min(1),
  contents: z.array(z.string()).min(1),
  priceCents: cents,
  image: image,
});

export const cartItemSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bottle"), wineSlug: slug, qty: z.number().int().positive() }),
  z.object({ type: z.literal("carton"), id: z.string(), bottles: z.array(slug).length(6) }),
  z.object({ type: z.literal("mini-set"), id: z.string(), setSlug: slug.optional(), custom: z.array(slug).length(6).optional() }),
  z.object({ type: z.literal("gift-set"), setSlug: slug, qty: z.number().int().positive() }),
]);

// ── Obsah ───────────────────────────────────────────────────────────────

export const newsPostSchema = z.object({
  slug,
  title: z.string().min(1),
  date: z.iso.date(),
  excerpt: z.string().min(1),
  cover: image,
  /** Odseky oddelené prázdnym riadkom */
  body: z.string().min(1),
});

export const eventSchema = z.object({
  slug,
  title: z.string().min(1),
  date: z.iso.date(),
  place: z.string().min(1),
  description: z.string().min(1),
});

// ── Typy ────────────────────────────────────────────────────────────────

export type Gps = z.infer<typeof gpsSchema>;
export type MapPoint = z.infer<typeof mapPointSchema>;
export type Wine = z.infer<typeof wineSchema>;
export type WineLine = z.infer<typeof wineLineSchema>;
export type WineColor = z.infer<typeof wineColorSchema>;
export type Sweetness = z.infer<typeof sweetnessSchema>;
export type OpeningHours = z.infer<typeof openingHoursSchema>;
export type Cellar = z.infer<typeof cellarSchema>;
export type MapAnchor = z.infer<typeof mapAnchorSchema>;
export type MapAnchors = z.infer<typeof mapAnchorsSchema>;
export type MapPoi = z.infer<typeof mapPoiSchema>;
export type GuideStop = z.infer<typeof guideStopSchema>;
export type ShopConfig = z.infer<typeof shopConfigSchema>;
export type MiniSet = z.infer<typeof miniSetSchema>;
export type GiftSet = z.infer<typeof giftSetSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type NewsPost = z.infer<typeof newsPostSchema>;
export type Event = z.infer<typeof eventSchema>;

// Slovenské popisky enumov pre UI
export const wineLineLabel: Record<WineLine, string> = { ulicka: "Rad Ulička", spras: "Rad Spraš", pivnica: "Rad Pivnica" };
export const wineColorLabel: Record<WineColor, string> = { biele: "biele", ruzove: "ružové", cervene: "červené", sumive: "šumivé" };
export const sweetnessLabel: Record<Sweetness, string> = { suche: "suché", polosuche: "polosuché", polosladke: "polosladké", sladke: "sladké" };
