import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Obchodné podmienky" };

export default function Page() {
  return <PagePlaceholder title="Obchodné podmienky" owner="session C" />;
}
