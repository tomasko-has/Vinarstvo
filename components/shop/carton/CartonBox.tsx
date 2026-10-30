"use client";

import { BottleIllustration } from "@/components/illustration/BottleIllustration";
import { LogoMark } from "@/components/layout/Logo";
import type { WineIndex } from "@/lib/cart/carton";

/** Zdvihnutá zadná stena kartónu s ohybom. */
function BackFlap() {
  return (
    <svg viewBox="0 0 400 44" preserveAspectRatio="none" className="block h-7 w-full sm:h-9" aria-hidden="true">
      <path
        d="M14 44 34 6h332l20 38Z"
        fill="var(--color-spras-svetla)"
        stroke="var(--color-spras-tmava)"
        strokeWidth="2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M56 25h288"
        stroke="var(--color-spras-tmava)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="1 8"
        opacity="0.8"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Silueta fľaše v prázdnej priehradke: ukazuje, kam fľaša patrí. */
function Silhouette() {
  return (
    <svg viewBox="96 30 108 346" className="h-[62%] w-auto" aria-hidden="true">
      <path
        d="M136 40h28v70c0 14 30 26 30 62v188a8 8 0 0 1-8 8h-72a8 8 0 0 1-8-8V172c0-36 30-48 30-62Z"
        fill="none"
        stroke="var(--color-spras)"
        strokeWidth="3.5"
        strokeDasharray="8 12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Potlač na prednom paneli kartónu: logo, objem a otvor na uchopenie. */
function FrontPanel() {
  return (
    <div className="mt-3 flex min-h-14 items-center justify-between gap-3 rounded-(--radius-ui) bg-spras-tmava/25 px-3 sm:mt-4">
      <div className="flex -rotate-1 items-center gap-2 text-pivnica/85">
        <LogoMark className="size-8 shrink-0" />
        <p className="leading-none">
          <span className="font-display text-lg font-extrabold">Na Spraši</span>
          <span className="mt-1 block text-sm font-bold">6 × 0,75 l</span>
        </p>
      </div>
      <span aria-hidden="true" className="h-5 w-16 shrink-0 rounded-full bg-spras-tmava shadow-[inset_0_2px_0_rgb(0_0_0/0.25)]" />
    </div>
  );
}

/**
 * Kartón zhora spredu: šesť oblúkových priehradiek ako vchody do pivníc.
 * Plná priehradka je tlačidlo, ktoré fľašu vyberie.
 */
export function CartonBox({
  bottles,
  wines,
  size,
  onRemove,
  highlight = false,
}: {
  bottles: readonly string[];
  wines: WineIndex;
  size: number;
  onRemove: (index: number) => void;
  highlight?: boolean;
}) {
  return (
    <div>
      <BackFlap />
      <div
        className={`rounded-b-(--radius-panel) border-x-4 border-b-4 border-spras-tmava bg-spras p-2.5 transition-[outline-color] sm:p-3.5 ${
          highlight ? "outline-4 outline-offset-4 outline-frankovka outline-dashed" : "outline-transparent"
        }`}
      >
        <ol className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Priehradky kartónu">
          {Array.from({ length: size }, (_, i) => {
            const slug = bottles[i];
            const wine = slug ? wines.get(slug) : undefined;
            return (
              <li key={i} className="flex flex-col">
                {wine ? (
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    aria-label={`Vybrať z kartónu: ${wine.name}`}
                    className="group relative flex aspect-[3/4] lg:aspect-[5/6] items-end justify-center overflow-hidden rounded-(--radius-obluk) bg-spras-tmava/45 px-2 pt-3 pb-1.5 shadow-[inset_0_3px_0_rgb(0_0_0/0.18)]"
                  >
                    <BottleIllustration
                      key={slug}
                      wine={wine}
                      bare
                      className="h-full w-auto transition-transform duration-300 ease-out starting:-translate-y-6 group-hover:-translate-y-1"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-vapno text-sm font-bold text-pivnica opacity-80 group-hover:bg-frankovka group-hover:text-vapno group-hover:opacity-100"
                    >
                      ×
                    </span>
                  </button>
                ) : (
                  <div className="flex aspect-[3/4] lg:aspect-[5/6] items-end justify-center rounded-(--radius-obluk) bg-spras-tmava/30 pb-2 shadow-[inset_0_3px_0_rgb(0_0_0/0.18)]">
                    <Silhouette />
                    <span className="sr-only">Priehradka {i + 1}: voľné</span>
                  </div>
                )}
                <p className="mt-1 line-clamp-2 min-h-10 text-center text-sm leading-tight font-bold text-pivnica">
                  {wine?.name}
                </p>
              </li>
            );
          })}
        </ol>
        <FrontPanel />
      </div>
    </div>
  );
}

export function CartonBoxSkeleton({ size }: { size: number }) {
  return (
    <div aria-hidden="true">
      <BackFlap />
      <div className="rounded-b-(--radius-panel) border-x-4 border-b-4 border-spras-tmava bg-spras p-2.5 sm:p-3.5">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {Array.from({ length: size }, (_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] lg:aspect-[5/6] rounded-(--radius-obluk) bg-spras-tmava/30" />
              <div className="mt-1 min-h-10" />
            </div>
          ))}
        </div>
        <div className="mt-3 min-h-14 rounded-(--radius-ui) bg-spras-tmava/25 sm:mt-4" />
      </div>
    </div>
  );
}
