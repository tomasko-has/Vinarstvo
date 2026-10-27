import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Košík" };

export default function Page() {
  return <PagePlaceholder title="Košík" owner="session B" />;
}
