import Link from "next/link";
import { Suspense } from "react";
import { CellarFront } from "@/components/illustration/CellarFront";
import { JsonLd } from "@/components/content/JsonLd";
import { NewsCard } from "@/components/content/NewsCard";
import { Section, SectionHeading } from "@/components/content/Section";
import { WineTile } from "@/components/content/WineTile";
import { EventRow, getUpcomingEvents } from "@/components/content/events";
import { pageMetadata } from "@/components/content/seo";
import { ButtonLink } from "@/components/ui/Button";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Picture } from "@/components/ui/Picture";
import { LoessSlope } from "@/components/ui/LoessSlope";
import { getNews, getWines } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: site.tagline,
  description:
    "Rodinné vinárstvo v Sprašovej uličke. Vína z vlastných viníc, degustácie v pivnici vykopanej do spraše a audio sprievodca uličkou.",
  path: "/",
});

// Fotka v úvode. Licencia: Unsplash (voľné použitie). Autor je uvedený pod úvodom.
const heroPhoto = { src: "/images/photos/hero-cellar.jpg", alt: "" };

// Vína, ktoré návštevníkom odporúčame ako prvé: po jednom z každého radu.
const featuredSlugs = ["rizling-rynsky-hlinisko-2024", "palava-pod-hajom-2024", "frankovka-modra-2024"];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Winery",
          name: site.name,
          url: site.url,
          telephone: site.phone,
          email: site.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: site.address.street,
            addressLocality: site.address.city,
            postalCode: site.address.zip,
            addressCountry: "SK",
          },
        }}
      />

      {/* Úvod: fotka chodby pivnice. Fotku vymeníte zmenou `heroPhoto` hore v súbore. */}
      <section aria-labelledby="hero-nadpis" className="relative isolate overflow-hidden bg-pivnica text-vapno">
        <Picture photo={heroPhoto} priority sizes="100vw" fallback={null} />
        {/* Tmavá vrstva zaručí čitateľný text na ktorejkoľvek fotke. */}
        <div aria-hidden="true" className="absolute inset-0 bg-pivnica/60" />
        <Container className="relative z-10 flex min-h-[30rem] flex-col justify-center py-20 sm:min-h-[36rem] lg:min-h-[42rem]">
          <div className="max-w-xl">
            <p className="mb-4 font-bold text-spras-svetla">Rodinné vinárstvo {site.laneIn}</p>
            <h1 id="hero-nadpis" className="text-4xl sm:text-5xl">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-(--container-text) text-lg text-vapno/90">
              Pivnicu máme vykopanú v spraši, rovnako ako ďalších jedenásť susedov v uličke. Príďte ochutnať, alebo si
              víno nechajte poslať domov.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href="/mapa" size="lg">
                Otvoriť mapu uličky
              </ButtonLink>
              <ButtonLink href="/e-shop" variant="secondary" size="lg" className="border-vapno text-vapno hover:bg-vapno hover:text-pivnica">
                Pozrieť vína
              </ButtonLink>
            </div>
          </div>
          <p className="absolute right-4 bottom-3 text-xs text-vapno/70 sm:right-6">
            Foto:{" "}
            <a
              href="https://unsplash.com/photos/mpfXEaWfdoQ"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-vapno"
            >
              Amin Zabardast, Unsplash
            </a>
          </p>
        </Container>
      </section>

      <Story />
      <Lane />
      <Suspense fallback={<div className="h-96 bg-vapno" />}>
        <FeaturedWines />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-pivnica" />}>
        <WhatsOn />
      </Suspense>
      <TastingInvite />
    </>
  );
}

/** Príbeh: svetlá sekcia hneď pod tmavou fotkou chodby. */
function Story() {
  return (
    <Section labelledBy="pribeh-nadpis">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div className="max-w-(--container-text)">
          <h2 id="pribeh-nadpis" className="text-2xl sm:text-3xl">
            Tretia generácia, jedna pivnica, dvanásť metrov spraše
          </h2>
          <div className="mt-6 space-y-5 text-lg text-pivnica-makka">
            <p>
              Starý otec vykopal našu pivnicu rýľom a lopatou. Spraš sa dá krájať ako syr a drží teplotu lepšie než
              akýkoľvek betón. Aj v lete je v nej jedenásť stupňov.
            </p>
            <p>
              Dnes robíme víno z troch menších viníc a jednej väčšej. Nič nemiešame z cudzieho hrozna. Čo sa urodí, to
              vyleje.
            </p>
          </div>
          <div className="mt-8">
            <ButtonLink href="/vinarstvo" variant="secondary">
              Prečítať celý príbeh
            </ButtonLink>
          </div>
        </div>
        <ArchFrame ratio="4/5" className="mx-auto w-full max-w-sm bg-spras">
          {/* Fotku pivnice dáte sem: zmeňte `src` na skutočný súbor, ilustrácia zmizne. */}
          <Picture
            photo={{ src: "/images/placeholder/pivnica.svg", alt: "Čelo našej pivnice s oblúkovými dverami" }}
            sizes="(min-width: 1024px) 384px, 90vw"
            fallback={
              <CellarFront
                slug="na-sprasi"
                label="Čelo našej pivnice s oblúkovými dverami"
                className="absolute inset-0 h-full w-full"
              />
            }
          />
        </ArchFrame>
      </div>
    </Section>
  );
}

