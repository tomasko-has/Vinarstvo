import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Reklamačný poriadok" };

export default function Page() {
  return <PagePlaceholder title="Reklamačný poriadok" owner="session C" />;
}
