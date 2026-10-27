import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Cookies" };

export default function Page() {
  return <PagePlaceholder title="Cookies" owner="session C" />;
}
