import { cacheLife } from "next/cache";
import { getEvents } from "@/lib/content";
import type { Event } from "@/lib/schemas";
import { formatDayMonth, formatLongDate } from "./format";

/** Akcie od dnešného dňa. Cache sa obnovuje po hodinách, aby minulé akcie zmizli. */
export async function getUpcomingEvents(limit?: number) {
  "use cache";
  cacheLife("hours");
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (await getEvents()).filter((e) => e.date >= today);
  return limit ? upcoming.slice(0, limit) : upcoming;
}

export function EventRow({ event, tone = "light" }: { event: Event; tone?: "light" | "cellar" }) {
  const { day, month } = formatDayMonth(event.date);
  const dark = tone === "cellar";
  return (
    <li className={`flex gap-5 border-t-2 pt-5 ${dark ? "border-vapno/60" : "border-pivnica/80"}`}>
      <time
        dateTime={event.date}
        className={`flex size-16 shrink-0 flex-col items-center justify-center rounded-(--radius-ui) font-display leading-none ${dark ? "bg-spras text-pivnica" : "bg-frankovka text-vapno"}`}
        aria-label={formatLongDate(event.date)}
      >
        <span className="text-xl font-extrabold">{day}</span>
        <span className="mt-1 text-sm">{month}</span>
      </time>
      <div>
        <h3 className="text-xl">{event.title}</h3>
        <p className={`mt-1 text-sm ${dark ? "text-vapno/70" : "text-pivnica-makka"}`}>{event.place}</p>
        <p className={`mt-2 ${dark ? "text-vapno/85" : "text-pivnica-makka"}`}>{event.description}</p>
      </div>
    </li>
  );
}
