import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Naše vinice" };

export default function Page() {
  return <PagePlaceholder title="Naše vinice" owner="session C" />;
}
