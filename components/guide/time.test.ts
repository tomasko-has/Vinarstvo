import { describe, expect, it } from "vitest";
import { formatRate, formatTime, spokenTime } from "./time";

describe("čas nahrávky", () => {
  it("formatTime", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(95.7)).toBe("1:35");
    expect(formatTime(Number.NaN)).toBe("0:00");
  });

  it("spokenTime skloňuje po slovensky", () => {
    expect(spokenTime(95)).toBe("1 minúta 35 sekúnd");
    expect(spokenTime(120)).toBe("2 minúty");
    expect(spokenTime(3)).toBe("3 sekundy");
    expect(spokenTime(301)).toBe("5 minút 1 sekunda");
  });

  it("formatRate používa desatinnú čiarku", () => {
    expect(formatRate(1.25)).toBe("1,25×");
    expect(formatRate(1)).toBe("1×");
  });
});
