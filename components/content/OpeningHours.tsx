import { getCellar } from "@/lib/content";
import { formatDays } from "./format";

/** Otváracie hodiny našej pivnice z dát mapy (jeden zdroj pravdy so sessionom A). */
export async function OpeningHours({ tone = "light" }: { tone?: "light" | "cellar" }) {
  const cellar = await getCellar("na-sprasi");
  if (!cellar) return null;
  const dark = tone === "cellar";
  return (
    <dl className="divide-y divide-current/20">
      {cellar.openingHours.map((h) => (
        <div key={h.days.join()} className="flex flex-wrap justify-between gap-x-6 py-3">
          <dt>{formatDays(h.days)}</dt>
          <dd className={`font-bold ${dark ? "text-spras" : "text-pivnica"}`}>
            {h.open} až {h.close}
          </dd>
        </div>
      ))}
    </dl>
  );
}
