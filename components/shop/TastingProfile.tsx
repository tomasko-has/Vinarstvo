import type { Wine } from "@/lib/schemas";

const scales: { key: keyof Wine["tasting"]; label: string; low: string; high: string }[] = [
  { key: "body", label: "Telo", low: "ľahké", high: "plné" },
  { key: "acidity", label: "Kyselina", low: "jemná", high: "svieža" },
  { key: "fruit", label: "Ovocie", low: "zdržanlivé", high: "výrazné" },
];

/** Chuťový profil ako päť políčok na škále, s textovým popisom pre čítačky. */
export function TastingProfile({ tasting }: { tasting: Wine["tasting"] }) {
  return (
    <dl className="space-y-4">
      {scales.map((scale) => {
        const value = tasting[scale.key];
        return (
          <div key={scale.key} className="grid grid-cols-[5.5rem_1fr] items-center gap-x-4 gap-y-1">
            <dt className="font-bold">{scale.label}</dt>
            <dd>
              <span className="sr-only">
                {value} z 5 ({scale.low} až {scale.high})
              </span>
              <span aria-hidden="true" className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={`h-3 flex-1 rounded-sm ${n <= value ? "bg-frankovka" : "bg-vapno-tien"}`} />
                ))}
              </span>
              <span aria-hidden="true" className="mt-1 flex justify-between text-sm text-pivnica-makka">
                <span>{scale.low}</span>
                <span>{scale.high}</span>
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
