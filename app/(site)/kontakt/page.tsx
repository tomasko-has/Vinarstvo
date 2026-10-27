import { EnquiryForm } from "@/components/content/EnquiryForm";
import { JsonLd } from "@/components/content/JsonLd";
import { OpeningHours } from "@/components/content/OpeningHours";
import { PageHeader } from "@/components/content/PageHeader";
import { Section, SectionHeading } from "@/components/content/Section";
import { pageMetadata } from "@/components/content/seo";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getCellar } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Kontakt",
  description: "Adresa, telefón, otváracie hodiny a ako sa k nám dostať. Pivnica v Sprašovej uličke.",
  path: "/kontakt",
});

export default async function Page() {
  const cellar = await getCellar("na-sprasi");
  const tel = `tel:${site.phone.replaceAll(" ", "")}`;
  const navigate = cellar
    ? `https://www.google.com/maps/dir/?api=1&destination=${cellar.gps.lat},${cellar.gps.lng}`
    : undefined;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
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
          openingHoursSpecification: cellar?.openingHours.map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: h.days.map((d) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d]),
            opens: h.open,
            closes: h.close,
          })),
        }}
      />
      <PageHeader title="Kontakt" lead="Zavolajte, napíšte, alebo sa rovno zastavte. V otváracích hodinách sme v pivnici." />

      <Section labelledBy="kde-nadpis">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-10">
            <div>
              <h2 id="kde-nadpis" className="text-2xl">
                Kde nás nájdete
              </h2>
              <address className="mt-4 not-italic text-lg">
                {site.name}
                <br />
                {site.address.street}
                <br />
                {site.address.zip} {site.address.city}
              </address>
              <ul className="mt-5 space-y-2">
                <li className="flex items-center gap-3">
                  <Icon name="phone" className="text-frankovka" />
                  <a href={tel} className="font-bold underline underline-offset-4">
                    {site.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className="ml-9 font-bold underline underline-offset-4">
                    {site.email}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl">Otváracie hodiny</h2>
              <div className="mt-3 max-w-md">
                <OpeningHours />
              </div>
              <p className="mt-3 text-sm text-pivnica-makka">
                Skupiny a mimoriadne termíny po dohode. Počas sviatkov a akcií sa hodiny môžu líšiť.
              </p>
            </div>
          </div>

          <div className="rounded-(--radius-panel) bg-spras-svetla p-6 sm:p-8">
            <h2 className="flex items-center gap-3 text-2xl">
              <Icon name="pin" className="text-frankovka" width={28} height={28} />
              Ako sa k nám dostanete
            </h2>
            <div className="mt-5 space-y-4">
              <p>
                <strong>Autom.</strong> Zaparkujte na parkovisku pred vstupom do uličky. Do uličky autá nevchádzajú, je
                úzka a hrbolatá. Z parkoviska to máte pešo päť minút.
              </p>
              <p>
                <strong>Pešo.</strong> Od vstupu choďte rovno uličkou. Naša pivnica má oblúkové dvere vo farbe
                frankovky a stojí asi v polovici.
              </p>
              <p>
                <strong>Signál.</strong> V uličke býva slabý. Mapu a sprievodcu si stiahnite doma, v pivnici
                fungujú aj bez internetu.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <ButtonLink href="/mapa">Otvoriť mapu uličky</ButtonLink>
              {navigate ? (
                <ButtonLink href={navigate} variant="quiet" target="_blank" rel="noopener noreferrer">
                  Navigovať do uličky
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="soil" labelledBy="sprava-nadpis">
        <div className="max-w-3xl">
          <SectionHeading id="sprava-nadpis" lead="Na otázky o vínach, objednávkach a návštevách odpovedáme do dvoch pracovných dní.">
            Napíšte nám
          </SectionHeading>
          <EnquiryForm kind="kontakt" submitLabel="Odoslať správu" />
        </div>
      </Section>
    </>
  );
}
