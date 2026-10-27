import Image from "next/image";
import { PageHeader } from "@/components/content/PageHeader";
import { Section } from "@/components/content/Section";
import { pageMetadata } from "@/components/content/seo";

export const metadata = pageMetadata({
  title: "Galéria",
  description: "Pivnica, vinice a ulička očami rodiny. Fotografie doplníme po prvej oberačke s fotografom.",
  path: "/vinarstvo/galeria",
});

// Zatiaľ placeholdery. Skutočné fotky pribudnú do public/images/content/ a sem sa len doplnia riadky.
const photos = [
  { src: "/images/placeholder/pivnica.svg", alt: "Čelo našej pivnice", caption: "Čelo pivnice, bielené každú jar", wide: true },
  { src: "/images/placeholder/aktualita.svg", alt: "Oberačka vo vinici", caption: "Oberačka na Hlinisku", wide: false },
  { src: "/images/placeholder/flasa-biele.svg", alt: "Fľaša bieleho vína", caption: "Rad Spraš, biele", wide: false },
  { src: "/images/placeholder/flasa-cervene.svg", alt: "Fľaša červeného vína", caption: "Frankovka z Kamennej", wide: false },
  { src: "/images/placeholder/darcek.svg", alt: "Darčeková krabica", caption: "Darčeková sada", wide: false },
  { src: "/images/placeholder/flasa-ruzove.svg", alt: "Fľaša ružového vína", caption: "Zweigelt rosé", wide: false },
];

export default function Page() {
  return (
    <>
      <PageHeader
        title="Galéria"
        lead="Pivnica, vinice a ulička. Skutočné fotky pridáme po prvej oberačke s fotografom, dovtedy tu máme náčrty."
        crumbs={[{ href: "/vinarstvo", label: "Vinárstvo" }]}
      />
      <Section labelledBy="fotky-nadpis">
        <h2 id="fotky-nadpis" className="sr-only">
          Fotografie
        </h2>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {photos.map((p) => (
            <li key={p.src} className={p.wide ? "col-span-2" : ""}>
              <figure>
                <div
                  className={`relative overflow-hidden rounded-(--radius-panel) bg-spras-svetla ${p.wide ? "aspect-[2/1]" : "aspect-square"}`}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes={p.wide ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-sm text-pivnica-makka">{p.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
