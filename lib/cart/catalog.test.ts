import { describe, expect, it } from "vitest";
import {
  emptyFilters,
  filterWines,
  parseFilters,
  serializeFilters,
  sortWines,
  stockStatus,
  varietyOptions,
  varietySlug,
} from "./catalog";
import { wine } from "./test-wines";

const wines = [
  wine("veltlin", { line: "ulicka", priceCents: 890, vintage: 2025 }),
  wine("frankovka", { line: "ulicka", color: "cervene", variety: "Frankovka modrá", priceCents: 990, vintage: 2024 }),
  wine("palava", { line: "spras", sweetness: "polosladke", variety: "Pálava", priceCents: 1390, vintage: 2024 }),
  wine("archiv", { line: "pivnica", color: "cervene", variety: "Cabernet Sauvignon", priceCents: 2490, stock: 0, vintage: 2021 }),
  wine("sekt", { line: "pivnica", color: "sumive", variety: "Rizling rýnsky, Veltlínske zelené", priceCents: 1990, vintage: 2022 }),
];
const slugs = (list: { slug: string }[]) => list.map((w) => w.slug);

describe("URL parametre filtrov", () => {
  it("prečíta viac hodnôt a zahodí neznáme", () => {
    const params = new URLSearchParams("rad=spras,pivnica,ine&farba=cervene&radenie=nieco");
    expect(parseFilters(params)).toEqual({ ...emptyFilters, line: ["spras", "pivnica"], color: ["cervene"] });
  });

  it("serialize a parse sú inverzné a predvolené hodnoty do URL nepíše", () => {
    const filters = { ...emptyFilters, sweetness: ["suche" as const], variety: ["palava"], sort: "nazov" as const };
    const params = serializeFilters(filters);
    expect(params.toString()).toBe("sladkost=suche&odroda=palava&radenie=nazov");
    expect(parseFilters(params)).toEqual(filters);
    expect(serializeFilters(emptyFilters).toString()).toBe("");
  });
});

describe("filterWines", () => {
  it("v skupine platí alebo, medzi skupinami a zároveň", () => {
    expect(slugs(filterWines(wines, { ...emptyFilters, line: ["spras", "pivnica"] }))).toEqual(["palava", "archiv", "sekt"]);
    expect(slugs(filterWines(wines, { ...emptyFilters, line: ["ulicka"], color: ["cervene"] }))).toEqual(["frankovka"]);
  });

  it("cuvée nájde podľa ktorejkoľvek odrody", () => {
    expect(slugs(filterWines(wines, { ...emptyFilters, variety: ["veltlinske-zelene"] }))).toEqual(["veltlin", "sekt"]);
  });
});

describe("sortWines", () => {
  it("odporúčané: vypredané na koniec, potom rad a cena", () => {
    expect(slugs(sortWines(wines, "odporucane"))).toEqual(["veltlin", "frankovka", "palava", "sekt", "archiv"]);
  });

  it("podľa ceny a ročníka", () => {
    expect(slugs(sortWines(wines, "cena-zostupne"))[0]).toBe("archiv");
    expect(slugs(sortWines(wines, "cena-vzostupne"))[0]).toBe("veltlin");
    expect(slugs(sortWines(wines, "rocnik"))).toEqual(["veltlin", "frankovka", "palava", "sekt", "archiv"]);
  });
});

describe("odrody a sklad", () => {
  it("slug odrody bez diakritiky", () => {
    expect(varietySlug("Svätovavrinecké")).toBe("svatovavrinecke");
    expect(varietySlug("Müller Thurgau")).toBe("muller-thurgau");
  });

  it("zoznam odrôd rozdelí cuvée a spočíta vína", () => {
    const options = varietyOptions(wines);
    expect(options.find((o) => o.slug === "veltlinske-zelene")?.count).toBe(2);
    expect(options.map((o) => o.slug)).toContain("rizling-rynsky");
  });

  it("stav skladu", () => {
    expect(stockStatus(0)).toBe("vypredane");
    expect(stockStatus(2)).toBe("posledne");
    expect(stockStatus(40)).toBe("skladom");
  });
});

describe("lokálne popisky", () => {
  it("pokrývajú všetky hodnoty enumov zo schém", async () => {
    const { sweetnessSchema, wineColorSchema, wineLineSchema } = await import("@/lib/schemas");
    const labels = await import("./labels");
    expect(labels.wineLines).toEqual(wineLineSchema.options);
    expect(labels.wineColors).toEqual(wineColorSchema.options);
    expect(labels.sweetnesses).toEqual(sweetnessSchema.options);
  });
});