/** Mapa a audio sprievodca: dve veľké plochy pre návštevníka, ktorý stojí v uličke. */
function Lane() {
  const items = [
    {
      href: "/mapa",
      icon: "map" as const,
      title: "Mapa uličky",
      text: "Dvanásť pivníc, parkovisko, záchody a vyhliadka. Vidíte, ktorá je práve otvorená.",
    },
    {
      href: "/sprievodca",
      icon: "guide" as const,
      title: "Audio sprievodca",
      text: "Osem zastávok od vchodu po koniec uličky. Stiahnite si ho doma a v pivnici funguje aj bez signálu.",
    },
  ];
  return (
    <div className="bg-spras-svetla">
    <Section tone="soil" labelledBy="ulicka-nadpis" className="pb-6 sm:pb-8">
      <SectionHeading id="ulicka-nadpis" lead="Sprašová ulička je malá. Za hodinu ju prejdete celú, za tri sa v nej stratíte radi.">
        Prejdite si uličku
      </SectionHeading>
      <ul className="grid gap-6 md:grid-cols-2">
        {items.map((it) => (
          <li key={it.href} className="group relative rounded-(--radius-panel) bg-vapno p-6 sm:p-8">
            <Icon name={it.icon} width={36} height={36} className="text-frankovka" />
            <h3 className="mt-5 text-xl">
              <Link href={it.href} className="underline-offset-4 group-hover:underline after:absolute after:inset-0">
                {it.title}
              </Link>
            </h3>
            <p className="mt-2 max-w-md text-pivnica-makka">{it.text}</p>
          </li>
        ))}
      </ul>
    </Section>
    <LoessSlope className="block h-44 w-full sm:h-64 lg:h-80" />
    </div>
  );
}

async function FeaturedWines() {
  const wines = await getWines();
  const featured = featuredSlugs.map((s) => wines.find((w) => w.slug === s)).filter((w) => w !== undefined);
  return (
    <Section labelledBy="vina-nadpis">
      <SectionHeading id="vina-nadpis" lead="Tri vína z troch radov. Dobrý začiatok, ak nás ešte nepoznáte.">
        Z pivnice na stôl
      </SectionHeading>
      <ul className="grid gap-x-8 gap-y-10 md:grid-cols-3">
        {featured.map((w) => (
          <WineTile key={w.slug} wine={w} />
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
        <ButtonLink href="/e-shop">Všetky vína</ButtonLink>
        <ButtonLink href="/e-shop/zostav-si-karton" variant="quiet">
          Zostaviť vlastný kartón
        </ButtonLink>
      </div>
    </Section>
  );
}

async function WhatsOn() {
  const [events, news] = await Promise.all([getUpcomingEvents(2), getNews()]);
  const latest = news.slice(0, 2);
  return (
    <Section tone="cellar" labelledBy="dianie-nadpis">
      <SectionHeading id="dianie-nadpis" tone="cellar">
        Čo sa u nás deje
      </SectionHeading>
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <h3 className="mb-6 text-xl text-spras">Najbližšie akcie</h3>
          {events.length > 0 ? (
            <ul className="space-y-6">
              {events.map((e) => (
                <EventRow key={e.slug} event={e} tone="cellar" />
              ))}
            </ul>
          ) : (
            <p className="text-vapno/80">Nové termíny pripravujeme. Zistite ich v aktualitách.</p>
          )}
        </div>
        <div>
          <h3 className="mb-6 text-xl text-spras">Aktuality</h3>
          <ul className="space-y-6 [&_p]:text-vapno/80 [&_time]:text-vapno/70">
            {latest.map((p) => (
              <NewsCard key={p.slug} post={p} />
            ))}
          </ul>
          <div className="mt-8">
            <ButtonLink href="/aktuality" variant="quiet" className="text-spras">
              Všetky aktuality
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

function TastingInvite() {
  return (
    <section aria-labelledby="degustacia-nadpis" className="bg-vapno pt-8 pb-4 sm:pt-16">
      <Container>
        <div className="grid items-center gap-8 rounded-(--radius-panel) bg-spras px-6 py-10 sm:px-12 sm:py-14 md:grid-cols-[1fr_auto]">
          <div className="max-w-xl">
            <h2 id="degustacia-nadpis" className="text-2xl sm:text-3xl">
              Prídete ochutnať
            </h2>
            <p className="mt-4 text-lg">
              Pár pohárov, chlieb a príbeh ku každému vínu. Stačí sa ohlásiť vopred, aby sme mali čas.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <ButtonLink href="/sluzby/degustacie" size="lg">
              Objednať degustáciu
            </ButtonLink>
            <ButtonLink href="/kontakt" variant="quiet" size="lg">
              Ako sa k nám dostanete
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
