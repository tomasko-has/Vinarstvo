import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AddGiftSet } from "@/components/shop/AddGiftSet";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/cart/format";
import { getGiftSets } from "@/lib/content";

export const metadata: Metadata = {
  title: "Darčekové sady",
  description: "Víno v drevenej debničke, sekt s pohármi alebo firemná trojica s vašou visačkou. Darčeky z pivnice v Sprašovej uličke.",
};

export default async function GiftSetsPage() {
  const sets = await getGiftSets();
  return (
    <Container className="pt-8 sm:pt-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Darčekové sady</h1>
        <p className="mt-4 text-lg text-pivnica-makka">
          Zabalené a pripravené na odovzdanie. Stačí ich už len doniesť.
        </p>
      </header>

      <ul className="mt-12 space-y-14">
        {sets.map((set, i) => (
          <li key={set.slug} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
            <div className={`relative aspect-[4/3] overflow-hidden rounded-(--radius-panel) bg-spras-svetla ${i % 2 ? "md:order-2" : ""}`}>
              <Image src={set.image.src} alt={set.image.alt} fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl">{set.name}</h2>
              <p className="mt-2 text-lg text-pivnica-makka">{set.description}</p>
              <h3 className="mt-5 font-sans text-base font-bold">V sade nájdete</h3>
              <ul className="mt-2 space-y-1">
                {set.contents.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-spras-tmava" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-display text-2xl font-bold text-frankovka tabular-nums">{formatPrice(set.priceCents)}</p>
              <div className="mt-3">
                <AddGiftSet setSlug={set.slug} name={set.name} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="mt-16 rounded-(--radius-panel) bg-pivnica p-6 text-vapno sm:p-8">
        <h2 className="text-2xl">Darčeky pre firmu</h2>
        <p className="mt-2 max-w-(--container-text) text-vapno/85">
          Pri desiatkach kusov pripravíme sady s vašou etiketou alebo visačkou a doručíme ich na jedno miesto.
        </p>
        <Link
          href="/sluzby/firemne-vina"
          className="mt-4 inline-flex min-h-11 items-center font-bold text-spras underline decoration-2 underline-offset-4"
        >
          Firemné vína a hromadné objednávky
        </Link>
      </aside>
    </Container>
  );
}
