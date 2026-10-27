import Image from "next/image";
import { EnquiryForm } from "@/components/content/EnquiryForm";
import { PageHeader } from "@/components/content/PageHeader";
import { Section, SectionHeading } from "@/components/content/Section";
import { formatEur } from "@/components/content/format";
import { pageMetadata } from "@/components/content/seo";
import { ButtonLink } from "@/components/ui/Button";
import { getGiftSets } from "@/lib/content";

export const metadata = pageMetadata({
  title: "Firemné vína",
  description:
    "Víno ako firemný darček: darčekové sady s visačkou, kartóny pre klientov a degustácie pre tím. Poradíme s výberom aj dodaním.",
  path: "/sluzby/firemne-vina",
});

const steps = [
  { title: "Napíšete nám", text: "Koľko darčekov potrebujete, pre koho a dokedy." },
  { title: "Navrhneme výber", text: "Pošleme tri varianty a v prípade záujmu dáme ochutnať vzorky." },
  { title: "Pripravíme darčeky", text: "Fľaše zabalíme a pridáme visačku s vaším textom." },
  { title: "Dodáme", text: "Pošleme na jednu adresu, alebo rozdelíme podľa zoznamu príjemcov." },
];

export default async function Page() {
  const sets = await getGiftSets();
  return (
    <>
      <PageHeader
        title="Víno, ktoré obdarovaný nezabudne"
        lead="Klientom, partnerom aj tímu. Poradíme vám s výberom, zabalíme a dodáme."
        crumbs={[{ href: "/sluzby/firemne-vina", label: "Služby" }]}
      />

      <Section labelledBy="sady-nadpis">
        <SectionHeading id="sady-nadpis" lead="Hotové sady, ktoré môžete objednať aj cez e-shop. Pri väčšom počte robíme sady na mieru.">
          Darčekové sady
        </SectionHeading>
        <ul className="grid gap-8 md:grid-cols-3">
          {sets.map((s) => (
            <li key={s.slug} className="flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden rounded-(--radius-panel) bg-spras-svetla">
                <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
              <h3 className="mt-4 text-xl">{s.name}</h3>
              <p className="mt-2 text-pivnica-makka">{s.description}</p>
              <p className="mt-auto pt-3 font-bold text-frankovka">{formatEur(s.priceCents)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink href="/e-shop/darcekove-sady">Pozrieť darčekové sady v e-shope</ButtonLink>
        </div>
      </Section>

      <Section tone="cellar" labelledBy="postup-nadpis">
        <SectionHeading id="postup-nadpis" tone="cellar">
          Ako to prebieha
        </SectionHeading>
        <ol className="grid gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="border-t-2 border-spras pt-4">
              <p className="font-display text-2xl font-extrabold text-spras">{i + 1}</p>
              <h3 className="mt-2 text-xl">{s.title}</h3>
              <p className="mt-2 text-vapno/80">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="soil" labelledBy="firma-dopyt-nadpis">
        <div className="max-w-3xl">
          <SectionHeading id="firma-dopyt-nadpis" lead="Napíšte, čo potrebujete. Ozveme sa do dvoch pracovných dní. Faktúru vystavíme na firmu.">
            Dopyt pre firmy
          </SectionHeading>
          <EnquiryForm kind="firma" submitLabel="Poslať firemný dopyt" />
        </div>
      </Section>
    </>
  );
}
