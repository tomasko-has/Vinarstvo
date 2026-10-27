import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Ste offline" };

export default function Page() {
  return <PagePlaceholder title="Ste offline" owner="session D" />;
}
