// Geometria ilustrovanej mapy uličky (viewBox 1000 × 600). Čisté funkcie bez Reactu,
// aby ich mohla použiť interaktívna mapa aj statické výrezy na detaile pivnice.
import type { MapPoint } from "@/lib/schemas";

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 600;

/** Deterministický generátor náhody (mulberry32): kresba vyzerá ručne, ale pri každom renderi rovnako. */
export function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Stred uličky (úvozu) v danom x. */
export const laneCenter = (x: number) => 300 + 7 * Math.sin(x / 140 + 0.6) - 3 * Math.sin(x / 60);
/** Polovičná šírka uličky. */
export const laneHalf = (x: number) => 20 + 3 * Math.sin(x / 80);
/** Šírka sprašového brehu nad uličkou (sever) a pod ňou (juh). */
export const bankNorth = (x: number) => 62 + 10 * Math.sin(x / 110 + 2);
export const bankSouth = (x: number) => 60 + 9 * Math.sin(x / 90);

export const LANE_START = 12;
export const LANE_END = 986;

export const laneTop = (x: number) => laneCenter(x) - laneHalf(x);
export const laneBottom = (x: number) => laneCenter(x) + laneHalf(x);
export const crestNorth = (x: number) => laneTop(x) - bankNorth(x);
export const crestSouth = (x: number) => laneBottom(x) + bankSouth(x);

/** Je bod nad uličkou (severná strana)? Podľa toho sa pivnica otáča čelom k uličke. */
export const isNorthSide = (p: MapPoint) => p.y < laneCenter(p.x);

/** Hladká krivka cez body (Catmull-Rom → kubické Bézierove krivky). */
export function smoothPath(points: [number, number][], closed = false): string {
  if (points.length < 2) return "";
  const pts = closed ? [points[points.length - 1], ...points, points[0], points[1]] : [points[0], ...points, points[points.length - 1]];
  let d = `M${r1(pts[1][0])} ${r1(pts[1][1])}`;
  for (let i = 1; i < pts.length - 2; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1], pts[i], pts[i + 1], pts[i + 2]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

/** Vzorky funkcie po krokoch s jemným chvením, ako keď sa čiara ťahá rukou. */
export function sample(f: (x: number) => number, from: number, to: number, step: number, jitter: number, seed: number) {
  const rnd = random(seed);
  const pts: [number, number][] = [];
  for (let x = from; x <= to + 0.001; x += step) pts.push([x, f(x) + (rnd() - 0.5) * jitter]);
  return pts;
}

/** Nepravidelný „ručne nakreslený“ kruh. */
export function wobblyCircle(cx: number, cy: number, r: number, seed: number, wobble = 0.12, n = 9): string {
  const rnd = random(seed);
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + (rnd() - 0.5) * wobble * 2);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return smoothPath(pts, true);
}

/**
 * Šrafy (hachures) sprašového brehu: krátke ťahy od hrany svahu dolu k uličke.
 * Vynechávajú miesta pred pivnicami a chodníky (`clearings`).
 */
export function hachures(side: "north" | "south", clearings: number[], seed: number): string {
  const rnd = random(seed);
  let d = "";
  for (let x = LANE_START + 4; x < LANE_END - 4; x += 5.5 + rnd() * 2) {
    if (clearings.some((c) => Math.abs(c - x) < 21)) continue;
    const crest = side === "north" ? crestNorth(x) : crestSouth(x);
    const edge = side === "north" ? laneTop(x) : laneBottom(x);
    const length = (edge - crest) * (0.42 + rnd() * 0.4);
    const start = crest + (edge - crest) * 0.04;
    const lean = (rnd() - 0.5) * 3;
    d += `M${r1(x)} ${r1(start)}l${r1(lean)} ${r1(length)}`;
  }
  return d;
}

export type Parcel = { rows: string; outline: string };

/** Vinica: rady viniča ako bodkované čiary (bodka = hlava kríka) v nepravidelnom obryse. */
export function vineyard(x1: number, y1: number, x2: number, y2: number, slant: number, seed: number): Parcel {
  const rnd = random(seed);
  let rows = "";
  for (let y = y1 + 5; y < y2 - 3; y += 9) {
    const a = x1 + 4 + rnd() * 5;
    const b = x2 - 4 - rnd() * 5;
    rows += `M${r1(a)} ${r1(y)}L${r1(b)} ${r1(y + slant)}`;
  }
  const outline = smoothPath(
    [
      [x1, y1 + (rnd() - 0.5) * 4],
      [(x1 + x2) / 2, y1 + (rnd() - 0.5) * 6],
      [x2, y1 + slant / 2 + (rnd() - 0.5) * 4],
      [x2 + (rnd() - 0.5) * 4, y2 + slant / 2],
      [(x1 + x2) / 2, y2 + slant / 2 + (rnd() - 0.5) * 6],
      [x1 + (rnd() - 0.5) * 4, y2],
    ],
    true,
  );
  return { rows, outline };
}

/** Polygon uličky alebo brehu medzi dvoma funkciami. */
export function band(top: (x: number) => number, bottom: (x: number) => number, from: number, to: number, seed: number) {
  const upper = sample(top, from, to, 25, 1.6, seed);
  const lower = sample(bottom, from, to, 25, 1.6, seed + 1).reverse();
  return `${smoothPath(upper)}L${r1(lower[0][0])} ${r1(lower[0][1])}${smoothPath(lower).replace(/^M[^C]+/, "")}Z`;
}
