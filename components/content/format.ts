// Pomocné formátovače pre obsahové stránky (slovenské formáty).
const eurFormat = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" });
const longDateFormat = new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const dayMonthFormat = new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "short", timeZone: "UTC" });

export function formatEur(cents: number) {
  return eurFormat.format(cents / 100);
}

/** ISO dátum (YYYY-MM-DD) → „11. novembra 2026“ */
export function formatLongDate(iso: string) {
  return longDateFormat.format(new Date(iso));
}

/** ISO dátum → { day: "11", month: "nov" } pre dátumový štítok */
export function formatDayMonth(iso: string) {
  const parts = dayMonthFormat.formatToParts(new Date(iso));
  return {
    day: parts.find((p) => p.type === "day")?.value ?? "",
    month: parts.find((p) => p.type === "month")?.value.replace(".", "") ?? "",
  };
}

const dayNames = ["nedeľa", "pondelok", "utorok", "streda", "štvrtok", "piatok", "sobota"];
const weekOrder = [1, 2, 3, 4, 5, 6, 0];

/** [3, 4] → „Streda a štvrtok“, [1,2,3,4,5] → „Pondelok až piatok“ */
export function formatDays(days: number[]) {
  const sorted = [...days].sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));
  const runs: number[][] = [];
  for (const d of sorted) {
    const last = runs.at(-1);
    if (last && weekOrder.indexOf(d) === weekOrder.indexOf(last.at(-1)!) + 1) last.push(d);
    else runs.push([d]);
  }
  const text = runs
    .map((run) => {
      if (run.length === 1) return dayNames[run[0]];
      if (run.length === 2) return `${dayNames[run[0]]} a ${dayNames[run[1]]}`;
      return `${dayNames[run[0]]} až ${dayNames[run.at(-1)!]}`;
    })
    .join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
