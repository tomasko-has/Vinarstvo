import { describe, expect, it } from "vitest";
import {
  addBottle,
  availableStock,
  canAddBottle,
  cartonPrice,
  fillRandom,
  indexWines,
  removeBottleAt,
  validateCarton,
} from "./carton";
import { wine } from "./test-wines";

const wines = [
  wine("veltlin", { priceCents: 890, stock: 100 }),
  wine("frankovka", { priceCents: 990, stock: 3, color: "cervene" }),
  wine("posledny", { priceCents: 1390, stock: 1 }),
  wine("vypredany", { stock: 0 }),
  wine("magnum", { volumeMl: 1500, stock: 20 }),
];
const index = indexWines(wines);
const stock = availableStock(wines);
const SIZE = 6;

describe("canAddBottle", () => {
  it("dovolí pridať víno na sklade do neplného kartónu", () => {
    expect(canAddBottle([], "veltlin", index, stock, SIZE)).toEqual({ ok: true });
  });

  it("to isté víno môže byť v kartóne viackrát", () => {
    const bottles = ["veltlin", "veltlin", "veltlin"];
    expect(canAddBottle(bottles, "veltlin", index, stock, SIZE).ok).toBe(true);
  });

  it("odmietne siedmu fľašu", () => {
    const full = Array(6).fill("veltlin");
    expect(canAddBottle(full, "veltlin", index, stock, SIZE)).toEqual({ ok: false, reason: "full" });
  });

  it("odmietne viac kusov, než je na sklade", () => {
    expect(canAddBottle(["posledny"], "posledny", index, stock, SIZE)).toEqual({ ok: false, reason: "out-of-stock" });
    expect(canAddBottle([], "vypredany", index, stock, SIZE)).toEqual({ ok: false, reason: "out-of-stock" });
  });

  it("odmietne neznáme víno a iný objem ako 0,75 l", () => {
    expect(canAddBottle([], "neexistuje", index, stock, SIZE)).toEqual({ ok: false, reason: "unknown" });
    expect(canAddBottle([], "magnum", index, stock, SIZE)).toEqual({ ok: false, reason: "not-eligible" });
  });

  it("počíta so sklad rezervovaným inde v košíku", () => {
    const reserved = availableStock(wines, new Map([["frankovka", 2]]));
    expect(canAddBottle([], "frankovka", index, reserved, SIZE).ok).toBe(true);
    expect(canAddBottle(["frankovka"], "frankovka", index, reserved, SIZE).ok).toBe(false);
  });
});

describe("addBottle / removeBottleAt", () => {
  it("pridá fľašu a odstráni ju podľa poradia slotu", () => {
    const one = addBottle([], "veltlin", index, stock, SIZE);
    const two = addBottle(one, "frankovka", index, stock, SIZE);
    expect(two).toEqual(["veltlin", "frankovka"]);
    expect(removeBottleAt(two, 0)).toEqual(["frankovka"]);
  });

  it("pri zamietnutí vráti pôvodné pole", () => {
    const before = ["posledny"];
    expect(addBottle(before, "posledny", index, stock, SIZE)).toBe(before);
    expect(removeBottleAt(before, 5)).toBe(before);
  });
});

describe("fillRandom", () => {
  it("doplní kartón do 6 fliaš a dodrží sklad", () => {
    for (let seed = 0; seed < 20; seed++) {
      let n = seed;
      const random = () => ((n = (n * 9301 + 49297) % 233280) / 233280);
      const filled = fillRandom(["posledny"], wines, stock, SIZE, random);
      expect(filled).toHaveLength(6);
      expect(filled[0]).toBe("posledny");
      expect(validateCarton(filled, index, stock, SIZE)).toEqual([]);
    }
  });

  it("nechá kartón neúplný, keď na sklade nie je dosť vína", () => {
    const few = [wine("a", { stock: 2 }), wine("b", { stock: 1 })];
    const filled = fillRandom([], few, availableStock(few), SIZE);
    expect(filled).toHaveLength(3);
  });

  it("plný kartón nezmení", () => {
    const full = Array(6).fill("veltlin");
    expect(fillRandom(full, wines, stock, SIZE)).toEqual(full);
  });
});

describe("validateCarton", () => {
  it("platný kartón nemá chyby", () => {
    const carton = ["veltlin", "veltlin", "frankovka", "frankovka", "frankovka", "posledny"];
    expect(validateCarton(carton, index, stock, SIZE)).toEqual([]);
  });

  it("hlási nesprávny počet fliaš", () => {
    expect(validateCarton(["veltlin"], index, stock, SIZE)).toEqual([{ kind: "size", count: 1, size: 6 }]);
  });

  it("hlási prekročený sklad, neznáme víno a nesprávny objem", () => {
    const carton = ["frankovka", "frankovka", "frankovka", "frankovka", "zmizne", "magnum"];
    expect(validateCarton(carton, index, stock, SIZE)).toEqual([
      { kind: "stock", slug: "frankovka", requested: 4, available: 3 },
      { kind: "unknown", slug: "zmizne" },
      { kind: "not-eligible", slug: "magnum" },
    ]);
  });
});

describe("cartonPrice", () => {
  it("odpočíta zľavu za kartón a zaokrúhli na centy", () => {
    const carton = ["veltlin", "veltlin", "veltlin", "frankovka", "frankovka", "posledny"];
    // 3 × 8,90 + 2 × 9,90 + 13,90 = 60,40 €; 10 % = 6,04 €
    expect(cartonPrice(carton, index, 10)).toEqual({ subtotalCents: 6040, discountCents: 604, totalCents: 5436 });
  });

  it("zaokrúhľuje polovice centov nahor", () => {
    const odd = indexWines([wine("x", { priceCents: 1005 })]);
    // 1005 × 6 = 6030, 7,5 % = 452,25 → 452
    expect(cartonPrice(Array(6).fill("x"), odd, 7.5).discountCents).toBe(452);
    // 1005 × 1 = 1005, 10 % = 100,5 → 101
    expect(cartonPrice(["x"], odd, 10).discountCents).toBe(101);
  });

  it("bez zľavy je cena súčtom fliaš", () => {
    expect(cartonPrice(["veltlin", "frankovka"], index, 0)).toEqual({
      subtotalCents: 1880,
      discountCents: 0,
      totalCents: 1880,
    });
  });
});
