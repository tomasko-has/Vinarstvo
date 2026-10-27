import { EnquiryForm } from "@/components/content/EnquiryForm";
import { OpeningHours } from "@/components/content/OpeningHours";
import { PageHeader } from "@/components/content/PageHeader";
import { Section, SectionHeading } from "@/components/content/Section";
import { formatEur } from "@/components/content/format";
import { pageMetadata } from "@/components/content/seo";

export const metadata = pageMetadata({
  title: "Degustácie",
  description:
    "Ochutnávka v pivnici vykopanej do spraše. Štyri druhy degustácií, ceny na osobu a formulár na dopyt.",
  path: "/sluzby/degustacie",
});

// Ceny sú zatiaľ ukážkové. Rodina ich potvrdí pred spustením.
const tastings = [
  {
    name: "Ochutnávka v pivnici",
    priceCents: 1200,
    meta: "5 vín, asi 45 minút",
    text: "Päť vín z Radu Ulička a Radu Spraš, chlieb a voda. Vhodné pre dvoch až osem ľudí.",
  },
  {
    name: "Degustácia s jedlom",
    priceCents: 2400,
    meta: "7 vín, asi 90 minút",
    text: "Sedem vín k domácim syrom, údeninám a teplému chlebu. Sedíme pri stole v pivnici.",
  },
  {
    name: "Archívna degustácia",
    priceCents: 3800,
    meta: "5 archívnych vín, asi 90 minút",
    text: "Vína z Radu Pivnica, aj tie, ktoré sa už nepredávajú. Pre tých, čo radi počúvajú, ako víno starne.",
  },
  {
    name: "Pre skupinu alebo firmu",
    priceCents: 1800,
    meta: "od 10 osôb, termín dohodou",
    text: "Pivnica len pre vás, prípadne s večerou v penzióne. Cenu upravíme podľa programu.",
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        title="Degustácie v pivnici"
        lead="Sedíte v chlade spraše, my nalievame a rozprávame. Termín si dohodneme vopred, aby sme mali čas len na vás."
        crumbs={[{ href: "/sluzby/degustacie", label: "Služby" }]}
      />

      <Section labelledBy="druhy-nadpis">
        <SectionHeading id="druhy-nadpis" lead="Ceny sú na osobu a zahŕňajú DPH.">
          Čo si môžete vybrať
        </SectionHeading>
        <ul className="grid gap-x-10 gap-y-10 md:grid-cols-2">
          {tastings.map((t) => (
            <li key={t.name} className="border-t-2 border-pivnica/80 pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl">{t.name}</h3>
                <p className="shrink-0 font-display text-xl font-extrabold text-frankovka">
                  {formatEur(t.priceCents)}
                </p>
              </div>
              <p className="mt-1 text-sm text-pivnica-makka">{t.meta}</p>
              <p className="mt-3">{t.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-(--container-text) text-sm text-pivnica-makka">
          Ceny sú zatiaľ ukážkové. Deti do 18 rokov víno nedostanú, ale radi im naliejeme mušt.
        </p>
      </Section>

      <Section tone="soil" labelledBy="dopyt-nadpis">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <div>
            <SectionHeading id="dopyt-nadpis" lead="Napíšte, kedy by ste chceli prísť. Ozveme sa do dvoch pracovných dní a termín potvrdíme.">
              Dopyt na degustáciu
            </SectionHeading>
            <EnquiryForm kind="degustacia" submitLabel="Poslať dopyt na degustáciu" />
          </div>
          <aside aria-labelledby="hodiny-nadpis" className="lg:pt-2">
            <h3 id="hodiny-nadpis" className="text-xl">
              Kedy máme otvorené
            </h3>
            <div className="mt-3">
              <OpeningHours />
            </div>
            <p className="mt-3 text-sm text-pivnica-makka">Mimo týchto hodín sa dá prísť po dohode.</p>
          </aside>
        </div>
      </Section>
    </>
  );
}
