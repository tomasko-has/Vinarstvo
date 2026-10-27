import { NewsCard } from "@/components/content/NewsCard";
import { PageHeader } from "@/components/content/PageHeader";
import { Section } from "@/components/content/Section";
import { EventRow, getUpcomingEvents } from "@/components/content/events";
import { pageMetadata } from "@/components/content/seo";
import { getNews } from "@/lib/content";

export const metadata = pageMetadata({
  title: "Aktuality",
  description: "Novinky z vinice a pivnice, nové vína a termíny akcií v Sprašovej uličke.",
  path: "/aktuality",
});

export default async function Page() {
  const [news, events] = await Promise.all([getNews(), getUpcomingEvents()]);
  return (
    <>
      <PageHeader title="Aktuality" lead="Čo sa deje vo vinici, v pivnici a v uličke." />
      <Section labelledBy="clanky-nadpis">
        <div className="grid gap-16 lg:grid-cols-[1fr_22rem] lg:gap-20">
          <div>
            <h2 id="clanky-nadpis" className="mb-8 text-2xl">
              Články
            </h2>
            <ul className="max-w-3xl space-y-10">
              {news.map((p) => (
                <NewsCard key={p.slug} post={p} />
              ))}
            </ul>
          </div>
          <aside aria-labelledby="akcie-nadpis">
            <h2 id="akcie-nadpis" className="mb-8 text-2xl">
              Najbližšie akcie
            </h2>
            {events.length > 0 ? (
              <ul className="space-y-6">
                {events.map((e) => (
                  <EventRow key={e.slug} event={e} />
                ))}
              </ul>
            ) : (
              <p className="text-pivnica-makka">Nové termíny pripravujeme.</p>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
