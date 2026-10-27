import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "E-shop" };

export default function Page() {
  return <PagePlaceholder title="E-shop" owner="session B" />;
}
