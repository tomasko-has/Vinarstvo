import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Galéria" };

export default function Page() {
  return <PagePlaceholder title="Galéria" owner="session C" />;
}
