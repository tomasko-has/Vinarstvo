// Stav „práve otvorené“ podľa otváracích hodín. Čas berieme vždy v časovom pásme uličky,
// nie podľa nastavenia telefónu (turista zo zahraničia má iné pásmo).
import type { OpeningHours } from "@/lib/schemas";

export const LANE_TIME_ZONE = "Europe/Bratislava";

/** Deň v týždni (0 = nedeľa) a minúty od polnoci. */
export type LaneTime = { day: number; minutes: number };

export type OpenState =
  | { open: true; closes: string }
  | { open: false; next: { day: number; time: string; inDays: number } | null };

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const WEEKDAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function laneTime(date: Date, timeZone = LANE_TIME_ZONE): LaneTime {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: WEEKDAY[get("weekday")], minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function openState(hours: OpeningHours[], now: LaneTime): OpenState {
  // Otvorené teraz: dnešný interval, alebo včerajší, ktorý ide cez polnoc
  for (const h of hours) {
    const open = toMinutes(h.open);
    let close = toMinutes(h.close);
    if (close <= open) close += 24 * 60;
    const yesterday = (now.day + 6) % 7;
    if (h.days.includes(now.day) && now.minutes >= open && now.minutes < close) return { open: true, closes: h.close };
    if (h.days.includes(yesterday) && now.minutes + 24 * 60 < close) return { open: true, closes: h.close };
  }

  // Najbližšie otvorenie v nasledujúcich 7 dňoch
  for (let inDays = 0; inDays <= 7; inDays++) {
    const day = (now.day + inDays) % 7;
    const candidates = hours
      .filter((h) => h.days.includes(day))
      .map((h) => h.open)
      .filter((open) => inDays > 0 || toMinutes(open) > now.minutes)
      .sort();
    if (candidates.length > 0) return { open: false, next: { day, time: candidates[0], inDays } };
  }
  return { open: false, next: null };
}

const DAY_IN = ["v nedeľu", "v pondelok", "v utorok", "v stredu", "vo štvrtok", "v piatok", "v sobotu"];
const DAY_SHORT = ["Ne", "Po", "Ut", "St", "Št", "Pi", "So"];
const DAY_LONG = ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"];

export function describeOpenState(state: OpenState): string {
  if (state.open) return `Otvorené do ${state.closes}`;
  if (!state.next) return "Zatvorené";
  const { day, time, inDays } = state.next;
  const when = inDays === 0 ? "dnes" : inDays === 1 ? "zajtra" : DAY_IN[day];
  return `Zatvorené, otvárajú ${when} o ${time}`;
}

/** Riadky rozvrhu od pondelka po nedeľu, napr. { label: "Štvrtok", times: ["15:00 – 19:00"] }. */
export function weekSchedule(hours: OpeningHours[]): { day: number; label: string; short: string; times: string[] }[] {
  return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
    day,
    label: DAY_LONG[day],
    short: DAY_SHORT[day],
    times: hours
      .filter((h) => h.days.includes(day))
      .sort((a, b) => a.open.localeCompare(b.open))
      .map((h) => `${h.open} – ${h.close}`),
  }));
}
