import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Degustácie" };

export default function Page() {
  return <PagePlaceholder title="Degustácie" owner="session C" />;
}
