import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { getCellars } from "@/lib/content";

export async function generateStaticParams() {
  return (await getCellars()).map((x) => ({ pivnica: x.slug }));
}

export default async function Page({ params }: PageProps<"/mapa/[pivnica]">) {
  const { pivnica } = await params;
  return <PagePlaceholder title={`Pivnica: ${pivnica}`} owner="session A" />;
}
