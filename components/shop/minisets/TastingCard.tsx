"use client";

import { useSearchParams } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { MINI_SET_SIZE, suggestTastingOrder } from "@/lib/cart/minisets";
import { sweetnessLabel, wineColorLabel } from "@/lib/cart/labels";
import type { MiniSet, Wine } from "@/lib/schemas";
import { VialGlyph } from "../BottleGlyph";
import { ShopIcon } from "../ShopIcon";

const number = new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 1 });

/** Degustačná karta pre ?set=<slug> alebo vlastný výber ?vzorky=a,b,c… */
export function TastingCard({ sets, wines }: { sets: MiniSet[]; wines: Wine[] }) {
  const params = useSearchParams();
  const bySlug = new Map(wines.map((w) => [w.slug, w]));
  const set = sets.find((s) => s.slug === params.get("set"));
  const custom = (params.get("vzorky") ?? "")
    .split(",")
    .map((slug) => bySlug.get(slug))
    .filter((w): w is Wine => Boolean(w?.sampleAvailable))
    .slice(0, MINI_SET_SIZE);

  const ordered = set
    ? set.tastingOrder.map((slug) => bySlug.get(slug)).filter((w): w is Wine => Boolean(w))
    : suggestTastingOrder(custom);
  const title = set?.name ?? "Vlastný mini-set";

  if (ordered.length === 0) {
    return (
      <div className="max-w-md">
        <p className="font-display text-xl font-bold">Kartu pre tento výber nevieme zostaviť.</p>
        <p className="mt-2 text-pivnica-makka">Odkaz je neúplný. Vyberte si set znova na stránke mini-setov.</p>
        <ButtonLink href="/e-shop/mini-sety" className="mt-4">
          Späť na mini-sety
        </ButtonLink>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <ButtonLink href="/e-shop/mini-sety" variant="quiet">
          Späť na mini-sety
        </ButtonLink>
        <Button variant="secondary" onClick={() => window.print()}>
          <ShopIcon name="print" className="size-5" />
          Vytlačiť kartu
        </Button>
      </div>

      <header className="mt-6 border-b-2 border-pivnica pb-4 print:mt-0">
        <p className="font-bold text-spras-tmava">Degustačná karta, Vinárstvo Na Spraši</p>
        <h1 className="mt-1 text-3xl">{title}</h1>
        <p className="mt-2 text-pivnica-makka">
          Vzorky ochutnávajte v tomto poradí. Medzi nimi si dajte vodu alebo kúsok chleba.
        </p>
      </header>

      <ol className="divide-y divide-vapno-tien">
        {ordered.map((wine, i) => (
          <li key={wine.slug} className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-5 break-inside-avoid sm:grid-cols-[3rem_auto_1fr]">
            <span className="font-display text-3xl leading-none font-bold text-frankovka">{i + 1}</span>
            <VialGlyph color={wine.color} className="hidden h-20 w-auto sm:block" />
            <div className="col-start-2 sm:col-start-3">
              <h2 className="text-xl">
                {wine.name} {wine.vintage}
              </h2>
              <p className="text-sm text-pivnica-makka">
                {wine.variety}, {wineColorLabel[wine.color]}, {sweetnessLabel[wine.sweetness]}, alkohol{" "}
                {number.format(wine.alcohol)} %
              </p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                {["Vôňa", "Chuť", "Moje hodnotenie"].map((label) => (
                  <div key={label}>
                    <dt className="font-bold">{label}</dt>
                    <dd className="mt-5 border-b border-pivnica-makka" aria-hidden="true" />
                  </div>
                ))}
              </dl>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
