import type { Metadata } from "next";
import { site } from "@/lib/site";

/** Metadáta stránky vrátane Open Graph. `path` je cesta bez domény, napr. "/kontakt". */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
      siteName: site.name,
      locale: "sk_SK",
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}
