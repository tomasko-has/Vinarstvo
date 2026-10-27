"use client";

import type { WineIndex } from "@/lib/cart/carton";
import { BottleGlyph } from "../BottleGlyph";

/** Otvorené chlopne kartónu nad krabicou. */
function Flaps() {
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="block h-6 w-full sm:h-8" aria-hidden="true">
      <path d="M4 40 22 4h150l14 36Z" fill="var(--color-spras-svetla)" />
      <path d="M396 40 378 4H228l-14 36Z" fill="var(--color-spras-svetla)" />
      <path d="M22 4h150M378 4H228" stroke="var(--color-spras-tmava)" strokeWidth="2" />
    </svg>
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
      <Flaps />
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
                    className="group relative flex aspect-[3/4] lg:aspect-[5/6] items-end justify-center overflow-hidden rounded-(--radius-obluk) bg-spras-tmava pt-2"
                  >
                    <BottleGlyph
                      key={slug}
                      color={wine.color}
                      className="h-[92%] w-auto transition-transform duration-300 ease-out starting:-translate-y-6 group-hover:-translate-y-1"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-vapno text-sm font-bold text-pivnica opacity-80 group-hover:bg-frankovka group-hover:text-vapno group-hover:opacity-100"
                    >
                      ×
                    </span>
                  </button>
                ) : (
                  <div className="flex aspect-[3/4] lg:aspect-[5/6] items-center justify-center rounded-(--radius-obluk) border-2 border-dashed border-spras-tmava bg-spras-svetla/50 text-sm text-pivnica-makka">
                    <span className="sr-only">Priehradka {i + 1}: </span>voľné
                  </div>
                )}
                <p className="mt-1 line-clamp-2 min-h-10 text-center text-sm leading-tight font-bold text-pivnica">
                  {wine?.name}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export function CartonBoxSkeleton({ size }: { size: number }) {
  return (
    <div aria-hidden="true">
      <Flaps />
      <div className="rounded-b-(--radius-panel) border-x-4 border-b-4 border-spras-tmava bg-spras p-2.5 sm:p-3.5">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {Array.from({ length: size }, (_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] lg:aspect-[5/6] rounded-(--radius-obluk) border-2 border-dashed border-spras-tmava bg-spras-svetla/50" />
              <div className="mt-1 min-h-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
