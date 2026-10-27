import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Darčekové sady" };

export default function Page() {
  return <PagePlaceholder title="Darčekové sady" owner="session B" />;
}
