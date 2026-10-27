"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { indexWines } from "@/lib/cart/carton";
import { formatPrice, formatVolume, plural } from "@/lib/cart/format";
import { suggestTastingOrder } from "@/lib/cart/minisets";
import { useCartStore } from "@/lib/cart/store";
import { validateCustomMiniSet } from "@/lib/cart/totals";
import { sweetnessLabel, wineColorLabel } from "@/lib/cart/labels";
import type { Wine } from "@/lib/schemas";
import { useAddedFlash } from "../AddWineToCart";
import { VialGlyph } from "../BottleGlyph";
import { ShopIcon } from "../ShopIcon";

/** „Do košíka“ pre preddefinovaný mini-set. */
export function AddMiniSetButton({ setSlug, name }: { setSlug: string; name: string }) {
  const addMiniSet = useCartStore((s) => s.addMiniSet);
  const [added, flash] = useAddedFlash(4000);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Button
        onClick={() => {
          addMiniSet({ setSlug });
          flash();
        }}
        aria-label={`Pridať do košíka: ${name}`}
      >
        Do košíka
      </Button>
      <p aria-live="polite" className="text-sm">
        {added && (
          <>
            Pridané.{" "}
            <Link href="/kosik" className="font-bold text-frankovka underline underline-offset-4">
              Prejsť do košíka
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

/** Vlastný mini-set: šesť rôznych vzoriek do stojana. */
export function CustomMiniSet({
  wines,
  size,
  priceCents,
  sampleVolumeMl,
}: {
  /** Vína dostupné ako vzorka */
  wines: Wine[];
  size: number;
  priceCents: number;
  sampleVolumeMl: number;
}) {
  const addMiniSet = useCartStore((s) => s.addMiniSet);
  const index = useMemo(() => indexWines(wines), [wines]);
  const [picked, setPicked] = useState<string[]>([]);
  const [added, setAdded] = useState<string[] | null>(null);

  const ordered = suggestTastingOrder(picked.map((slug) => index.get(slug)!).filter(Boolean));
  const remaining = size - picked.length;
  const valid = validateCustomMiniSet(picked, index, size);

  const toggle = (slug: string) => {
    setAdded(null);
    setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : p.length < size ? [...p, slug] : p));
  };

  const submit = () => {
    if (!valid) return;
    const custom = ordered.map((w) => w.slug);
    addMiniSet({ custom });
    setAdded(custom);
    setPicked([]);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(20rem,24rem)] lg:gap-12">
      <fieldset className="lg:order-1">
        <legend className="font-display text-xl font-bold">Vyberte {size} vín</legend>
        <p className="mt-1 text-pivnica-makka">
          Každé víno raz, vzorka má {formatVolume(sampleVolumeMl)}.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {wines.map((wine) => {
            const checked = picked.includes(wine.slug);
            const disabled = !checked && picked.length >= size;
            return (
              <li key={wine.slug}>
                <label
                  className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-(--radius-panel) border-2 p-2 pr-3 transition-colors has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-frankovka ${
                    checked ? "border-pivnica bg-pivnica text-vapno" : "border-vapno-tien bg-vapno hover:border-pivnica"
                  } ${disabled ? "cursor-not-allowed opacity-50 hover:border-vapno-tien" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggle(wine.slug)}
                  />
                  <VialGlyph color={wine.color} className="h-12 w-auto shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-snug">{wine.name}</span>
                    <span className={`block text-sm ${checked ? "text-vapno/80" : "text-pivnica-makka"}`}>
                      {wine.vintage}, {wineColorLabel[wine.color]}, {sweetnessLabel[wine.sweetness]}
                    </span>
                  </span>
                  {checked && <ShopIcon name="check" className="size-5 shrink-0" />}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <section aria-labelledby="vlastny-stojan" className="lg:sticky lg:top-24 lg:order-2 lg:self-start">
        <h3 id="vlastny-stojan" className="text-xl">
          Váš mini-set
        </h3>
        {/* Stojan na vzorky: poradie ochutnávania sa zoradí samo */}
        <ol className="mt-4 grid grid-cols-6 items-end gap-1 rounded-t-(--radius-panel) border-b-8 border-spras-tmava bg-spras-svetla px-3 pt-4">
          {Array.from({ length: size }, (_, i) => {
            const wine = ordered[i];
            return (
              <li key={wine?.slug ?? `prazdne-${i}`} className="flex flex-col items-center">
                {wine ? (
                  <>
                    <span className="sr-only">
                      {i + 1}. {wine.name}
                    </span>
                    <VialGlyph color={wine.color} className="h-24 w-auto starting:translate-y-3 transition-transform" />
                  </>
                ) : (
                  <span className="block h-24 w-5 rounded-b-full border-2 border-dashed border-spras-tmava" aria-hidden="true" />
                )}
                <span aria-hidden="true" className="py-1 text-sm font-bold text-pivnica-makka">
                  {i + 1}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="rounded-b-(--radius-panel) bg-pivnica p-5 text-vapno">
          <div className="flex items-baseline justify-between">
            <p className="text-vapno/80">{size} vzoriek</p>
            <p className="font-display text-2xl font-bold text-spras tabular-nums">{formatPrice(priceCents)}</p>
          </div>
          <p aria-live="polite" className="mt-1 text-sm text-vapno/80">
            {remaining > 0
              ? `Vyberte ešte ${remaining} ${plural(remaining, ["víno", "vína", "vín"])}.`
              : "Vzorky sme zoradili v poradí, v akom ich odporúčame ochutnať."}
          </p>
          <Button className="mt-4 w-full bg-spras text-pivnica hover:bg-spras-svetla" disabled={!valid} onClick={submit}>
            Vložiť mini-set do košíka
          </Button>
        </div>
        {added && (
          <p aria-live="polite" className="mt-3 text-sm">
            Mini-set je v košíku.{" "}
            <Link href="/kosik" className="font-bold text-frankovka underline underline-offset-4">
              Prejsť do košíka
            </Link>{" "}
            alebo{" "}
            <Link
              href={`/e-shop/mini-sety/karta?vzorky=${added.join(",")}`}
              className="font-bold text-frankovka underline underline-offset-4"
            >
              vytlačiť degustačnú kartu
            </Link>
            .
          </p>
        )}
        {picked.length === 0 && !added && (
          <ButtonLink href="#hotove-sety" variant="quiet" className="mt-2">
            Radšej vybrať hotový set
          </ButtonLink>
        )}
      </section>
    </div>
  );
}
