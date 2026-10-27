import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { wineSchema } from "@/lib/schemas";
import { vineyardsSchema } from "./vineyards";
import { readdirSync } from "node:fs";

const root = path.join(__dirname, "..", "..", "content");

describe("vinice", () => {
  const vineyards = vineyardsSchema.parse(JSON.parse(readFileSync(path.join(root, "pages", "vinice.json"), "utf8")));

  it("názvy viníc sa zhodujú s poľom vineyard vo vínach", () => {
    const wines = readdirSync(path.join(root, "wines")).map((f) =>
      wineSchema.parse(JSON.parse(readFileSync(path.join(root, "wines", f), "utf8"))),
    );
    const names = new Set(vineyards.map((v) => v.name));
    for (const w of wines) if (w.vineyard) expect(names.has(w.vineyard)).toBe(true);
    for (const v of vineyards) expect(wines.some((w) => w.vineyard === v.name)).toBe(true);
  });
});
