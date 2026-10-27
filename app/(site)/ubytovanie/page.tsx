import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Penzión Pri pivnici" };

export default function Page() {
  return <PagePlaceholder title="Penzión Pri pivnici" owner="session C" />;
}
