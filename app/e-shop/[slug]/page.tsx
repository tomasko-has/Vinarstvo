import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddWineWithQty } from "@/components/shop/AddWineToCart";
import { StockStatus } from "@/components/shop/StockStatus";
import { TastingProfile } from "@/components/shop/TastingProfile";
import { WineImage } from "@/components/shop/WineImage";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { Container } from "@/components/ui/Container";
import { varietySlug } from "@/lib/cart/catalog";
import { eshopConfig } from "@/lib/cart/config";
import { formatPrice, formatVolume } from "@/lib/cart/format";
import { getWine, getWines } from "@/lib/content";
import { sweetnessLabel, wineColorLabel, wineLineLabel } from "@/lib/cart/labels";
import type { Wine } from "@/lib/schemas";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  return (await getWines()).map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: PageProps<"/e-shop/[slug]">): Promise<Metadata> {
  const wine = await getWine((await params).slug);
  if (!wine) return { title: "Víno sa nenašlo" };
  return {
    title: `${wine.name} ${wine.vintage}`,
    description: wine.description,
    openGraph: { images: wine.images.map((i) => ({ url: i.src, alt: i.alt })) },
  };
}

const lineNote: Record<Wine["line"], string> = {
  ulicka: "Svieže víno na každý deň.",
  spras: "Víno z jednej viničnej trate.",
  pivnica: "Výberové víno z malej série.",
};

const number = new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 1 });

function productJsonLd(wine: Wine) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${wine.name} ${wine.vintage}`,
    description: wine.description,
    image: wine.images.map((i) => new URL(i.src, site.url).toString()),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      price: (wine.priceCents / 100).toFixed(2),
      priceCurrency: "EUR",
      availability: wine.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: new URL(`/e-shop/${wine.slug}`, site.url).toString(),
    },
  };
}

// Shell stránky je spoločný pre všetky vína, preto sa `params` čítajú až vo vnútri Suspense.
export default function WinePage({ params }: PageProps<"/e-shop/[slug]">) {
  return (
    <Suspense fallback={<WineSkeleton />}>
      <WineBySlug params={params} />
    </Suspense>
  );
}

function WineSkeleton() {
  return (
    <Container className="pt-6 sm:pt-10" aria-busy="true">
      <p className="text-sm text-pivnica-makka">Vína</p>
      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:gap-16">
        <ArchFrame className="mx-auto w-full max-w-56 sm:max-w-xs md:max-w-none">{null}</ArchFrame>
        <div className="space-y-4">
          <div className="h-12 w-3/4 rounded-(--radius-ui) bg-vapno-tien" />
          <div className="h-20 rounded-(--radius-ui) bg-vapno-tien" />
        </div>
      </div>
    </Container>
  );
}

async function WineBySlug({ params }: { params: PageProps<"/e-shop/[slug]">["params"] }) {
  const { slug } = await params;
  const wine = await getWine(slug);
  if (!wine) notFound();
  return <WineDetail wine={wine} />;
}

function WineDetail({ wine }: { wine: Wine }) {
  const technical: [string, string][] = [
    ["Odroda", wine.variety],
    ["Ročník", String(wine.vintage)],
    ["Farba", wineColorLabel[wine.color]],
    ["Sladkosť", sweetnessLabel[wine.sweetness]],
    ["Alkohol", `${number.format(wine.alcohol)} % obj.`],
    ["Zvyškový cukor", `${number.format(wine.sugarGl)} g/l`],
    ["Kyseliny", `${number.format(wine.acidityGl)} g/l`],
    ["Objem", formatVolume(wine.volumeMl)],
  ];

  return (
    <Container className="pt-6 sm:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(wine)).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Omrvinky" className="text-sm text-pivnica-makka">
        <Link href="/e-shop" className="underline underline-offset-4 hover:text-pivnica">
          Vína
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{wineLineLabel[wine.line]}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:gap-16">
        <div className="md:sticky md:top-24 md:self-start">
          <WineImage
            wine={wine}
            priority
            sizes="(min-width: 768px) 40vw, 90vw"
            className={`mx-auto max-w-56 sm:max-w-xs md:max-w-none ${wine.stock === 0 ? "opacity-60 grayscale" : ""}`}
          />
        </div>

        <div>
          <p className="font-bold text-spras-tmava">
            {wineLineLabel[wine.line]}. <span className="font-normal text-pivnica-makka">{lineNote[wine.line]}</span>
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl">
            {wine.name} <span className="font-normal text-pivnica-makka">{wine.vintage}</span>
          </h1>
          <p className="mt-3 max-w-(--container-text) text-lg">{wine.description}</p>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="font-display text-3xl font-bold text-frankovka tabular-nums">{formatPrice(wine.priceCents)}</p>
            <p className="text-pivnica-makka">
              {formatVolume(wine.volumeMl)}, {formatPrice(Math.round((wine.priceCents * 1000) / wine.volumeMl))} za liter
            </p>
          </div>
          <StockStatus stock={wine.stock} className="mt-2" />
          <div className="mt-5">
            <AddWineWithQty slug={wine.slug} name={wine.name} stock={wine.stock} />
          </div>
          {wine.stock > 0 && (
            <p className="mt-1 text-pivnica-makka">
              Alebo ho dajte do{" "}
              <Link
                href={`/e-shop/zostav-si-karton?pridat=${wine.slug}`}
                className="font-bold text-frankovka underline underline-offset-4"
              >
                kartónu na mieru
              </Link>{" "}
              so zľavou {eshopConfig.cartonDiscountPct} %.
            </p>
          )}

          <div className="mt-12 grid gap-10 border-t-2 border-pivnica pt-8 lg:grid-cols-2">
            <section aria-labelledby="chut">
              <h2 id="chut" className="text-xl">
                Chuťový profil
              </h2>
              <div className="mt-4">
                <TastingProfile tasting={wine.tasting} />
              </div>
            </section>

            <section aria-labelledby="parovanie">
              <h2 id="parovanie" className="text-xl">
                Hodí sa k
              </h2>
              <ul className="mt-4 space-y-2">
                {wine.pairing.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-spras-tmava" />
                    {p}
                  </li>
                ))}
              </ul>
              {wine.sampleAvailable && (
                <p className="mt-6 text-pivnica-makka">
                  Chcete ho najprv ochutnať? Je aj v{" "}
                  <Link href="/e-shop/mini-sety" className="font-bold text-frankovka underline underline-offset-4">
                    degustačných mini-setoch
                  </Link>
                  .
                </p>
              )}
            </section>
          </div>

          <section aria-labelledby="udaje" className="mt-12">
            <h2 id="udaje" className="text-xl">
              Technické údaje
            </h2>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-8 sm:grid-cols-[auto_1fr_auto_1fr]">
              {technical.map(([term, value]) => (
                <div key={term} className="col-span-2 grid grid-cols-subgrid border-b border-vapno-tien py-2.5">
                  <dt className="text-pivnica-makka">{term}</dt>
                  <dd className="font-bold tabular-nums">{value}</dd>
                </div>
              ))}
              {wine.vineyard && (
                <div className="col-span-2 grid grid-cols-subgrid border-b border-vapno-tien py-2.5">
                  <dt className="text-pivnica-makka">Vinica</dt>
                  <dd className="font-bold">
                    <Link
                      href={`/vinarstvo/vinice#${varietySlug(wine.vineyard)}`}
                      className="text-frankovka underline underline-offset-4"
                    >
                      {wine.vineyard}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </Container>
  );
}
