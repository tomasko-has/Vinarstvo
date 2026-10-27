import { describe, expect, it } from "vitest";
import type { OpeningHours } from "@/lib/schemas";
import { describeOpenState, laneTime, openState, weekSchedule } from "./opening-hours";

const hours: OpeningHours[] = [
  { days: [3, 4], open: "15:00", close: "19:00" },
  { days: [5], open: "16:00", close: "21:00" },
  { days: [6], open: "22:00", close: "02:00" },
];

const at = (day: number, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return { day, minutes: h * 60 + m };
};

describe("openState", () => {
  it("otvorené počas intervalu, zatvorené presne v čase zatvárania", () => {
    expect(openState(hours, at(3, "15:00"))).toEqual({ open: true, closes: "19:00" });
    expect(openState(hours, at(4, "18:59")).open).toBe(true);
    expect(openState(hours, at(4, "19:00")).open).toBe(false);
  });

  it("nájde najbližšie otvorenie dnes, zajtra aj o niekoľko dní", () => {
    expect(openState(hours, at(3, "10:00"))).toEqual({ open: false, next: { day: 3, time: "15:00", inDays: 0 } });
    expect(openState(hours, at(4, "20:00"))).toEqual({ open: false, next: { day: 5, time: "16:00", inDays: 1 } });
    expect(openState(hours, at(0, "12:00"))).toEqual({ open: false, next: { day: 3, time: "15:00", inDays: 3 } });
  });

  it("interval cez polnoc platí aj nasledujúci deň ráno", () => {
    expect(openState(hours, at(6, "23:30"))).toEqual({ open: true, closes: "02:00" });
    expect(openState(hours, at(0, "01:15"))).toEqual({ open: true, closes: "02:00" });
    expect(openState(hours, at(0, "02:00")).open).toBe(false);
  });

  it("bez otváracích hodín je stále zatvorené", () => {
    expect(openState([], at(5, "17:00"))).toEqual({ open: false, next: null });
  });
});

describe("describeOpenState", () => {
  it("píše ľudsky", () => {
    expect(describeOpenState(openState(hours, at(5, "17:00")))).toBe("Otvorené do 21:00");
    expect(describeOpenState(openState(hours, at(3, "09:00")))).toBe("Zatvorené, otvárajú dnes o 15:00");
    expect(describeOpenState(openState(hours, at(2, "09:00")))).toBe("Zatvorené, otvárajú zajtra o 15:00");
    expect(describeOpenState(openState(hours, at(0, "09:00")))).toBe("Zatvorené, otvárajú v stredu o 15:00");
    expect(describeOpenState(openState([], at(0, "09:00")))).toBe("Zatvorené");
  });
});

describe("laneTime", () => {
  it("prepočíta čas do pásma uličky (letný aj zimný čas)", () => {
    // 2026-07-03 je piatok; 14:30 UTC = 16:30 v Bratislave (SELČ)
    expect(laneTime(new Date("2026-07-03T14:30:00Z"))).toEqual({ day: 5, minutes: 16 * 60 + 30 });
    // 2026-12-05 je sobota; 23:30 UTC = nedeľa 00:30 v Bratislave (SEČ)
    expect(laneTime(new Date("2026-12-05T23:30:00Z"))).toEqual({ day: 0, minutes: 30 });
  });
});

describe("weekSchedule", () => {
  it("začína pondelkom a zoradí časy", () => {
    const week = weekSchedule(hours);
    expect(week.map((d) => d.short)).toEqual(["Po", "Ut", "St", "Št", "Pi", "So", "Ne"]);
    expect(week[2].times).toEqual(["15:00 – 19:00"]);
    expect(week[0].times).toEqual([]);
  });
});
