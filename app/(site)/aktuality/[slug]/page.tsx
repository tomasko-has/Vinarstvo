import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { getNews } from "@/lib/content";

export async function generateStaticParams() {
  return (await getNews()).map((x) => ({ slug: x.slug }));
}

export default async function Page({ params }: PageProps<"/aktuality/[slug]">) {
  const { slug } = await params;
  return <PagePlaceholder title={`Aktualita: ${slug}`} owner="session C" />;
}
