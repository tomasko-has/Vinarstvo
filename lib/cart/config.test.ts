// Krížová kontrola konfigurácie e-shopu proti seed dátam vín.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { wineSchema } from "@/lib/schemas";
import { availableStock, indexWines, validateCarton } from "./carton";
import { eshopConfig } from "./config";

const dir = path.join(__dirname, "..", "..", "content", "wines");
const wines = readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => wineSchema.parse(JSON.parse(readFileSync(path.join(dir, f), "utf8"))));

describe("content/shop-config.json", () => {
  it("má cenu vlastného mini-setu", () => {
    expect(eshopConfig.customMiniSetPriceCents).toBeGreaterThan(0);
  });

  it("odporúčané kartóny sú platné kartóny pri aktuálnom sklade", () => {
    const index = indexWines(wines);
    const stock = availableStock(wines);
    for (const carton of eshopConfig.recommendedCartons) {
      expect(validateCarton(carton.bottles, index, stock, eshopConfig.cartonSize), carton.slug).toEqual([]);
    }
  });
});
