import Image from "next/image";
import { PageHeader } from "@/components/content/PageHeader";
import { Section } from "@/components/content/Section";
import { pageMetadata } from "@/components/content/seo";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = pageMetadata({
  title: "Náš príbeh",
  description:
    "Tri generácie rodiny Hlinických a pivnica vykopaná dvanásť metrov do spraše. Ako sme začali a ako dnes robíme víno.",
  path: "/vinarstvo",
});

const timeline = [
  { year: "1962", text: "Starý otec začína kopať pivnicu do sprašového svahu. Prvé sudy stoja o rok neskôr." },
  { year: "1998", text: "Otec vysádza Hlinisko. Prvé fľašované víno ide z pivnice pod vlastným menom." },
  { year: "2011", text: "Pribúdajú Dlhé rady. Prvýkrát oberáme strojovo aspoň časť hrozna." },
  { year: "2019", text: "Preberáme pivnicu a začíname vlastný Rad Spraš, víno z jednotlivých viníc." },
  { year: "2026", text: "Otvárame Penzión Pri pivnici a robíme z uličky miesto, kde sa dá zostať dlhšie." },
];

export default function Page() {
  return (
    <>
      <PageHeader
        title="Víno robíme tam, kde sme doma"
        lead="Sme rodina Hlinických. Treťou generáciou robíme víno v pivnici, ktorú vykopal náš starý otec."
        crumbs={[{ href: "/vinarstvo", label: "Vinárstvo" }]}
      />

      <Section labelledBy="spras-nadpis">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <ArchFrame ratio="4/5" className="mx-auto w-full max-w-sm bg-spras">
            <Image
              src="/images/placeholder/pivnica.svg"
              alt="Vchod do našej pivnice, oblúkové dvere v bielenej stene"
              fill
              sizes="(min-width: 1024px) 384px, 90vw"
              className="object-cover"
            />
          </ArchFrame>
          <div className="max-w-(--container-text) space-y-5">
            <h2 id="spras-nadpis" className="text-2xl sm:text-3xl">
              Prečo práve spraš
            </h2>
            <p>
              Spraš je jemný žltý prach, ktorý tu pred tisíckami rokov nanieslo vetrom. Je mäkká, drží vodu a korene
              v nej idú hlboko. Preto nám hrozno aj v suchom lete dozrieva pomaly a poctivo.
            </p>
            <p>
              Do spraše sa dá kopať bez výstuže. Naša pivnica má chodbu dlhú dvanásť metrov a celý rok je v nej
              jedenásť stupňov. Netreba chladiť ani kúriť. Víno tu leží tak, ako ležalo za starého otca.
            </p>
            <p>
              Nepíšeme vám, že robíme „tradičné“ víno. Robíme ho tak, že sa nás ľudia pýtajú, odkiaľ je. A my im
              ukážeme na svah.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="soil" labelledBy="ako-nadpis">
        <div className="max-w-(--container-text)">
          <h2 id="ako-nadpis" className="text-2xl sm:text-3xl">
            Ako víno robíme
          </h2>
          <div className="mt-6 space-y-5">
            <p>
              Hrozno oberáme ručne do malých prepraviek, aby sa nepomliaždilo. Biele vína kvasia pomaly a v chlade,
              červené kvasia na šupkách. Väčšinu necháme dozrieť v nerezových nádržiach, vybrané vína v starých
              sudoch.
            </p>
            <p>
              Chémiu používame len tam, kde bez nej nejde nič. Ak je ročník slabý, radšej vyrobíme menej, než by sme
              predali niečo, čo nie je naše.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="cesta-nadpis">
        <h2 id="cesta-nadpis" className="mb-10 text-2xl sm:text-3xl">
          Naša cesta
        </h2>
        <ol className="max-w-(--container-text) border-l-4 border-spras-tmava">
          {timeline.map((t) => (
            <li key={t.year} className="relative pb-8 pl-6 last:pb-0">
              <span className="absolute top-2 -left-[0.6rem] size-4 rounded-full border-4 border-vapno bg-frankovka" aria-hidden="true" />
              <p className="font-display text-xl font-extrabold text-frankovka">{t.year}</p>
              <p className="mt-1">{t.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm text-pivnica-makka">
          Roky a mená v tomto príbehu sú zatiaľ ukážkové. Skutočné údaje doplní rodina.
        </p>
      </Section>

      <Section tone="cellar" labelledBy="viac-nadpis">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <h2 id="viac-nadpis" className="max-w-md text-2xl sm:text-3xl">
            Pozrite si, odkiaľ víno pochádza
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <ButtonLink href="/vinarstvo/vinice" size="lg">
              Naše vinice
            </ButtonLink>
            <ButtonLink href="/vinarstvo/galeria" variant="quiet" size="lg" className="text-spras">
              Galéria
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
