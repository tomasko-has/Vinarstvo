import Image from "next/image";
import { EnquiryForm } from "@/components/content/EnquiryForm";
import { PageHeader } from "@/components/content/PageHeader";
import { Section, SectionHeading } from "@/components/content/Section";
import { pageMetadata } from "@/components/content/seo";
import { ButtonLink } from "@/components/ui/Button";
import { ArchFrame } from "@/components/ui/ArchFrame";

export const metadata = pageMetadata({
  title: "Penzión Pri pivnici",
  description:
    "Ubytovanie priamo v Sprašovej uličke. Štyri izby, raňajky z domácich surovín a pivnica na pár krokov.",
  path: "/ubytovanie",
});

// Údaje sú zatiaľ ukážkové. Rodina ich doplní pred spustením.
const rooms = [
  { name: "Izba Hlinisko", beds: "2 osoby", text: "Manželská posteľ a okno do vinice." },
  { name: "Izba Pod Hájom", beds: "2 osoby", text: "Dve oddelené postele, vhodné pre priateľov." },
  { name: "Izba Dlhé rady", beds: "3 osoby", text: "Manželská posteľ a rozkladacia pohovka." },
  { name: "Apartmán Kamenná", beds: "4 osoby", text: "Dve miestnosti, malá kuchynka a terasa so svahom pred očami." },
];

const included = [
  "Raňajky z domácich a miestnych surovín",
  "Parkovanie pri penzióne",
  "Wi-Fi pripojenie",
  "Ochutnávka vína pre hostí so zľavou",
  "Pivnica na dva kroky",
];

export default function Page() {
  return (
    <>
      <PageHeader
        title="Penzión Pri pivnici"
        lead="Prespíte pár krokov od pivnice, ráno sa prejdete uličkou a poobede dokončíte degustáciu, ktorú ste včera nestihli."
      />

      <Section labelledBy="penzion-nadpis">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="max-w-(--container-text) space-y-5">
            <h2 id="penzion-nadpis" className="text-2xl sm:text-3xl">
              Zostaňte cez noc
            </h2>
            <p>
              Penzión stojí na konci uličky, kúsok od našej pivnice. Má štyri izby a celkovo ubytuje deväť hostí. Je
              malý, preto vás nebudeme zhadzovať na raňajky o siedmej.
            </p>
            <p>
              Hostia sa u nás cítia najlepšie, keď si nič nenaplánujú. Pozrú sa na vinice, prečítajú si knihu,
              ochutnajú to, čo sme práve otvorili.
            </p>
            <ul className="space-y-2 pt-2">
              {included.map((i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-0.5 w-4 shrink-0 bg-frankovka" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <ArchFrame ratio="4/5" className="mx-auto w-full max-w-sm bg-spras">
            <Image
              src="/images/placeholder/pivnica.svg"
              alt="Ukážková ilustrácia: priečelie penziónu s oblúkovými dverami"
              fill
              sizes="(min-width: 1024px) 384px, 90vw"
              className="object-cover"
            />
          </ArchFrame>
        </div>
      </Section>

      <Section tone="soil" labelledBy="izby-nadpis">
        <SectionHeading id="izby-nadpis" lead="Cena od 59 € za izbu a noc, raňajky sú v cene. Presnú cenu vám potvrdíme podľa termínu.">
          Naše izby
        </SectionHeading>
        <ul className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          {rooms.map((r) => (
            <li key={r.name} className="border-t-2 border-pivnica/80 pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl">{r.name}</h3>
                <p className="shrink-0 text-sm text-pivnica-makka">{r.beds}</p>
              </div>
              <p className="mt-2">{r.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-pivnica-makka">Ceny a rozloženie izieb sú zatiaľ ukážkové.</p>
      </Section>

      <Section labelledBy="rezervacia-nadpis">
        <div className="max-w-3xl">
          <SectionHeading
            id="rezervacia-nadpis"
            lead="Online rezervačný systém zatiaľ nemáme. Pošlite termín a odpovieme vám do dvoch pracovných dní."
          >
            Dopyt na ubytovanie
          </SectionHeading>
          <EnquiryForm kind="ubytovanie" submitLabel="Poslať dopyt na ubytovanie" />
          <p className="mt-10">
            <ButtonLink href="/mapa" variant="quiet">
              Penzión nájdete na mape uličky
            </ButtonLink>
          </p>
        </div>
      </Section>
    </>
  );
}
