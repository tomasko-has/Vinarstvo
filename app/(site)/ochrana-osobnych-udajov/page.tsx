import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = { title: "Ochrana osobných údajov" };

export default function Page() {
  return <PagePlaceholder title="Ochrana osobných údajov" owner="session C" />;
}
