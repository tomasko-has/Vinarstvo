import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Kontakt" };

export default function Page() {
  return <PagePlaceholder title="Kontakt" owner="session C" />;
}
