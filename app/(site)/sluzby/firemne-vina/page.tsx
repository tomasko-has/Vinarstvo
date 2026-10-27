import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Firemné vína" };

export default function Page() {
  return <PagePlaceholder title="Firemné vína" owner="session C" />;
}
