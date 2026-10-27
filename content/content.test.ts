// Kontrola seed dát: schémy + krížové odkazy. Spúšťa sa cez `npm test`.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
  cellarSchema,
  eventSchema,
  giftSetSchema,
  guideStopSchema,
  mapAnchorsSchema,
  mapPoiSchema,
  miniSetSchema,
  newsPostSchema,
  shopConfigSchema,
  wineSchema,
} from "@/lib/schemas";

const CONTENT = path.join(__dirname);
const PUBLIC = path.join(__dirname, "..", "public");

function load<S extends z.ZodType>(schema: S, file: string): z.infer<S> {
  return schema.parse(JSON.parse(readFileSync(path.join(CONTENT, file), "utf8")));
}

function loadDir<S extends z.ZodType>(schema: S, dir: string): z.infer<S>[] {
  return readdirSync(path.join(CONTENT, dir))
    .filter((f) => f.endsWith(".json"))
    .map((f) => load(schema, `${dir}/${f}`));
}

const wines = loadDir(wineSchema, "wines");
const wineSlugs = new Set(wines.map((w) => w.slug));
const cellars = loadDir(cellarSchema, "cellars");
const stops = loadDir(guideStopSchema, "guide");
const miniSets = loadDir(miniSetSchema, "sets/mini");
const giftSets = loadDir(giftSetSchema, "sets/gift");
const shopConfig = load(shopConfigSchema, "shop-config.json");
const news = loadDir(newsPostSchema, "news");

describe("obsah zodpovedá schémam", () => {
  it("všetky súbory sa dajú načítať", () => {
    expect(wines.length).toBeGreaterThan(0);
    expect(cellars.length).toBeGreaterThan(0);
    expect(load(mapAnchorsSchema, "map/anchors.json")).toHaveLength(3);
    expect(loadDir(mapPoiSchema, "map/poi").length).toBeGreaterThan(0);
    expect(loadDir(eventSchema, "events").length).toBeGreaterThan(0);
    expect(giftSets.length).toBeGreaterThan(0);
    expect(news.length).toBeGreaterThan(0);
  });

  it("slugy sú unikátne", () => {
    for (const list of [wines, cellars, miniSets, giftSets, news]) {
      const slugs = list.map((x) => x.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
    const ids = stops.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("krížové odkazy", () => {
  it("práve jedna pivnica je naša a jej vína existujú", () => {
    const ours = cellars.filter((c) => c.isOurs);
    expect(ours).toHaveLength(1);
    for (const slug of ours[0].wines ?? []) expect(wineSlugs).toContain(slug);
  });

  it("odporúčané kartóny obsahujú existujúce vína", () => {
    for (const carton of shopConfig.recommendedCartons) {
      for (const slug of carton.bottles) expect(wineSlugs).toContain(slug);
    }
  });

  it("mini-sety obsahujú len vína dostupné ako vzorka a poradie je ich permutácia", () => {
    const samples = new Set(wines.filter((w) => w.sampleAvailable).map((w) => w.slug));
    for (const set of miniSets) {
      for (const slug of set.samples) expect(samples).toContain(slug);
      expect([...set.tastingOrder].sort()).toEqual([...set.samples].sort());
    }
  });

  it("zastávky sprievodcu idú po poradí 1…n", () => {
    const orders = stops.map((s) => s.order).sort((a, b) => a - b);
    expect(orders).toEqual(orders.map((_, i) => i + 1));
  });

  it("obrázky v obsahu existujú v public/", () => {
    const srcs = [
      ...wines.flatMap((w) => w.images.map((i) => i.src)),
      ...cellars.map((c) => c.image.src),
      ...giftSets.map((g) => g.image.src),
      ...news.map((n) => n.cover.src),
    ];
    for (const src of new Set(srcs)) expect(existsSync(path.join(PUBLIC, src)), src).toBe(true);
  });
});
