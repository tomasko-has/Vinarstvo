// GPS v obsahu musí sedieť s bodmi na mape, inak by bodka „tu ste“ ukazovala vedľa.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cellarSchema, guideStopSchema, mapAnchorsSchema } from "@/lib/schemas";
import { createGeoTransform } from "./affine";

const CONTENT = path.join(__dirname, "..", "..", "content");
const read = (file: string) => JSON.parse(readFileSync(path.join(CONTENT, file), "utf8"));
const readDir = (dir: string) =>
  readdirSync(path.join(CONTENT, dir))
    .filter((f) => f.endsWith(".json"))
    .map((f) => read(`${dir}/${f}`));

const transform = createGeoTransform(mapAnchorsSchema.parse(read("map/anchors.json")));
const cellars = readDir("cellars").map((c) => cellarSchema.parse(c));
const stops = readDir("guide").map((s) => guideStopSchema.parse(s));

describe("GPS v obsahu zodpovedá mape", () => {
  it.each([...cellars.map((c) => [c.slug, c] as const), ...stops.map((s) => [s.id, s] as const)])(
    "%s",
    (_, { gps, mapPoint }) => {
      const p = transform.toSvg(gps);
      expect(Math.hypot(p.x - mapPoint.x, p.y - mapPoint.y)).toBeLessThan(5);
    },
  );

  it("zastávky idú pozdĺž uličky zľava doprava (okrem odbočky na vyhliadku)", () => {
    const xs = [...stops].sort((a, b) => a.order - b.order).map((s) => s.mapPoint.x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });

  it("audio súbory zastávok sú pomenované podľa poradia", () => {
    for (const s of stops) {
      expect(s.audioUrl).toBe(`/audio/guide/${String(s.order).padStart(2, "0")}-${s.id}.mp3`);
    }
  });
});
