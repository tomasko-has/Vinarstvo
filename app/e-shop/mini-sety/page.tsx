import type { Metadata } from "next";
import Link from "next/link";
import { VialGlyph } from "@/components/shop/BottleGlyph";
import { AddMiniSetButton, CustomMiniSet } from "@/components/shop/minisets/MiniSetActions";
import { ShopIcon } from "@/components/shop/ShopIcon";
import { Container } from "@/components/ui/Container";
import { eshopConfig } from "@/lib/cart/config";
import { formatPrice, formatVolume } from "@/lib/cart/format";
import { MINI_SET_SIZE } from "@/lib/cart/minisets";
import { getMiniSets, getWines } from "@/lib/content";
import { sweetnessLabel, wineColorLabel } from "@/lib/cart/labels";

export const metadata: Metadata = {
  title: "Degustačné mini-sety",
  description:
    "Šesť vzoriek po 0,1 l s odporúčaným poradím ochutnávania a degustačnou kartou. Hotové sety alebo vlastný výber.",
};

export default async function MiniSetsPage() {
  const [sets, wines] = await Promise.all([getMiniSets(), getWines()]);
  const bySlug = new Map(wines.map((w) => [w.slug, w]));
  const sampleWines = wines.filter((w) => w.sampleAvailable);
  const sample = formatVolume(eshopConfig.sampleVolumeMl);

  return (
    <Container className="pt-8 sm:pt-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Degustačné mini-sety</h1>
        <p className="mt-4 text-lg text-pivnica-makka">
          Šesť vzoriek po {sample} v skúmavkách. Ochutnáte doma, v poradí, aké odporúčame, a viete, ktoré víno si
          objednať celé.
        </p>
      </header>

      <section aria-labelledby="hotove-sety" className="mt-12">
        <h2 id="hotove-sety" className="sr-only">
          Hotové sety
        </h2>
        <ul className="divide-y-2 divide-pivnica border-y-2 border-pivnica">
          {sets.map((set) => (
            <li key={set.slug} className="grid gap-6 py-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
              <div>
                <h3 className="text-2xl">{set.name}</h3>
                <p className="mt-2 max-w-(--container-text) text-pivnica-makka">{set.description}</p>
                <p className="mt-4 font-display text-2xl font-bold text-frankovka tabular-nums">
                  {formatPrice(set.priceCents)}
                </p>
                <div className="mt-4">
                  <AddMiniSetButton setSlug={set.slug} name={set.name} />
                </div>
                <Link
                  href={`/e-shop/mini-sety/karta?set=${set.slug}`}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 font-bold text-pivnica-makka underline underline-offset-4 hover:text-pivnica"
                >
                  <ShopIcon name="print" className="size-5" />
                  Degustačná karta na tlač
                </Link>
              </div>

              <div>
                <p className="text-sm font-bold text-pivnica-makka">Poradie ochutnávania</p>
                <ol className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                  {set.tastingOrder.map((slug, i) => {
                    const wine = bySlug.get(slug);
                    if (!wine) return null;
                    return (
                      <li key={slug} className="flex items-center gap-3">
                        <VialGlyph color={wine.color} className="h-14 w-auto shrink-0" />
                        <span className="min-w-0">
                          <span className="block font-display text-lg leading-none font-bold text-spras-tmava">
                            {i + 1}
                          </span>
                          <Link href={`/e-shop/${wine.slug}`} className="block leading-snug font-bold hover:text-frankovka">
                            {wine.name}
                          </Link>
                          <span className="block text-sm text-pivnica-makka">
                            {wineColorLabel[wine.color]}, {sweetnessLabel[wine.sweetness]}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="vlastny" className="mt-16">
        <h2 id="vlastny" className="text-2xl sm:text-3xl">
          Vlastný mini-set
        </h2>
        <p className="mt-2 max-w-(--container-text) text-pivnica-makka">
          Vyberte si šesť vín, ktoré chcete spoznať. Poradie ochutnávania zostavíme za vás.
        </p>
        <div className="mt-6">
          <CustomMiniSet
            wines={sampleWines}
            size={MINI_SET_SIZE}
            priceCents={eshopConfig.customMiniSetPriceCents}
            sampleVolumeMl={eshopConfig.sampleVolumeMl}
          />
        </div>
      </section>
    </Container>
  );
}
