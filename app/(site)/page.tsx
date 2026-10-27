import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LoessSlope } from "@/components/ui/LoessSlope";
import { site } from "@/lib/site";

// Úvodná sekcia z fázy 0. Ďalšie sekcie domovskej stránky doplní session C.
export default function HomePage() {
  return (
    <section aria-labelledby="hero-nadpis" className="relative overflow-hidden">
      <Container className="relative z-10 pt-12 sm:pt-20 lg:pt-24">
        <div className="max-w-xl">
          <p className="mb-4 font-bold text-pivnica-makka">
            Rodinné vinárstvo {site.laneIn}
          </p>
          <h1 id="hero-nadpis" className="text-4xl sm:text-5xl">
            {site.tagline}
          </h1>
          <p className="mt-6 max-w-(--container-text) text-lg text-pivnica-makka">
            Pivnicu máme vykopanú v spraši, rovnako ako ďalších jedenásť susedov v uličke. Príďte ochutnať, alebo si
            víno nechajte poslať domov.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/mapa" size="lg">
              Otvoriť mapu uličky
            </ButtonLink>
            <ButtonLink href="/e-shop" variant="quiet" size="lg">
              Pozrieť vína
            </ButtonLink>
          </div>
        </div>
      </Container>
      <LoessSlope className="-mt-6 block h-64 w-full sm:-mt-16 sm:h-96 lg:-mt-40 lg:h-[34rem]" />
    </section>
  );
}
