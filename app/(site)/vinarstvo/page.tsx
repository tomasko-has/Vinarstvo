import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Náš príbeh" };

export default function Page() {
  return <PagePlaceholder title="Náš príbeh" owner="session C" />;
}
