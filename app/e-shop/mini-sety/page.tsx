import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Degustačné mini-sety" };

export default function Page() {
  return <PagePlaceholder title="Degustačné mini-sety" owner="session B" />;
}
