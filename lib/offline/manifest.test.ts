import { describe, expect, it } from "vitest";
import { GUIDE_MANIFEST_URL } from "./constants";
import { buildGuideManifest, isAudioUrl } from "./manifest";

const cellars = [
  { slug: "pod-orechom", image: { src: "/images/placeholder/pivnica.svg" } },
  { slug: "na-sprasi", image: { src: "/images/placeholder/pivnica.svg" } },
];
const stops = [
  { order: 2, audioUrl: "/audio/guide/02.mp3" },
  { order: 1, audioUrl: "/audio/guide/01.mp3" },
];

describe("buildGuideManifest", () => {
  const manifest = buildGuideManifest({ cellars, stops });

  it("obsahuje mapu, sprievodcu a profil každej pivnice", () => {
    expect(manifest).toEqual(
      expect.arrayContaining(["/mapa", "/sprievodca", "/mapa/pod-orechom", "/mapa/na-sprasi", "/offline"]),
    );
  });

  it("obsahuje samotný manifest, aby sa dal skontrolovať offline", () => {
    expect(manifest[0]).toBe(GUIDE_MANIFEST_URL);
  });

  it("odstráni duplicity (zdieľaný obrázok)", () => {
    expect(manifest.filter((u) => u === "/images/placeholder/pivnica.svg")).toHaveLength(1);
    expect(new Set(manifest).size).toBe(manifest.length);
  });

  it("audio zoradí podľa poradia zastávok a dá na koniec", () => {
    expect(manifest.slice(-2)).toEqual(["/audio/guide/01.mp3", "/audio/guide/02.mp3"]);
  });

  it("zahodí cudzie a protokolovo relatívne URL", () => {
    const out = buildGuideManifest({
      cellars,
      stops: [
        { order: 1, audioUrl: "https://evil.example/a.mp3" },
        { order: 2, audioUrl: "//evil.example/b.mp3" },
      ],
    });
    expect(out.some((u) => u.includes("evil"))).toBe(false);
  });
});

describe("isAudioUrl", () => {
  it("rozpozná audio podľa cesty aj prípony", () => {
    expect(isAudioUrl("/audio/guide/01.mp3")).toBe(true);
    expect(isAudioUrl("/x/voice.mp3?v=2")).toBe(true);
    expect(isAudioUrl("/mapa")).toBe(false);
  });
});
