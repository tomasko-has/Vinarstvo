import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Aktuality" };

export default function Page() {
  return <PagePlaceholder title="Aktuality" owner="session C" />;
}
