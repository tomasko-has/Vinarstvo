// Malý testovací katalóg pre unit testy košíka. Seed dáta z content/ sa overujú zvlášť.
import type { Wine } from "@/lib/schemas";

export function wine(slug: string, overrides: Partial<Wine> = {}): Wine {
  return {
    slug,
    name: slug,
    line: "ulicka",
    variety: "Veltlínske zelené",
    vintage: 2025,
    color: "biele",
    sweetness: "suche",
    volumeMl: 750,
    priceCents: 1000,
    stock: 10,
    alcohol: 12,
    sugarGl: 2,
    acidityGl: 6,
    description: "Testovacie víno.",
    tasting: { body: 3, acidity: 3, fruit: 3 },
    pairing: [],
    images: [],
    sampleAvailable: true,
    ...overrides,
  };
}
