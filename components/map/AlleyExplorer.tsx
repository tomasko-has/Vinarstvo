"use client";

// Interaktívna mapa uličky: značky pivníc, filtre, poloha návštevníka, zoznam a profil.
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createGeoTransform } from "@/lib/geo/affine";
import { distanceToNearest, metersToSvg, OUTSIDE_LANE_METERS } from "@/lib/geo/distance";
import { navigationUrl } from "@/lib/geo/navigation";
import type { Cellar, Gps, MapAnchors, MapPoi } from "@/lib/schemas";
import { CellarProfile, type WineLink } from "./CellarProfile";
import { isNorthSide } from "./geometry";
import { CellarFacade, halo, OpenLantern, PoiGlyph } from "./glyphs";
import { formatDistance, useGeolocation, useLaneTime } from "./hooks";
import { MapIcon } from "./icons";
import { featuresText } from "./labels";
import { describeOpenState, openState } from "./opening-hours";
import styles from "./map.module.css";
import { PanZoomMap, type PanZoomHandle } from "./PanZoomMap";

type Filter = "open" | "degustacia" | "ubytovanie";

const filterLabels: Record<Filter, string> = {
  open: "Otvorené teraz",
  degustacia: "Degustácia",
  ubytovanie: "Ubytovanie",
};

/** Krátky názov na mapu: „Pivnica Pod Orechom“ → „Pod Orechom“. */
const shortName = (name: string) => name.replace(/^(Pivnica|Vinárstvo) /, "");

// Odkaz z detailu pivnice: /mapa?pivnica=slug (na serveri neznáme)
const noSubscribe = () => () => {};
const slugFromUrl = () => new URLSearchParams(window.location.search).get("pivnica");
const noSlug = () => null;

// Značky držia veľkosť na obrazovke podľa --ui, ktoré nastavuje PanZoomMap
const markerScale = "[transform:scale(var(--ui,1))]";

