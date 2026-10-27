import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatLongDate } from "@/components/content/format";
import { JsonLd } from "@/components/content/JsonLd";
import { PageHeader } from "@/components/content/PageHeader";
import { Paragraphs, Prose } from "@/components/content/Prose";
import { Section } from "@/components/content/Section";
import { pageMetadata } from "@/components/content/seo";
import { ButtonLink } from "@/components/ui/Button";
import { getNews } from "@/lib/content";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  return (await getNews()).map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: PageProps<"/aktuality/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getNews()).find((p) => p.slug === slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/aktuality/${post.slug}`,
    image: post.cover.src,
  });
}

export default async function Page({ params }: PageProps<"/aktuality/[slug]">) {
  const { slug } = await params;
  const post = (await getNews()).find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: post.title,
          datePublished: post.date,
          description: post.excerpt,
          image: `${site.url}${post.cover.src}`,
          publisher: { "@type": "Organization", name: site.name },
        }}
      />
      <PageHeader
        title={post.title}
        lead={post.excerpt}
        crumbs={[{ href: "/aktuality", label: "Aktuality" }]}
      >
        <p className="mt-5 text-sm text-pivnica-makka">
          <time dateTime={post.date}>{formatLongDate(post.date)}</time>
        </p>
      </PageHeader>
      <Section labelledBy={undefined}>
        <article>
          <div className="relative mb-10 aspect-[2/1] max-w-3xl overflow-hidden rounded-(--radius-panel) bg-spras-svetla">
            <Image src={post.cover.src} alt={post.cover.alt} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
          <Prose className="text-lg">
            <Paragraphs text={post.body} />
          </Prose>
        </article>
        <div className="mt-12">
          <ButtonLink href="/aktuality" variant="quiet">
            Späť na aktuality
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
