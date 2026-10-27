import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Zostav si kartón" };

export default function Page() {
  return <PagePlaceholder title="Zostav si kartón" owner="session B" />;
}