export function AlleyExplorer({
  artwork,
  cellars,
  pois,
  anchors,
  lanePoints,
  entrance,
  wines,
}: {
  artwork: ReactNode;
  cellars: Cellar[];
  pois: MapPoi[];
  anchors: MapAnchors;
  /** GPS bodov uličky na výpočet „ste mimo uličky“ */
  lanePoints: Gps[];
  entrance: Gps;
  wines: WineLink[];
}) {
  const map = useRef<PanZoomHandle>(null);
  const opener = useRef<HTMLOrSVGElement | null>(null);
  const urlSlug = useSyncExternalStore(noSubscribe, slugFromUrl, noSlug);
  // undefined = návštevník ešte nič nevybral, platí výber z URL
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const selected = picked === undefined ? urlSlug : picked;
  const [filters, setFilters] = useState<Set<Filter>>(new Set());
  const now = useLaneTime();
  const geo = useGeolocation();
  const transform = useMemo(() => createGeoTransform(anchors), [anchors]);

  const ordered = useMemo(() => [...cellars].sort((a, b) => a.mapPoint.x - b.mapPoint.x), [cellars]);
  const isOpen = useCallback((c: Cellar) => (now ? openState(c.openingHours, now).open : false), [now]);
  const matches = useCallback(
    (c: Cellar) =>
      (!filters.has("open") || isOpen(c)) &&
      (!filters.has("degustacia") || c.features.includes("degustacia")) &&
      (!filters.has("ubytovanie") || c.features.includes("ubytovanie")),
    [filters, isOpen],
  );
  const visible = ordered.filter(matches);
  const current = cellars.find((c) => c.slug === selected) ?? null;

  const select = useCallback(
    (slug: string, from?: HTMLOrSVGElement | null) => {
      const cellar = cellars.find((c) => c.slug === slug);
      if (!cellar) return;
      opener.current = from ?? null;
      setPicked(slug);
      // Na mobile prekryje spodok mapy bottom sheet, preto pivnicu posunieme vyššie
      const narrow = map.current?.isNarrow() ?? false;
      map.current?.flyTo(cellar.mapPoint, { offsetY: narrow ? window.innerHeight * 0.22 : 0 });
    },
    [cellars],
  );

  const close = useCallback(() => {
    setPicked(null);
    opener.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const cellar = cellars.find((c) => c.slug === urlSlug);
    if (cellar) map.current?.flyTo(cellar.mapPoint, { offsetY: map.current.isNarrow() ? window.innerHeight * 0.22 : 0 });
  }, [cellars, urlSlug]);

  const toggleFilter = (f: Filter) =>
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });

  // Poloha
  const here = geo.position ? transform.toSvg(geo.position.gps) : null;
  const awayMeters = geo.position ? distanceToNearest(geo.position.gps, lanePoints) : 0;
  const outside = geo.position !== null && awayMeters > OUTSIDE_LANE_METERS;
  const accuracy = geo.position ? metersToSvg(transform, geo.position.gps, Math.min(geo.position.accuracy, 200)) : 0;

  const centeredOnce = useRef(false);
  useEffect(() => {
    if (geo.status !== "active") centeredOnce.current = false;
    else if (here && !outside && !centeredOnce.current) {
      centeredOnce.current = true;
      map.current?.flyTo(here);
    }
  }, [geo.status, here, outside]);

  const onMarkerClick = (e: MouseEvent<HTMLAnchorElement>, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // nová karta funguje normálne
    e.preventDefault();
    select(slug, e.currentTarget);
  };

  return (
    <div className="lg:grid lg:h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1fr)_25rem]">
      <section aria-labelledby="mapa-nadpis" className="relative">
        <h1 id="mapa-nadpis" className="sr-only">
          Mapa Sprašovej uličky
        </h1>
        <p id="mapa-ovladanie" className="sr-only">
          Mapu posúvate šípkami, plus a mínus približujú, nula vráti celý pohľad. Tabulátorom prechádzate pivnice.
          Rovnaké pivnice sú aj v zozname pod mapou.
        </p>
        <div className={`${styles.paper} relative h-[calc(100svh-4rem-var(--spacing-tabbar)-3.25rem)] min-h-80 overflow-hidden lg:h-full`}>
          <PanZoomMap ref={map} label="Mapa Sprašovej uličky" describedBy="mapa-ovladanie">
            {artwork}

            {/* body záujmu */}
            <g aria-hidden="true">
              {pois.map((p) => (
                <g key={p.id} transform={`translate(${p.mapPoint.x} ${p.mapPoint.y})`}>
                  <g className={markerScale}>
                    <PoiGlyph kind={p.kind} />
                    <text
                      x={p.mapPoint.x < 100 ? -14 : 0}
                      y={p.kind === "penzion" ? 30 : 26}
                      textAnchor={p.mapPoint.x < 100 ? "start" : "middle"}
                      fontSize="11.5"
                      {...halo}
                      fill="var(--color-pivnica-makka)"
                    >
                      {p.label}
                    </text>
                  </g>
                </g>
              ))}
            </g>

            {/* pivnice */}
            <g>
              {ordered.map((c) => {
                const north = isNorthSide(c.mapPoint);
                const active = c.slug === selected;
                const match = matches(c);
                const open = isOpen(c);
                const status = now ? describeOpenState(openState(c.openingHours, now)) : "";
                return (
                  <a
                    key={c.slug}
                    href={`/mapa/${c.slug}`}
                    aria-label={`${c.name}${status ? `, ${status.toLowerCase()}` : ""}`}
                    aria-current={active ? "true" : undefined}
                    tabIndex={match ? 0 : -1}
                    onClick={(e) => onMarkerClick(e, c.slug)}
                    onFocus={() => map.current?.reveal(c.mapPoint)}
                    className={`group cursor-pointer outline-none transition-opacity ${match ? "" : "opacity-30"}`}
                  >
                    <g transform={`translate(${c.mapPoint.x} ${c.mapPoint.y})`}>
                      <g className={markerScale}>
                        <circle r="25" fill="transparent" />
                        <circle
                          r="25"
                          fill="none"
                          stroke="var(--color-frankovka)"
                          strokeWidth="2.5"
                          strokeDasharray={active ? undefined : "4 4"}
                          className={active ? "" : "opacity-0 group-hover:opacity-60 group-focus-visible:opacity-100"}
                        />
                        <g className={`transition-transform duration-200 ${active ? "scale-125" : ""}`}>
                          <CellarFacade ours={c.isOurs} />
                          {open && <OpenLantern />}
                        </g>
                        <text
                          x={c.mapPoint.x > 920 ? 20 : 0}
                          y={north ? -31 : 41}
                          textAnchor={c.mapPoint.x > 920 ? "end" : "middle"}
                          fontSize={c.isOurs ? 14 : 13}
                          fontWeight={c.isOurs || active ? 800 : 600}
                          {...halo}
                          className="font-display"
                          fill={c.isOurs || active ? "var(--color-frankovka)" : "var(--color-pivnica)"}
                        >
                          {shortName(c.name)}
                        </text>
                      </g>
                    </g>
                  </a>
                );
              })}
            </g>

            {/* tu ste */}
            {here && !outside && (
              <g transform={`translate(${here.x} ${here.y})`} aria-hidden="true">
                <circle r={accuracy} fill="var(--color-frankovka)" opacity="0.12" stroke="var(--color-frankovka)" strokeOpacity="0.4" />
                <g className={markerScale}>
                  <circle r="14" fill="var(--color-frankovka)" opacity="0.25" className="motion-safe:animate-ping [transform-box:fill-box] [transform-origin:center]" />
                  <circle r="9" fill="var(--color-frankovka)" stroke="var(--color-vapno)" strokeWidth="3" />
                  <text y="-15" textAnchor="middle" fontSize="12" fontWeight="700" {...halo} fill="var(--color-frankovka)">
                    Tu ste
                  </text>
                </g>
              </g>
            )}
          </PanZoomMap>

          {/* filtre */}
          <div
            role="group"
            aria-label="Filtrovať pivnice"
            className="absolute inset-x-0 top-0 flex gap-2 overflow-x-auto px-(--spacing-gutter) py-3 [scrollbar-width:none]"
          >
            {(Object.keys(filterLabels) as Filter[]).map((f) => {
              const on = filters.has(f);
              const disabled = f === "open" && !now;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  disabled={disabled}
                  onClick={() => toggleFilter(f)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-2 px-4 text-sm font-bold shadow-[0_1px_0_var(--color-spras-tmava)] transition-colors disabled:opacity-50 ${
                    on ? "border-pivnica bg-pivnica text-vapno" : "border-pivnica/80 bg-vapno text-pivnica hover:bg-vapno-tien"
                  }`}
                >
                  {on && <MapIcon name="check" className="-ml-1 size-4" />}
                  {f === "open" && !on && <span aria-hidden="true" className="size-2.5 rounded-full bg-listok" />}
                  {filterLabels[f]}
                </button>
              );
            })}
          </div>

          {/* ovládanie mapy */}
          <div className="absolute right-(--spacing-gutter) bottom-4 flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={geo.status === "active" || geo.status === "locating" ? geo.stop : geo.start}
              aria-pressed={geo.status === "active"}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-bold shadow-[0_2px_0_var(--color-pivnica)] ${
                geo.status === "active" ? "bg-frankovka text-vapno" : "bg-vapno text-pivnica ring-2 ring-pivnica"
              }`}
            >
              <MapIcon name="locate" className={geo.status === "locating" ? "motion-safe:animate-spin" : ""} />
              {geo.status === "active" ? "Skryť polohu" : "Ukáž, kde som"}
            </button>
            <div className="flex flex-col overflow-hidden rounded-(--radius-ui) bg-vapno ring-2 ring-pivnica">
              <MapButton label="Priblížiť" icon="plus" onClick={() => map.current?.zoomBy(1.5)} />
              <MapButton label="Oddialiť" icon="minus" onClick={() => map.current?.zoomBy(1 / 1.5)} border />
              <MapButton label="Celá ulička" icon="whole" onClick={() => map.current?.reset()} border />
            </div>
          </div>

          <GeoNotice
            status={geo.status}
            outside={outside}
            distance={awayMeters}
            entrance={entrance}
            onRetry={geo.start}
          />
        </div>
      </section>

      {/* na mobile: lišta, ktorá vedie k zoznamu pod mapou */}
      <a
        href="#zoznam-pivnic"
        className="flex h-13 items-center justify-center gap-2 border-y-2 border-spras-tmava/30 bg-spras-svetla font-bold lg:hidden"
      >
        <MapIcon name="list" className="size-5" />
        Zoznam pivníc ({visible.length})
      </a>

      <CellarList
        cellars={visible}
        total={cellars.length}
        now={now !== null}
        isOpen={isOpen}
        selected={selected}
        onShow={(slug, el) => {
          select(slug, el);
          if (!(map.current?.isNarrow() ?? true)) return;
          window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        }}
      />

      {current && (
        <aside
          aria-label="Profil pivnice"
          className={`fixed inset-x-0 bottom-(--spacing-tabbar) z-30 flex max-h-[55svh] flex-col rounded-t-(--radius-panel) bg-vapno shadow-[0_-6px_24px_rgb(34_40_35/0.18)] ${styles.sheet} lg:top-16 lg:right-0 lg:bottom-0 lg:left-auto lg:max-h-none lg:w-[25rem] lg:rounded-none lg:border-l-2 lg:border-spras-tmava/30 lg:shadow-none`}
        >
          <CellarProfile
            key={current.slug}
            cellar={current}
            wines={current.isOurs ? wines.filter((w) => current.wines?.includes(w.slug)) : []}
            onClose={close}
          />
        </aside>
      )}
    </div>
  );
}

function MapButton({ label, icon, onClick, border = false }: { label: string; icon: "plus" | "minus" | "whole"; onClick: () => void; border?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`grid size-11 place-items-center text-pivnica hover:bg-vapno-tien ${border ? "border-t border-pivnica/25" : ""}`}
    >
      <MapIcon name={icon} />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function GeoNotice({
  status,
  outside,
  distance,
  entrance,
  onRetry,
}: {
  status: ReturnType<typeof useGeolocation>["status"];
  outside: boolean;
  distance: number;
  entrance: Gps;
  onRetry: () => void;
}) {
  let message: ReactNode = null;
  if (status === "locating") message = "Hľadáme vašu polohu…";
  else if (status === "denied") message = "Polohu ste nepovolili. Mapa funguje aj bez nej.";
  else if (status === "unavailable") message = "Poloha teraz nie je dostupná. Vonku pred pivnicou to zvyčajne ide lepšie.";
  else if (status === "error")
    message = (
      <>
        Polohu sa nepodarilo zistiť.{" "}
        <button type="button" onClick={onRetry} className="font-bold underline underline-offset-2">
          Skúsiť znova
        </button>
      </>
    );
  else if (status === "active" && outside)
    message = (
      <>
        <strong className="block">Ste mimo uličky</strong>
        Ste asi {formatDistance(distance)} od najbližšej pivnice.{" "}
        <a href={navigationUrl(entrance)} target="_blank" rel="noopener" className="font-bold underline underline-offset-2">
          Navigovať k vstupu
        </a>
      </>
    );

  return (
    <div role="status" aria-live="polite" className="pointer-events-none absolute right-[4.75rem] bottom-4 left-(--spacing-gutter) lg:right-auto lg:max-w-80">
      {message && (
        <p className="pointer-events-auto rounded-(--radius-panel) bg-pivnica px-4 py-3 text-sm text-vapno shadow-[0_2px_0_var(--color-spras-tmava)]">
          {message}
        </p>
      )}
    </div>
  );
}

function CellarList({
  cellars,
  total,
  now,
  isOpen,
  selected,
  onShow,
}: {
  cellars: Cellar[];
  total: number;
  now: boolean;
  isOpen: (c: Cellar) => boolean;
  selected: string | null;
  onShow: (slug: string, el: HTMLElement) => void;
}) {
  return (
    <section
      id="zoznam-pivnic"
      aria-labelledby="zoznam-nadpis"
      className="scroll-mt-16 px-(--spacing-gutter) py-6 lg:overflow-y-auto lg:border-l-2 lg:border-spras-tmava/30 lg:px-6"
    >
      <h2 id="zoznam-nadpis" className="text-2xl">
        Pivnice v uličke
      </h2>
      <p className="mt-2 text-sm text-pivnica-makka">
        Od vstupu po koniec uličky.{" "}
        {now && "Zelený lampáš pri vchode znamená, že majú práve otvorené. "}
        Vínovočervené dvere sú naše.
      </p>
      {cellars.length < total && (
        <p className="mt-3 text-sm font-bold" role="status">
          Zobrazujeme {cellars.length} z {total} pivníc.
        </p>
      )}
      {cellars.length === 0 ? (
        <p className="mt-6 rounded-(--radius-panel) bg-vapno-tien px-4 py-5">
          Teraz tomu nevyhovuje žiadna pivnica. Skúste vypnúť niektorý filter nad mapou.
        </p>
      ) : (
        <ol className="mt-4 divide-y divide-spras-tmava/25 border-y border-spras-tmava/25">
          {cellars.map((c) => {
            const open = isOpen(c);
            return (
              <li key={c.slug} className={c.slug === selected ? "bg-spras-svetla/50" : ""}>
                <button
                  type="button"
                  onClick={(e) => onShow(c.slug, e.currentTarget)}
                  className="flex min-h-11 w-full items-start gap-3 py-3 text-left hover:bg-vapno-tien/70"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-2 size-3 shrink-0 rounded-full ring-2 ${open ? "bg-listok ring-listok/30" : "ring-pivnica-makka/40"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`block font-display text-lg leading-snug font-bold ${c.isOurs ? "text-frankovka" : ""}`}>
                      {c.name}
                    </span>
                    <span className="block text-sm text-pivnica-makka">
                      {now && (open ? "Otvorené. " : "Zatvorené. ")}
                      {featuresText(c.features)}
                    </span>
                  </span>
                  <span className="mt-1 shrink-0 text-sm font-bold text-frankovka">Na mape</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
