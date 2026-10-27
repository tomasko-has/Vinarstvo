import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { getWines } from "@/lib/content";

export async function generateStaticParams() {
  return (await getWines()).map((x) => ({ slug: x.slug }));
}

export default async function Page({ params }: PageProps<"/e-shop/[slug]">) {
  const { slug } = await params;
  return <PagePlaceholder title={`Víno: ${slug}`} owner="session B" />;
}
