import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Mapa uličky" };

export default function Page() {
  return <PagePlaceholder title="Mapa uličky" owner="session A" />;
}
