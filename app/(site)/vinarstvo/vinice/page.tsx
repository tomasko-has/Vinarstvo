import Link from "next/link";
import { PageHeader } from "@/components/content/PageHeader";
import { Section } from "@/components/content/Section";
import { pageMetadata } from "@/components/content/seo";
import { getVineyards } from "@/components/content/vineyards";
import { ButtonLink } from "@/components/ui/Button";
import { getWines } from "@/lib/content";

export const metadata = pageMetadata({
  title: "Naše vinice",
  description:
    "Štyri vinice nad Sprašovou uličkou: Hlinisko, Pod Hájom, Dlhé rady a Kamenná. Poloha, pôda, odrody a vína z každej trate.",
  path: "/vinarstvo/vinice",
});

export default async function Page() {
  const [vineyards, wines] = await Promise.all([getVineyards(), getWines()]);
  return (
    <>
      <PageHeader
        title="Štyri vinice nad uličkou"
        lead="Každá trať má inú pôdu a iný charakter. Preto z nich robíme samostatné vína."
        crumbs={[
          { href: "/vinarstvo", label: "Vinárstvo" },
          { href: "/vinarstvo/vinice", label: "Vinice" },
        ]}
      />
      <Section labelledBy="trate-nadpis">
        <h2 id="trate-nadpis" className="sr-only">
          Viničné trate
        </h2>
        <ul className="space-y-16 sm:space-y-24">
          {vineyards.map((v, i) => {
            const related = wines.filter((w) => w.vineyard === v.name);
            return (
              <li
                key={v.slug}
                id={v.slug}
                className="grid scroll-mt-24 gap-8 lg:grid-cols-[18rem_1fr] lg:gap-16"
              >
                <div>
                  <SoilProfile index={i} />
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <dt className="text-pivnica-makka">Rozloha</dt>
                    <dd className="font-bold">{v.areaHa.toLocaleString("sk-SK")} ha</dd>
                    <dt className="text-pivnica-makka">Vysadené</dt>
                    <dd className="font-bold">{v.planted}</dd>
                    <dt className="text-pivnica-makka">Expozícia</dt>
                    <dd className="font-bold">{v.exposure}</dd>
                  </dl>
                </div>
                <div className="max-w-(--container-text)">
                  <h3 className="text-2xl sm:text-3xl">{v.name}</h3>
                  <p className="mt-3 text-lg text-frankovka">{v.summary}</p>
                  <p className="mt-5">{v.story}</p>
                  <p className="mt-5">
                    <span className="font-bold">Pôda:</span> {v.soil}.
                  </p>
                  <p className="mt-2">
                    <span className="font-bold">Odrody:</span> {v.varieties.join(", ")}.
                  </p>
                  {related.length > 0 ? (
                    <div className="mt-6 border-t-2 border-pivnica/80 pt-4">
                      <p className="font-bold">Vína z tejto vinice</p>
                      <ul className="mt-2 space-y-1">
                        {related.map((w) => (
                          <li key={w.slug}>
                            <Link
                              href={`/e-shop/${w.slug}`}
                              className="text-frankovka underline underline-offset-4 hover:decoration-2"
                            >
                              {w.name} {w.vintage}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-16 text-sm text-pivnica-makka">
          Rozlohy a roky výsadby sú zatiaľ ukážkové. Skutočné čísla doplní rodina.
        </p>
      </Section>
      <Section tone="soil" labelledBy="vina-vinice-nadpis">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <h2 id="vina-vinice-nadpis" className="max-w-md text-2xl sm:text-3xl">
            Ochutnajte rozdiel medzi vinicami
          </h2>
          <ButtonLink href="/e-shop/mini-sety" size="lg">
            Degustačné mini-sety
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}

// Rez pôdou: každá vinica má vlastné poradie a hrúbku vrstiev, aby sa dali rozlíšiť pohľadom.
const profiles = [
  [34, 28, 38],
  [26, 40, 34],
  [44, 30, 26],
  [22, 26, 52],
];
const layerColors = ["var(--color-spras-svetla)", "var(--color-spras)", "var(--color-spras-tmava)"];

function SoilProfile({ index }: { index: number }) {
  const heights = profiles[index % profiles.length];
  const tops = heights.map((_, i) => (heights.slice(0, i).reduce((a, b) => a + b, 0) / 100) * 120);
  return (
    <svg
      viewBox="0 0 288 120"
      className="h-28 w-full rounded-(--radius-panel)"
      role="img"
      aria-label="Schematický rez pôdou vinice, tri vrstvy spraše"
    >
      {heights.map((h, i) => (
        <rect key={i} x="0" y={tops[i]} width="288" height={(h / 100) * 120 + 1} fill={layerColors[i]} />
      ))}
      <path d="M0 6C60 2 120 10 180 5C230 1 260 7 288 4" fill="none" stroke="var(--color-listok)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
