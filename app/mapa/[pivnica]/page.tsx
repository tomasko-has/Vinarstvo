import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpenStatus, WeekHours } from "@/components/map/CellarHours";
import { mapGeometry } from "@/components/map/data";
import { MapIcon } from "@/components/map/icons";
import { featuresText } from "@/components/map/labels";
import { MapExcerpt } from "@/components/map/MapExcerpt";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getCellar, getCellars, getMapAnchors, getMapPois, getWines } from "@/lib/content";
import { navigationUrl } from "@/lib/geo/navigation";
import type { Cellar } from "@/lib/schemas";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  return (await getCellars()).map((x) => ({ pivnica: x.slug }));
}

export async function generateMetadata({ params }: PageProps<"/mapa/[pivnica]">): Promise<Metadata> {
  const cellar = await getCellar((await params).pivnica);
  if (!cellar) return {};
  return {
    title: cellar.isOurs ? "Naša pivnica v uličke" : `${cellar.name} | Mapa uličky`,
    description: `${cellar.story} ${featuresText(cellar.features)}.`,
    openGraph: { images: [cellar.image.src] },
  };
}

const DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function structuredData(cellar: Cellar) {
  return {
    "@context": "https://schema.org",
    "@type": "Winery",
    name: cellar.name,
    description: cellar.story,
    image: new URL(cellar.image.src, site.url).toString(),
    telephone: cellar.phone,
    address: { "@type": "PostalAddress", streetAddress: site.lane, addressLocality: site.address.city, addressCountry: "SK" },
    geo: { "@type": "GeoCoordinates", latitude: cellar.gps.lat, longitude: cellar.gps.lng },
    openingHoursSpecification: cellar.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => DAY_EN[d]),
      opens: h.open,
      closes: h.close,
    })),
  };
}

export default async function Page({ params }: PageProps<"/mapa/[pivnica]">) {
  const { pivnica } = await params;
  const [cellar, cellars, anchors, pois, wines] = await Promise.all([
    getCellar(pivnica),
    getCellars(),
    getMapAnchors(),
    getMapPois(),
    getWines(),
  ]);
  if (!cellar) notFound();

  const { unitsPer100m, northAngle } = mapGeometry(anchors, pois);
  const ourWines = cellar.isOurs ? wines.filter((w) => cellar.wines?.includes(w.slug)) : [];
  const neighbours = [...cellars].sort((a, b) => a.mapPoint.x - b.mapPoint.x);
  const index = neighbours.findIndex((c) => c.slug === cellar.slug);
  const prev = neighbours[index - 1];
  const next = neighbours[index + 1];

  return (
    <Container className="py-6 lg:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(cellar)).replace(/</g, "\\u003c") }}
      />
      <Link href="/mapa" className="inline-flex min-h-11 items-center gap-2 font-bold text-pivnica-makka hover:text-frankovka">
        <MapIcon name="back" className="size-5" />
        Mapa uličky
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div>
          <ArchFrame ratio="4/5" className="mx-auto w-full max-w-sm lg:max-w-none">
            <Image src={cellar.image.src} alt={cellar.image.alt} fill unoptimized priority className="object-cover" />
          </ArchFrame>
        </div>

        <div className="max-w-(--container-text)">
          <p className="text-pivnica-makka">{cellar.isOurs ? "Naša pivnica" : `Pivnica, ${cellar.owner}`}</p>
          <h1 className={`mt-1 text-3xl lg:text-4xl ${cellar.isOurs ? "text-frankovka" : ""}`}>{cellar.name}</h1>
          <OpenStatus hours={cellar.openingHours} className="mt-4" />
          <p className="mt-5 text-lg">{cellar.story}</p>
          {cellar.features.length > 0 && <p className="mt-3 text-pivnica-makka">{featuresText(cellar.features)}.</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={navigationUrl(cellar.gps)} target="_blank" rel="noopener">
              <Icon name="pin" />
              Navigovať
            </ButtonLink>
            {cellar.phone && (
              <ButtonLink href={`tel:${cellar.phone.replace(/\s/g, "")}`} variant="secondary">
                <Icon name="phone" />
                {cellar.phone}
              </ButtonLink>
            )}
            <ButtonLink href={`/mapa?pivnica=${cellar.slug}`} variant="secondary">
              <Icon name="map" />
              Ukázať na mape
            </ButtonLink>
          </div>

          <section aria-labelledby="hodiny" className="mt-10">
            <h2 id="hodiny" className="text-xl">
              Otváracie hodiny
            </h2>
            <div className="mt-3">
              <WeekHours hours={cellar.openingHours} />
            </div>
            <p className="mt-3 text-sm text-pivnica-makka">
              Na hody a pri zbere hrozna sa hodiny menia. Ak idete z diaľky, radšej zavolajte.
            </p>
          </section>

          {ourWines.length > 0 && (
            <section aria-labelledby="vina" className="mt-10">
              <h2 id="vina" className="text-xl">
                Vína z tejto pivnice
              </h2>
              <ul className="mt-3 divide-y divide-spras-tmava/25 border-y border-spras-tmava/25">
                {ourWines.map((w) => (
                  <li key={w.slug}>
                    <Link
                      href={`/e-shop/${w.slug}`}
                      className="flex min-h-11 items-center justify-between gap-4 py-2.5 hover:text-frankovka"
                    >
                      <span>{w.name}</span>
                      <span className="shrink-0 text-sm text-pivnica-makka tabular-nums">
                        {(w.priceCents / 100).toLocaleString("sk-SK", { style: "currency", currency: "EUR" })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/e-shop" variant="quiet" className="mt-2">
                Celý e-shop
              </ButtonLink>
            </section>
          )}
        </div>
      </div>

      <section aria-labelledby="kde" className="mt-12 lg:mt-16">
        <h2 id="kde" className="text-xl">
          Kde ju nájdete
        </h2>
        <div className="mt-4 max-w-4xl">
          <MapExcerpt
            focus={cellar.mapPoint}
            cellars={cellars}
            artwork={{ unitsPer100m, northAngle }}
            label={`Výrez mapy uličky s pivnicou ${cellar.name} a susednými pivnicami`}
          />
        </div>
        <nav aria-label="Susedné pivnice" className="mt-4 flex max-w-4xl flex-wrap justify-between gap-3">
          {prev ? (
            <Link href={`/mapa/${prev.slug}`} className="inline-flex min-h-11 items-center gap-2 font-bold hover:text-frankovka">
              <MapIcon name="back" className="size-5" />
              {prev.name}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/mapa/${next.slug}`} className="inline-flex min-h-11 items-center gap-2 font-bold hover:text-frankovka">
              {next.name}
              <MapIcon name="arrow" className="size-5" />
            </Link>
          )}
        </nav>
      </section>
    </Container>
  );
}
