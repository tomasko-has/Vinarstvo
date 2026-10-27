"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  countActive,
  emptyFilters,
  filterWines,
  parseFilters,
  serializeFilters,
  sortKeys,
  sortLabel,
  sortWines,
  varietyOptions,
  type CatalogFilters,
  type SortKey,
} from "@/lib/cart/catalog";
import { plural } from "@/lib/cart/format";
import {
  sweetnesses,
  sweetnessLabel,
  wineColorLabel,
  wineColors,
  wineLineLabel,
  wineLines,
} from "@/lib/cart/labels";
import type { Wine } from "@/lib/schemas";
import { ShopIcon } from "./ShopIcon";
import { WineCard } from "./WineCard";

type GroupKey = "line" | "color" | "sweetness" | "variety";
type Option = { value: string; label: string };

/** Katalóg s filtrami v URL. Filtre menia adresu cez history.replaceState, bez načítania stránky. */
export function Catalog({ wines }: { wines: Wine[] }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const filters = useMemo(() => parseFilters(params), [params]);

  const update = (next: CatalogFilters) => {
    const query = serializeFilters(next).toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };

  return <CatalogView wines={wines} filters={filters} onChange={update} />;
}

/** Statická verzia pre prvé vykreslenie (pred načítaním URL parametrov v prehliadači). */
export function CatalogStatic({ wines }: { wines: Wine[] }) {
  return <CatalogView wines={wines} filters={emptyFilters} onChange={() => {}} />;
}

function CatalogView({
  wines,
  filters,
  onChange,
}: {
  wines: Wine[];
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const panelId = useId();
  const visible = useMemo(() => sortWines(filterWines(wines, filters), filters.sort), [wines, filters]);
  const active = countActive(filters);

  const groups: { key: GroupKey; legend: string; options: Option[] }[] = useMemo(
    () => [
      { key: "line", legend: "Rad", options: wineLines.map((v) => ({ value: v, label: wineLineLabel[v] })) },
      { key: "color", legend: "Farba", options: wineColors.map((v) => ({ value: v, label: wineColorLabel[v] })) },
      {
        key: "sweetness",
        legend: "Sladkosť",
        options: sweetnesses.map((v) => ({ value: v, label: sweetnessLabel[v] })),
      },
      { key: "variety", legend: "Odroda", options: varietyOptions(wines).map((o) => ({ value: o.slug, label: o.label })) },
    ],
    [wines],
  );

  const toggle = (key: GroupKey, value: string) => {
    const current = filters[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const chips = groups.flatMap((g) =>
    g.options.filter((o) => (filters[g.key] as string[]).includes(o.value)).map((o) => ({ ...o, key: g.key })),
  );

  return (
    <div className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-10 xl:gap-14">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          aria-expanded={panelOpen}
          aria-controls={panelId}
          className="inline-flex min-h-11 items-center gap-2 rounded-(--radius-ui) border-2 border-pivnica px-4 font-bold hover:bg-pivnica hover:text-vapno lg:hidden"
        >
          {panelOpen ? <Icon name="close" className="size-5" /> : <ShopIcon name="filter" className="size-5" />}
          {panelOpen ? "Skryť filtre" : "Filtrovať"}
          {active > 0 && (
            <span className="grid min-w-6 place-items-center rounded-full bg-frankovka px-1.5 text-sm leading-6 text-vapno">
              {active}
            </span>
          )}
        </button>

        <div id={panelId} className={`${panelOpen ? "block" : "hidden"} mt-4 space-y-6 lg:mt-0 lg:block`}>
          <h2 className="sr-only">Filtre</h2>
          {groups.map((group) => (
            <fieldset key={group.key}>
              <legend className="mb-2 font-display text-lg font-bold">{group.legend}</legend>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    checked={(filters[group.key] as string[]).includes(option.value)}
                    onChange={() => toggle(group.key, option.value)}
                  />
                ))}
              </div>
            </fieldset>
          ))}
          {active > 0 && (
            <button
              type="button"
              onClick={() => onChange({ ...emptyFilters, sort: filters.sort })}
              className="min-h-11 font-bold text-frankovka underline decoration-2 underline-offset-4"
            >
              Zrušiť všetky filtre
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 lg:mt-0">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-pivnica pb-3">
          <p aria-live="polite" className="font-bold">
            {visible.length} {plural(visible.length, ["víno", "vína", "vín"])}
            {active > 0 && <span className="font-normal text-pivnica-makka"> podľa filtrov</span>}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-pivnica-makka">Zoradiť</span>
            <select
              value={filters.sort}
              onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
              className="min-h-11 rounded-(--radius-ui) border-2 border-vapno-tien bg-vapno px-3 font-bold text-pivnica"
            >
              {sortKeys.map((key) => (
                <option key={key} value={key}>
                  {sortLabel[key]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {chips.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Aktívne filtre">
            {chips.map((chip) => (
              <li key={`${chip.key}-${chip.value}`}>
                <button
                  type="button"
                  onClick={() => toggle(chip.key, chip.value)}
                  className="inline-flex min-h-9 items-center gap-1 rounded-full bg-pivnica py-1 pr-2 pl-3 text-sm font-bold text-vapno hover:bg-pivnica-makka"
                  aria-label={`Zrušiť filter ${chip.label}`}
                >
                  {chip.label}
                  <Icon name="close" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {visible.length > 0 ? (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 xl:gap-x-8">
            {visible.map((wine) => (
              <li key={wine.slug} className="flex">
                <WineCard wine={wine} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 max-w-md">
            <p className="font-display text-xl font-bold">Takú kombináciu v pivnici nemáme.</p>
            <p className="mt-2 text-pivnica-makka">Skúste zrušiť niektorý filter, napríklad sladkosť alebo odrodu.</p>
            <button
              type="button"
              onClick={() => onChange({ ...emptyFilters, sort: filters.sort })}
              className="mt-4 min-h-11 font-bold text-frankovka underline decoration-2 underline-offset-4"
            >
              Zrušiť všetky filtre
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="cursor-pointer">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span className="inline-flex min-h-11 items-center rounded-full border-2 border-vapno-tien bg-vapno px-3.5 font-bold text-pivnica transition-colors peer-checked:border-pivnica peer-checked:bg-pivnica peer-checked:text-vapno peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-frankovka hover:border-pivnica">
        {label}
      </span>
    </label>
  );
}
