// Načítanie obsahu z content/ s validáciou cez Zod. Obsah sa mení len pri deployi → cacheLife("max").
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
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

const CONTENT = path.join(process.cwd(), "content");

async function readJson<S extends z.ZodType>(schema: S, file: string): Promise<z.infer<S>> {
  const raw = JSON.parse(await readFile(path.join(CONTENT, file), "utf8"));
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Neplatný obsah v content/${file}:\n${result.error.message}`);
  }
  return result.data;
}

async function readDir<S extends z.ZodType>(schema: S, dir: string): Promise<z.infer<S>[]> {
  const files = (await readdir(path.join(CONTENT, dir))).filter((f) => f.endsWith(".json")).sort();
  return Promise.all(files.map((f) => readJson(schema, `${dir}/${f}`)));
}

// ── Vína a e-shop ──

export async function getWines() {
  "use cache";
  cacheLife("max");
  return readDir(wineSchema, "wines");
}

export async function getWine(slug: string) {
  "use cache";
  cacheLife("max");
  return (await getWines()).find((w) => w.slug === slug) ?? null;
}

export async function getShopConfig() {
  "use cache";
  cacheLife("max");
  return readJson(shopConfigSchema, "shop-config.json");
}

export async function getMiniSets() {
  "use cache";
  cacheLife("max");
  return readDir(miniSetSchema, "sets/mini");
}

export async function getGiftSets() {
  "use cache";
  cacheLife("max");
  return readDir(giftSetSchema, "sets/gift");
}

// ── Mapa a sprievodca ──

export async function getCellars() {
  "use cache";
  cacheLife("max");
  return readDir(cellarSchema, "cellars");
}

export async function getCellar(slug: string) {
  "use cache";
  cacheLife("max");
  return (await getCellars()).find((c) => c.slug === slug) ?? null;
}

export async function getMapAnchors() {
  "use cache";
  cacheLife("max");
  return readJson(mapAnchorsSchema, "map/anchors.json");
}

export async function getMapPois() {
  "use cache";
  cacheLife("max");
  return readDir(mapPoiSchema, "map/poi");
}

export async function getGuideStops() {
  "use cache";
  cacheLife("max");
  return (await readDir(guideStopSchema, "guide")).sort((a, b) => a.order - b.order);
}

// ── Aktuality a akcie ──

export async function getNews() {
  "use cache";
  cacheLife("max");
  return (await readDir(newsPostSchema, "news")).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getEvents() {
  "use cache";
  cacheLife("max");
  return (await readDir(eventSchema, "events")).sort((a, b) => a.date.localeCompare(b.date));
}
