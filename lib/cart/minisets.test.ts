import { describe, expect, it } from "vitest";
import { suggestTastingOrder } from "./minisets";
import { wine } from "./test-wines";

describe("suggestTastingOrder", () => {
  it("šumivé, biele, ružové, červené a sladké na koniec", () => {
    const order = suggestTastingOrder([
      wine("frankovka", { color: "cervene" }),
      wine("palava", { color: "biele", sweetness: "polosladke" }),
      wine("rose", { color: "ruzove", sweetness: "polosuche" }),
      wine("rizling", { color: "biele", tasting: { body: 4, acidity: 5, fruit: 4 } }),
      wine("veltlin", { color: "biele", tasting: { body: 2, acidity: 4, fruit: 3 } }),
      wine("sekt", { color: "sumive" }),
    ]).map((w) => w.slug);
    expect(order).toEqual(["sekt", "veltlin", "rizling", "rose", "frankovka", "palava"]);
  });
});
