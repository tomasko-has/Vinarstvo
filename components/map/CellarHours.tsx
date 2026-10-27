"use client";

import type { OpeningHours } from "@/lib/schemas";
import { useLaneTime } from "./hooks";
import { describeOpenState, openState, weekSchedule } from "./opening-hours";

/** „Otvorené do 21:00“ so zeleným lampášom. Pred hydratáciou ukáže len neutrálny text. */
export function OpenStatus({ hours, className = "" }: { hours: OpeningHours[]; className?: string }) {
  const now = useLaneTime();
  const state = now ? openState(hours, now) : null;
  return (
    <p className={`flex items-center gap-2 font-bold ${className}`}>
      <span
        aria-hidden="true"
        className={`size-3 shrink-0 rounded-full ring-2 ${
          state?.open ? "bg-listok ring-listok/30" : "bg-transparent ring-pivnica-makka/50"
        }`}
      />
      <span className={state?.open ? "text-listok" : "text-pivnica-makka"}>
        {state ? describeOpenState(state) : "Otváracie hodiny nižšie"}
      </span>
    </p>
  );
}

export function WeekHours({ hours }: { hours: OpeningHours[] }) {
  const now = useLaneTime();
  return (
    <table className="w-full max-w-xs text-sm">
      <caption className="sr-only">Otváracie hodiny</caption>
      <tbody>
        {weekSchedule(hours).map((d) => {
          const today = now?.day === d.day;
          return (
            <tr key={d.day} className={today ? "font-bold text-pivnica" : "text-pivnica-makka"}>
              <th scope="row" className="py-1 pr-4 text-left font-[inherit]">
                {d.label}
                {today && <span className="sr-only"> (dnes)</span>}
              </th>
              <td className="py-1 text-right tabular-nums">{d.times.length ? d.times.join(", ") : "zatvorené"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
